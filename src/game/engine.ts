import { GameState, Player, Zombie, Bullet, Platform, Particle } from './types';

const GRAVITY = 0.5;
const JUMP_FORCE = -11;
const MOVE_SPEED = 5;
const MOVE_ACCEL = 0.6;
const MOVE_FRICTION = 0.82;
const AIR_FRICTION = 0.92;
const BULLET_SPEED = 12;
const SHOOT_COOLDOWN = 10;
const WORLD_WIDTH = 3200;
const COYOTE_TIME = 6;
const JUMP_BUFFER = 6;

export function createInitialState(levelId: number = 1, wavesRequired: number = 3): GameState {
  const platforms = generatePlatforms(levelId);
  return {
    player: {
      x: 100,
      y: 300,
      width: 24,
      height: 32,
      velocityX: 0,
      velocityY: 0,
      isJumping: false,
      onGround: false,
      direction: 'right',
      health: 100,
      maxHealth: 100,
      shootCooldown: 0,
      animFrame: 0,
      animTimer: 0,
      isMoving: false,
    },
    bullets: [],
    zombies: [],
    platforms,
    particles: [],
    score: 0,
    wave: 1,
    maxWaves: wavesRequired,
    gameOver: false,
    gameWon: false,
    gameStarted: false,
    cameraX: 0,
    spawnTimer: 0,
    zombiesKilled: 0,
    zombiesToSpawn: 3,
    levelId,
  };
}

function seededRandom(seed: number) {
  let s = seed;
  return () => {
    s = (s * 1103515245 + 12345) & 0x7fffffff;
    return s / 0x7fffffff;
  };
}

function generatePlatforms(levelId: number): Platform[] {
  const platforms: Platform[] = [];
  const rng = seededRandom(levelId * 137 + 42);

  // Ground with gaps that vary per level
  for (let x = 0; x < WORLD_WIDTH; x += 400) {
    const gapChance = x > 400 && x < WORLD_WIDTH - 400 ? rng() : 1;
    const gapThreshold = 0.1 + (levelId * 0.01);
    if (gapChance > gapThreshold) {
      platforms.push({ x, y: 440, width: 400, height: 60, type: 'ground' });
    }
  }

  // Floating platforms - positions vary per level via seed
  const count = 12 + Math.min(levelId, 8);
  for (let i = 0; i < count; i++) {
    platforms.push({
      x: 150 + rng() * (WORLD_WIDTH - 300),
      y: 240 + rng() * 140,
      width: 80 + rng() * 80,
      height: 20,
      type: 'floating',
    });
  }

  // Brick walls - more in later levels
  const wallCount = 2 + Math.floor(levelId / 4);
  for (let i = 0; i < wallCount; i++) {
    platforms.push({
      x: 400 + rng() * (WORLD_WIDTH - 800),
      y: 360,
      width: 32,
      height: 80,
      type: 'brick',
    });
  }

  return platforms;
}

function spawnZombie(state: GameState): Zombie {
  const types: Array<'normal' | 'fast' | 'big'> = ['normal', 'normal', 'normal', 'fast', 'big'];
  const type = state.wave >= 3 ? types[Math.floor(Math.random() * types.length)] : 'normal';
  
  const side = Math.random() > 0.5 ? 1 : -1;
  const spawnX = state.player.x + side * (500 + Math.random() * 200);

  const healthMult = 1 + (state.wave - 1) * 0.3;

  const configs = {
    normal: { health: 30 * healthMult, speed: 1.5 + Math.random() * 0.5, width: 24, height: 32 },
    fast: { health: 15 * healthMult, speed: 3 + Math.random() * 0.5, width: 20, height: 28 },
    big: { health: 80 * healthMult, speed: 0.8 + Math.random() * 0.3, width: 34, height: 45 },
  };

  const config = configs[type];

  return {
    x: Math.max(0, Math.min(WORLD_WIDTH - 30, spawnX)),
    y: 100,
    width: config.width,
    height: config.height,
    velocityX: 0,
    velocityY: 0,
    health: config.health,
    maxHealth: config.health,
    active: true,
    direction: 'left',
    animFrame: 0,
    animTimer: 0,
    speed: config.speed,
    type,
  };
}

function createBloodParticles(x: number, y: number, count: number): Particle[] {
  const particles: Particle[] = [];
  for (let i = 0; i < count; i++) {
    particles.push({
      x,
      y,
      velocityX: (Math.random() - 0.5) * 6,
      velocityY: -Math.random() * 5 - 2,
      life: 30 + Math.random() * 20,
      maxLife: 50,
      color: Math.random() > 0.5 ? '#aa0000' : '#dd3333',
      size: 2 + Math.random() * 3,
    });
  }
  return particles;
}

function checkCollision(a: { x: number; y: number; width: number; height: number }, b: { x: number; y: number; width: number; height: number }) {
  return a.x < b.x + b.width && a.x + a.width > b.x && a.y < b.y + b.height && a.y + a.height > b.y;
}

function resolvePlatformCollisions(entity: { x: number; y: number; width: number; height: number; velocityX: number; velocityY: number }, platforms: Platform[]) {
  let onGround = false;

  for (const p of platforms) {
    if (!checkCollision(entity, p)) continue;

    // Calculate overlaps
    const overlapLeft = (entity.x + entity.width) - p.x;
    const overlapRight = (p.x + p.width) - entity.x;
    const overlapTop = (entity.y + entity.height) - p.y;
    const overlapBottom = (p.y + p.height) - entity.y;

    const minOverlapX = Math.min(overlapLeft, overlapRight);
    const minOverlapY = Math.min(overlapTop, overlapBottom);

    if (minOverlapY < minOverlapX) {
      // Vertical collision
      if (overlapTop < overlapBottom && entity.velocityY >= 0) {
        entity.y = p.y - entity.height;
        entity.velocityY = 0;
        onGround = true;
      } else if (entity.velocityY < 0) {
        entity.y = p.y + p.height;
        entity.velocityY = 0;
      }
    } else {
      // Horizontal collision
      if (overlapLeft < overlapRight) {
        entity.x = p.x - entity.width;
      } else {
        entity.x = p.x + p.width;
      }
      entity.velocityX = 0;
    }
  }

  return onGround;
}

// Track coyote time and jump buffer outside state for simplicity
let coyoteTimer = 0;
let jumpBufferTimer = 0;

export function resetTimers() {
  coyoteTimer = 0;
  jumpBufferTimer = 0;
}

export function update(state: GameState, keys: Set<string>, dt: number): GameState {
  if (state.gameOver || !state.gameStarted) return state;

  const newState = { ...state };
  const player = { ...newState.player };

  const wantsJump = keys.has('ArrowUp') || keys.has('w') || keys.has('W') || keys.has(' ');

  // Player horizontal movement with acceleration
  player.isMoving = false;
  if (keys.has('ArrowLeft') || keys.has('a') || keys.has('A')) {
    player.velocityX -= MOVE_ACCEL;
    if (player.velocityX < -MOVE_SPEED) player.velocityX = -MOVE_SPEED;
    player.direction = 'left';
    player.isMoving = true;
  } else if (keys.has('ArrowRight') || keys.has('d') || keys.has('D')) {
    player.velocityX += MOVE_ACCEL;
    if (player.velocityX > MOVE_SPEED) player.velocityX = MOVE_SPEED;
    player.direction = 'right';
    player.isMoving = true;
  } else {
    player.velocityX *= player.onGround ? MOVE_FRICTION : AIR_FRICTION;
    if (Math.abs(player.velocityX) < 0.2) player.velocityX = 0;
  }

  // Coyote time & jump buffer
  if (player.onGround) {
    coyoteTimer = COYOTE_TIME;
  } else {
    coyoteTimer = Math.max(0, coyoteTimer - 1);
  }

  if (wantsJump) {
    jumpBufferTimer = JUMP_BUFFER;
  } else {
    jumpBufferTimer = Math.max(0, jumpBufferTimer - 1);
  }

  // Jump with coyote time + jump buffer
  if (jumpBufferTimer > 0 && coyoteTimer > 0) {
    player.velocityY = JUMP_FORCE;
    player.isJumping = true;
    player.onGround = false;
    coyoteTimer = 0;
    jumpBufferTimer = 0;
  }

  // Variable jump height - release jump early for short hop
  if (!wantsJump && player.velocityY < -4) {
    player.velocityY *= 0.7;
  }

  // Shooting
  if (player.shootCooldown > 0) player.shootCooldown--;
  if ((keys.has('z') || keys.has('Z') || keys.has('j') || keys.has('J')) && player.shootCooldown <= 0) {
    player.shootCooldown = SHOOT_COOLDOWN;
    const bulletX = player.direction === 'right' ? player.x + player.width + 10 : player.x - 10;
    newState.bullets = [...newState.bullets, {
      x: bulletX,
      y: player.y + 14,
      width: 6,
      height: 4,
      velocityX: player.direction === 'right' ? BULLET_SPEED : -BULLET_SPEED,
      velocityY: 0,
      direction: player.direction,
      active: true,
    }];
  }

  // Physics
  player.velocityY += GRAVITY;
  if (player.velocityY > 15) player.velocityY = 15; // terminal velocity
  player.x += player.velocityX;
  player.y += player.velocityY;

  // Platform collisions
  player.onGround = resolvePlatformCollisions(player, newState.platforms);
  if (player.onGround) player.isJumping = false;

  // World bounds
  player.x = Math.max(0, Math.min(WORLD_WIDTH - player.width, player.x));
  if (player.y > 550) {
    player.health = 0;
  }

  // Animation
  player.animTimer += dt;

  // Camera - smoother follow
  const targetCameraX = player.x - 400;
  newState.cameraX += (targetCameraX - newState.cameraX) * 0.08;
  newState.cameraX = Math.max(0, Math.min(WORLD_WIDTH - 800, newState.cameraX));

  // Update bullets
  newState.bullets = newState.bullets.filter(b => b.active).map(b => {
    const bullet = { ...b };
    bullet.x += bullet.velocityX;
    if (bullet.x < newState.cameraX - 50 || bullet.x > newState.cameraX + 900) {
      bullet.active = false;
    }
    return bullet;
  });

  // Spawn zombies
  newState.spawnTimer += dt;
  if (newState.spawnTimer > 1.5 && newState.zombiesToSpawn > 0) {
    newState.spawnTimer = 0;
    newState.zombiesToSpawn--;
    newState.zombies = [...newState.zombies, spawnZombie(newState)];
  }

  // Check wave complete
  if (newState.zombiesToSpawn <= 0 && newState.zombies.filter(z => z.active).length === 0) {
    if (newState.wave >= newState.maxWaves) {
      newState.gameWon = true;
      newState.gameOver = true;
    } else {
      newState.wave++;
      newState.zombiesToSpawn = 3 + newState.wave * 2;
      newState.score += newState.wave * 100;
    }
  }

  // Update zombies
  let newParticles = [...newState.particles];
  newState.zombies = newState.zombies.filter(z => z.active).map(z => {
    const zombie = { ...z };
    
    // AI - move towards player
    const dx = player.x - zombie.x;
    zombie.direction = dx > 0 ? 'right' : 'left';
    zombie.velocityX = zombie.direction === 'right' ? zombie.speed : -zombie.speed;

    // Jump over obstacles if blocked
    const inFront = newState.platforms.some(p => 
      p.type === 'brick' && 
      Math.abs((zombie.direction === 'right' ? zombie.x + zombie.width + 10 : zombie.x - 10) - p.x) < 20 &&
      zombie.y + zombie.height > p.y
    );
    if (inFront && zombie.velocityY === 0) {
      zombie.velocityY = -10;
    }

    // Physics
    zombie.velocityY += GRAVITY;
    zombie.x += zombie.velocityX;
    zombie.y += zombie.velocityY;

    resolvePlatformCollisions(zombie, newState.platforms);

    // World bounds
    zombie.x = Math.max(0, Math.min(WORLD_WIDTH - zombie.width, zombie.x));
    if (zombie.y > 600) zombie.active = false;

    // Animation
    zombie.animTimer += dt;

    // Damage player on contact
    if (checkCollision(zombie, player) && player.health > 0) {
      player.health -= 0.4;
      const knockback = zombie.x < player.x ? 4 : -4;
      player.velocityX = knockback;
      player.velocityY = -3;
    }

    // Bullet collision
    for (const bullet of newState.bullets) {
      if (bullet.active && checkCollision(bullet, zombie)) {
        bullet.active = false;
        zombie.health -= 25;
        zombie.velocityX = bullet.direction === 'right' ? 5 : -5;
        zombie.velocityY = -3;
        newParticles.push(...createBloodParticles(zombie.x + zombie.width / 2, zombie.y + zombie.height / 2, 5));

        if (zombie.health <= 0) {
          zombie.active = false;
          newState.score += zombie.type === 'big' ? 200 : zombie.type === 'fast' ? 150 : 100;
          newState.zombiesKilled++;
          newParticles.push(...createBloodParticles(zombie.x + zombie.width / 2, zombie.y + zombie.height / 2, 15));
        }
      }
    }

    return zombie;
  });

  // Update particles
  newParticles = newParticles.filter(p => p.life > 0).map(p => ({
    ...p,
    x: p.x + p.velocityX,
    y: p.y + p.velocityY,
    velocityY: p.velocityY + 0.2,
    velocityX: p.velocityX * 0.98,
    life: p.life - 1,
  }));

  newState.particles = newParticles;
  newState.player = player;

  if (player.health <= 0) {
    newState.gameOver = true;
  }

  return newState;
}

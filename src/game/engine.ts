import { GameState, Player, Zombie, Bullet, Platform, Particle } from './types';

const GRAVITY = 0.6;
const JUMP_FORCE = -12;
const MOVE_SPEED = 4;
const BULLET_SPEED = 10;
const SHOOT_COOLDOWN = 12;
const WORLD_WIDTH = 3200;

export function createInitialState(): GameState {
  const platforms = generatePlatforms();
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
    gameOver: false,
    gameStarted: false,
    cameraX: 0,
    spawnTimer: 0,
    zombiesKilled: 0,
    zombiesToSpawn: 3,
  };
}

function generatePlatforms(): Platform[] {
  const platforms: Platform[] = [];

  // Main ground
  for (let x = 0; x < WORLD_WIDTH; x += 400) {
    const gapChance = x > 200 && x < WORLD_WIDTH - 400 ? Math.random() : 1;
    if (gapChance > 0.2) {
      platforms.push({
        x,
        y: 440,
        width: 400,
        height: 60,
        type: 'ground',
      });
    }
  }

  // Floating platforms
  const floatingPositions = [
    { x: 250, y: 340 }, { x: 500, y: 300 }, { x: 750, y: 280 },
    { x: 1000, y: 320 }, { x: 1200, y: 260 }, { x: 1500, y: 340 },
    { x: 1700, y: 280 }, { x: 2000, y: 300 }, { x: 2200, y: 260 },
    { x: 2500, y: 340 }, { x: 2700, y: 300 }, { x: 3000, y: 280 },
  ];

  for (const pos of floatingPositions) {
    platforms.push({
      x: pos.x,
      y: pos.y,
      width: 96 + Math.random() * 64,
      height: 20,
      type: 'floating',
    });
  }

  // Some brick walls
  platforms.push({ x: 600, y: 360, width: 32, height: 80, type: 'brick' });
  platforms.push({ x: 1400, y: 360, width: 32, height: 80, type: 'brick' });
  platforms.push({ x: 2300, y: 360, width: 32, height: 80, type: 'brick' });

  return platforms;
}

function spawnZombie(state: GameState): Zombie {
  const types: Array<'normal' | 'fast' | 'big'> = ['normal', 'normal', 'normal', 'fast', 'big'];
  const type = state.wave >= 3 ? types[Math.floor(Math.random() * types.length)] : 'normal';
  
  const side = Math.random() > 0.5 ? 1 : -1;
  const spawnX = state.player.x + side * (500 + Math.random() * 200);

  const healthMult = 1 + (state.wave - 1) * 0.3;

  const configs = {
    normal: { health: 30 * healthMult, speed: 1.2 + Math.random() * 0.5, width: 24, height: 32 },
    fast: { health: 15 * healthMult, speed: 2.5 + Math.random() * 0.5, width: 20, height: 28 },
    big: { health: 80 * healthMult, speed: 0.7 + Math.random() * 0.3, width: 34, height: 45 },
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

function resolveplatformCollisions(entity: { x: number; y: number; width: number; height: number; velocityX: number; velocityY: number; onGround?: boolean }, platforms: Platform[]) {
  let onGround = false;

  for (const p of platforms) {
    if (checkCollision(entity, p)) {
      // From above
      const prevBottom = entity.y + entity.height - entity.velocityY;
      if (prevBottom <= p.y + 2 && entity.velocityY >= 0) {
        entity.y = p.y - entity.height;
        entity.velocityY = 0;
        onGround = true;
      }
      // From below
      else if (entity.velocityY < 0 && entity.y >= p.y + p.height - 4) {
        entity.y = p.y + p.height;
        entity.velocityY = 0;
      }
      // From sides
      else if (entity.velocityX > 0) {
        entity.x = p.x - entity.width;
      } else if (entity.velocityX < 0) {
        entity.x = p.x + p.width;
      }
    }
  }

  return onGround;
}

export function update(state: GameState, keys: Set<string>, dt: number): GameState {
  if (state.gameOver || !state.gameStarted) return state;

  const newState = { ...state };
  const player = { ...newState.player };

  // Player input
  player.isMoving = false;
  if (keys.has('ArrowLeft') || keys.has('a') || keys.has('A')) {
    player.velocityX = -MOVE_SPEED;
    player.direction = 'left';
    player.isMoving = true;
  } else if (keys.has('ArrowRight') || keys.has('d') || keys.has('D')) {
    player.velocityX = MOVE_SPEED;
    player.direction = 'right';
    player.isMoving = true;
  } else {
    player.velocityX *= 0.7;
    if (Math.abs(player.velocityX) < 0.1) player.velocityX = 0;
  }

  if ((keys.has('ArrowUp') || keys.has('w') || keys.has('W') || keys.has(' ')) && player.onGround) {
    player.velocityY = JUMP_FORCE;
    player.isJumping = true;
    player.onGround = false;
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
  player.x += player.velocityX;
  player.y += player.velocityY;

  // Platform collisions
  player.onGround = resolveplatformCollisions(player as any, newState.platforms);
  if (player.onGround) player.isJumping = false;

  // World bounds
  player.x = Math.max(0, Math.min(WORLD_WIDTH - player.width, player.x));
  if (player.y > 550) {
    player.health = 0;
  }

  // Animation
  player.animTimer += dt;

  // Camera
  const targetCameraX = player.x - 400;
  newState.cameraX += (targetCameraX - newState.cameraX) * 0.1;
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
  if (newState.spawnTimer > 2 && newState.zombiesToSpawn > 0) {
    newState.spawnTimer = 0;
    newState.zombiesToSpawn--;
    newState.zombies = [...newState.zombies, spawnZombie(newState)];
  }

  // Check wave complete
  if (newState.zombiesToSpawn <= 0 && newState.zombies.filter(z => z.active).length === 0) {
    newState.wave++;
    newState.zombiesToSpawn = 3 + newState.wave * 2;
    newState.score += newState.wave * 100;
  }

  // Update zombies
  let newParticles = [...newState.particles];
  newState.zombies = newState.zombies.filter(z => z.active).map(z => {
    const zombie = { ...z };
    
    // AI - move towards player
    const dx = player.x - zombie.x;
    zombie.direction = dx > 0 ? 'right' : 'left';
    zombie.velocityX = zombie.direction === 'right' ? zombie.speed : -zombie.speed;

    // Physics
    zombie.velocityY += GRAVITY;
    zombie.x += zombie.velocityX;
    zombie.y += zombie.velocityY;

    resolveplatformCollisions(zombie as any, newState.platforms);

    // World bounds
    zombie.x = Math.max(0, Math.min(WORLD_WIDTH - zombie.width, zombie.x));
    if (zombie.y > 600) zombie.active = false;

    // Animation
    zombie.animTimer += dt;

    // Damage player on contact
    if (checkCollision(zombie, player) && player.health > 0) {
      player.health -= 0.5;
      const knockback = zombie.x < player.x ? 3 : -3;
      player.velocityX = knockback;
    }

    // Bullet collision
    for (const bullet of newState.bullets) {
      if (bullet.active && checkCollision(bullet, zombie)) {
        bullet.active = false;
        zombie.health -= 25;
        zombie.velocityX = bullet.direction === 'right' ? 4 : -4;
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

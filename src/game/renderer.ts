import { GameState, Player, Zombie, Bullet, Platform, Particle } from './types';
import { getLevelTheme, LevelTheme } from './levels';

const BASE_COLORS = {
  player: '#3a7d44',
  playerLight: '#5aad64',
  playerDark: '#1a5d24',
  skin: '#e8b87a',
  skinDark: '#c89a5a',
  gun: '#555555',
  gunLight: '#777777',
  zombie: '#4a8a3a',
  zombieDark: '#2a6a1a',
  zombieLight: '#6aaa5a',
  zombieEyes: '#ff2222',
  blood: '#aa0000',
  bloodLight: '#dd3333',
  bullet: '#ffcc00',
  bulletGlow: '#ffee66',
  healthBar: '#44dd44',
  healthBarBg: '#222222',
  ui: '#44ff44',
  uiDark: '#228822',
};

function drawPixelRect(ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, color: string) {
  ctx.fillStyle = color;
  ctx.fillRect(Math.floor(x), Math.floor(y), w, h);
}

function drawPlayer(ctx: CanvasRenderingContext2D, player: Player, cameraX: number) {
  const px = Math.floor(player.x - cameraX);
  const py = Math.floor(player.y);
  const dir = player.direction === 'right' ? 1 : -1;
  const bodyOffset = player.isMoving && player.onGround ? Math.sin(player.animTimer * 10) * 2 : 0;

  if (player.isMoving && player.onGround) {
    const legAnim = Math.sin(player.animTimer * 12);
    drawPixelRect(ctx, px + (dir === 1 ? 4 : 16), py + 24 + Math.abs(legAnim) * 2, 6, 8 - Math.abs(legAnim) * 2, BASE_COLORS.playerDark);
    drawPixelRect(ctx, px + (dir === 1 ? 14 : 6), py + 24 - Math.abs(legAnim) * 2, 6, 8 + Math.abs(legAnim) * 2, BASE_COLORS.playerDark);
  } else {
    drawPixelRect(ctx, px + 4, py + 24, 6, 8, BASE_COLORS.playerDark);
    drawPixelRect(ctx, px + 14, py + 24, 6, 8, BASE_COLORS.playerDark);
  }

  drawPixelRect(ctx, px + 2, py + 10 + bodyOffset, 20, 14, BASE_COLORS.player);
  drawPixelRect(ctx, px + 4, py + 12 + bodyOffset, 16, 10, BASE_COLORS.playerLight);
  drawPixelRect(ctx, px + 4, py - 2 + bodyOffset, 16, 14, BASE_COLORS.skin);
  drawPixelRect(ctx, px + 6, py + bodyOffset, 12, 10, BASE_COLORS.skinDark);

  const eyeX = dir === 1 ? px + 14 : px + 6;
  drawPixelRect(ctx, eyeX, py + 4 + bodyOffset, 4, 4, '#ffffff');
  drawPixelRect(ctx, eyeX + 1, py + 5 + bodyOffset, 2, 2, '#222222');
  drawPixelRect(ctx, px + 2, py - 4 + bodyOffset, 20, 4, BASE_COLORS.playerDark);
  drawPixelRect(ctx, px + (dir === 1 ? 0 : 16), py - 2 + bodyOffset, 8, 2, BASE_COLORS.playerDark);

  const gunY = py + 14 + bodyOffset;
  const gunX = dir === 1 ? px + 20 : px - 14;
  drawPixelRect(ctx, dir === 1 ? px + 18 : px - 2, gunY, 8, 4, BASE_COLORS.skin);
  drawPixelRect(ctx, gunX, gunY - 1, 14, 5, BASE_COLORS.gun);
  drawPixelRect(ctx, gunX + (dir === 1 ? 12 : 0), gunY, 3, 3, BASE_COLORS.gunLight);

  if (player.shootCooldown > 8) {
    const flashX = dir === 1 ? gunX + 16 : gunX - 6;
    ctx.fillStyle = BASE_COLORS.bulletGlow;
    ctx.globalAlpha = (player.shootCooldown - 8) / 4;
    ctx.fillRect(flashX, gunY - 3, 6, 8);
    ctx.globalAlpha = 1;
  }
}

function drawZombie(ctx: CanvasRenderingContext2D, zombie: Zombie, cameraX: number) {
  if (!zombie.active) return;
  const zx = Math.floor(zombie.x - cameraX);
  const zy = Math.floor(zombie.y);
  const dir = zombie.direction === 'right' ? 1 : -1;
  const scale = zombie.type === 'big' ? 1.4 : 1;
  const wobble = Math.sin(zombie.animTimer * 6) * 2;

  const legAnim = Math.sin(zombie.animTimer * 4);
  drawPixelRect(ctx, zx + 4 * scale, zy + 24 * scale + Math.abs(legAnim) * 3, 6 * scale, 8 * scale, BASE_COLORS.zombieDark);
  drawPixelRect(ctx, zx + 14 * scale, zy + 24 * scale - Math.abs(legAnim) * 2, 6 * scale, 8 * scale + Math.abs(legAnim) * 2, BASE_COLORS.zombieDark);

  drawPixelRect(ctx, zx + 2 * scale, zy + 10 * scale + wobble, 20 * scale, 14 * scale, BASE_COLORS.zombie);
  drawPixelRect(ctx, zx + 6 * scale, zy + 14 * scale + wobble, 4 * scale, 6 * scale, BASE_COLORS.zombieDark);
  drawPixelRect(ctx, zx + 14 * scale, zy + 12 * scale + wobble, 4 * scale, 4 * scale, BASE_COLORS.blood);
  drawPixelRect(ctx, zx + 4 * scale, zy - 2 * scale + wobble, 16 * scale, 14 * scale, BASE_COLORS.zombie);
  drawPixelRect(ctx, zx + 6 * scale, zy + wobble, 12 * scale, 10 * scale, BASE_COLORS.zombieLight);

  const eyeFlicker = Math.random() > 0.95 ? 0 : 1;
  drawPixelRect(ctx, zx + 6 * scale, zy + 3 * scale + wobble, 4 * scale, 4 * scale * eyeFlicker, BASE_COLORS.zombieEyes);
  drawPixelRect(ctx, zx + 14 * scale, zy + 3 * scale + wobble, 4 * scale, 4 * scale * eyeFlicker, BASE_COLORS.zombieEyes);

  const armX = dir === 1 ? zx + 20 * scale : zx - 10 * scale;
  drawPixelRect(ctx, armX, zy + 10 * scale + wobble + Math.sin(zombie.animTimer * 3) * 4, 10 * scale, 4 * scale, BASE_COLORS.zombie);

  if (zombie.health < zombie.maxHealth) {
    const barWidth = 24 * scale;
    const healthPercent = zombie.health / zombie.maxHealth;
    drawPixelRect(ctx, zx, zy - 8 * scale, barWidth, 3, BASE_COLORS.healthBarBg);
    drawPixelRect(ctx, zx, zy - 8 * scale, barWidth * healthPercent, 3, zombie.health > zombie.maxHealth * 0.3 ? BASE_COLORS.healthBar : BASE_COLORS.blood);
  }
}

function drawBullet(ctx: CanvasRenderingContext2D, bullet: Bullet, cameraX: number) {
  if (!bullet.active) return;
  const bx = Math.floor(bullet.x - cameraX);
  const by = Math.floor(bullet.y);
  ctx.fillStyle = BASE_COLORS.bulletGlow;
  ctx.globalAlpha = 0.4;
  ctx.fillRect(bx - 2, by - 2, 10, 8);
  ctx.globalAlpha = 1;
  drawPixelRect(ctx, bx, by, 6, 4, BASE_COLORS.bullet);
  drawPixelRect(ctx, bx + (bullet.direction === 'right' ? 4 : 0), by + 1, 2, 2, '#ffffff');
}

function drawPlatform(ctx: CanvasRenderingContext2D, platform: Platform, cameraX: number, theme: LevelTheme) {
  const px = Math.floor(platform.x - cameraX);
  const py = Math.floor(platform.y);

  if (platform.type === 'ground') {
    drawPixelRect(ctx, px, py, platform.width, 4, theme.grassColor);
    drawPixelRect(ctx, px, py + 4, platform.width, platform.height - 4, theme.groundColor);
    for (let i = 0; i < platform.width; i += 16) {
      drawPixelRect(ctx, px + i + 4, py + 12, 4, 4, theme.groundDark);
      drawPixelRect(ctx, px + i + 12, py + 20, 4, 4, theme.groundDark);
    }
  } else if (platform.type === 'brick') {
    for (let row = 0; row < platform.height; row += 16) {
      const offset = (row / 16) % 2 === 0 ? 0 : 16;
      for (let col = 0; col < platform.width; col += 32) {
        drawPixelRect(ctx, px + col + offset, py + row, 30, 14, theme.brickColor);
        drawPixelRect(ctx, px + col + offset + 1, py + row + 1, 28, 2, theme.brickLight);
        drawPixelRect(ctx, px + col + offset + 27, py + row + 3, 2, 10, theme.brickDark);
      }
    }
  } else {
    drawPixelRect(ctx, px, py, platform.width, 4, theme.floatingTop);
    drawPixelRect(ctx, px, py + 4, platform.width, platform.height - 4, theme.floatingColor);
    drawPixelRect(ctx, px + 1, py + 5, platform.width - 2, 2, theme.brickLight);
  }
}

function drawParticle(ctx: CanvasRenderingContext2D, particle: Particle, cameraX: number) {
  const alpha = particle.life / particle.maxLife;
  ctx.fillStyle = particle.color;
  ctx.globalAlpha = alpha;
  ctx.fillRect(Math.floor(particle.x - cameraX), Math.floor(particle.y), particle.size, particle.size);
  ctx.globalAlpha = 1;
}

function drawBackground(ctx: CanvasRenderingContext2D, width: number, height: number, cameraX: number, theme: LevelTheme) {
  const gradient = ctx.createLinearGradient(0, 0, 0, height);
  gradient.addColorStop(0, theme.skyTop);
  gradient.addColorStop(0.5, theme.skyMid);
  gradient.addColorStop(1, theme.skyBottom);
  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, width, height);

  // Moon/light source
  const moonX = width * 0.8 - (cameraX * 0.05) % width;
  ctx.fillStyle = theme.moonColor;
  ctx.beginPath();
  ctx.arc(moonX, 60, 30, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = theme.skyTop;
  ctx.beginPath();
  ctx.arc(moonX + 8, 55, 26, 0, Math.PI * 2);
  ctx.fill();

  // Stars
  const starSeed = [23, 67, 134, 189, 245, 312, 378, 445, 512, 589, 645, 712, 778, 834];
  ctx.fillStyle = theme.starsColor;
  for (const s of starSeed) {
    const sx = (s * 7 + 100 - cameraX * 0.02) % width;
    const sy = (s * 3 + 20) % (height * 0.4);
    const twinkle = Math.sin(Date.now() / 500 + s) * 0.5 + 0.5;
    ctx.globalAlpha = twinkle * 0.8;
    ctx.fillRect(sx, sy, 2, 2);
  }
  ctx.globalAlpha = 1;

  // Background silhouettes
  ctx.fillStyle = theme.bgElementColor;
  for (let i = 0; i < width + 200; i += 80) {
    const bx = i - (cameraX * 0.1) % 80;
    const bh = 60 + Math.sin(i * 0.1) * 40;
    ctx.fillRect(bx, height - 120 - bh, 60, bh + 20);
    ctx.fillStyle = theme.bgDetailColor;
    for (let wy = 0; wy < bh - 10; wy += 16) {
      for (let wx = 8; wx < 50; wx += 14) {
        if (Math.sin(i + wx + wy) > 0.3) {
          ctx.fillRect(bx + wx, height - 120 - bh + wy + 8, 6, 8);
        }
      }
    }
    ctx.fillStyle = theme.bgElementColor;
  }

  // Fog overlay
  if (theme.fogAlpha > 0) {
    ctx.fillStyle = theme.fogColor;
    ctx.globalAlpha = theme.fogAlpha * (0.7 + Math.sin(Date.now() / 2000) * 0.3);
    ctx.fillRect(0, height * 0.5, width, height * 0.5);
    ctx.globalAlpha = 1;
  }
}

function drawHUD(ctx: CanvasRenderingContext2D, state: GameState, width: number, theme: LevelTheme) {
  const barX = 16, barY = 16, barW = 160, barH = 16;

  ctx.fillStyle = BASE_COLORS.healthBarBg;
  ctx.fillRect(barX - 2, barY - 2, barW + 4, barH + 4);
  ctx.fillStyle = BASE_COLORS.uiDark;
  ctx.fillRect(barX, barY, barW, barH);

  const healthPercent = state.player.health / state.player.maxHealth;
  const healthColor = healthPercent > 0.5 ? BASE_COLORS.healthBar : healthPercent > 0.25 ? BASE_COLORS.bullet : BASE_COLORS.blood;
  ctx.fillStyle = healthColor;
  ctx.fillRect(barX, barY, barW * healthPercent, barH);

  ctx.fillStyle = '#ffffff';
  ctx.font = '8px "Press Start 2P"';
  ctx.textAlign = 'left';
  ctx.fillText('HP', barX, barY - 4);

  ctx.fillStyle = BASE_COLORS.ui;
  ctx.font = '10px "Press Start 2P"';
  ctx.textAlign = 'right';
  ctx.fillText(`SCORE: ${state.score}`, width - 16, 28);
  ctx.fillText(`WAVE: ${state.wave}/${state.maxWaves}`, width - 16, 48);
  ctx.fillStyle = BASE_COLORS.blood;
  ctx.fillText(`KILLS: ${state.zombiesKilled}`, width - 16, 68);

  // Level name
  ctx.fillStyle = theme.starsColor;
  ctx.font = '7px "Press Start 2P"';
  ctx.textAlign = 'center';
  ctx.fillText(`${theme.icon} ${theme.name}`, width / 2, 16);

  ctx.textAlign = 'left';
}

export function render(ctx: CanvasRenderingContext2D, state: GameState, width: number, height: number) {
  const theme = getLevelTheme(state.levelId);
  ctx.clearRect(0, 0, width, height);

  drawBackground(ctx, width, height, state.cameraX, theme);

  for (const platform of state.platforms) {
    drawPlatform(ctx, platform, state.cameraX, theme);
  }
  for (const particle of state.particles) {
    drawParticle(ctx, particle, state.cameraX);
  }
  for (const bullet of state.bullets) {
    drawBullet(ctx, bullet, state.cameraX);
  }
  for (const zombie of state.zombies) {
    drawZombie(ctx, zombie, state.cameraX);
  }
  drawPlayer(ctx, state.player, state.cameraX);
  drawHUD(ctx, state, width, theme);
}

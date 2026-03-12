export interface Vector2D {
  x: number;
  y: number;
}

export interface Entity {
  x: number;
  y: number;
  width: number;
  height: number;
  velocityX: number;
  velocityY: number;
}

export interface Player extends Entity {
  isJumping: boolean;
  onGround: boolean;
  direction: 'left' | 'right';
  health: number;
  maxHealth: number;
  shootCooldown: number;
  animFrame: number;
  animTimer: number;
  isMoving: boolean;
}

export interface Bullet extends Entity {
  direction: 'left' | 'right';
  active: boolean;
}

export interface Zombie extends Entity {
  health: number;
  maxHealth: number;
  active: boolean;
  direction: 'left' | 'right';
  animFrame: number;
  animTimer: number;
  speed: number;
  type: 'normal' | 'fast' | 'big';
}

export interface Platform {
  x: number;
  y: number;
  width: number;
  height: number;
  type: 'ground' | 'brick' | 'floating';
}

export interface Particle {
  x: number;
  y: number;
  velocityX: number;
  velocityY: number;
  life: number;
  maxLife: number;
  color: string;
  size: number;
}

export interface GameState {
  player: Player;
  bullets: Bullet[];
  zombies: Zombie[];
  platforms: Platform[];
  particles: Particle[];
  score: number;
  wave: number;
  gameOver: boolean;
  gameStarted: boolean;
  cameraX: number;
  spawnTimer: number;
  zombiesKilled: number;
  zombiesToSpawn: number;
}

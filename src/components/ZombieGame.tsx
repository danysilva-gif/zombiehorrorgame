import { useRef, useEffect, useState, useCallback } from 'react';
import { createInitialState, update } from '@/game/engine';
import { render } from '@/game/renderer';
import { GameState } from '@/game/types';
import { LevelConfig } from '@/game/levels';
import LevelSelect from './LevelSelect';

const GAME_WIDTH = 800;
const GAME_HEIGHT = 500;

type Screen = 'title' | 'levels' | 'playing' | 'gameover' | 'victory';

export default function ZombieGame() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const keysRef = useRef<Set<string>>(new Set());
  const gameStateRef = useRef<GameState>(createInitialState());
  const animFrameRef = useRef<number>(0);
  const lastTimeRef = useRef<number>(0);

  const [screen, setScreen] = useState<Screen>('title');
  const [finalScore, setFinalScore] = useState(0);
  const [finalWave, setFinalWave] = useState(0);
  const [finalKills, setFinalKills] = useState(0);
  const [scale, setScale] = useState(1);
  const [currentLevel, setCurrentLevel] = useState<LevelConfig | null>(null);
  const [unlockedLevel, setUnlockedLevel] = useState(() => {
    const saved = localStorage.getItem('zombie_unlocked');
    return saved ? parseInt(saved, 10) : 1;
  });

  const updateScale = useCallback(() => {
    const vw = window.innerWidth;
    const vh = window.innerHeight;
    const padding = 80;
    const scaleX = (vw - 32) / GAME_WIDTH;
    const scaleY = (vh - padding) / GAME_HEIGHT;
    setScale(Math.min(scaleX, scaleY, 1.5));
  }, []);

  useEffect(() => {
    updateScale();
    window.addEventListener('resize', updateScale);
    return () => window.removeEventListener('resize', updateScale);
  }, [updateScale]);

  const startLevel = useCallback((level: LevelConfig) => {
    const state = createInitialState(level.id, level.wavesRequired);
    state.gameStarted = true;
    gameStateRef.current = state;
    setCurrentLevel(level);
    setScreen('playing');
  }, []);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', ' '].includes(e.key)) {
        e.preventDefault();
      }
      keysRef.current.add(e.key);
    };
    const handleKeyUp = (e: KeyboardEvent) => {
      keysRef.current.delete(e.key);
    };
    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || screen !== 'playing') return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const gameLoop = (timestamp: number) => {
      const dt = Math.min((timestamp - lastTimeRef.current) / 1000, 0.05);
      lastTimeRef.current = timestamp;

      gameStateRef.current = update(gameStateRef.current, keysRef.current, dt);
      const gs = gameStateRef.current;

      if (gs.gameOver && screen === 'playing') {
        setFinalScore(gs.score);
        setFinalWave(gs.wave);
        setFinalKills(gs.zombiesKilled);
        if (gs.gameWon) {
          // Unlock next level
          if (currentLevel && currentLevel.id >= unlockedLevel) {
            const next = currentLevel.id + 1;
            setUnlockedLevel(next);
            localStorage.setItem('zombie_unlocked', String(next));
          }
          setScreen('victory');
        } else {
          setScreen('gameover');
        }
      }

      render(ctx, gs, GAME_WIDTH, GAME_HEIGHT);
      animFrameRef.current = requestAnimationFrame(gameLoop);
    };

    lastTimeRef.current = performance.now();
    animFrameRef.current = requestAnimationFrame(gameLoop);
    return () => cancelAnimationFrame(animFrameRef.current);
  }, [screen, currentLevel, unlockedLevel]);

  // Title screen
  if (screen === 'title') {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-background gap-4 p-4">
        <h1 className="pixel-text text-primary text-base md:text-2xl tracking-wider animate-pulse">
          🧟 ZOMBIE SLAYER 🧟
        </h1>
        <div className="flex flex-col gap-1.5 text-muted-foreground pixel-text text-[6px] md:text-[8px]">
          <p>← → ou A/D: Mover</p>
          <p>↑ ou W ou ESPAÇO: Pular</p>
          <p>Z ou J: Atirar</p>
        </div>
        <button
          onClick={() => setScreen('levels')}
          className="pixel-text text-accent bg-muted px-8 py-4 pixel-border hover:bg-primary hover:text-primary-foreground transition-colors text-xs md:text-sm"
        >
          ▶ JOGAR
        </button>
      </div>
    );
  }

  // Level select
  if (screen === 'levels') {
    return (
      <LevelSelect
        unlockedLevel={unlockedLevel}
        onSelectLevel={startLevel}
        onBack={() => setScreen('title')}
      />
    );
  }

  // Game canvas (playing, gameover, victory)
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-background gap-2 p-2">
      <h1 className="pixel-text text-primary text-sm md:text-xl tracking-wider">
        🧟 ZOMBIE SLAYER 🧟
      </h1>

      <div
        className="relative pixel-border"
        style={{ width: GAME_WIDTH * scale, height: GAME_HEIGHT * scale }}
      >
        <canvas
          ref={canvasRef}
          width={GAME_WIDTH}
          height={GAME_HEIGHT}
          className="block"
          style={{
            imageRendering: 'pixelated',
            width: GAME_WIDTH * scale,
            height: GAME_HEIGHT * scale,
          }}
        />

        {screen === 'gameover' && (
          <div className="absolute inset-0 flex flex-col items-center justify-center bg-background/90">
            <h2 className="pixel-text text-destructive text-base md:text-xl mb-3">GAME OVER</h2>
            <div className="flex flex-col gap-1.5 pixel-text text-[9px] md:text-[11px] text-foreground mb-4">
              <p>SCORE: <span className="text-primary">{finalScore}</span></p>
              <p>WAVE: <span className="text-primary">{finalWave}</span></p>
              <p>KILLS: <span className="text-destructive">{finalKills}</span></p>
            </div>
            <div className="flex gap-3">
              <button
                onClick={() => currentLevel && startLevel(currentLevel)}
                className="pixel-text text-accent bg-muted px-4 py-2 pixel-border hover:bg-primary hover:text-primary-foreground transition-colors text-[8px] md:text-[10px]"
              >
                ↻ TENTAR NOVAMENTE
              </button>
              <button
                onClick={() => setScreen('levels')}
                className="pixel-text text-accent bg-muted px-4 py-2 pixel-border hover:bg-primary hover:text-primary-foreground transition-colors text-[8px] md:text-[10px]"
              >
                📋 FASES
              </button>
            </div>
          </div>
        )}

        {screen === 'victory' && (
          <div className="absolute inset-0 flex flex-col items-center justify-center bg-background/90">
            <h2 className="pixel-text text-accent text-base md:text-xl mb-1 animate-pulse">⭐ VITÓRIA! ⭐</h2>
            <p className="pixel-text text-primary text-[8px] md:text-[10px] mb-3">
              {currentLevel?.theme.name} COMPLETO!
            </p>
            <div className="flex flex-col gap-1.5 pixel-text text-[9px] md:text-[11px] text-foreground mb-4">
              <p>SCORE: <span className="text-primary">{finalScore}</span></p>
              <p>KILLS: <span className="text-destructive">{finalKills}</span></p>
            </div>
            <div className="flex gap-3">
              <button
                onClick={() => setScreen('levels')}
                className="pixel-text text-accent bg-muted px-4 py-2 pixel-border hover:bg-primary hover:text-primary-foreground transition-colors text-[8px] md:text-[10px]"
              >
                📋 PRÓXIMA FASE
              </button>
            </div>
          </div>
        )}
      </div>

      <div className="flex gap-4 pixel-text text-[7px] md:text-[9px] text-muted-foreground">
        <span>← → MOVER</span>
        <span>↑ PULAR</span>
        <span>Z ATIRAR</span>
      </div>
    </div>
  );
}

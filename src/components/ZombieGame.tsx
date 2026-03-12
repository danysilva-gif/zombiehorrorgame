import { useRef, useEffect, useState, useCallback } from 'react';
import { createInitialState, update } from '@/game/engine';
import { render } from '@/game/renderer';
import { GameState } from '@/game/types';

const GAME_WIDTH = 800;
const GAME_HEIGHT = 500;

export default function ZombieGame() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const keysRef = useRef<Set<string>>(new Set());
  const gameStateRef = useRef<GameState>(createInitialState());
  const animFrameRef = useRef<number>(0);
  const lastTimeRef = useRef<number>(0);
  const [gameStarted, setGameStarted] = useState(false);
  const [gameOver, setGameOver] = useState(false);
  const [finalScore, setFinalScore] = useState(0);
  const [finalWave, setFinalWave] = useState(0);
  const [finalKills, setFinalKills] = useState(0);
  const [scale, setScale] = useState(1);

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

  const startGame = useCallback(() => {
    const state = createInitialState();
    state.gameStarted = true;
    gameStateRef.current = state;
    setGameStarted(true);
    setGameOver(false);
  }, []);

  const restartGame = useCallback(() => {
    startGame();
  }, [startGame]);

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
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const gameLoop = (timestamp: number) => {
      const dt = Math.min((timestamp - lastTimeRef.current) / 1000, 0.05);
      lastTimeRef.current = timestamp;

      gameStateRef.current = update(gameStateRef.current, keysRef.current, dt);

      if (gameStateRef.current.gameOver && !gameOver) {
        setGameOver(true);
        setFinalScore(gameStateRef.current.score);
        setFinalWave(gameStateRef.current.wave);
        setFinalKills(gameStateRef.current.zombiesKilled);
      }

      render(ctx, gameStateRef.current, GAME_WIDTH, GAME_HEIGHT);
      animFrameRef.current = requestAnimationFrame(gameLoop);
    };

    animFrameRef.current = requestAnimationFrame(gameLoop);
    return () => cancelAnimationFrame(animFrameRef.current);
  }, [gameOver]);

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-background gap-2 p-2">
      <h1 className="pixel-text text-primary text-sm md:text-xl tracking-wider">
        🧟 ZOMBIE SLAYER 🧟
      </h1>

      <div
        ref={containerRef}
        className="relative pixel-border"
        style={{
          width: GAME_WIDTH * scale,
          height: GAME_HEIGHT * scale,
        }}
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

        {!gameStarted && !gameOver && (
          <div className="absolute inset-0 flex flex-col items-center justify-center bg-background/90">
            <h2 className="pixel-text text-primary text-base md:text-xl mb-6 animate-pulse">
              ZOMBIE SLAYER
            </h2>
            <div className="flex flex-col gap-2 text-muted-foreground pixel-text text-[7px] md:text-[9px] mb-6">
              <p>← → ou A/D: Mover</p>
              <p>↑ ou W ou ESPAÇO: Pular</p>
              <p>Z ou J: Atirar</p>
            </div>
            <button
              onClick={startGame}
              className="pixel-text text-accent bg-muted px-6 py-3 pixel-border hover:bg-primary hover:text-primary-foreground transition-colors text-xs md:text-sm"
            >
              ▶ INICIAR
            </button>
          </div>
        )}

        {gameOver && (
          <div className="absolute inset-0 flex flex-col items-center justify-center bg-background/90">
            <h2 className="pixel-text text-destructive text-base md:text-xl mb-3">
              GAME OVER
            </h2>
            <div className="flex flex-col gap-1.5 pixel-text text-[9px] md:text-[11px] text-foreground mb-4">
              <p>SCORE: <span className="text-primary">{finalScore}</span></p>
              <p>WAVE: <span className="text-primary">{finalWave}</span></p>
              <p>KILLS: <span className="text-destructive">{finalKills}</span></p>
            </div>
            <button
              onClick={restartGame}
              className="pixel-text text-accent bg-muted px-6 py-3 pixel-border hover:bg-primary hover:text-primary-foreground transition-colors text-xs md:text-sm"
            >
              ↻ JOGAR NOVAMENTE
            </button>
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

import { LEVELS, LevelConfig } from '@/game/levels';

interface LevelSelectProps {
  unlockedLevel: number;
  onSelectLevel: (level: LevelConfig) => void;
  onBack: () => void;
}

export default function LevelSelect({ unlockedLevel, onSelectLevel, onBack }: LevelSelectProps) {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-background p-4 overflow-auto">
      <h1 className="pixel-text text-primary text-sm md:text-lg mb-1">
        🧟 ZOMBIE SLAYER 🧟
      </h1>
      <h2 className="pixel-text text-accent text-[8px] md:text-xs mb-4">
        SELECIONE A FASE
      </h2>

      <div className="grid grid-cols-4 md:grid-cols-5 gap-2 md:gap-3 max-w-[600px] w-full mb-4">
        {LEVELS.map((level) => {
          const locked = level.id > unlockedLevel;
          return (
            <button
              key={level.id}
              onClick={() => !locked && onSelectLevel(level)}
              disabled={locked}
              className={`
                relative flex flex-col items-center justify-center
                pixel-border p-1.5 md:p-2 transition-all
                ${locked
                  ? 'bg-muted opacity-40 cursor-not-allowed'
                  : 'bg-card hover:bg-primary/20 hover:scale-105 cursor-pointer'
                }
              `}
            >
              <span className="text-lg md:text-xl mb-0.5">
                {locked ? '🔒' : level.theme.icon}
              </span>
              <span className="pixel-text text-[5px] md:text-[7px] text-foreground">
                {level.id}
              </span>
              <span className="pixel-text text-[4px] md:text-[5px] text-muted-foreground leading-tight text-center mt-0.5">
                {locked ? '???' : level.name}
              </span>
              {level.id < unlockedLevel && (
                <span className="absolute top-0.5 right-0.5 text-[6px]">⭐</span>
              )}
            </button>
          );
        })}
      </div>

      <button
        onClick={onBack}
        className="pixel-text text-accent bg-muted px-4 py-2 pixel-border hover:bg-primary hover:text-primary-foreground transition-colors text-[8px] md:text-[10px]"
      >
        ← VOLTAR
      </button>
    </div>
  );
}

import { Suspense, lazy, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Brain, Crown, Gamepad2, Shield, Sparkles } from 'lucide-react';
import { useI18n } from '../i18n/I18nContext';

const TechQuizArena = lazy(() =>
  import('../components/TechQuizArena').then((m) => ({ default: m.TechQuizArena }))
);
const NeuralChessGame = lazy(() =>
  import('../components/NeuralChessGame').then((m) => ({ default: m.NeuralChessGame }))
);
const OrbitalDefenderGame = lazy(() =>
  import('../components/OrbitalDefenderGame').then((m) => ({ default: m.OrbitalDefenderGame }))
);

type ArcadeGameId = 'quiz' | 'chess' | 'orbital';

function parseGameParam(val: string | null): ArcadeGameId {
  if (val === 'chess') return 'chess';
  if (val === 'orbital') return 'orbital';
  return 'quiz';
}

export function ArcadePage() {
  const { t } = useI18n();
  const [searchParams, setSearchParams] = useSearchParams();
  const [activeGame, setActiveGame] = useState<ArcadeGameId>(() => parseGameParam(searchParams.get('game')));

  const selectGame = (game: ArcadeGameId) => {
    setActiveGame(game);
    setSearchParams(game === 'quiz' ? {} : { game });
  };

  return (
    <div className="max-w-[1560px] mx-auto px-4 sm:px-6 lg:px-10 xl:px-12 py-10 space-y-6">
      {/* Header — Open Editorial */}
      <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-4">
        <div className="space-y-2.5 max-w-3xl">
          <div className="inline-flex items-center gap-2 text-xs font-mono font-semibold tracking-wider text-indigo-700 dark:text-indigo-300">
            <Gamepad2 className="w-4 h-4" /> {t.arcade.badge}
          </div>
          <h1 className="font-brand font-bold text-3xl sm:text-5xl text-black dark:text-white tracking-tight">
            {t.arcade.title}
          </h1>
          <p className="text-sm sm:text-base text-slate-800 dark:text-white leading-relaxed">
            {t.arcade.subtitle}
          </p>
        </div>

        <div className="inline-flex items-center gap-2 ps-3.5 border-s-2 border-emerald-500 font-mono text-xs text-slate-800 dark:text-white shrink-0">
          <Sparkles className="w-4 h-4 text-emerald-500 shrink-0" />
          {t.arcade.zeroLatency}
        </div>
      </div>

      {/* 3-Game Switcher — Open Underline / Pill Tabs */}
      <div className="flex flex-wrap items-center gap-3 border-b border-slate-300/80 dark:border-slate-800 pb-4">
        <button
          type="button"
          onClick={() => selectGame('quiz')}
          className={`px-5 py-2.5 rounded-full text-sm font-bold inline-flex items-center gap-2 transition ${
            activeGame === 'quiz'
              ? 'bg-indigo-500 text-white shadow-sm'
              : 'border border-slate-300 dark:border-slate-700 text-black dark:text-white hover:border-indigo-500'
          }`}
        >
          <Brain className="w-4 h-4 shrink-0" /> {t.arcade.tabQuiz}
          <span className="px-1.5 py-0.5 rounded-full text-[10px] font-mono bg-black/20">EN · FR · AR</span>
        </button>

        <button
          type="button"
          onClick={() => selectGame('chess')}
          className={`px-5 py-2.5 rounded-full text-sm font-bold inline-flex items-center gap-2 transition ${
            activeGame === 'chess'
              ? 'bg-emerald-500 text-slate-950 shadow-sm'
              : 'border border-slate-300 dark:border-slate-700 text-black dark:text-white hover:border-emerald-500'
          }`}
        >
          <Crown className="w-4 h-4 shrink-0" /> {t.arcade.tabChess}
          <span className="px-1.5 py-0.5 rounded-full text-[10px] font-mono bg-black/15">LOCAL AI + 2P</span>
        </button>

        <button
          type="button"
          onClick={() => selectGame('orbital')}
          className={`px-5 py-2.5 rounded-full text-sm font-bold inline-flex items-center gap-2 transition ${
            activeGame === 'orbital'
              ? 'bg-sky-500 text-slate-950 shadow-sm'
              : 'border border-slate-300 dark:border-slate-700 text-black dark:text-white hover:border-sky-500'
          }`}
        >
          <Shield className="w-4 h-4 shrink-0" /> {t.arcade.tabOrbital}
          <span className="px-1.5 py-0.5 rounded-full text-[10px] font-mono bg-black/15">60FPS</span>
        </button>
      </div>

      {/* Active Game Arena (Lazy-Loaded Per Game!) */}
      <Suspense
        fallback={
          <div className="py-20 flex items-center justify-center">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-xl glass-panel text-xs font-mono text-sky-600 dark:text-sky-300">
              <span className="w-2 h-2 rounded-full bg-sky-500 animate-pulse" />
              Loading Arcade Module...
            </div>
          </div>
        }
      >
        {activeGame === 'quiz' ? (
          <TechQuizArena />
        ) : activeGame === 'chess' ? (
          <NeuralChessGame />
        ) : (
          <OrbitalDefenderGame />
        )}
      </Suspense>
    </div>
  );
}

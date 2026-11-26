import { useCallback, useEffect, useMemo, useState } from 'react';
import {
  ArrowRight,
  Award,
  Brain,
  Check,
  CheckCircle2,
  Code2,
  Copy,
  Flame,
  Globe,
  Heart,
  HelpCircle,
  Lightbulb,
  Play,
  RotateCcw,
  Scissors,
  Sparkles,
  Terminal,
  Timer,
  Trophy,
  Volume2,
  VolumeX,
  XCircle,
  Zap,
} from 'lucide-react';
import {
  QUIZ_QUESTIONS,
  QUIZ_UI,
  type QuizDifficulty,
  type QuizLang,
  type QuizMode,
  type QuizQuestion,
  type QuizTrack,
} from '../data/techQuizBank';
import { useI18n } from '../i18n/I18nContext';

interface QuizProfile {
  xp: number;
  bestScore: number;
  solvedIds: string[];
}

interface MistakeEntry {
  question: QuizQuestion;
  chosenIndex: number;
}

const STORAGE_PROFILE = 'kronvex-tech-quiz-profile-v1';
const STORAGE_LANG = 'kronvex-tech-quiz-lang';

function loadProfile(): QuizProfile {
  if (typeof window === 'undefined') return { xp: 0, bestScore: 0, solvedIds: [] };
  try {
    const raw = localStorage.getItem(STORAGE_PROFILE);
    if (!raw) return { xp: 0, bestScore: 0, solvedIds: [] };
    const parsed = JSON.parse(raw) as Partial<QuizProfile>;
    return {
      xp: typeof parsed.xp === 'number' ? parsed.xp : 0,
      bestScore: typeof parsed.bestScore === 'number' ? parsed.bestScore : 0,
      solvedIds: Array.isArray(parsed.solvedIds) ? parsed.solvedIds : [],
    };
  } catch {
    return { xp: 0, bestScore: 0, solvedIds: [] };
  }
}

function saveProfile(p: QuizProfile) {
  try {
    localStorage.setItem(STORAGE_PROFILE, JSON.stringify(p));
  } catch {
    // Ignore storage quota errors
  }
}

function shuffle<T>(arr: T[]): T[] {
  const copy = arr.slice();
  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
}

function getRankIndex(xp: number): number {
  if (xp >= 4000) return 4;
  if (xp >= 2000) return 3;
  if (xp >= 900) return 2;
  if (xp >= 300) return 1;
  return 0;
}

function playQuizTone(kind: 'correct' | 'wrong' | 'finish', muted: boolean) {
  if (muted || typeof window === 'undefined') return;
  try {
    const AudioCtx =
      window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    if (!AudioCtx) return;
    const ctx = new AudioCtx();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.connect(gain);
    gain.connect(ctx.destination);
    const now = ctx.currentTime;

    if (kind === 'correct') {
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(523, now);
      osc.frequency.exponentialRampToValueAtTime(784, now + 0.11);
      gain.gain.setValueAtTime(0.08, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.13);
      osc.start(now);
      osc.stop(now + 0.14);
    } else if (kind === 'wrong') {
      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(210, now);
      osc.frequency.exponentialRampToValueAtTime(125, now + 0.16);
      gain.gain.setValueAtTime(0.07, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.18);
      osc.start(now);
      osc.stop(now + 0.19);
    } else {
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(523, now);
      osc.frequency.setValueAtTime(659, now + 0.09);
      osc.frequency.setValueAtTime(1046, now + 0.18);
      gain.gain.setValueAtTime(0.09, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.36);
      osc.start(now);
      osc.stop(now + 0.38);
    }
    setTimeout(() => ctx.close().catch(() => {}), 480);
  } catch {
    // Ignore audio context restrictions
  }
}

function renderRichInline(text: string) {
  const parts = text.split(/(\*\*[^*]+\*\*|`[^`]+`)/g);
  return parts.map((part, idx) => {
    if (part.startsWith('**') && part.endsWith('**') && part.length > 4) {
      return (
        <strong key={idx} className="font-bold">
          {part.slice(2, -2)}
        </strong>
      );
    }
    if (part.startsWith('`') && part.endsWith('`') && part.length > 2) {
      return (
        <code
          key={idx}
          dir="ltr"
          className="inline-block px-1.5 py-0.5 rounded bg-slate-200/90 dark:bg-slate-800 text-sky-900 dark:text-sky-200 font-mono text-[12px]"
        >
          {part.slice(1, -1)}
        </code>
      );
    }
    return <span key={idx}>{part}</span>;
  });
}

export function TechQuizArena() {
  const { locale } = useI18n();
  const [lang, setLang] = useState<QuizLang>(() => {
    if (locale === 'ar' || locale === 'fr' || locale === 'en') return locale;
    if (typeof window === 'undefined') return 'en';
    const saved = localStorage.getItem(STORAGE_LANG);
    return saved === 'fr' || saved === 'ar' || saved === 'en' ? saved : 'en';
  });

  useEffect(() => {
    if (locale === 'ar' || locale === 'fr' || locale === 'en') {
      setLang(locale);
    } else {
      setLang('en');
    }
  }, [locale]);
  const [track, setTrack] = useState<QuizTrack>('all');
  const [mode, setMode] = useState<QuizMode>('mission');
  const [difficulty, setDifficulty] = useState<QuizDifficulty>('all');
  const [muted, setMuted] = useState<boolean>(false);

  const [profile, setProfile] = useState<QuizProfile>(() => loadProfile());

  // Active match state
  const [phase, setPhase] = useState<'setup' | 'playing' | 'summary'>('setup');
  const [deck, setDeck] = useState<QuizQuestion[]>([]);
  const [cursor, setCursor] = useState<number>(0);
  const [selectedOpt, setSelectedOpt] = useState<number | null>(null);
  const [eliminated, setEliminated] = useState<number[]>([]);
  const [showHint, setShowHint] = useState<boolean>(false);
  const [used5050, setUsed5050] = useState<boolean>(false);
  const [usedHint, setUsedHint] = useState<boolean>(false);

  const [score, setScore] = useState<number>(0);
  const [xpEarned, setXpEarned] = useState<number>(0);
  const [combo, setCombo] = useState<number>(0);
  const [maxCombo, setMaxCombo] = useState<number>(0);
  const [correctCount, setCorrectCount] = useState<number>(0);
  const [answeredCount, setAnsweredCount] = useState<number>(0);
  const [hearts, setHearts] = useState<number>(3);
  const [timeLeft, setTimeLeft] = useState<number>(90);
  const [mistakes, setMistakes] = useState<MistakeEntry[]>([]);
  const [copiedCard, setCopiedCard] = useState<boolean>(false);

  const ui = QUIZ_UI[lang];
  const isRtl = lang === 'ar';

  const switchLang = (next: QuizLang) => {
    setLang(next);
    try {
      localStorage.setItem(STORAGE_LANG, next);
    } catch {
      // Ignore
    }
  };

  // Track mastery percentages
  const mastery = useMemo(() => {
    const solvedSet = new Set(profile.solvedIds);
    const calc = (t: 'python' | 'javascript' | 'ai') => {
      const total = QUIZ_QUESTIONS.filter((q) => q.track === t).length;
      const done = QUIZ_QUESTIONS.filter((q) => q.track === t && solvedSet.has(q.id)).length;
      return { done, total, pct: total > 0 ? Math.round((done / total) * 100) : 0 };
    };
    return {
      python: calc('python'),
      javascript: calc('javascript'),
      ai: calc('ai'),
    };
  }, [profile.solvedIds]);

  const finishRun = useCallback(
    (finalScore: number, finalXp: number) => {
      setPhase('summary');
      playQuizTone('finish', muted);
      setProfile((prev) => {
        const updated: QuizProfile = {
          ...prev,
          xp: prev.xp + finalXp,
          bestScore: Math.max(prev.bestScore, finalScore),
        };
        saveProfile(updated);
        return updated;
      });
    },
    [muted]
  );

  // Blitz 90s countdown timer
  useEffect(() => {
    if (phase !== 'playing' || mode !== 'blitz') return;
    if (timeLeft <= 0) {
      finishRun(score, xpEarned);
      return;
    }
    const id = window.setInterval(() => {
      setTimeLeft((t) => {
        if (t <= 1) {
          window.clearInterval(id);
          return 0;
        }
        return t - 1;
      });
    }, 1000);
    return () => window.clearInterval(id);
  }, [phase, mode, timeLeft, score, xpEarned, finishRun]);

  const buildDeck = (selectedTrack: QuizTrack, selectedDiff: QuizDifficulty, selectedMode: QuizMode) => {
    let pool = QUIZ_QUESTIONS.filter((q) => {
      const tOk = selectedTrack === 'all' || q.track === selectedTrack;
      const dOk = selectedDiff === 'all' || q.difficulty === selectedDiff;
      return tOk && dOk;
    });
    if (pool.length < 5) {
      pool = QUIZ_QUESTIONS.filter((q) => selectedTrack === 'all' || q.track === selectedTrack);
    }
    const shuffled = shuffle(pool);
    return selectedMode === 'mission' ? shuffled.slice(0, Math.min(10, shuffled.length)) : shuffled;
  };

  const startChallenge = () => {
    const nextDeck = buildDeck(track, difficulty, mode);
    setDeck(nextDeck);
    setCursor(0);
    setSelectedOpt(null);
    setEliminated([]);
    setShowHint(false);
    setUsed5050(false);
    setUsedHint(false);
    setScore(0);
    setXpEarned(0);
    setCombo(0);
    setMaxCombo(0);
    setCorrectCount(0);
    setAnsweredCount(0);
    setHearts(3);
    setTimeLeft(90);
    setMistakes([]);
    setCopiedCard(false);
    setPhase('playing');
  };

  const currentQuestion = deck[cursor];

  const handleSelectOption = (idx: number) => {
    if (!currentQuestion || selectedOpt !== null || eliminated.includes(idx)) return;
    setSelectedOpt(idx);
    setAnsweredCount((c) => c + 1);

    const isCorrect = idx === currentQuestion.correctIndex;
    if (isCorrect) {
      const nextCombo = combo + 1;
      const mult = Math.min(5, 1 + Math.floor(nextCombo / 2));
      const diffBonus =
        currentQuestion.difficulty === 'architect' ? 150 : currentQuestion.difficulty === 'intermediate' ? 120 : 100;
      const gainedScore = diffBonus * mult;
      const gainedXp = currentQuestion.difficulty === 'architect' ? 45 : currentQuestion.difficulty === 'intermediate' ? 35 : 25;

      setCombo(nextCombo);
      setMaxCombo((m) => Math.max(m, nextCombo));
      setCorrectCount((c) => c + 1);
      setScore((s) => s + gainedScore);
      setXpEarned((x) => x + gainedXp);
      playQuizTone('correct', muted);

      // Mark question mastered immediately
      setProfile((prev) => {
        if (prev.solvedIds.includes(currentQuestion.id)) return prev;
        const updated = { ...prev, solvedIds: [...prev.solvedIds, currentQuestion.id] };
        saveProfile(updated);
        return updated;
      });
    } else {
      setCombo(0);
      setMistakes((prev) => [...prev, { question: currentQuestion, chosenIndex: idx }]);
      playQuizTone('wrong', muted);
      if (mode === 'survival') {
        setHearts((h) => Math.max(0, h - 1));
      }
    }
  };

  const handleNext = () => {
    if (mode === 'survival' && hearts <= 0) {
      finishRun(score, xpEarned);
      return;
    }
    if (cursor + 1 >= deck.length) {
      if (mode === 'mission') {
        finishRun(score, xpEarned);
        return;
      }
      // Endless reshuffle for Survival / Blitz if player clears entire deck!
      const fresh = buildDeck(track, difficulty, mode);
      setDeck(fresh);
      setCursor(0);
    } else {
      setCursor((c) => c + 1);
    }
    setSelectedOpt(null);
    setEliminated([]);
    setShowHint(false);
  };

  const handle5050 = () => {
    if (!currentQuestion || used5050 || selectedOpt !== null) return;
    const wrongIndices = [0, 1, 2, 3].filter((i) => i !== currentQuestion.correctIndex);
    const toRemove = shuffle(wrongIndices).slice(0, 2);
    setEliminated(toRemove);
    setUsed5050(true);
  };

  const handleHint = () => {
    if (!currentQuestion || usedHint || selectedOpt !== null) return;
    setShowHint(true);
    setUsedHint(true);
  };

  const rankName = ui.ranks[getRankIndex(profile.xp)];
  const accuracyPct = answeredCount > 0 ? Math.round((correctCount / answeredCount) * 100) : 0;

  const copyScoreCard = () => {
    const summary = [
      `KRONVEX Tech & AI Mastery Arena (${lang.toUpperCase()})`,
      `Track: ${ui.tracks[track]} | Mode: ${ui.modes[mode].name}`,
      `Score: ${score.toLocaleString()} | Accuracy: ${accuracyPct}% (${correctCount}/${answeredCount})`,
      `Max Combo: x${Math.min(5, 1 + Math.floor(maxCombo / 2))} | Rank: ${rankName} (${profile.xp} XP)`,
      `Play free at https://kronvex.org/arcade?game=quiz`,
    ].join('\n');
    navigator.clipboard?.writeText(summary);
    setCopiedCard(true);
    setTimeout(() => setCopiedCard(false), 1800);
  };

  const trackBadgeColor = (t: 'python' | 'javascript' | 'ai') => {
    if (t === 'python') return 'bg-sky-500/15 text-sky-900 dark:text-sky-200 border-sky-500/35';
    if (t === 'javascript') return 'bg-amber-500/15 text-amber-900 dark:text-amber-200 border-amber-500/35';
    return 'bg-indigo-500/15 text-indigo-900 dark:text-indigo-200 border-indigo-500/35';
  };

  return (
    <div dir={isRtl ? 'rtl' : 'ltr'} className="space-y-8">
      {/* Top Trilingual Switcher & Audio Bar — Open Hairline Strip */}
      <div className="flex flex-wrap items-center justify-between gap-3 pb-4 border-b border-slate-300/80 dark:border-slate-800">
        <div className="inline-flex items-center gap-2 text-xs font-mono font-bold text-sky-700 dark:text-sky-300">
          <Globe className="w-4 h-4 shrink-0" />
          <span>{ui.badge}</span>
        </div>

        <div className="flex items-center gap-3">
          <div className="inline-flex items-center gap-3" role="group" aria-label="Quiz language">
            {(
              [
                { id: 'en', label: 'EN' },
                { id: 'fr', label: 'FR' },
                { id: 'ar', label: 'العربية' },
              ] as const
            ).map((opt) => (
              <button
                key={opt.id}
                type="button"
                onClick={() => switchLang(opt.id)}
                className={`pb-0.5 text-xs font-mono font-bold border-b-2 transition ${
                  lang === opt.id
                    ? 'border-sky-500 text-sky-600 dark:text-sky-300'
                    : 'border-transparent text-slate-900 dark:text-white hover:text-sky-500'
                }`}
              >
                {opt.label}
              </button>
            ))}
          </div>

          <button
            type="button"
            onClick={() => setMuted((m) => !m)}
            className="p-2 rounded-full text-black dark:text-white hover:text-sky-500 hover:bg-slate-200/60 dark:hover:bg-slate-800/70 transition"
            aria-label={muted ? 'Unmute SFX' : 'Mute SFX'}
          >
            {muted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
          </button>
        </div>
      </div>

      {/* PHASE 1: OPEN EDITORIAL SETUP & MASTERY LOBBY */}
      {phase === 'setup' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-12 items-start">
          {/* Left: Track / Mode / Difficulty Configurator (No Outer Card Box) */}
          <div className="lg:col-span-8 space-y-8">
            <div className="space-y-2">
              <h2 className="font-display font-bold text-2xl sm:text-3xl text-black dark:text-white">
                {ui.title}
              </h2>
              <p className="text-sm sm:text-base text-slate-900 dark:text-white leading-relaxed">{ui.subtitle}</p>
            </div>

            {/* Track Selection */}
            <div className="space-y-3">
              <div className="font-mono text-xs font-bold uppercase tracking-wider text-slate-900 dark:text-white">
                {ui.tracksLabel}
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {(
                  [
                    { id: 'all' as const, icon: Sparkles, count: QUIZ_QUESTIONS.length, tone: 'sky' },
                    { id: 'python' as const, icon: Terminal, count: mastery.python.total, tone: 'sky' },
                    { id: 'javascript' as const, icon: Code2, count: mastery.javascript.total, tone: 'amber' },
                    { id: 'ai' as const, icon: Brain, count: mastery.ai.total, tone: 'indigo' },
                  ] as const
                ).map((item) => {
                  const Icon = item.icon;
                  const active = track === item.id;
                  return (
                    <button
                      key={item.id}
                      type="button"
                      onClick={() => setTrack(item.id)}
                      className={`py-3.5 px-4 rounded-xl border text-start flex items-center justify-between gap-3 transition ${
                        active
                          ? 'bg-sky-500/15 border-sky-500 text-black dark:text-white'
                          : 'border-slate-300/80 dark:border-slate-800 hover:border-sky-500/60 text-black dark:text-white'
                      }`}
                    >
                      <div className="flex items-center gap-2.5 min-w-0">
                        <Icon className="w-4 h-4 text-sky-500 shrink-0" />
                        <span className="font-bold text-sm leading-snug">{ui.tracks[item.id]}</span>
                      </div>
                      <span className="font-mono text-xs font-bold text-sky-700 dark:text-sky-300 shrink-0">
                        {item.count} Q
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Game Mode Selection */}
            <div className="space-y-3">
              <div className="font-mono text-xs font-bold uppercase tracking-wider text-slate-900 dark:text-white">
                {ui.modeLabel}
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                {(
                  [
                    { id: 'mission' as const, icon: Award },
                    { id: 'blitz' as const, icon: Zap },
                    { id: 'survival' as const, icon: Heart },
                  ] as const
                ).map((m) => {
                  const Icon = m.icon;
                  const active = mode === m.id;
                  return (
                    <button
                      key={m.id}
                      type="button"
                      onClick={() => setMode(m.id)}
                      className={`p-3.5 rounded-xl border text-start space-y-1 transition ${
                        active
                          ? 'bg-emerald-500/15 border-emerald-500'
                          : 'border-slate-300/80 dark:border-slate-800 hover:border-emerald-500/60'
                      }`}
                    >
                      <div className="flex items-center gap-2 font-bold text-sm text-black dark:text-white">
                        <Icon className="w-4 h-4 text-emerald-500 shrink-0" />
                        <span>{ui.modes[m.id].name}</span>
                      </div>
                      <div className="text-xs text-slate-900 dark:text-white leading-snug">
                        {ui.modes[m.id].desc}
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Difficulty Filter */}
            <div className="space-y-3">
              <div className="font-mono text-xs font-bold uppercase tracking-wider text-slate-900 dark:text-white">
                {ui.diffLabel}
              </div>
              <div className="flex flex-wrap gap-2">
                {(['all', 'beginner', 'intermediate', 'architect'] as QuizDifficulty[]).map((d) => (
                  <button
                    key={d}
                    type="button"
                    onClick={() => setDifficulty(d)}
                    className={`px-4 py-1.5 rounded-full text-xs font-mono font-bold border transition ${
                      difficulty === d
                        ? 'bg-black dark:bg-white text-white dark:text-black border-transparent'
                        : 'border-slate-300 dark:border-slate-700 text-black dark:text-white hover:border-sky-500'
                    }`}
                  >
                    {ui.diffs[d]}
                  </button>
                ))}
              </div>
            </div>

            <button
              type="button"
              onClick={startChallenge}
              className="w-full sm:w-auto px-8 py-3.5 rounded-full bg-sky-500 hover:bg-sky-400 text-slate-950 font-bold text-sm inline-flex items-center justify-center gap-2 shadow-lg shadow-sky-500/20 transition"
            >
              <Play className="w-4 h-4" /> {ui.startBtn}
            </button>
          </div>

          {/* Right: Open Engineer Profile & Track Mastery (Separated by Hairline, Zero Card Boxes) */}
          <div className="lg:col-span-4 lg:border-s border-slate-300/80 dark:border-slate-800 lg:ps-8 space-y-6">
            <div className="grid grid-cols-2 gap-6 pb-5 border-b border-slate-300/70 dark:border-slate-800">
              <div>
                <div className="font-mono text-[10px] font-bold tracking-wider text-slate-900 dark:text-slate-100">
                  {ui.rankLabel}
                </div>
                <div className="font-display font-bold text-lg text-sky-600 dark:text-sky-300 mt-0.5 truncate">
                  {rankName}
                </div>
              </div>
              <div>
                <div className="font-mono text-[10px] font-bold tracking-wider text-slate-900 dark:text-slate-100">
                  {ui.xpLabel}
                </div>
                <div className="font-mono font-extrabold text-xl text-emerald-600 dark:text-emerald-300 mt-0.5">
                  {profile.xp.toLocaleString()} XP
                </div>
              </div>
            </div>

            <div className="pb-5 border-b border-slate-300/70 dark:border-slate-800 flex items-center justify-between">
              <span className="font-mono text-xs font-bold text-amber-700 dark:text-amber-300 inline-flex items-center gap-1.5">
                <Trophy className="w-4 h-4" /> {ui.bestScore}
              </span>
              <span className="font-mono font-extrabold text-xl text-amber-600 dark:text-amber-300">
                {profile.bestScore.toLocaleString()}
              </span>
            </div>

            <div className="space-y-4">
              <div className="font-mono text-xs font-bold uppercase tracking-wider text-slate-900 dark:text-white">
                {ui.masteryLabel}
              </div>
              {(
                [
                  { id: 'python' as const, bar: 'from-sky-400 to-cyan-400', data: mastery.python },
                  { id: 'javascript' as const, bar: 'from-amber-400 to-orange-400', data: mastery.javascript },
                  { id: 'ai' as const, bar: 'from-indigo-400 to-emerald-400', data: mastery.ai },
                ] as const
              ).map((m) => (
                <div key={m.id} className="space-y-1.5">
                  <div className="flex items-center justify-between text-xs font-mono">
                    <span className="text-black dark:text-white font-semibold truncate">{ui.tracks[m.id]}</span>
                    <span className="text-slate-900 dark:text-white shrink-0">
                      {m.data.done}/{m.data.total} ({m.data.pct}%)
                    </span>
                  </div>
                  <div className="h-1.5 rounded-full bg-slate-200 dark:bg-slate-800 overflow-hidden">
                    <div
                      className={`h-full rounded-full bg-gradient-to-r ${m.bar} transition-all duration-300`}
                      style={{ width: `${m.data.pct}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* PHASE 2: ACTIVE GAMEPLAY — OPEN CLEAN ARENA */}
      {phase === 'playing' && currentQuestion && (
        <div className="space-y-7">
          {/* Open Inline Match HUD (Zero Stat Boxes) */}
          <div className="pb-4 border-b border-slate-300/80 dark:border-slate-800 grid grid-cols-3 sm:grid-cols-4 gap-4 items-center">
            <div>
              <div className="font-mono text-[10px] font-bold text-slate-900 dark:text-slate-100">{ui.scoreLabel}</div>
              <div className="font-mono font-extrabold text-xl text-sky-600 dark:text-sky-400">
                {score.toLocaleString()}
              </div>
            </div>
            <div>
              <div className="font-mono text-[10px] font-bold text-slate-900 dark:text-slate-100">{ui.comboLabel}</div>
              <div className="font-mono font-extrabold text-xl text-amber-600 dark:text-amber-300 inline-flex items-center gap-1">
                <Flame className="w-4 h-4 shrink-0" /> x{Math.min(5, 1 + Math.floor(combo / 2))}
              </div>
            </div>
            {mode === 'blitz' ? (
              <div>
                <div className="font-mono text-[10px] font-bold text-slate-900 dark:text-slate-100">{ui.timeLabel}</div>
                <div
                  className={`font-mono font-extrabold text-xl inline-flex items-center gap-1 ${
                    timeLeft <= 15 ? 'text-rose-500 animate-pulse' : 'text-emerald-600 dark:text-emerald-400'
                  }`}
                >
                  <Timer className="w-4 h-4 shrink-0" /> {timeLeft}s
                </div>
              </div>
            ) : mode === 'survival' ? (
              <div>
                <div className="font-mono text-[10px] font-bold text-slate-900 dark:text-slate-100">{ui.heartsLabel}</div>
                <div className="flex items-center gap-1 mt-1">
                  {[0, 1, 2].map((i) => (
                    <Heart
                      key={i}
                      className={`w-4 h-4 sm:w-5 sm:h-5 ${
                        i < hearts ? 'text-rose-500 fill-rose-500' : 'text-slate-300 dark:text-slate-700'
                      }`}
                    />
                  ))}
                </div>
              </div>
            ) : (
              <div>
                <div className="font-mono text-[10px] font-bold text-slate-900 dark:text-slate-100">PROGRESS</div>
                <div className="font-mono font-extrabold text-lg text-indigo-600 dark:text-indigo-300">
                  {cursor + 1} / {deck.length}
                </div>
              </div>
            )}

            <div className="col-span-3 sm:col-span-1 flex flex-wrap items-center sm:justify-end gap-2">
              <button
                type="button"
                onClick={handle5050}
                disabled={used5050 || selectedOpt !== null}
                className="px-3 py-1.5 rounded-full text-[11px] font-mono font-bold bg-indigo-500/15 text-indigo-900 dark:text-indigo-200 border border-indigo-500/30 disabled:opacity-40 inline-flex items-center gap-1 whitespace-nowrap"
                title="50/50"
              >
                <Scissors className="w-3.5 h-3.5 shrink-0" /> {ui.lifeline5050}
              </button>
              <button
                type="button"
                onClick={handleHint}
                disabled={usedHint || selectedOpt !== null}
                className="px-3 py-1.5 rounded-full text-[11px] font-mono font-bold bg-amber-500/15 text-amber-900 dark:text-amber-200 border border-amber-500/30 disabled:opacity-40 inline-flex items-center gap-1 whitespace-nowrap"
                title="Hint"
              >
                <HelpCircle className="w-3.5 h-3.5 shrink-0" /> {ui.lifelineHint}
              </button>
              <button
                type="button"
                onClick={() => setPhase('setup')}
                className="px-2 py-1 text-xs font-mono font-bold text-slate-900 dark:text-white hover:text-rose-500 whitespace-nowrap shrink-0"
              >
                {ui.quitBtn}
              </button>
            </div>
          </div>

          {/* Open Question Stage (Zero Outer Card Box) */}
          <div className="space-y-6">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div className="flex flex-wrap items-center gap-3 font-mono text-xs">
                <span className={`px-2.5 py-0.5 rounded-full text-[11px] font-bold border ${trackBadgeColor(currentQuestion.track)}`}>
                  {ui.tracks[currentQuestion.track]}
                </span>
                <span className="text-black dark:text-white font-semibold">{currentQuestion.topic[lang]}</span>
                <span className="text-emerald-600 dark:text-emerald-400 font-bold">
                  ● {currentQuestion.kind === 'code' ? ui.codeLabTag : ui.conceptTag}
                </span>
              </div>
              <span className="font-mono text-xs font-semibold text-slate-900 dark:text-white">
                {mode === 'mission' ? ui.questionOf(cursor + 1, deck.length) : ui.questionNum(answeredCount + 1)} ·{' '}
                {ui.diffs[currentQuestion.difficulty]}
              </span>
            </div>

            <h3 className="font-display font-bold text-xl sm:text-3xl text-black dark:text-white leading-snug max-w-4xl">
              {renderRichInline(currentQuestion.prompt[lang])}
            </h3>

            {/* Optional Code Snippet (ALWAYS LTR!) */}
            {currentQuestion.codeSnippet && (
              <div
                dir="ltr"
                className="rounded-xl bg-[#050914] border border-slate-700/90 overflow-hidden text-left shadow-inner"
              >
                <div className="px-4 py-1.5 bg-slate-900/90 border-b border-slate-800 flex items-center justify-between text-[11px] font-mono text-sky-300">
                  <span>{currentQuestion.codeSnippet.lang.toUpperCase()}</span>
                  <span className="text-slate-200">KRONVEX CODE LAB</span>
                </div>
                <pre dir="ltr" className="p-4 text-xs sm:text-sm font-mono text-slate-100 overflow-x-auto leading-relaxed text-left">
                  {currentQuestion.codeSnippet.code}
                </pre>
              </div>
            )}

            {/* Tactical Hint Banner */}
            {showHint && (
              <div className="ps-4 border-s-2 border-amber-500 py-1 text-xs sm:text-sm text-amber-900 dark:text-amber-200 flex items-start gap-2.5">
                <Lightbulb className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />
                <div>
                  <strong>{ui.hintPrefix}</strong> {renderRichInline(currentQuestion.hint[lang])}
                </div>
              </div>
            )}

            {/* 4 Interactive Answer Options */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
              {currentQuestion.options[lang].map((opt, idx) => {
                const isRemoved = eliminated.includes(idx);
                const isAnswered = selectedOpt !== null;
                const isCorrect = idx === currentQuestion.correctIndex;
                const isChosen = idx === selectedOpt;

                let cardStyle =
                  'border-slate-300 dark:border-slate-700 text-black dark:text-white hover:border-sky-500 hover:bg-sky-500/[0.04]';
                if (isRemoved) {
                  cardStyle =
                    'border-slate-200 dark:border-slate-800 text-slate-500 line-through opacity-40 cursor-not-allowed';
                } else if (isAnswered) {
                  if (isCorrect) {
                    cardStyle =
                      'bg-emerald-500/15 border-emerald-500 text-emerald-950 dark:text-emerald-100';
                  } else if (isChosen) {
                    cardStyle =
                      'bg-rose-500/15 border-rose-500 text-rose-950 dark:text-rose-100';
                  } else {
                    cardStyle =
                      'border-slate-200 dark:border-slate-800 text-slate-800 dark:text-slate-100 opacity-65';
                  }
                }

                const letter = ['A', 'B', 'C', 'D'][idx];

                return (
                  <button
                    key={idx}
                    type="button"
                    disabled={isAnswered || isRemoved}
                    onClick={() => handleSelectOption(idx)}
                    className={`p-4 rounded-xl border text-start flex items-start gap-3 transition ${cardStyle}`}
                  >
                    <span className="font-mono text-xs font-extrabold text-sky-600 dark:text-sky-400 shrink-0 mt-0.5">
                      {letter}.
                    </span>
                    <span className="text-sm sm:text-[15px] leading-relaxed flex-1 break-words">
                      {renderRichInline(opt)}
                    </span>
                    {isAnswered && isCorrect && <CheckCircle2 className="w-5 h-5 text-emerald-500 shrink-0 mt-0.5" />}
                    {isAnswered && isChosen && !isCorrect && (
                      <XCircle className="w-5 h-5 text-rose-500 shrink-0 mt-0.5" />
                    )}
                  </button>
                );
              })}
            </div>

            {/* Instant Engineer's Insight & Code Tip after answering */}
            {selectedOpt !== null && (
              <div className="space-y-4 pt-5 border-t border-slate-300/80 dark:border-slate-800">
                <div
                  className={`ps-4 border-s-2 space-y-2.5 ${
                    selectedOpt === currentQuestion.correctIndex ? 'border-emerald-500' : 'border-rose-500'
                  }`}
                >
                  <div className="flex items-center gap-2 font-display font-bold text-base text-black dark:text-white">
                    {selectedOpt === currentQuestion.correctIndex ? (
                      <CheckCircle2 className="w-5 h-5 text-emerald-500 shrink-0" />
                    ) : (
                      <XCircle className="w-5 h-5 text-rose-500 shrink-0" />
                    )}
                    {selectedOpt === currentQuestion.correctIndex ? ui.correctBanner : ui.wrongBanner}
                  </div>
                  <div className="text-sm text-slate-900 dark:text-white leading-relaxed">
                    <strong className="text-sky-700 dark:text-sky-300">{ui.insightTitle}: </strong>
                    {renderRichInline(currentQuestion.explanation[lang])}
                  </div>
                  <div className="text-xs sm:text-sm text-slate-900 dark:text-white leading-relaxed">
                    <strong className="text-emerald-700 dark:text-emerald-300 font-mono">
                      💡 {ui.codeTipTitle}:{' '}
                    </strong>
                    {renderRichInline(currentQuestion.codeTip[lang])}
                  </div>
                </div>

                <div className="flex justify-end">
                  <button
                    type="button"
                    onClick={handleNext}
                    className="px-7 py-2.5 rounded-full bg-sky-500 hover:bg-sky-400 text-slate-950 font-bold text-sm inline-flex items-center gap-2 transition"
                  >
                    {(mode === 'mission' && cursor + 1 >= deck.length) || (mode === 'survival' && hearts <= 0)
                      ? ui.finishBtn
                      : ui.nextBtn}
                    <ArrowRight className={`w-4 h-4 ${isRtl ? 'rotate-180' : ''}`} />
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* PHASE 3: OPEN SUMMARY & MISTAKE REVIEW */}
      {phase === 'summary' && (
        <div className="space-y-10">
          <div className="space-y-6 pb-8 border-b border-slate-300/80 dark:border-slate-800">
            <div className="flex flex-wrap items-center justify-between gap-4">
              <div className="space-y-1">
                <div className="font-mono text-xs font-bold text-emerald-600 dark:text-emerald-400">
                  {ui.tracks[track]} · {ui.modes[mode].name}
                </div>
                <h2 className="font-display font-bold text-2xl sm:text-4xl text-black dark:text-white">
                  {ui.reportTitle}
                </h2>
              </div>
              <div className="font-mono text-sm font-bold text-sky-700 dark:text-sky-300">
                {rankName} · {profile.xp.toLocaleString()} XP
              </div>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-6 pt-2">
              <div>
                <div className="font-mono text-[10px] font-bold text-slate-900 dark:text-slate-100">{ui.scoreLabel}</div>
                <div className="font-mono font-extrabold text-3xl text-sky-600 dark:text-sky-400">
                  {score.toLocaleString()}
                </div>
              </div>
              <div>
                <div className="font-mono text-[10px] font-bold text-slate-900 dark:text-slate-100">{ui.accuracy}</div>
                <div className="font-mono font-extrabold text-3xl text-emerald-600 dark:text-emerald-400">
                  {accuracyPct}% <span className="text-xs font-semibold">({correctCount}/{answeredCount})</span>
                </div>
              </div>
              <div>
                <div className="font-mono text-[10px] font-bold text-slate-900 dark:text-slate-100">{ui.xpEarned}</div>
                <div className="font-mono font-extrabold text-3xl text-indigo-600 dark:text-indigo-300">
                  +{xpEarned}
                </div>
              </div>
              <div>
                <div className="font-mono text-[10px] font-bold text-slate-900 dark:text-slate-100">{ui.maxCombo}</div>
                <div className="font-mono font-extrabold text-3xl text-amber-600 dark:text-amber-300">
                  x{Math.min(5, 1 + Math.floor(maxCombo / 2))}
                </div>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-3 pt-2">
              <button
                type="button"
                onClick={startChallenge}
                className="px-6 py-2.5 rounded-full bg-sky-500 hover:bg-sky-400 text-slate-950 font-bold text-sm inline-flex items-center gap-2 transition"
              >
                <RotateCcw className="w-4 h-4" /> {ui.playAgain}
              </button>
              <button
                type="button"
                onClick={() => setPhase('setup')}
                className="px-6 py-2.5 rounded-full border border-slate-300 dark:border-slate-700 text-black dark:text-white font-semibold text-sm hover:border-sky-500 transition"
              >
                {ui.changeTrack}
              </button>
              <button
                type="button"
                onClick={copyScoreCard}
                className="px-6 py-2.5 rounded-full bg-emerald-500/15 hover:bg-emerald-500/25 border border-emerald-500/40 text-emerald-900 dark:text-emerald-200 font-semibold text-sm inline-flex items-center gap-2 transition"
              >
                {copiedCard ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                {copiedCard ? ui.copiedCard : ui.copyCard}
              </button>
            </div>
          </div>

          {/* Open Mistake Review Deck */}
          <div className="space-y-4">
            <h3 className="font-display font-bold text-xl text-black dark:text-white">{ui.mistakesTitle}</h3>
            {mistakes.length === 0 ? (
              <div className="ps-4 border-s-2 border-emerald-500 text-sm font-semibold text-emerald-700 dark:text-emerald-300">
                {ui.perfectRun}
              </div>
            ) : (
              <div className="divide-y divide-slate-300/70 dark:divide-slate-800">
                {mistakes.map((m, i) => (
                  <div key={`${m.question.id}-${i}`} className="py-5 space-y-2 text-xs sm:text-sm">
                    <div className="font-bold text-black dark:text-white">
                      {renderRichInline(m.question.prompt[lang])}
                    </div>
                    <div className="text-rose-700 dark:text-rose-300">
                      <strong>{ui.yourAnswer}</strong> {renderRichInline(m.question.options[lang][m.chosenIndex])}
                    </div>
                    <div className="text-emerald-700 dark:text-emerald-300">
                      <strong>{ui.correctAnswer}</strong>{' '}
                      {renderRichInline(m.question.options[lang][m.question.correctIndex])}
                    </div>
                    <div className="text-slate-900 dark:text-white pt-1">
                      {renderRichInline(m.question.explanation[lang])}
                    </div>
                    <div className="text-sky-700 dark:text-sky-300 font-mono text-xs">
                      💡 {renderRichInline(m.question.codeTip[lang])}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

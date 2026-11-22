import { useEffect, useMemo, useRef, useState } from 'react';
import {
  Bot,
  Cpu,
  FlipVertical2,
  Maximize2,
  Minimize2,
  RotateCcw,
  ShieldCheck,
  Trophy,
  Undo2,
  Users,
  Volume2,
  VolumeX,
} from 'lucide-react';
import {
  createInitialState,
  evaluateBoard,
  findBestMove,
  getCapturedAndMaterial,
  getGameStatus,
  getLegalMovesFrom,
  makeMove,
  type AiDifficulty,
  type ChessMove,
  type ChessState,
  type Color,
  type Piece,
  type PromotionPiece,
} from '../utils/chessEngine';

const FILES = ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h'];
const RANKS = ['8', '7', '6', '5', '4', '3', '2', '1'];

function playChessTone(kind: 'move' | 'capture' | 'check' | 'end', muted: boolean) {
  if (muted || typeof window === 'undefined') return;
  try {
    const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    if (!AudioCtx) return;
    const ctx = new AudioCtx();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.connect(gain);
    gain.connect(ctx.destination);
    const now = ctx.currentTime;

    if (kind === 'move') {
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(340, now);
      osc.frequency.exponentialRampToValueAtTime(210, now + 0.06);
      gain.gain.setValueAtTime(0.08, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.07);
      osc.start(now);
      osc.stop(now + 0.075);
    } else if (kind === 'capture') {
      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(260, now);
      osc.frequency.exponentialRampToValueAtTime(110, now + 0.11);
      gain.gain.setValueAtTime(0.09, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.12);
      osc.start(now);
      osc.stop(now + 0.125);
    } else if (kind === 'check') {
      osc.type = 'sine';
      osc.frequency.setValueAtTime(660, now);
      osc.frequency.setValueAtTime(880, now + 0.07);
      gain.gain.setValueAtTime(0.1, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.18);
      osc.start(now);
      osc.stop(now + 0.19);
    } else {
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(523, now);
      osc.frequency.setValueAtTime(659, now + 0.1);
      osc.frequency.setValueAtTime(784, now + 0.2);
      gain.gain.setValueAtTime(0.1, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.35);
      osc.start(now);
      osc.stop(now + 0.36);
    }
    setTimeout(() => ctx.close().catch(() => {}), 450);
  } catch {
    // Ignore autoplay restrictions
  }
}

function ChessPieceSvg({ piece, className = 'w-4/5 h-4/5' }: { piece: Piece; className?: string }) {
  const isW = piece.color === 'w';
  const fill = isW ? '#F8FAFC' : '#0F172A';
  const stroke = isW ? '#0F172A' : '#38BDF8';
  const accent = isW ? '#CBD5E1' : '#1E293B';

  return (
    <svg viewBox="0 0 45 45" className={`${className} select-none drop-shadow-[0_2px_2px_rgba(0,0,0,0.45)]`} aria-hidden="true">
      {piece.type === 'p' && (
        <path
          d="M22.5 9c-2.21 0-4 1.79-4 4 0 .89.29 1.71.78 2.38C17.33 16.5 16 18.59 16 21c0 2.03.94 3.84 2.41 5.03-3 1.06-7.41 5.55-7.41 13.47h23c0-7.92-4.41-12.41-7.41-13.47 1.47-1.19 2.41-3 2.41-5.03 0-2.41-1.33-4.5-3.28-5.62.49-.67.78-1.49.78-2.38 0-2.21-1.79-4-4-4z"
          fill={fill}
          stroke={stroke}
          strokeWidth="1.7"
          strokeLinecap="round"
        />
      )}
      {piece.type === 'r' && (
        <g fill={fill} stroke={stroke} strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
          <path d="M9 39h27v-3H9v3zM12 36v-4h21v4H12zM11 14V9h4v2h5V9h5v2h5V9h4v5" />
          <path d="M34 14l-3 3H14l-3-3" />
          <path d="M31 17v12.5H14V17" />
          <path d="M31 29.5l1.5 2.5h-20l1.5-2.5" />
        </g>
      )}
      {piece.type === 'n' && (
        <g fill={fill} stroke={stroke} strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
          <path d="M22 10c10.5 1 16.5 8 16 29H15c0-9 10-6.5 8-21" />
          <path d="M24 18c.38 2.91-5.55 7.37-8 9-3 2-2.82 4.34-5 4-1.042-.94 1.41-3.04 0-3-1 0 .19 1.23-1 2-1 0-4.003 1-4-4 0-2 6-12 6-12s1.89-1.9 2-3.5c-.73-.994-.5-2-.5-3 1-1 3 2.5 3 2.5h2s.78-1.992 2.5-3c1 0 1 3 1 3" />
          <circle cx="15" cy="15.5" r="1.2" fill={stroke} stroke="none" />
        </g>
      )}
      {piece.type === 'b' && (
        <g fill={fill} stroke={stroke} strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
          <path d="M9 36c3.39-.97 10.11.43 13.5-2 3.39 2.43 10.11 1.03 13.5 2 0 0 1.65.54 3 2-.68.97-1.65.99-3 .5-3.39-.97-10.11.46-13.5-1-3.39 1.46-10.11.03-13.5 1-1.354.49-2.323.47-3-.5 1.354-1.94 3-2 3-2z" />
          <path d="M15 32c2.5 2.5 12.5 2.5 15 0 .5-1.5 0-2 0-2 0-2.5-2.5-4-2.5-4 5.5-1.5 6-11.5-5-15.5-11 4-10.5 14-5 15.5 0 0-2.5 1.5-2.5 4 0 0-.5.5 0 2z" />
          <circle cx="22.5" cy="8" r="2.5" />
          <path d="M17.5 26h10M15 30h15M22.5 15.5v5M20 18h5" fill="none" stroke={stroke} strokeWidth="1.5" />
        </g>
      )}
      {piece.type === 'q' && (
        <g fill={fill} stroke={stroke} strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="6" cy="12" r="2.3" />
          <circle cx="14" cy="9" r="2.3" />
          <circle cx="22.5" cy="8" r="2.3" />
          <circle cx="31" cy="9" r="2.3" />
          <circle cx="39" cy="12" r="2.3" />
          <path d="M9 26c8.5-1.5 21-1.5 27 0l2.5-12.5L31 25l-.3-14.1-5.2 13.6-3-14.5-3 14.5-5.2-13.6L14 25 6.5 13.5 9 26z" />
          <path d="M9 26c0 2 1.5 2 2.5 4 1 1.5 1 1 .5 3.5-1.5 1-1.5 2.5-1.5 2.5-1.5 1.5.5 2.5.5 2.5 6.5 1 16.5 1 23 0 0 0 1.5-1 0-2.5 0 0 .5-1.5-1-2.5-.5-2.5-.5-2 .5-3.5 1-2 2.5-2 2.5-4-8.5-1.5-18.5-1.5-27 0z" />
          <path d="M11.5 30c3.5-1 18.5-1 22 0M12 33.5c6-1 15-1 21 0" fill="none" stroke={stroke} strokeWidth="1.3" />
        </g>
      )}
      {piece.type === 'k' && (
        <g fill={fill} stroke={stroke} strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
          <path d="M22.5 11.63V6M20 8h5" fill="none" />
          <path d="M22.5 25s4.5-7.5 3-10.5c0 0-1-2.5-3-2.5s-3 2.5-3 2.5c-1.5 3 3 10.5 3 10.5" fill={accent} />
          <path d="M11.5 37c5.5 3.5 15.5 3.5 21 0v-7s9-4.5 6-10.5c-4-6.5-13.5-3.5-16 4V27v-3.5c-3.5-7.5-13-10.5-16-4-3 6 5 10 5 10V37z" />
          <path d="M11.5 30c5.5-3 15.5-3 21 0M11.5 33.5c5.5-3 15.5-3 21 0M11.5 37c5.5-3 15.5-3 21 0" fill="none" stroke={stroke} strokeWidth="1.3" />
        </g>
      )}
    </svg>
  );
}

const DIFFICULTY_META: Record<AiDifficulty, { label: string; desc: string }> = {
  scout: { label: 'Scout (Easy)', desc: 'Depth 1 · Casual local sparring' },
  tactical: { label: 'Tactical (Med)', desc: 'Depth 2 + Quiescence · Club tactics' },
  apex: { label: 'Apex AI (Hard)', desc: 'Depth 3 + Quiescence · Sharp Alpha-Beta' },
};

export function NeuralChessGame() {
  const [mode, setMode] = useState<'ai' | 'pvp'>('ai');
  const [difficulty, setDifficulty] = useState<AiDifficulty>('tactical');
  const [playerColor, setPlayerColor] = useState<Color>('w');
  const [flipped, setFlipped] = useState<boolean>(false);
  const [muted, setMuted] = useState<boolean>(false);
  const [theaterMode, setTheaterMode] = useState<boolean>(false);

  const [state, setState] = useState<ChessState>(() => createInitialState());
  const [snapshots, setSnapshots] = useState<ChessState[]>([]);
  const [selectedSq, setSelectedSq] = useState<number | null>(null);
  const [pendingPromo, setPendingPromo] = useState<{ from: number; to: number } | null>(null);
  const [aiThinking, setAiThinking] = useState<boolean>(false);
  const [aiTelemetry, setAiTelemetry] = useState<{ evalCp: number; nodes: number; elapsedMs: number }>({
    evalCp: 0,
    nodes: 0,
    elapsedMs: 0,
  });
  const [wins, setWins] = useState<number>(() => {
    if (typeof window === 'undefined') return 0;
    return parseInt(localStorage.getItem('kronvex-chess-wins') || '0', 10) || 0;
  });

  const moveListEndRef = useRef<HTMLDivElement>(null);

  const status = useMemo(() => getGameStatus(state), [state]);
  const legalFromSelected = useMemo(
    () => (selectedSq !== null ? getLegalMovesFrom(state, selectedSq) : []),
    [state, selectedSq]
  );
  const { capturedByWhite, capturedByBlack, whiteAdvantage } = useMemo(
    () => getCapturedAndMaterial(state.board),
    [state.board]
  );

  const lastMove = state.history.length > 0 ? state.history[state.history.length - 1].move : null;
  const isGameOver = status.kind === 'checkmate' || status.kind === 'stalemate' || status.kind === 'draw-50' || status.kind === 'draw-insufficient';

  useEffect(() => {
    moveListEndRef.current?.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
  }, [state.history.length]);

  // Trigger Local AI move when it's AI's turn
  useEffect(() => {
    if (mode !== 'ai' || isGameOver || pendingPromo) return;
    const aiColor: Color = playerColor === 'w' ? 'b' : 'w';
    if (state.turn !== aiColor) return;

    setAiThinking(true);
    const timer = window.setTimeout(() => {
      const result = findBestMove(state, difficulty);
      if (result.move) {
        const next = makeMove(state, result.move);
        const nextStatus = getGameStatus(next);
        setSnapshots((prev) => [...prev, state]);
        setState(next);
        setAiTelemetry({ evalCp: result.scoreCp, nodes: result.nodes, elapsedMs: result.elapsedMs });
        if (nextStatus.kind === 'checkmate' || nextStatus.kind === 'stalemate') {
          playChessTone('end', muted);
        } else if (nextStatus.inCheck) {
          playChessTone('check', muted);
        } else if (result.move.captured) {
          playChessTone('capture', muted);
        } else {
          playChessTone('move', muted);
        }
      }
      setAiThinking(false);
    }, 160);

    return () => window.clearTimeout(timer);
  }, [mode, state, playerColor, difficulty, isGameOver, pendingPromo, muted]);

  const executeMove = (move: ChessMove) => {
    const next = makeMove(state, move);
    const nextStatus = getGameStatus(next);
    setSnapshots((prev) => [...prev, state]);
    setState(next);
    setSelectedSq(null);
    setPendingPromo(null);
    setAiTelemetry((prev) => ({ ...prev, evalCp: evaluateBoard(next.board) }));

    if (nextStatus.kind === 'checkmate') {
      playChessTone('end', muted);
      if (mode === 'ai' && nextStatus.winner === playerColor) {
        setWins((w) => {
          const nw = w + 1;
          localStorage.setItem('kronvex-chess-wins', String(nw));
          return nw;
        });
      }
    } else if (nextStatus.kind === 'stalemate') {
      playChessTone('end', muted);
    } else if (nextStatus.inCheck) {
      playChessTone('check', muted);
    } else if (move.captured) {
      playChessTone('capture', muted);
    } else {
      playChessTone('move', muted);
    }
  };

  const handleSquareClick = (sq: number) => {
    if (isGameOver || aiThinking || pendingPromo) return;
    if (mode === 'ai' && state.turn !== playerColor) return;

    const clickedPiece = state.board[sq];

    if (selectedSq !== null) {
      const matchingMoves = legalFromSelected.filter((m) => m.to === sq);
      if (matchingMoves.length > 0) {
        if (matchingMoves.some((m) => m.promotion)) {
          setPendingPromo({ from: selectedSq, to: sq });
          return;
        }
        executeMove(matchingMoves[0]);
        return;
      }
    }

    if (clickedPiece && clickedPiece.color === state.turn) {
      setSelectedSq(sq === selectedSq ? null : sq);
    } else {
      setSelectedSq(null);
    }
  };

  const handlePromotionChoice = (promo: PromotionPiece) => {
    if (!pendingPromo) return;
    const moves = getLegalMovesFrom(state, pendingPromo.from);
    const chosen = moves.find((m) => m.to === pendingPromo.to && m.promotion === promo);
    if (chosen) executeMove(chosen);
    else setPendingPromo(null);
  };

  const handleUndo = () => {
    if (aiThinking || snapshots.length === 0) return;
    const stepsBack = mode === 'ai' && state.turn === playerColor && snapshots.length >= 2 ? 2 : 1;
    const targetIdx = Math.max(0, snapshots.length - stepsBack);
    const restored = snapshots[targetIdx];
    setState(restored);
    setSnapshots(snapshots.slice(0, targetIdx));
    setSelectedSq(null);
    setPendingPromo(null);
    setAiTelemetry((prev) => ({ ...prev, evalCp: evaluateBoard(restored.board) }));
  };

  const startNewGame = (nextMode = mode, nextColor = playerColor) => {
    setMode(nextMode);
    setPlayerColor(nextColor);
    setFlipped(nextMode === 'ai' ? nextColor === 'b' : false);
    setState(createInitialState());
    setSnapshots([]);
    setSelectedSq(null);
    setPendingPromo(null);
    setAiThinking(false);
    setAiTelemetry({ evalCp: 0, nodes: 0, elapsedMs: 0 });
  };

  // Evaluation bar percentage (White height / width share)
  const clampedCp = Math.max(-800, Math.min(800, aiTelemetry.evalCp));
  const whiteEvalPct = Math.round(50 + (clampedCp / 800) * 45);
  const evalLabel =
    Math.abs(aiTelemetry.evalCp) > 90000
      ? aiTelemetry.evalCp > 0
        ? 'M+'
        : 'M-'
      : `${aiTelemetry.evalCp >= 0 ? '+' : ''}${(aiTelemetry.evalCp / 100).toFixed(1)}`;

  const renderOrder = useMemo(() => {
    const arr: number[] = [];
    for (let r = 0; r < 8; r++) {
      for (let c = 0; c < 8; c++) {
        const rr = flipped ? 7 - r : r;
        const cc = flipped ? 7 - c : c;
        arr.push((rr << 3) | cc);
      }
    }
    return arr;
  }, [flipped]);

  const legalTargets = useMemo(() => {
    const map = new Map<number, boolean>();
    legalFromSelected.forEach((m) => map.set(m.to, Boolean(m.captured)));
    return map;
  }, [legalFromSelected]);

  // Pair move history into full turns
  const pairedHistory = useMemo(() => {
    const rows: { num: number; w?: string; b?: string }[] = [];
    for (let i = 0; i < state.history.length; i++) {
      const rec = state.history[i];
      if (rec.color === 'w') {
        rows.push({ num: rec.moveNumber, w: rec.san });
      } else {
        if (rows.length === 0 || rows[rows.length - 1].b) {
          rows.push({ num: rec.moveNumber, b: rec.san });
        } else {
          rows[rows.length - 1].b = rec.san;
        }
      }
    }
    return rows;
  }, [state.history]);

  const statusHeadline = (() => {
    if (status.kind === 'checkmate') {
      const winText = status.winner === 'w' ? 'White Wins by Checkmate!' : 'Black Wins by Checkmate!';
      return mode === 'ai'
        ? status.winner === playerColor
          ? `Victory! ${winText}`
          : `KRONVEX AI Wins — ${winText}`
        : winText;
    }
    if (status.kind === 'stalemate') return 'Draw by Stalemate';
    if (status.kind === 'draw-50') return 'Draw (50-Move Rule)';
    if (status.kind === 'draw-insufficient') return 'Draw (Insufficient Material)';
    if (aiThinking) return `KRONVEX ${DIFFICULTY_META[difficulty].label.split(' ')[0]} AI is calculating...`;
    const turnLabel = state.turn === 'w' ? 'White to move' : 'Black to move';
    return status.inCheck ? `${turnLabel} — CHECK!` : turnLabel;
  })();

  const topColor: Color = flipped ? 'w' : 'b';
  const bottomColor: Color = flipped ? 'b' : 'w';

  const renderCapturedStrip = (color: Color) => {
    const pieces = color === 'w' ? capturedByWhite : capturedByBlack;
    const adv = color === 'w' ? whiteAdvantage : -whiteAdvantage;
    const label =
      mode === 'ai'
        ? color === playerColor
          ? `You (${color === 'w' ? 'White' : 'Black'})`
          : `KRONVEX ${DIFFICULTY_META[difficulty].label.split(' ')[0]} AI`
        : color === 'w'
        ? 'Player 1 (White)'
        : 'Player 2 (Black)';
    const isTurn = !isGameOver && state.turn === color;

    return (
      <div className="flex items-center justify-between gap-2 px-3 py-2 rounded-xl bg-slate-100/90 dark:bg-slate-900/90 border border-slate-300 dark:border-slate-800">
        <div className="flex items-center gap-2 min-w-0">
          <span
            className={`w-2.5 h-2.5 rounded-full shrink-0 ${
              isTurn ? 'bg-emerald-400 animate-pulse' : 'bg-slate-400 dark:bg-slate-600'
            }`}
          />
          <span className="text-xs font-mono font-bold text-black dark:text-white truncate">{label}</span>
          {adv > 0 && (
            <span className="px-1.5 py-0.5 rounded text-[10px] font-mono font-bold bg-sky-500/15 text-sky-800 dark:text-sky-300 shrink-0">
              +{adv}
            </span>
          )}
        </div>
        <div className="flex items-center gap-0.5 overflow-hidden shrink-0">
          {pieces.slice(0, 12).map((pt, idx) => (
            <div key={`${pt}-${idx}`} className="w-4 h-4">
              <ChessPieceSvg piece={{ type: pt, color: color === 'w' ? 'b' : 'w' }} className="w-4 h-4" />
            </div>
          ))}
        </div>
      </div>
    );
  };

  return (
    <div
      className={
        theaterMode
          ? 'fixed inset-0 z-[60] bg-white dark:bg-[#050811] overflow-y-auto px-3 sm:px-6 py-4 space-y-3'
          : 'space-y-4'
      }
    >
      {/* Open Horizontal Match Settings Toolbar ABOVE the Board (Zero Outer Box) */}
      <div className="pb-3 border-b border-slate-300/80 dark:border-slate-800 flex flex-wrap items-center justify-between gap-3">
        {/* Left group: Mode + Difficulty + Side */}
        <div className="flex flex-wrap items-center gap-3">
          <div className="inline-flex rounded-full p-0.5 border border-slate-300 dark:border-slate-700">
            <button
              type="button"
              onClick={() => startNewGame('ai', playerColor)}
              className={`px-3 py-1 rounded-full text-[11px] font-mono font-bold inline-flex items-center gap-1 transition ${
                mode === 'ai'
                  ? 'bg-sky-500 text-slate-950'
                  : 'text-slate-900 dark:text-white hover:text-sky-500'
              }`}
            >
              <Bot className="w-3.5 h-3.5" /> Local AI
            </button>
            <button
              type="button"
              onClick={() => startNewGame('pvp', 'w')}
              className={`px-3 py-1 rounded-full text-[11px] font-mono font-bold inline-flex items-center gap-1 transition ${
                mode === 'pvp'
                  ? 'bg-indigo-500 text-white'
                  : 'text-slate-900 dark:text-white hover:text-indigo-400'
              }`}
            >
              <Users className="w-3.5 h-3.5" /> 2P
            </button>
          </div>

          {mode === 'ai' && (
            <>
              <div className="inline-flex items-center gap-2">
                {(['scout', 'tactical', 'apex'] as AiDifficulty[]).map((lvl) => (
                  <button
                    key={lvl}
                    type="button"
                    onClick={() => setDifficulty(lvl)}
                    title={DIFFICULTY_META[lvl].desc}
                    className={`pb-0.5 text-[11px] font-mono font-bold border-b-2 transition ${
                      difficulty === lvl
                        ? 'border-emerald-500 text-emerald-600 dark:text-emerald-400'
                        : 'border-transparent text-slate-900 dark:text-white hover:text-emerald-500'
                    }`}
                  >
                    {DIFFICULTY_META[lvl].label.split(' ')[0]}
                  </button>
                ))}
              </div>

              <span className="opacity-30 text-xs">|</span>

              <div className="inline-flex items-center gap-2">
                {(['w', 'b'] as Color[]).map((c) => (
                  <button
                    key={c}
                    type="button"
                    onClick={() => startNewGame('ai', c)}
                    className={`pb-0.5 text-[11px] font-mono font-bold border-b-2 transition ${
                      playerColor === c
                        ? 'border-sky-500 text-black dark:text-white'
                        : 'border-transparent text-slate-800 dark:text-slate-100 hover:text-sky-500'
                    }`}
                  >
                    {c === 'w' ? 'White' : 'Black'}
                  </button>
                ))}
              </div>
            </>
          )}
        </div>

        {/* Right group: Compact Controls + Fullscreen Toggle */}
        <div className="flex flex-wrap items-center gap-2">
          <span className="font-mono text-[11px] font-bold text-emerald-600 dark:text-emerald-400 pe-1">
            WINS: {wins}
          </span>
          <button
            type="button"
            onClick={handleUndo}
            disabled={snapshots.length === 0 || aiThinking}
            className="px-2.5 py-1.5 rounded-full hover:bg-slate-200/60 dark:hover:bg-slate-800/70 disabled:opacity-40 text-[11px] font-mono font-bold text-black dark:text-white inline-flex items-center gap-1 transition"
            title="Undo move"
          >
            <Undo2 className="w-3.5 h-3.5" /> Undo
          </button>
          <button
            type="button"
            onClick={() => setFlipped((f) => !f)}
            className="px-2.5 py-1.5 rounded-full hover:bg-slate-200/60 dark:hover:bg-slate-800/70 text-[11px] font-mono font-bold text-black dark:text-white inline-flex items-center gap-1 transition"
            title="Flip board"
          >
            <FlipVertical2 className="w-3.5 h-3.5" /> Flip
          </button>
          <button
            type="button"
            onClick={() => setMuted((m) => !m)}
            className="p-1.5 rounded-full hover:bg-slate-200/60 dark:hover:bg-slate-800/70 text-black dark:text-white transition"
            aria-label={muted ? 'Unmute SFX' : 'Mute SFX'}
            title={muted ? 'Unmute SFX' : 'Mute SFX'}
          >
            {muted ? <VolumeX className="w-3.5 h-3.5" /> : <Volume2 className="w-3.5 h-3.5" />}
          </button>
          <button
            type="button"
            onClick={() => setTheaterMode((t) => !t)}
            className="px-3 py-1.5 rounded-full border border-slate-300 dark:border-slate-700 hover:border-sky-500 text-[11px] font-mono font-bold text-black dark:text-white inline-flex items-center gap-1 transition"
            title={theaterMode ? 'Exit Fullscreen Board' : 'Fullscreen Board'}
          >
            {theaterMode ? <Minimize2 className="w-3.5 h-3.5" /> : <Maximize2 className="w-3.5 h-3.5" />}
            <span className="hidden sm:inline">{theaterMode ? 'Exit Full' : 'Full Screen'}</span>
          </button>
          <button
            type="button"
            onClick={() => startNewGame(mode, playerColor)}
            className="px-3.5 py-1.5 rounded-full bg-sky-500 hover:bg-sky-400 text-slate-950 text-[11px] font-mono font-bold inline-flex items-center gap-1 transition"
          >
            <RotateCcw className="w-3.5 h-3.5" /> New
          </button>
        </div>
      </div>

      {/* Large Centered Full-Stage Chessboard Area */}
      <div className={`${theaterMode ? 'max-w-[min(82vh,820px)]' : 'max-w-[740px]'} mx-auto w-full space-y-2.5`}>
        {/* Open Status Line */}
        <div
          className={`flex flex-wrap items-center justify-between gap-2 py-1.5 font-mono text-xs font-bold ${
            status.kind === 'checkmate'
              ? 'text-emerald-600 dark:text-emerald-300'
              : status.inCheck
              ? 'text-rose-600 dark:text-rose-300'
              : 'text-black dark:text-white'
          }`}
        >
          <span className="inline-flex items-center gap-2">
            {aiThinking ? (
              <Cpu className="w-4 h-4 text-sky-500 animate-spin shrink-0" />
            ) : (
              <Trophy className="w-4 h-4 text-amber-500 shrink-0" />
            )}
            {statusHeadline}
          </span>
          <span className="text-[11px] text-slate-900 dark:text-white inline-flex items-center gap-3">
            {aiTelemetry.nodes > 0 && (
              <span className="hidden sm:inline text-sky-700 dark:text-sky-300">
                {aiTelemetry.nodes.toLocaleString()} nodes · {aiTelemetry.elapsedMs}ms
              </span>
            )}
            <span>
              Eval: <strong>{evalLabel}</strong>
            </span>
          </span>
        </div>

        {/* Top Player Strip */}
        {renderCapturedStrip(topColor)}

        {/* Evaluation Bar */}
        <div
          className="h-2 rounded-full overflow-hidden bg-slate-800 border border-slate-700 flex"
          aria-label="Engine evaluation bar"
        >
          <div
            className="h-full bg-gradient-to-r from-slate-100 to-sky-300 transition-all duration-300"
            style={{ width: `${whiteEvalPct}%` }}
          />
        </div>

        {/* Full-Width 8x8 Chessboard */}
        <div
          dir="ltr"
          className="relative w-full rounded-2xl overflow-hidden border-2 border-slate-700/90 shadow-2xl select-none"
        >
          <div className="grid grid-cols-8 aspect-square w-full">
            {renderOrder.map((sq, gridIdx) => {
              const r = sq >> 3;
              const c = sq & 7;
              const isDarkSq = (r + c) % 2 === 1;
              const piece = state.board[sq];
              const isSelected = selectedSq === sq;
              const isLast = lastMove && (lastMove.from === sq || lastMove.to === sq);
              const isLegalTarget = legalTargets.has(sq);
              const isCaptureTarget = legalTargets.get(sq) === true;
              const isCheckedKing = status.inCheck && status.kingSq === sq;

              const visualRow = Math.floor(gridIdx / 8);
              const visualCol = gridIdx % 8;

              let bg = isDarkSq ? 'bg-[#1E3A5F]' : 'bg-[#CBD5E1]';
              if (isLast) bg = isDarkSq ? 'bg-[#2563EB]/75' : 'bg-[#7DD3FC]';
              if (isSelected) bg = 'bg-amber-400/90';
              if (isCheckedKing) bg = 'bg-rose-500/90';

              return (
                <button
                  key={sq}
                  type="button"
                  onClick={() => handleSquareClick(sq)}
                  aria-label={`Square ${FILES[c]}${RANKS[r]}${piece ? ` ${piece.color === 'w' ? 'White' : 'Black'} ${piece.type}` : ''}`}
                  className={`relative flex items-center justify-center ${bg} transition-colors focus:outline-none focus:ring-2 focus:ring-inset focus:ring-sky-400`}
                >
                  {/* Rank coordinate */}
                  {visualCol === 0 && (
                    <span
                      className={`absolute top-0.5 left-1 text-[10px] sm:text-xs font-mono font-bold pointer-events-none ${
                        isDarkSq ? 'text-sky-200/80' : 'text-slate-900/90'
                      }`}
                    >
                      {RANKS[r]}
                    </span>
                  )}
                  {/* File coordinate */}
                  {visualRow === 7 && (
                    <span
                      className={`absolute bottom-0.5 right-1 text-[10px] sm:text-xs font-mono font-bold pointer-events-none ${
                        isDarkSq ? 'text-sky-200/80' : 'text-slate-900/90'
                      }`}
                    >
                      {FILES[c]}
                    </span>
                  )}

                  {/* Legal Move Indicator */}
                  {isLegalTarget && !isCaptureTarget && (
                    <span className="w-3.5 h-3.5 sm:w-4 sm:h-4 rounded-full bg-emerald-400/85 ring-2 ring-slate-950/30 pointer-events-none" />
                  )}
                  {isLegalTarget && isCaptureTarget && (
                    <span className="absolute inset-1 rounded-full border-[3px] sm:border-4 border-rose-400/90 pointer-events-none" />
                  )}

                  {/* Piece */}
                  {piece && <ChessPieceSvg piece={piece} />}
                </button>
              );
            })}
          </div>

          {/* Pawn Promotion Picker Overlay */}
          {pendingPromo && (
            <div className="absolute inset-0 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4 z-20">
              <div className="rounded-2xl bg-[#0B1120] border border-sky-500/40 p-5 text-center space-y-4 shadow-2xl">
                <div className="font-mono text-xs font-bold text-sky-300 uppercase">Promote Pawn To</div>
                <div className="flex items-center gap-3">
                  {(['q', 'r', 'b', 'n'] as PromotionPiece[]).map((pt) => (
                    <button
                      key={pt}
                      type="button"
                      onClick={() => handlePromotionChoice(pt)}
                      className="w-14 h-14 rounded-xl bg-slate-800 hover:bg-sky-500/30 border border-slate-600 hover:border-sky-400 flex items-center justify-center transition"
                      aria-label={`Promote to ${pt}`}
                    >
                      <ChessPieceSvg piece={{ type: pt, color: state.turn }} className="w-11 h-11" />
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Bottom Player Strip */}
        {renderCapturedStrip(bottomColor)}

        {/* Open Horizontal Move Log Below the Board */}
        <div className="pt-3 border-t border-slate-300/80 dark:border-slate-800 space-y-2">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <span className="font-mono text-[11px] font-bold uppercase text-black dark:text-white">
              Move Log ({state.history.length} ply)
            </span>
            <span className="inline-flex items-center gap-1.5 font-mono text-[10px] text-slate-900 dark:text-white">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
              100% Local Alpha-Beta + Quiescence · Full FIDE Rules · $0 Server Cost
            </span>
          </div>

          <div className="max-h-24 overflow-y-auto py-1 font-mono text-xs flex flex-wrap gap-x-3 gap-y-1">
            {pairedHistory.length === 0 ? (
              <span className="text-slate-900 dark:text-white">
                Tap any piece on the board to see legal moves and begin.
              </span>
            ) : (
              pairedHistory.map((row) => (
                <span key={row.num} className="inline-flex items-center gap-1 whitespace-nowrap">
                  <span className="text-slate-700 dark:text-slate-100">{row.num}.</span>
                  <span className="text-black dark:text-white font-semibold">{row.w || ''}</span>
                  {row.b && <span className="text-sky-700 dark:text-sky-300 font-semibold">{row.b}</span>}
                </span>
              ))
            )}
            <div ref={moveListEndRef} />
          </div>
        </div>
      </div>
    </div>
  );
}

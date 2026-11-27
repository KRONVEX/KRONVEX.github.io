import { useEffect, useRef, useState } from 'react';
import {
  ArrowLeft,
  ArrowRight,
  Check,
  Copy,
  Download,
  ExternalLink,
  Layers,
  RotateCcw,
  ShieldCheck,
  Sparkles,
  Terminal,
  X,
} from 'lucide-react';
import {
  TOTAL_VAULT_TRIALS,
  VAULT_EPIGRAPH,
  buildStandaloneCliScript,
  getVaultProgress,
  reopenUnlockedVault,
  resetVaultProgress,
  submitVaultTrial,
  type DecryptedArchitectVault,
  type VaultTrialSpec,
} from '../utils/architectVaultCrypto';

interface MatrixChamberModalProps {
  initialView?: 'choose' | 'chamber' | 'cli';
  onClose: () => void;
  onOpenBuiltInCli: () => void;
  onUnlocked: (result: { payload: DecryptedArchitectVault; proofCode: string }) => void;
}

export function MatrixChamberModal({
  initialView = 'choose',
  onClose,
  onOpenBuiltInCli,
  onUnlocked,
}: MatrixChamberModalProps) {
  const [view, setView] = useState<'choose' | 'chamber' | 'cli'>(initialView);
  const [progress, setProgress] = useState<{ cleared: number; currentTrial: VaultTrialSpec | null }>(() =>
    getVaultProgress()
  );
  const [answer, setAnswer] = useState('');
  const [feedback, setFeedback] = useState<{ kind: 'idle' | 'error' | 'ok'; text: string }>({
    kind: 'idle',
    text: '',
  });
  const [submitting, setSubmitting] = useState(false);
  const [copiedCmd, setCopiedCmd] = useState(false);
  const [downloadedCli, setDownloadedCli] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [onClose]);

  useEffect(() => {
    if (view === 'chamber') {
      window.setTimeout(() => inputRef.current?.focus(), 60);
    }
  }, [view, progress.cleared]);

  const fireUnlockShockwaves = () => {
    const cx = window.innerWidth / 2;
    const cy = window.innerHeight / 2;
    window.dispatchEvent(new CustomEvent('kronvex-core-pulse', { detail: { x: cx, y: cy, pillar: 1 } }));
    window.setTimeout(() => {
      window.dispatchEvent(new CustomEvent('kronvex-core-pulse', { detail: { x: cx, y: cy, pillar: 2 } }));
    }, 160);
  };

  const handleOpenCompletedVault = async () => {
    const res = await reopenUnlockedVault();
    if (res) {
      fireUnlockShockwaves();
      onUnlocked(res);
    } else {
      resetVaultProgress();
      setProgress(getVaultProgress());
      setView('chamber');
    }
  };

  const handleEnterChamber = () => {
    const current = getVaultProgress();
    setProgress(current);
    if (!current.currentTrial) {
      void handleOpenCompletedVault();
      return;
    }
    setFeedback({ kind: 'idle', text: '' });
    setView('chamber');
  };

  const handleReset = () => {
    resetVaultProgress();
    setProgress(getVaultProgress());
    setAnswer('');
    setFeedback({ kind: 'idle', text: 'Matrix trial progress reset to 01/21.' });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = answer.trim();
    if (!trimmed || submitting) return;
    setSubmitting(true);
    try {
      const res = await submitVaultTrial(trimmed);
      if (res.status === 'wrong_answer') {
        const n = String((res.clearedCount ?? progress.cleared) + 1).padStart(2, '0');
        setFeedback({
          kind: 'error',
          text: `TRIAL ${n}/${TOTAL_VAULT_TRIALS} REJECTED — Signal mismatch. Re-evaluate and try again.`,
        });
      } else if (res.status === 'advanced' && res.nextTrial) {
        const passed = res.clearedCount ?? progress.cleared + 1;
        setProgress({ cleared: passed, currentTrial: res.nextTrial });
        setAnswer('');
        setFeedback({
          kind: 'ok',
          text: `TRIAL ${String(passed).padStart(2, '0')}/${TOTAL_VAULT_TRIALS} CLEARED — Advancing to Trial ${String(
            res.nextTrial.id
          ).padStart(2, '0')}.`,
        });
      } else if (res.status === 'unlocked' && res.payload && res.proofCode) {
        setProgress({ cleared: TOTAL_VAULT_TRIALS, currentTrial: null });
        setAnswer('');
        fireUnlockShockwaves();
        onUnlocked({ payload: res.payload, proofCode: res.proofCode });
      } else if (res.status === 'ritual_required') {
        setFeedback({
          kind: 'error',
          text: '7-Node harmonic resonance expired. Complete the Owl Crest pillar ritual again.',
        });
      } else {
        setFeedback({ kind: 'error', text: 'Web Crypto API unavailable in this browser context.' });
      }
    } finally {
      setSubmitting(false);
    }
  };

  const handleDownloadCli = () => {
    const script = buildStandaloneCliScript();
    const blob = new Blob([script], { type: 'text/javascript;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'kronvex-matrix-cli.mjs';
    document.body.appendChild(link);
    link.click();
    link.remove();
    URL.revokeObjectURL(url);
    setDownloadedCli(true);
    window.setTimeout(() => setDownloadedCli(false), 2600);
  };

  const handleCopyRunCmd = () => {
    navigator.clipboard?.writeText('node kronvex-matrix-cli.mjs');
    setCopiedCmd(true);
    window.setTimeout(() => setCopiedCmd(false), 1800);
  };

  const trial = progress.currentTrial;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="KRONVEX Matrix Gateway"
      dir="ltr"
      className="fixed inset-0 z-[75] flex items-center justify-center p-4 sm:p-6 bg-[#02050c]/90 backdrop-blur-xl overflow-y-auto"
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-3xl rounded-3xl border border-emerald-400/30 bg-[#050914]/95 shadow-[0_0_90px_-18px_rgba(34,255,136,0.3),0_0_50px_-20px_rgba(245,158,11,0.22)] overflow-hidden my-auto text-slate-100"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Subtle Ambient Glow */}
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_75%_50%_at_50%_0%,rgba(16,185,129,0.16),transparent_65%),radial-gradient(ellipse_60%_45%_at_50%_100%,rgba(245,158,11,0.12),transparent_65%)]"
        />

        {/* Top Bar */}
        <div className="relative flex items-center justify-between gap-3 px-6 py-4 border-b border-white/10">
          <div className="inline-flex items-center gap-2 font-brand text-xs tracking-[0.2em] text-emerald-300 uppercase">
            <Sparkles className="w-4 h-4 text-amber-300" />
            <span>
              {view === 'choose'
                ? 'KRONVEX // MATRIX GATEWAY'
                : view === 'chamber'
                ? 'KRONVEX // 21-TRIAL CHAMBER'
                : 'KRONVEX // CLI DOWNLOAD & SETUP'}
            </span>
          </div>
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-1 rounded-full border border-emerald-400/30 bg-emerald-500/10 font-mono text-[11px] text-emerald-200">
              {String(progress.cleared).padStart(2, '0')}/{TOTAL_VAULT_TRIALS} CLEARED
            </span>
            <button
              type="button"
              onClick={onClose}
              aria-label="Close Matrix Gateway"
              className="p-1.5 rounded-full text-slate-300 hover:text-white hover:bg-white/10 transition"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* SCREEN 1: CHOOSE ARENA (CHAMBER vs CLI) */}
        {view === 'choose' && (
          <div className="relative px-6 sm:px-9 py-8 space-y-7">
            <div className="text-center space-y-2.5 max-w-xl mx-auto">
              <div className="font-mono text-[11px] uppercase tracking-[0.24em] text-amber-300 font-semibold">
                7-NODE HARMONIC RESONANCE CONFIRMED
              </div>
              <h2 className="font-brand text-2xl sm:text-3xl font-bold text-white tracking-tight">
                Choose Your Trial Arena
              </h2>
              <p className="font-editorial italic text-lg sm:text-xl text-emerald-200/95">
                &ldquo;{VAULT_EPIGRAPH}&rdquo;
              </p>
              <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
                21 sequential cryptographic, mathematical, and logical trials seal the Architect&apos;s Vault. Select how
                you wish to face the Matrix.
              </p>
            </div>

            {progress.cleared >= TOTAL_VAULT_TRIALS && (
              <div className="flex justify-center">
                <button
                  type="button"
                  onClick={() => void handleOpenCompletedVault()}
                  className="px-6 py-2.5 rounded-full bg-gradient-to-r from-amber-400 to-emerald-400 text-black font-bold text-xs font-mono inline-flex items-center gap-2 shadow-lg hover:opacity-95 transition"
                >
                  <ShieldCheck className="w-4 h-4" /> 21/21 Cleared — Open Architect&apos;s Vault
                </button>
              </div>
            )}

            <div className="grid sm:grid-cols-2 gap-4">
              {/* Option 1: Interactive Chamber */}
              <button
                type="button"
                onClick={handleEnterChamber}
                className="group text-left p-6 rounded-2xl border border-emerald-400/35 bg-emerald-500/[0.06] hover:bg-emerald-500/[0.12] hover:border-emerald-300 transition flex flex-col justify-between gap-5"
              >
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="p-2.5 rounded-xl bg-emerald-500/15 border border-emerald-400/35 text-emerald-300">
                      <Layers className="w-5 h-5" />
                    </span>
                    <span className="font-mono text-[10px] tracking-[0.2em] text-emerald-300 uppercase">
                      ARENA 01 · VISUAL
                    </span>
                  </div>
                  <h3 className="font-brand text-lg font-bold text-white">Interactive Chamber</h3>
                  <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
                    Face all 21 trials directly inside this cinematic interface with a live 21-node progress grid, instant
                    SHA-256 verification, and automatic Vault decryption.
                  </p>
                </div>
                <div className="inline-flex items-center gap-2 font-mono text-xs font-bold text-emerald-300 group-hover:translate-x-1 transition">
                  <span>{progress.cleared > 0 ? `Resume Trial ${String(progress.cleared + 1).padStart(2, '0')}/21` : 'Enter 21-Trial Chamber'}</span>
                  <ArrowRight className="w-4 h-4" />
                </div>
              </button>

              {/* Option 2: Terminal CLI (Download & Setup) */}
              <button
                type="button"
                onClick={() => setView('cli')}
                className="group text-left p-6 rounded-2xl border border-amber-400/35 bg-amber-500/[0.06] hover:bg-amber-500/[0.12] hover:border-amber-300 transition flex flex-col justify-between gap-5"
              >
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="p-2.5 rounded-xl bg-amber-500/15 border border-amber-400/35 text-amber-300">
                      <Terminal className="w-5 h-5" />
                    </span>
                    <span className="font-mono text-[10px] tracking-[0.2em] text-amber-300 uppercase">
                      ARENA 02 · CLI
                    </span>
                  </div>
                  <h3 className="font-brand text-lg font-bold text-white">Terminal CLI</h3>
                  <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
                    Download the standalone zero-dependency local CLI runner for your OS terminal (PowerShell / Bash) or
                    launch the built-in <span className="font-mono text-amber-200">kronvex&gt; CLI</span>.
                  </p>
                </div>
                <div className="inline-flex items-center gap-2 font-mono text-xs font-bold text-amber-300 group-hover:translate-x-1 transition">
                  <span>Download &amp; Setup Guide</span>
                  <ArrowRight className="w-4 h-4" />
                </div>
              </button>
            </div>
          </div>
        )}

        {/* SCREEN 2: INTERACTIVE 21-TRIAL CHAMBER */}
        {view === 'chamber' && trial && (
          <div className="relative px-6 sm:px-9 py-7 space-y-6">
            {/* Sub-Nav */}
            <div className="flex flex-wrap items-center justify-between gap-3">
              <button
                type="button"
                onClick={() => setView('choose')}
                className="inline-flex items-center gap-1.5 text-xs font-mono text-slate-300 hover:text-white transition"
              >
                <ArrowLeft className="w-3.5 h-3.5" /> Choose Arena
              </button>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setView('cli')}
                  className="px-3 py-1 rounded-full border border-white/15 hover:border-amber-300/60 text-[11px] font-mono text-slate-200 hover:text-amber-200 inline-flex items-center gap-1.5 transition"
                >
                  <Terminal className="w-3 h-3" /> Switch to CLI
                </button>
                {progress.cleared > 0 && (
                  <button
                    type="button"
                    onClick={handleReset}
                    className="px-3 py-1 rounded-full border border-white/15 hover:border-rose-400/60 text-[11px] font-mono text-slate-300 hover:text-rose-200 inline-flex items-center gap-1.5 transition"
                  >
                    <RotateCcw className="w-3 h-3" /> Reset
                  </button>
                )}
              </div>
            </div>

            {/* 21-Node Matrix Progress Bar (3 Pillars x 7 Nodes) */}
            <div className="space-y-2">
              <div className="flex items-center justify-between text-[11px] font-mono text-slate-300">
                <span className="text-emerald-300 font-semibold">{trial.pillar}</span>
                <span>
                  TRIAL {String(trial.id).padStart(2, '0')} / {TOTAL_VAULT_TRIALS}
                </span>
              </div>
              <div className="grid grid-cols-7 sm:grid-cols-21 gap-1.5" style={{ gridTemplateColumns: 'repeat(21, minmax(0, 1fr))' }}>
                {Array.from({ length: TOTAL_VAULT_TRIALS }, (_, i) => {
                  const done = i < progress.cleared;
                  const active = i === progress.cleared;
                  return (
                    <div
                      key={i}
                      title={`Trial ${String(i + 1).padStart(2, '0')}`}
                      className={`h-2 rounded-full transition-all duration-300 ${
                        done
                          ? 'bg-emerald-400 shadow-[0_0_10px_rgba(52,211,153,0.7)]'
                          : active
                          ? 'bg-amber-300 animate-pulse shadow-[0_0_10px_rgba(252,211,77,0.8)]'
                          : 'bg-white/10'
                      }`}
                    />
                  );
                })}
              </div>
            </div>

            {/* Active Trial Card */}
            <div className="rounded-2xl border border-white/15 bg-black/45 p-5 sm:p-6 space-y-4">
              <div className="space-y-1">
                <div className="font-mono text-[11px] uppercase tracking-[0.2em] text-amber-300">
                  SIGNAL CHALLENGE #{String(trial.id).padStart(2, '0')}
                </div>
                <h3 className="font-brand text-xl sm:text-2xl font-bold text-white">{trial.title}</h3>
              </div>

              <div className="rounded-xl border border-emerald-400/20 bg-[#040812] p-4 font-mono text-sm sm:text-base text-emerald-100 leading-relaxed select-text break-words">
                {trial.prompt}
              </div>

              <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-2.5 pt-1">
                <input
                  ref={inputRef}
                  type="text"
                  value={answer}
                  onChange={(e) => setAnswer(e.target.value)}
                  placeholder="Enter decrypted answer..."
                  autoComplete="off"
                  spellCheck={false}
                  className="flex-1 px-4 py-3 rounded-xl bg-[#040812] border border-white/20 focus:border-emerald-400 focus:outline-none font-mono text-sm text-white placeholder-slate-500"
                />
                <button
                  type="submit"
                  disabled={submitting || !answer.trim()}
                  className="px-6 py-3 rounded-xl bg-gradient-to-r from-emerald-400 to-amber-300 hover:opacity-95 disabled:opacity-45 text-black font-mono font-bold text-xs uppercase tracking-wider inline-flex items-center justify-center gap-2 transition shrink-0"
                >
                  <span>Verify Signal</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </form>

              {feedback.text && (
                <div
                  className={`font-mono text-xs px-3.5 py-2.5 rounded-xl border ${
                    feedback.kind === 'error'
                      ? 'border-rose-500/40 bg-rose-500/10 text-rose-200'
                      : feedback.kind === 'ok'
                      ? 'border-emerald-400/40 bg-emerald-500/10 text-emerald-200'
                      : 'border-white/15 bg-white/5 text-slate-200'
                  }`}
                >
                  {feedback.text}
                </div>
              )}
            </div>
          </div>
        )}

        {/* SCREEN 3: CLI DOWNLOAD & SETUP GUIDE */}
        {view === 'cli' && (
          <div className="relative px-6 sm:px-9 py-7 space-y-6">
            <div className="flex items-center justify-between gap-3">
              <button
                type="button"
                onClick={() => setView('choose')}
                className="inline-flex items-center gap-1.5 text-xs font-mono text-slate-300 hover:text-white transition"
              >
                <ArrowLeft className="w-3.5 h-3.5" /> Choose Arena
              </button>
              <button
                type="button"
                onClick={handleEnterChamber}
                className="px-3 py-1 rounded-full border border-white/15 hover:border-emerald-300/60 text-[11px] font-mono text-slate-200 hover:text-emerald-200 inline-flex items-center gap-1.5 transition"
              >
                <Layers className="w-3 h-3" /> Switch to Chamber
              </button>
            </div>

            <div className="space-y-1.5">
              <h2 className="font-brand text-xl sm:text-2xl font-bold text-white">Terminal CLI — Download &amp; Run</h2>
              <p className="text-xs sm:text-sm text-slate-300">
                Choose either the downloadable offline Node.js CLI binary script or the built-in browser terminal. Both
                enforce identical SHA-256 verification across all 21 trials.
              </p>
            </div>

            {/* Method A: Download Standalone Local CLI */}
            <div className="rounded-2xl border border-amber-400/35 bg-amber-500/[0.05] p-5 space-y-4">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div className="font-mono text-xs font-bold uppercase tracking-wider text-amber-300">
                  OPTION A · STANDALONE LOCAL CLI (WINDOWS / MACOS / LINUX)
                </div>
                <span className="px-2 py-0.5 rounded bg-black/40 border border-white/10 font-mono text-[10px] text-slate-300">
                  Zero Dependencies · Node.js 18+
                </span>
              </div>

              <ol className="space-y-2.5 text-xs sm:text-sm text-slate-200 list-decimal list-inside">
                <li>
                  Ensure <strong className="text-white">Node.js 18+</strong> is installed (
                  <a
                    href="https://nodejs.org/"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-sky-300 hover:underline inline-flex items-center gap-1"
                  >
                    nodejs.org <ExternalLink className="w-3 h-3" />
                  </a>
                  ).
                </li>
                <li>Download the encrypted standalone CLI runner below (<code className="font-mono text-amber-200">kronvex-matrix-cli.mjs</code>).</li>
                <li>Open PowerShell, Terminal, or Bash in your download folder and run the command below:</li>
              </ol>

              <div className="flex items-center justify-between gap-3 px-4 py-3 rounded-xl bg-[#040812] border border-white/15 font-mono text-xs sm:text-sm text-emerald-300">
                <code>node kronvex-matrix-cli.mjs</code>
                <button
                  type="button"
                  onClick={handleCopyRunCmd}
                  className="px-2.5 py-1 rounded-lg border border-white/15 hover:border-emerald-300 text-[11px] text-slate-200 inline-flex items-center gap-1.5 transition shrink-0"
                >
                  {copiedCmd ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                  {copiedCmd ? 'Copied' : 'Copy'}
                </button>
              </div>

              <div className="flex flex-wrap items-center gap-3 pt-1">
                <button
                  type="button"
                  onClick={handleDownloadCli}
                  className="px-5 py-2.5 rounded-full bg-gradient-to-r from-amber-400 to-emerald-400 hover:opacity-95 text-black font-mono font-bold text-xs inline-flex items-center gap-2 transition"
                >
                  {downloadedCli ? <Check className="w-4 h-4" /> : <Download className="w-4 h-4" />}
                  {downloadedCli ? 'Downloaded kronvex-matrix-cli.mjs!' : 'Download kronvex-matrix-cli.mjs'}
                </button>
                <span className="font-mono text-[11px] text-slate-400">
                  Clearing all 21 trials locally prints your Vault decryption &amp; web unlock chain.
                </span>
              </div>
            </div>

            {/* Method B: Built-In Web CLI */}
            <div className="rounded-2xl border border-emerald-400/30 bg-emerald-500/[0.05] p-5 space-y-3.5">
              <div className="font-mono text-xs font-bold uppercase tracking-wider text-emerald-300">
                OPTION B · BUILT-IN WEB TERMINAL (ZERO DOWNLOAD)
              </div>
              <p className="text-xs sm:text-sm text-slate-300">
                Run the 21 trials directly inside the site&apos;s integrated <code className="font-mono text-emerald-200">kronvex&gt; CLI</code> (<code className="font-mono text-slate-200">Ctrl+K</code>):
              </p>
              <div className="rounded-xl bg-[#040812] border border-white/15 p-3.5 font-mono text-xs text-slate-200 space-y-1">
                <div><span className="text-emerald-400">kronvex&gt;</span> vault                 <span className="text-slate-400"># View active trial</span></div>
                <div><span className="text-emerald-400">kronvex&gt;</span> vault &lt;answer&gt;        <span className="text-slate-400"># Submit decrypted answer</span></div>
                <div><span className="text-emerald-400">kronvex&gt;</span> vault chain A1|...|A21 <span className="text-slate-400"># Batch-verify all 21 answers</span></div>
                <div><span className="text-emerald-400">kronvex&gt;</span> vault chamber         <span className="text-slate-400"># Return to Visual Chamber</span></div>
              </div>
              <button
                type="button"
                onClick={onOpenBuiltInCli}
                className="px-5 py-2.5 rounded-full border border-emerald-400/50 bg-emerald-500/15 hover:bg-emerald-500/25 text-emerald-200 font-mono font-bold text-xs inline-flex items-center gap-2 transition"
              >
                <Terminal className="w-4 h-4" /> Launch Built-in kronvex&gt; CLI
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

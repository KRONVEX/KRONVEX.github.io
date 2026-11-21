import { useEffect, useMemo, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowRight, Command, Cpu, Layers, Network, Search, Sparkles, Terminal, X } from 'lucide-react';
import { KRONVEX_APPS, KRONVEX_MODELS, KRONVEX_SKILLS, ORG_META } from '../data/catalog';
import type { DetectedHardware } from '../types/kronvex';

interface CommandTerminalProps {
  open: boolean;
  initialMode: 'palette' | 'terminal';
  onClose: () => void;
  hardware: DetectedHardware;
}

interface SearchEntry {
  id: string;
  title: string;
  subtitle: string;
  category: 'Page' | 'App' | 'AI Model' | 'AI Skill';
  route: string;
}

interface TermLine {
  type: 'input' | 'output' | 'accent';
  text: string;
}

export function CommandTerminal({ open, initialMode, onClose, hardware }: CommandTerminalProps) {
  const navigate = useNavigate();
  const [mode, setMode] = useState<'palette' | 'terminal'>(initialMode);
  const [query, setQuery] = useState('');
  const [cmdInput, setCmdInput] = useState('');
  const [history, setHistory] = useState<TermLine[]>([
    { type: 'accent', text: 'KRONVEX OS // MISSION CONTROL CLI v1.0.0' },
    { type: 'output', text: 'Type "help" to list commands, or switch to Quick Search.' },
  ]);
  const inputRef = useRef<HTMLInputElement>(null);
  const termEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setMode(initialMode);
  }, [initialMode, open]);

  useEffect(() => {
    if (open) {
      setTimeout(() => inputRef.current?.focus(), 40);
    }
  }, [open, mode]);

  useEffect(() => {
    termEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [history]);

  const entries = useMemo<SearchEntry[]>(() => {
    const pages: SearchEntry[] = [
      { id: 'p-home', title: 'Mission Control Home', subtitle: 'Organization overview & live telemetry', category: 'Page', route: '/' },
      { id: 'p-apps', title: 'Android & Windows Apps', subtitle: 'Direct downloads with SHA-256 verification', category: 'Page', route: '/apps' },
      { id: 'p-models', title: 'AI Models & Local Browser Chat', subtitle: 'Download weights or chat locally via WebGPU/WASM', category: 'Page', route: '/models' },
      { id: 'p-skills', title: 'AI Skills Marketplace & Composer', subtitle: 'Preview SKILL.md & export .zip bundles', category: 'Page', route: '/skills' },
      { id: 'p-top21', title: 'Top 21 — Weekly GitHub & Hugging Face', subtitle: 'Top 21 GitHub repos & Top 21 Hugging Face AI models this week', category: 'Page', route: '/top-21' },
      { id: 'p-const', title: 'Ecosystem Constellation', subtitle: 'Interactive neural orbital map of KRONVEX', category: 'Page', route: '/constellation' },
      { id: 'p-vision', title: 'Vision, Mission & Roadmap', subtitle: 'Organization goals, governance & multi-phase plan', category: 'Page', route: '/vision' },
      { id: 'p-contact', title: 'Contact & Partnerships', subtitle: 'Connect with KRONVEX leadership', category: 'Page', route: '/contact' },
    ];
    const apps: SearchEntry[] = KRONVEX_APPS.map((a) => ({
      id: a.id,
      title: a.name,
      subtitle: `${a.version} · ${a.platforms.join(', ')}`,
      category: 'App',
      route: '/apps',
    }));
    const models: SearchEntry[] = KRONVEX_MODELS.map((m) => ({
      id: m.id,
      title: m.name,
      subtitle: `${m.parameters} · ${m.browserRunnable ? 'Browser Chat Ready' : m.family}`,
      category: 'AI Model',
      route: '/models',
    }));
    const skills: SearchEntry[] = KRONVEX_SKILLS.map((s) => ({
      id: s.id,
      title: s.name,
      subtitle: `${s.category} · ${s.slug}`,
      category: 'AI Skill',
      route: '/skills',
    }));
    return [...pages, ...apps, ...models, ...skills];
  }, []);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return entries.slice(0, 9);
    return entries.filter(
      (e) =>
        e.title.toLowerCase().includes(q) ||
        e.subtitle.toLowerCase().includes(q) ||
        e.category.toLowerCase().includes(q)
    );
  }, [entries, query]);

  const runCommand = (raw: string) => {
    const cmd = raw.trim();
    if (!cmd) return;
    const parts = cmd.split(/\s+/);
    const head = parts[0].toLowerCase();
    const arg = parts[1]?.toLowerCase() || '';

    const next: TermLine[] = [{ type: 'input', text: `kronvex> ${cmd}` }];

    if (head === 'help') {
      next.push(
        { type: 'accent', text: 'Available Commands:' },
        { type: 'output', text: '  status          — Organization telemetry & local client status' },
        { type: 'output', text: '  hardware        — Inspect your PC CPU, RAM & WebGPU readiness' },
        { type: 'output', text: '  apps            — List Windows & Android apps' },
        { type: 'output', text: '  models          — List downloadable & browser-runnable AI models' },
        { type: 'output', text: '  skills          — List KRONVEX AI agent skills' },
        { type: 'output', text: '  open <page>     — Navigate (home|apps|models|skills|constellation|vision|contact)' },
        { type: 'output', text: '  whoami          — Organization founder & mission brief' },
        { type: 'output', text: '  clear           — Clear terminal screen' }
      );
    } else if (head === 'clear') {
      setHistory([{ type: 'accent', text: 'Terminal cleared. Type "help" for commands.' }]);
      setCmdInput('');
      return;
    } else if (head === 'status') {
      next.push(
        { type: 'accent', text: `ORG: ${ORG_META.name} (${ORG_META.githubUrl})` },
        { type: 'output', text: `APPS: ${KRONVEX_APPS.length} tracked | MODELS: ${KRONVEX_MODELS.length} | SKILLS: ${KRONVEX_SKILLS.length}` },
        { type: 'output', text: 'HOSTING: GitHub Pages (100% Static · $0 Server Cost · Local-First AI)' }
      );
    } else if (head === 'hardware') {
      next.push(
        { type: 'accent', text: 'LOCAL CLIENT HARDWARE PROFILE:' },
        { type: 'output', text: `  OS:       ${hardware.os}` },
        { type: 'output', text: `  CPU:      ${hardware.cpuCores} logical threads` },
        { type: 'output', text: `  RAM Est:  ${hardware.ramGb ? `${hardware.ramGb} GB` : 'Browser-masked (4–8+ GB)'}` },
        { type: 'output', text: `  WebGPU:   ${hardware.webgpuSupported ? `ENABLED (${hardware.webgpuAdapter})` : 'Unavailable (WASM CPU fallback active)'}` }
      );
    } else if (head === 'apps') {
      KRONVEX_APPS.forEach((a) =>
        next.push({ type: 'output', text: `  • ${a.name} (${a.version}) [${a.platforms.join('/')}] — ${a.status.toUpperCase()}` })
      );
    } else if (head === 'models') {
      KRONVEX_MODELS.forEach((m) =>
        next.push({
          type: 'output',
          text: `  • ${m.name} [${m.parameters}] — ${m.browserRunnable ? 'BROWSER CHAT READY' : 'LOCAL GGUF/HF'}`,
        })
      );
    } else if (head === 'skills') {
      KRONVEX_SKILLS.forEach((s) =>
        next.push({ type: 'output', text: `  • ${s.slug} (${s.category}) — ${s.tagline}` })
      );
    } else if (head === 'whoami') {
      next.push(
        { type: 'accent', text: `${ORG_META.name} — Founded by ${ORG_META.founderName} (@khalid-naami)` },
        { type: 'output', text: ORG_META.tagline }
      );
    } else if (head === 'open' || head === 'cd' || head === 'goto') {
      const map: Record<string, string> = {
        home: '/',
        apps: '/apps',
        models: '/models',
        chat: '/models',
        skills: '/skills',
        top21: '/top-21',
        'top-21': '/top-21',
        radar: '/top-21',
        constellation: '/constellation',
        vision: '/vision',
        roadmap: '/vision',
        contact: '/contact',
      };
      if (map[arg]) {
        navigate(map[arg]);
        onClose();
        setCmdInput('');
        return;
      }
      next.push({ type: 'output', text: `Unknown target "${arg}". Try: open apps | models | skills | constellation | vision | contact` });
    } else {
      next.push({ type: 'output', text: `Command not found: "${head}". Type "help" to see available commands.` });
    }

    setHistory((prev) => [...prev, ...next]);
    setCmdInput('');
  };

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-start justify-center pt-16 sm:pt-24 px-4 bg-slate-950/75 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        className="w-full max-w-2xl rounded-2xl overflow-hidden border border-slate-700/80 bg-[#080E1C] text-slate-100 shadow-2xl shadow-sky-950/50"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div className="flex items-center justify-between px-4 py-3 border-b border-slate-800 bg-[#050914]">
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setMode('palette')}
              className={`px-3 py-1 rounded-md text-xs font-mono flex items-center gap-1.5 transition ${
                mode === 'palette'
                  ? 'bg-sky-500/20 text-sky-300 border border-sky-500/40'
                  : 'text-slate-200 hover:text-white'
              }`}
            >
              <Command className="w-3.5 h-3.5" /> Quick Search
            </button>
            <button
              type="button"
              onClick={() => setMode('terminal')}
              className={`px-3 py-1 rounded-md text-xs font-mono flex items-center gap-1.5 transition ${
                mode === 'terminal'
                  ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                  : 'text-slate-200 hover:text-white'
              }`}
            >
              <Terminal className="w-3.5 h-3.5" /> kronvex&gt; CLI
            </button>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1 rounded-md text-slate-200 hover:text-white hover:bg-slate-800"
            aria-label="Close modal"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {mode === 'palette' ? (
          <div>
            <div className="flex items-center gap-3 px-4 py-3 border-b border-slate-800">
              <Search className="w-4 h-4 text-sky-400 shrink-0" />
              <input
                ref={inputRef}
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search apps, AI models, skills, or pages..."
                className="w-full bg-transparent text-sm text-white placeholder-slate-400 dark:placeholder-slate-300 focus:outline-none"
              />
            </div>
            <div className="max-h-80 overflow-y-auto p-2 space-y-1">
              {filtered.map((item) => (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => {
                    navigate(item.route);
                    onClose();
                  }}
                  className="w-full text-left px-3 py-2.5 rounded-xl hover:bg-slate-800/80 flex items-center justify-between gap-3 group transition"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <span className="p-1.5 rounded-lg bg-slate-900 border border-slate-800 text-sky-400">
                      {item.category === 'App' ? (
                        <Layers className="w-3.5 h-3.5" />
                      ) : item.category === 'AI Model' ? (
                        <Cpu className="w-3.5 h-3.5" />
                      ) : item.category === 'AI Skill' ? (
                        <Sparkles className="w-3.5 h-3.5" />
                      ) : (
                        <Network className="w-3.5 h-3.5" />
                      )}
                    </span>
                    <div className="min-w-0">
                      <div className="text-sm font-medium text-slate-100 truncate">{item.title}</div>
                      <div className="text-xs text-slate-200 truncate">{item.subtitle}</div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-slate-900 border border-slate-700 text-slate-200">
                      {item.category}
                    </span>
                    <ArrowRight className="w-3.5 h-3.5 text-slate-100 group-hover:text-sky-400 transition" />
                  </div>
                </button>
              ))}
              {filtered.length === 0 && (
                <div className="py-8 text-center text-sm text-slate-100">
                  No matches found. Try switching to <span className="text-emerald-400 font-mono">kronvex&gt; CLI</span>.
                </div>
              )}
            </div>
          </div>
        ) : (
          <div className="p-4 font-mono text-xs">
            <div className="h-64 overflow-y-auto space-y-1.5 pr-1 mb-3">
              {history.map((line, i) => (
                <div
                  key={i}
                  className={
                    line.type === 'input'
                      ? 'text-sky-400 font-semibold'
                      : line.type === 'accent'
                      ? 'text-emerald-400 font-semibold'
                      : 'text-slate-100 whitespace-pre-wrap'
                  }
                >
                  {line.text}
                </div>
              ))}
              <div ref={termEndRef} />
            </div>
            <form
              onSubmit={(e) => {
                e.preventDefault();
                runCommand(cmdInput);
              }}
              className="flex items-center gap-2 px-3 py-2 rounded-lg bg-[#050914] border border-slate-700/80"
            >
              <span className="text-emerald-400 font-bold select-none">kronvex&gt;</span>
              <input
                ref={inputRef}
                value={cmdInput}
                onChange={(e) => setCmdInput(e.target.value)}
                placeholder="help | hardware | models | apps | skills | open models"
                className="w-full bg-transparent text-slate-100 placeholder-slate-400 focus:outline-none"
              />
            </form>
          </div>
        )}
      </div>
    </div>
  );
}

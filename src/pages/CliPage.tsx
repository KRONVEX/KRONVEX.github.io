import { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  ArrowRight,
  BookOpen,
  Check,
  Copy,
  Cpu,
  Download,
  ExternalLink,
  Layers,
  ShieldCheck,
  Sparkles,
  Terminal,
  Zap,
} from 'lucide-react';
import { ScrollReveal, ScrollScrubText } from '../components/KineticScrollText';
import mcpMeta from '../data/mcp-meta.json';

type InstallTab = 'windows' | 'unix' | 'direct' | 'agent';
type DemoTab = 'repl' | 'doctor' | 'search' | 'models' | 'bibtex' | 'mcp';

const INSTALL_SNIPPETS: Record<InstallTab, { label: string; shell: string; cmd: string; note: string }> = {
  windows: {
    label: 'Windows (PowerShell)',
    shell: 'PowerShell',
    cmd: 'irm https://kronvex.org/cli/install.ps1 | iex',
    note: 'Installs `kronvex` and `kvx` into %USERPROFILE%\\.kronvex\\bin, updates User PATH, and prints SHA-256.',
  },
  unix: {
    label: 'macOS / Linux',
    shell: 'Bash / Zsh',
    cmd: 'curl -fsSL https://kronvex.org/cli/install.sh | sh',
    note: 'Installs executable `kronvex` and `kvx` symlinks into ~/.kronvex/bin. Requires Node.js >= 18.',
  },
  direct: {
    label: 'Zero-Install (Node)',
    shell: 'Any OS',
    cmd: 'curl -fsSLO https://kronvex.org/cli/kronvex.mjs && node kronvex.mjs doctor',
    note: 'Single zero-dependency ES module. Runs offline from ~/.kronvex/cache after first sync.',
  },
  agent: {
    label: 'AI Agent Skill',
    shell: 'SKILL.md',
    cmd: 'curl -fsSLO https://kronvex.org/cli/SKILL.md',
    note: 'Drop into .gemini/skills/, .claude/skills/, or .cursor/rules/ so agents operate kronvex with --json.',
  },
};

const TERMINAL_DEMOS: Record<DemoTab, { label: string; command: string; output: string }> = {
  repl: {
    label: 'Interactive REPL',
    command: 'kronvex',
    output: ` ◥◣◢████████◣◢◤    ██░░░██░ ██████░  ░█████░  ██░░░░██░ ██░░░░██░ ███████░ ██░░░██░
 ██▀        ▀██    ██░░██░░ ██░░░██░ ██░░░██░ ███░░░██░ ██░░░░██░ ██░░░░░░ ░██░██░░
██  ◈█    █◈  ██   █████░░░ ██████░░ ██░░░██░ ████░░██░ ██░░░░██░ █████░░░ ░░███░░░
██     ▼▼     ██   ██░░██░░ ██░░██░░ ██░░░██░ ██░██░██░ ░██░░██░░ ██░░░░░░ ░░███░░░
██    ◢◆◆◣    ██   ██░░░██░ ██░░░██░ ██░░░██░ ██░░████░ ░░████░░░ ██░░░░░░ ░██░██░░
 ◥██▄      ▄██◤    ██░░░██░ ██░░░██░ ░█████░░ ██░░░███░ ░░░██░░░░ ███████░ ██░░░██░
   ◥████████◤      ░░░░░░░░ ░░░░░░░░  ░░░░░░  ░░░░░░░░░ ░░░░░░░░░ ░░░░░░░░ ░░░░░░░░

  ◈ KRONVEX · Cross-Platform Apps · Market Intelligence · Mission-Critical AI

  Tips for getting started:
  1. Run doctor, search "webgpu", or models recommend to inspect KRONVEX live.
  2. Pass --json or toggle /json for deterministic AI-agent output.
  3. Type /help for all commands · /crest for full Cyber-Owl Hex emblem · /theme for palettes.

  ╭──────────────────────────────────────────────────────────────────────────╮
  │ ● Connected to kronvex.org & mcp.kronvex.org/mcp · Read-Only · 0 Deps    │
  ╰──────────────────────────────────────────────────────────────────────────╯
  ~/projects (kronvex v1.3.0)  ·  mcp.kronvex.org/mcp (read-only)  ·  theme:kronvex
  ❯ `,
  },
  doctor: {
    label: 'kronvex doctor',
    command: 'kronvex doctor',
    output: `  ╭──────────────────────────────────────────────────────────────────────────╮
  │ ✦ Diagnostics  Probed kronvex.org & mcp.kronvex.org/mcp (OPERATIONAL)    │
  ╰──────────────────────────────────────────────────────────────────────────╯

    Platform API           ONLINE (64ms · synced 2026-11-27)
    Remote MCP Gateway     ONLINE (48ms · MCP 2026-07-28)
    MCP Code-Mode Tools    kronvex_search, kronvex_query
    Host OS / Runtime      win32 10.0 (x64) · Node v24.15.0
    Host Hardware          16 CPU cores · 32.0 GB RAM`,
  },
  search: {
    label: 'search --json',
    command: 'kronvex search "webgpu" --json',
    output: `{
  "query": "webgpu",
  "category": "all",
  "totalMatches": 3,
  "latencyMs": 42,
  "source": "remote-mcp",
  "results": [
    {
      "type": "model",
      "id": "kronvex-nano-135m",
      "title": "Kronvex Nano-135M (Browser Ready)",
      "url": "https://kronvex.org/models"
    }
  ]
}`,
  },
  models: {
    label: 'models recommend',
    command: 'kronvex models recommend',
    output: `✓ Local AI Hardware Fit for 32.0 GB RAM · 16 CPU Threads
┌────────────────────────────────────┬────────┬──────────┬─────────┬───────────┐
│ MODEL                              │ PARAMS │ FORMAT   │ MIN RAM │ FIT       │
├────────────────────────────────────┼────────┼──────────┼─────────┼───────────┤
│ Kronvex Nano-135M (Browser Ready)  │ 135M   │ ONNX-Q4  │ 4 GB    │ OPTIMAL   │
│ Kronvex Pulse-360M (Browser Ready) │ 360M   │ ONNX-Q4  │ 4 GB    │ OPTIMAL   │
│ Qwen2.5-Coder-7B-Instruct          │ 7B     │ GGUF-Q4  │ 8 GB    │ OPTIMAL   │
└────────────────────────────────────┴────────┴──────────┴─────────┴───────────┘`,
  },
  bibtex: {
    label: 'research bibtex',
    command: 'kronvex research bibtex 1',
    output: `@article{kronvex_2025_alphaevolveaco,
  title     = {AlphaEvolve: A coding agent for scientific and algorithmic discovery},
  author    = {Google DeepMind},
  year      = {2025},
  journal   = {arXiv preprint arXiv:2506.13131},
  url       = {https://arxiv.org/abs/2506.13131}
}`,
  },
  mcp: {
    label: 'mcp config',
    command: 'kronvex mcp config antigravity',
    output: `● MCP Configuration for antigravity (http)

{
  "mcpServers": {
    "kronvex": {
      "type": "http",
      "url": "https://mcp.kronvex.org/mcp"
    }
  }
}`,
  },
};

const COMMAND_GROUPS = [
  { cmd: 'kronvex', mode: 'REPL', desc: 'Launch branded interactive REPL with persistent history, tab autocomplete & /json toggle' },
  { cmd: 'kronvex doctor', mode: 'Both', desc: 'Probe live latency of kronvex.org & mcp.kronvex.org/mcp + host CPU/RAM diagnostics' },
  { cmd: 'kronvex search "<q>"', mode: 'Both', desc: 'Live fuzzy search via Remote Code-Mode MCP (auto-falls back to local offline cache)' },
  { cmd: 'kronvex apps [list|info <id>]', mode: 'Both', desc: 'Inspect signed Windows (.EXE/.MSI) & Android (.APK) software artifacts' },
  { cmd: 'kronvex models [list|recommend]', mode: 'Both', desc: 'Inspect local WebGPU/ONNX/GGUF AI models & match against your local RAM/CPU' },
  { cmd: 'kronvex skills [list|inspect|install <id>]', mode: 'Both', desc: 'Browse and install production SKILL.md agent bundles directly into your workspace' },
  { cmd: 'kronvex research [list|search|bibtex <id>]', mode: 'Both', desc: 'Query Top 21 frontier arXiv papers and pipe verified BibTeX citations to stdout' },
  { cmd: 'kronvex top21 [github|hf|weekly]', mode: 'Both', desc: 'View live 6-hour synced GitHub & Hugging Face Top 21 leaderboards in terminal tables' },
  { cmd: 'kronvex mcp [discover|tools|call|config]', mode: 'Both', desc: 'Inspect mcp.kronvex.org/mcp and print ready-to-paste configs for 8 coding agents' },
  { cmd: 'kronvex services / work', mode: 'Both', desc: 'Query KRONVEX engineering services and verified production case studies' },
  { cmd: 'kronvex skill-md', mode: 'Agent', desc: 'Print canonical SKILL.md manifest for autonomous agent discovery' },
  { cmd: 'kronvex crest / theme [name]', mode: 'TUI', desc: 'Render the full 30x28 TrueColor KRONVEX Owl emblem or switch Owl brand themes (kronvex, medallion, ruby, sentinel)' },
  { cmd: 'kronvex update', mode: 'Local', desc: 'Self-update kronvex.mjs directly from kronvex.org/cli/kronvex.mjs with SHA-256 verification' },
  { cmd: 'kronvex cache [status|clear]', mode: 'Local', desc: 'Inspect or purge the 10-minute ~/.kronvex/cache offline JSON snapshots' },
];

export function CliPage() {
  const [installTab, setInstallTab] = useState<InstallTab>('windows');
  const [demoTab, setDemoTab] = useState<DemoTab>('repl');
  const [copiedCmd, setCopiedCmd] = useState(false);
  const [copiedSha, setCopiedSha] = useState(false);

  const activeInstall = INSTALL_SNIPPETS[installTab];
  const activeDemo = TERMINAL_DEMOS[demoTab];

  const copyText = (text: string, which: 'cmd' | 'sha') => {
    navigator.clipboard?.writeText(text).catch(() => {});
    if (which === 'cmd') {
      setCopiedCmd(true);
      window.setTimeout(() => setCopiedCmd(false), 1800);
    } else {
      setCopiedSha(true);
      window.setTimeout(() => setCopiedSha(false), 1800);
    }
  };

  return (
    <div className="max-w-[1560px] mx-auto px-4 sm:px-6 lg:px-10 xl:px-12 py-14 space-y-20">
      {/* Hero */}
      <section className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-end">
        <div className="lg:col-span-8 space-y-5">
          <div className="inline-flex items-center gap-2 text-xs font-mono font-bold tracking-wider text-emerald-700 dark:text-emerald-300 uppercase">
            <Terminal className="w-4 h-4" /> KRONVEX OFFICIAL TERMINAL CLI · KRONVEX / KVX v{mcpMeta.version}
          </div>
          <h1 className="font-display font-bold text-3xl sm:text-5xl text-black dark:text-white leading-[1.08] tracking-tight">
            One Terminal Interface for{' '}
            <span className="font-editorial italic font-normal text-sky-700 dark:text-emerald-300">
              Humans &amp; AI Agents.
            </span>
          </h1>
          <p className="text-base sm:text-lg text-slate-900 dark:text-slate-100 leading-relaxed max-w-3xl">
            Operate the entire KRONVEX platform straight from your shell: branded stateful REPL with tab completion,
            deterministic <code>--json</code> and <code>--output-format stream-json</code> agent protocols, live{' '}
            <strong>mcp.kronvex.org/mcp</strong> client, local RAM-aware AI model recommender, 1-command{' '}
            <code>SKILL.md</code> installer, and BibTeX exporter—all in <strong>0 dependencies</strong>.
          </p>
          <div className="flex flex-wrap items-center gap-3 pt-1">
            <a
              href="/cli/kronvex.mjs"
              download="kronvex.mjs"
              className="px-6 py-3 rounded-full bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-sm inline-flex items-center gap-2 shadow-lg shadow-emerald-500/20 transition"
            >
              <Download className="w-4 h-4" /> Download kronvex.mjs (0 deps)
            </a>
            <a
              href="/cli/SKILL.md"
              target="_blank"
              rel="noopener noreferrer"
              className="px-5 py-3 rounded-full border border-slate-300 dark:border-white/20 hover:border-sky-500 dark:hover:border-emerald-400 text-sm font-bold text-black dark:text-white inline-flex items-center gap-2 transition"
            >
              <BookOpen className="w-4 h-4" /> Agent SKILL.md <ExternalLink className="w-3.5 h-3.5" />
            </a>
          </div>
        </div>

        {/* Metrics Strip */}
        <div className="lg:col-span-4 grid grid-cols-2 gap-4 border-t lg:border-t-0 lg:border-s border-slate-300/70 dark:border-white/15 pt-6 lg:pt-0 lg:ps-8">
          <div>
            <div className="font-brand text-2xl sm:text-3xl font-bold text-emerald-700 dark:text-emerald-300">0 Deps</div>
            <div className="font-mono text-[11px] text-slate-700 dark:text-slate-300 mt-1">
              Pure Node.js &gt;=18 · ~55ms Boot
            </div>
          </div>
          <div>
            <div className="font-brand text-2xl sm:text-3xl font-bold text-black dark:text-white">3 Modes</div>
            <div className="font-mono text-[11px] text-slate-700 dark:text-slate-300 mt-1">
              REPL · --json · stream-json
            </div>
          </div>
          <div>
            <div className="font-brand text-2xl sm:text-3xl font-bold text-black dark:text-white">Live MCP</div>
            <div className="font-mono text-[11px] text-slate-700 dark:text-slate-300 mt-1">
              Native mcp.kronvex.org Client
            </div>
          </div>
          <div>
            <div className="font-brand text-2xl sm:text-3xl font-bold text-black dark:text-white">12 Groups</div>
            <div className="font-mono text-[11px] text-slate-700 dark:text-slate-300 mt-1">
              Subprocess E2E Verified
            </div>
          </div>
        </div>
      </section>

      {/* 1-Line Installers */}
      <ScrollReveal>
        <section className="p-6 sm:p-8 rounded-3xl border border-slate-300/80 dark:border-white/15 bg-white/80 dark:bg-white/[0.03] backdrop-blur-sm space-y-6">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-200/80 dark:border-white/10 pb-5">
            <div>
              <div className="font-mono text-xs font-bold uppercase tracking-wider text-sky-700 dark:text-sky-300 flex items-center gap-1.5">
                <Zap className="w-3.5 h-3.5" /> 1-Command Installation
              </div>
              <h2 className="font-display font-bold text-2xl text-black dark:text-white mt-1">
                Install `kronvex` &amp; `kvx` Globally
              </h2>
            </div>

            <div className="flex flex-wrap gap-2">
              {(Object.keys(INSTALL_SNIPPETS) as InstallTab[]).map((tab) => (
                <button
                  key={tab}
                  type="button"
                  onClick={() => setInstallTab(tab)}
                  className={`px-3.5 py-1.5 rounded-full text-xs font-mono font-bold border transition ${
                    installTab === tab
                      ? 'bg-emerald-500 text-slate-950 border-emerald-500'
                      : 'border-slate-300 dark:border-white/20 text-slate-800 dark:text-slate-200 hover:border-emerald-500'
                  }`}
                >
                  {INSTALL_SNIPPETS[tab].label}
                </button>
              ))}
            </div>
          </div>

          <div className="rounded-2xl border border-slate-300/80 dark:border-white/15 bg-slate-950 text-slate-100 overflow-hidden">
            <div className="flex items-center justify-between px-4 py-2.5 border-b border-white/10 text-xs font-mono text-slate-300">
              <span>{activeInstall.shell}</span>
              <button
                type="button"
                onClick={() => copyText(activeInstall.cmd, 'cmd')}
                className="inline-flex items-center gap-1.5 px-3 py-1 rounded-md bg-white/10 hover:bg-white/20 text-white transition"
              >
                {copiedCmd ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                {copiedCmd ? 'Copied' : 'Copy Command'}
              </button>
            </div>
            <pre className="p-4 text-xs sm:text-sm font-mono overflow-x-auto text-emerald-300">
              <code>$ {activeInstall.cmd}</code>
            </pre>
          </div>

          <p className="text-xs sm:text-sm text-slate-700 dark:text-slate-300">{activeInstall.note}</p>

          {mcpMeta.cliSha256 && (
            <div className="flex flex-wrap items-center justify-between gap-3 px-4 py-3 rounded-xl bg-slate-100/80 dark:bg-black/30 border border-slate-200 dark:border-white/10 text-xs font-mono">
              <div className="flex items-center gap-2 text-slate-800 dark:text-slate-200 overflow-x-auto">
                <ShieldCheck className="w-4 h-4 text-emerald-500 shrink-0" />
                <span className="font-bold">kronvex.mjs SHA-256:</span>
                <span className="text-slate-600 dark:text-slate-400">{mcpMeta.cliSha256}</span>
              </div>
              <button
                type="button"
                onClick={() => copyText(mcpMeta.cliSha256 ?? '', 'sha')}
                className="inline-flex items-center gap-1 text-sky-700 dark:text-sky-300 hover:underline shrink-0"
              >
                {copiedSha ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                {copiedSha ? 'Copied' : 'Copy SHA-256'}
              </button>
            </div>
          )}
        </section>
      </ScrollReveal>

      {/* Interactive Terminal Preview */}
      <ScrollReveal>
        <section className="p-6 sm:p-8 rounded-3xl border border-slate-300/80 dark:border-white/15 bg-white/80 dark:bg-white/[0.03] backdrop-blur-sm space-y-6">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <div className="font-mono text-xs font-bold uppercase tracking-wider text-emerald-700 dark:text-emerald-300 flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5" /> Live Output Preview
              </div>
              <h2 className="font-display font-bold text-2xl text-black dark:text-white mt-1">
                ReplSkin UI &amp; Agent JSON Protocols
              </h2>
            </div>

            <div className="flex flex-wrap gap-2">
              {(Object.keys(TERMINAL_DEMOS) as DemoTab[]).map((tab) => (
                <button
                  key={tab}
                  type="button"
                  onClick={() => setDemoTab(tab)}
                  className={`px-3 py-1.5 rounded-full text-xs font-mono font-bold border transition ${
                    demoTab === tab
                      ? 'bg-slate-950 dark:bg-white text-white dark:text-slate-950 border-slate-950 dark:border-white'
                      : 'border-slate-300 dark:border-white/20 text-slate-800 dark:text-slate-200 hover:border-sky-500'
                  }`}
                >
                  {TERMINAL_DEMOS[tab].label}
                </button>
              ))}
            </div>
          </div>

          <div className="rounded-2xl border border-slate-300/80 dark:border-white/15 bg-[#070B14] text-slate-100 overflow-hidden shadow-2xl">
            <div className="flex items-center justify-between px-4 py-2.5 border-b border-white/10 bg-white/[0.03]">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-rose-500/80" />
                <span className="w-2.5 h-2.5 rounded-full bg-amber-400/80" />
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-400/80" />
                <span className="ms-2 font-mono text-xs text-slate-400">kronvex — {activeDemo.command}</span>
              </div>
              <span className="font-mono text-[11px] text-emerald-400">UTF-8 · ANSI · Zero Deps</span>
            </div>
            <div className="p-5 overflow-x-auto">
              <pre
                className="text-xs sm:text-[13px] font-mono leading-relaxed bg-clip-text text-transparent"
                style={{
                  backgroundImage:
                    'linear-gradient(90deg, #00D4FF 0%, #22E53A 34%, #FFE024 68%, #FF2E4C 100%)',
                }}
              >
                <code>{`$ ${activeDemo.command}\n\n${activeDemo.output}`}</code>
              </pre>
            </div>
          </div>
        </section>
      </ScrollReveal>

      {/* Command Reference Table */}
      <ScrollReveal>
        <section className="space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
            <div>
              <div className="font-mono text-xs font-bold uppercase tracking-wider text-sky-700 dark:text-sky-300 flex items-center gap-1.5">
                <Cpu className="w-3.5 h-3.5" /> Complete Command Surface
              </div>
              <h2 className="font-display font-bold text-2xl sm:text-3xl text-black dark:text-white mt-1">
                12 Self-Describing Command Groups
              </h2>
            </div>
            <span className="font-mono text-xs text-slate-600 dark:text-slate-400">
              Global flags: <code>--json</code> · <code>--output-format stream-json</code> · <code>--no-cache</code>
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {COMMAND_GROUPS.map((item) => (
              <div
                key={item.cmd}
                className="p-5 rounded-2xl border border-slate-300/80 dark:border-white/15 bg-white/80 dark:bg-white/[0.03] flex flex-col justify-between gap-2"
              >
                <div className="flex items-center justify-between gap-3">
                  <code className="font-mono text-xs sm:text-sm font-bold text-emerald-700 dark:text-emerald-300">
                    {item.cmd}
                  </code>
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-mono font-bold bg-sky-500/15 text-sky-800 dark:text-sky-300 border border-sky-500/30 shrink-0">
                    {item.mode}
                  </span>
                </div>
                <p className="text-xs sm:text-sm text-slate-700 dark:text-slate-300 leading-relaxed">{item.desc}</p>
              </div>
            ))}
          </div>
        </section>
      </ScrollReveal>

      {/* Bottom CTA */}
      <section className="border-t border-slate-300/70 dark:border-white/15 pt-12 flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="space-y-2 max-w-2xl">
          <ScrollScrubText
            as="h2"
            text="Pair the KRONVEX CLI with our live Code-Mode MCP Gateway."
            className="font-display font-bold text-2xl sm:text-3xl text-black dark:text-white"
          />
          <p className="text-sm text-slate-800 dark:text-slate-200">
            Run <code>kronvex mcp config antigravity</code> to wire <code>https://mcp.kronvex.org/mcp</code> in 1
            second.
          </p>
        </div>
        <div className="flex flex-wrap gap-3">
          <Link
            to="/mcp"
            className="px-6 py-3 rounded-full bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-sm inline-flex items-center gap-2 transition"
          >
            Open MCP Hub <ArrowRight className="w-4 h-4 rtl:rotate-180" />
          </Link>
          <Link
            to="/work"
            className="px-5 py-3 rounded-full border border-slate-300 dark:border-white/20 text-black dark:text-white font-bold text-sm inline-flex items-center gap-2 hover:border-sky-500 transition"
          >
            <Layers className="w-4 h-4" /> View Case Studies
          </Link>
        </div>
      </section>
    </div>
  );
}

import { useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, CheckCircle2, ExternalLink, Layers, ShieldCheck, Sparkles } from 'lucide-react';
import { ScrollReveal, ScrollScrubText } from '../components/KineticScrollText';
import { KRONVEX_MODELS, KRONVEX_SKILLS } from '../data/catalog';
import liveGithub from '../data/live-github.json';

type CaseCategory = 'All' | 'Systems' | 'AI Core' | 'Market Intel';

interface CaseStudy {
  id: string;
  code: string;
  category: Exclude<CaseCategory, 'All'>;
  title: string;
  subtitle: string;
  challenge: string;
  architecture: string;
  metrics: { label: string; value: string }[];
  stack: string[];
  liveRoute: string;
  liveLabel: string;
}

const SYNC_DATE = liveGithub.syncedAt.slice(0, 10);

const CASE_STUDIES: CaseStudy[] = [
  {
    id: 'kronvex-platform',
    code: 'CASE 01',
    category: 'Systems',
    title: 'KRONVEX Global Edge Platform (kronvex.org)',
    subtitle: 'Zero-Server Engineering Portal · 100/100 Lighthouse & 98/100 Technical SEO/AEO',
    challenge:
      'Build a multi-module technical showcase, software distribution hub, and research portal operating at $0 recurring server cost with zero third-party cookies, hardened edge security, and instant global load times.',
    architecture:
      'React 19.3 + TypeScript + Vite 6 code-split architecture with route-level lazy loading, 22 static HTTP-200 prerendered route entrypoints on GitHub Pages behind Cloudflare Full (Strict) TLS + HSTS Preload + CSP + Brotli, and 60fps canvas particle physics.',
    metrics: [
      { label: 'RankPulse SEO · GEO Audit', value: '100 · 97 / 100' },
      { label: 'SEOmator & AEO Lint Score', value: '98 / 100 (A)' },
      { label: 'Static HTTP-200 Routes', value: '22 Routes' },
      { label: 'npm Audit & Monthly Server Cost', value: '0 Vulns · $0/mo' },
    ],
    stack: ['React 19', 'TypeScript', 'Vite 6', 'Cloudflare HSTS/CSP', 'GitHub Pages', '6-Lang RTL'],
    liveRoute: '/',
    liveLabel: 'Explore Live Platform',
  },
  {
    id: 'local-webgpu-studio',
    code: 'CASE 02',
    category: 'AI Core',
    title: 'In-Browser Local WebGPU & WASM AI Chat Studio',
    subtitle: 'Privacy-Preserving Neural Inference Running 100% on Visitor Hardware',
    challenge:
      'Eliminate cloud API costs, rate limits, and privacy risks while letting developers inspect hardware readiness and test open-weight AI models directly inside any modern browser.',
    architecture:
      'Client-side hardware capability profiler (OS, CPU threads, RAM heuristic, WebGPU adapter detection) paired with direct Hugging Face ONNX weight streaming via @huggingface/transformers and automatic WASM fallback.',
    metrics: [
      { label: 'Data Sent to External Servers', value: '0 Bytes' },
      { label: 'Tracked Open-Weight AI Models', value: `${KRONVEX_MODELS.length} Verified` },
      { label: 'Inference Execution', value: '100% Local' },
    ],
    stack: ['WebGPU', 'WebAssembly', 'ONNX', 'Hugging Face Transformers', 'TypeScript'],
    liveRoute: '/models?tab=chat',
    liveLabel: 'Launch Local AI Studio',
  },
  {
    id: 'top21-research-radar',
    code: 'CASE 03',
    category: 'Market Intel',
    title: 'Automated Top 21 Global Research & Open-Source Radar',
    subtitle: 'Zero-Backend Intelligence Pipeline Synced Every 6 Hours',
    challenge:
      'Engineers waste hours tracking fragmented breakthroughs across GitHub, Hugging Face, and arXiv labs (Google DeepMind, OpenAI, Anthropic, NVIDIA, DeepSeek, Microsoft, Samsung AI, MIT).',
    architecture:
      'Scheduled GitHub Actions Node.js pipeline aggregating GitHub REST, Hugging Face Hub, and arXiv feeds every 6 hours into deterministic static JSON snapshots with 1-click BibTeX & PDF export.',
    metrics: [
      { label: 'Curated Frontier Papers', value: '21 Verified' },
      { label: 'Automated Refresh Cadence', value: `Every 6h (${SYNC_DATE})` },
      { label: 'Database Infrastructure Needed', value: 'Zero ($0/mo)' },
    ],
    stack: ['Node.js CI', 'GitHub REST API', 'Hugging Face API', 'arXiv API', 'Static JSON'],
    liveRoute: '/research',
    liveLabel: 'Inspect Top 21 Radar',
  },
  {
    id: 'agent-skills-bundler',
    code: 'CASE 04',
    category: 'AI Core',
    title: 'Modular AI Agent Skills Marketplace & .ZIP Composer',
    subtitle: 'Portable SKILL.md Workflows for Antigravity, Claude Code, Cursor & Gemini CLI',
    challenge:
      'Coding agents perform best with deterministic, reusable instruction bundles, yet teams struggle to inspect, select, and package multi-skill directories cleanly without CLI friction.',
    architecture:
      'Interactive Markdown inspector coupled with an on-demand lazy-loaded client-side JSZip packager that compiles custom multi-skill .ZIP archives directly in browser memory.',
    metrics: [
      { label: 'Curated Production Skills', value: `${KRONVEX_SKILLS.length} Verified` },
      { label: 'Initial Bundle Impact', value: '0 KB (Lazy)' },
      { label: 'Compatible Agent Runtimes', value: '4+ Runtimes' },
    ],
    stack: ['SKILL.md Standard', 'JSZip', 'React Lazy', 'TypeScript'],
    liveRoute: '/skills',
    liveLabel: 'Open Skills Marketplace',
  },
  {
    id: 'kronvex-mcp-gateway',
    code: 'CASE 05',
    category: 'AI Core',
    title: 'Official KRONVEX Code-Mode MCP Gateway (mcp.kronvex.org)',
    subtitle: 'Dual-Transport AI Agent Server · 98.4% Token Reduction & 100/100 Security Audit',
    challenge:
      'Traditional MCP servers dump 50+ bloated JSON tool schemas (40,000+ tokens) into every AI agent prompt, burning context windows and raising latency while requiring costly always-on backends.',
    architecture:
      'Built on NexusMCP Code Mode: collapses apps, local AI models, SKILL.md library, and Top 21 research into 2 read-only tools (~650 tokens) over stateless Streamable HTTP (Cloudflare Worker at mcp.kronvex.org/mcp) plus a 0-dependency local stdio server (kronvex-mcp.mjs) backed by static edge JSON snapshots.',
    metrics: [
      { label: 'Context Token Reduction', value: '98.4% (~650 tok)' },
      { label: 'NexusMCP Security Audit', value: '100 / 100 (0 P0)' },
      { label: 'Transports & Monthly Cost', value: 'HTTP + stdio · $0' },
    ],
    stack: ['MCP 2026-07-28', 'Code Mode', 'Cloudflare Workers', 'JSON-RPC 2.0', 'Node.js 0-Deps'],
    liveRoute: '/mcp',
    liveLabel: 'Open MCP Hub & Playground',
  },
  {
    id: 'kronvex-official-cli',
    code: 'CASE 06',
    category: 'Systems',
    title: 'KRONVEX Official Terminal CLI (kronvex / kvx)',
    subtitle: 'Zero-Dependency Agent-Native CLI · Branded REPL, --json, stream-json & Live MCP Client',
    challenge:
      'Developers and autonomous AI coding agents need a fast, scriptable, cross-platform terminal interface to query catalogs, match local AI models to host RAM, install SKILL.md modules, and export BibTeX without browser friction.',
    architecture:
      'Pure Node.js >=18 single-file CLI with zero external dependencies, unified ANSI ReplSkin interactive shell, deterministic --json and NDJSON stream-json protocols, native https://mcp.kronvex.org/mcp client with local disk cache fallback, and 1-line Windows/macOS/Linux installers.',
    metrics: [
      { label: 'Capabilities & Zero Deps', value: '33 Tools · 0 Deps' },
      { label: 'Output Protocols & Arcade', value: 'REPL · JSON · 3 Games' },
      { label: 'Subprocess E2E Verification', value: '100% Passing' },
    ],
    stack: ['Node.js ESM', 'ReplSkin ANSI', 'NDJSON Stream', 'MCP Client', 'SKILL.md'],
    liveRoute: '/cli',
    liveLabel: 'Install KRONVEX CLI',
  },
];

export function WorkPage() {
  const [filter, setFilter] = useState<CaseCategory>('All');
  const visible = filter === 'All' ? CASE_STUDIES : CASE_STUDIES.filter((c) => c.category === filter);

  return (
    <div className="max-w-[1560px] mx-auto px-4 sm:px-6 lg:px-10 xl:px-12 py-14 space-y-20">
      {/* Hero */}
      <section className="space-y-6 max-w-4xl">
        <div className="inline-flex items-center gap-2 text-xs font-mono font-bold tracking-wider text-sky-700 dark:text-sky-300 uppercase">
          <ShieldCheck className="w-4 h-4" /> KRONVEX CASE STUDIES · VERIFIED ENGINEERING PROOF
        </div>
        <h1 className="font-display font-bold text-3xl sm:text-5xl text-black dark:text-white leading-[1.08] tracking-tight">
          Real Systems.{' '}
          <span className="font-editorial italic font-normal text-emerald-700 dark:text-emerald-300">
            Measured Outcomes.
          </span>
        </h1>
        <p className="text-base sm:text-lg text-slate-900 dark:text-slate-100 leading-relaxed max-w-3xl">
          Every case study below is a live, verifiable system engineered by KRONVEX that you can open, test, and audit
          right now—backed by reproducible architecture and real telemetry instead of marketing claims.
        </p>

        {/* Filter Bar */}
        <div className="flex flex-wrap items-center gap-2 pt-2">
          {(['All', 'Systems', 'AI Core', 'Market Intel'] as CaseCategory[]).map((cat) => (
            <button
              key={cat}
              type="button"
              onClick={() => setFilter(cat)}
              className={`px-4 py-1.5 rounded-full text-xs font-mono font-bold border transition ${
                filter === cat
                  ? 'bg-sky-500 text-slate-950 border-sky-500'
                  : 'border-slate-300 dark:border-white/20 text-slate-900 dark:text-slate-100 hover:border-sky-500'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </section>

      {/* Case Studies List */}
      <section className="space-y-10">
        {visible.map((cs, idx) => (
          <ScrollReveal key={cs.id} delayMs={idx * 70}>
            <article className="p-7 sm:p-9 rounded-3xl border border-slate-300/80 dark:border-white/15 bg-white/80 dark:bg-white/[0.03] backdrop-blur-sm space-y-7">
              <div className="flex flex-wrap items-start justify-between gap-4 border-b border-slate-200/80 dark:border-white/10 pb-6">
                <div className="space-y-2 max-w-3xl">
                  <div className="flex items-center gap-3 font-mono text-xs">
                    <span className="font-brand font-bold text-emerald-600 dark:text-emerald-400">{cs.code}</span>
                    <span className="px-2.5 py-0.5 rounded-full bg-sky-500/15 text-sky-800 dark:text-sky-300 border border-sky-500/30">
                      {cs.category}
                    </span>
                  </div>
                  <h2 className="font-display font-bold text-2xl sm:text-3xl text-black dark:text-white">
                    {cs.title}
                  </h2>
                  <p className="text-sm sm:text-base font-medium text-slate-700 dark:text-slate-300">{cs.subtitle}</p>
                </div>
                <Link
                  to={cs.liveRoute}
                  className="px-5 py-2.5 rounded-full bg-slate-950 dark:bg-emerald-400 text-white dark:text-slate-950 font-mono font-bold text-xs inline-flex items-center gap-2 hover:opacity-90 transition shrink-0"
                >
                  {cs.liveLabel} <ExternalLink className="w-3.5 h-3.5" />
                </Link>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                <div className="lg:col-span-7 space-y-5">
                  <div>
                    <div className="font-mono text-[11px] font-bold uppercase tracking-wider text-amber-700 dark:text-amber-300 mb-1.5">
                      01 // Engineering Challenge
                    </div>
                    <p className="text-sm sm:text-base text-slate-800 dark:text-slate-200 leading-relaxed">
                      {cs.challenge}
                    </p>
                  </div>
                  <div>
                    <div className="font-mono text-[11px] font-bold uppercase tracking-wider text-sky-700 dark:text-sky-300 mb-1.5">
                      02 // Solution Architecture
                    </div>
                    <p className="text-sm sm:text-base text-slate-800 dark:text-slate-200 leading-relaxed">
                      {cs.architecture}
                    </p>
                  </div>
                </div>

                <div className="lg:col-span-5 space-y-5 lg:border-s border-slate-200/80 dark:border-white/10 lg:ps-8">
                  <div className="font-mono text-[11px] font-bold uppercase tracking-wider text-emerald-700 dark:text-emerald-300">
                    03 // Verified Outcomes
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-3 lg:grid-cols-1 gap-3.5">
                    {cs.metrics.map((m) => (
                      <div
                        key={m.label}
                        className="p-3.5 rounded-xl border border-slate-200/80 dark:border-white/10 bg-slate-50/70 dark:bg-black/30 flex items-center justify-between gap-3"
                      >
                        <span className="text-xs text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                          {m.label}
                        </span>
                        <span className="font-brand text-sm font-bold text-black dark:text-white shrink-0">
                          {m.value}
                        </span>
                      </div>
                    ))}
                  </div>
                  <div className="flex flex-wrap gap-1.5 pt-1">
                    {cs.stack.map((tech) => (
                      <span
                        key={tech}
                        className="px-2.5 py-1 rounded-md text-[11px] font-mono bg-slate-100 dark:bg-white/5 border border-slate-300/70 dark:border-white/10 text-slate-900 dark:text-slate-100"
                      >
                        {tech}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            </article>
          </ScrollReveal>
        ))}
      </section>

      {/* Bottom CTA */}
      <section className="border-t border-slate-300/70 dark:border-white/15 pt-14 flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="space-y-2 max-w-2xl">
          <ScrollScrubText
            as="h2"
            text="Ready to build a system engineered to these same standards?"
            className="font-display font-bold text-2xl sm:text-3xl text-black dark:text-white"
          />
          <p className="text-sm text-slate-800 dark:text-slate-200">
            Explore our engagement models or scope your architecture sprint directly with KRONVEX.
          </p>
        </div>
        <div className="flex flex-wrap gap-3">
          <Link
            to="/services"
            className="px-6 py-3 rounded-full bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-sm inline-flex items-center gap-2 transition"
          >
            <Sparkles className="w-4 h-4" /> View Services
          </Link>
          <Link
            to="/enterprise#scope-builder"
            className="px-5 py-3 rounded-full border border-slate-300 dark:border-white/20 text-black dark:text-white font-bold text-sm inline-flex items-center gap-2 hover:border-sky-500 transition"
          >
            <Layers className="w-4 h-4" /> Scope a Project <ArrowRight className="w-4 h-4 rtl:rotate-180" />
          </Link>
        </div>
      </section>
    </div>
  );
}

export type { CaseStudy };

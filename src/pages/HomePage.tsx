import { Link } from 'react-router-dom';
import {
  ArrowRight,
  Cpu,
  Download,
  Github,
  Layers,
  MessageSquare,
  Network,
  ShieldCheck,
  Sparkles,
  Terminal,
  Zap,
} from 'lucide-react';
import { NOVALIS_APPS, NOVALIS_MODELS, NOVALIS_PILLARS, NOVALIS_SKILLS, ORG_META } from '../data/catalog';
import liveGithub from '../data/live-github.json';
import type { DetectedHardware } from '../types/novalis';

interface HomePageProps {
  hardware: DetectedHardware;
  onOpenTerminal: () => void;
}

export function HomePage({ hardware, onOpenTerminal }: HomePageProps) {
  const osTarget =
    hardware.os === 'Android'
      ? { label: 'Explore Android (.APK) Apps', route: '/apps' }
      : hardware.os === 'Windows'
      ? { label: 'Explore Windows (.EXE) Apps', route: '/apps' }
      : { label: 'Explore Cross-Platform Apps', route: '/apps' };

  return (
    <div className="space-y-24">
      {/* Cinematic Mission Control Hero */}
      <section className="relative overflow-hidden border-b border-slate-200/80 dark:border-slate-800/80 novalis-grid">
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_top,rgba(56,189,248,0.16),transparent_60%),radial-gradient(ellipse_at_bottom_right,rgba(129,140,248,0.14),transparent_55%)]" />

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-16 pb-20 lg:pt-24 lg:pb-28">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            <div className="lg:col-span-7 space-y-6">
              <div className="inline-flex flex-wrap items-center gap-2 px-3 py-1.5 rounded-full text-xs font-mono bg-sky-500/10 text-sky-700 dark:text-sky-300 border border-sky-500/25">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                SYSTEMS OPERATIONAL · LOCAL-FIRST AI &amp; SOFTWARE LAB
              </div>

              <h1 className="font-display font-bold text-4xl sm:text-5xl lg:text-6xl tracking-tight text-black dark:text-white leading-[1.08]">
                Engineering{' '}
                <span className="bg-gradient-to-r from-sky-400 via-indigo-400 to-emerald-400 bg-clip-text text-transparent">
                  Cross-Platform Apps
                </span>
                , Market Intelligence &amp; Mission-Critical AI.
              </h1>

              <p className="text-base sm:text-lg text-slate-900 dark:text-slate-100 max-w-2xl leading-relaxed">
                {ORG_META.tagline} Download signed Android &amp; Windows software, compose AI agent skills, or run
                quantized neural models directly on your own PC inside this browser.
              </p>

              <div className="flex flex-wrap items-center gap-3 pt-2">
                <Link
                  to="/models?tab=chat"
                  className="px-5 py-3 rounded-xl bg-sky-500 hover:bg-sky-400 text-slate-950 font-semibold text-sm inline-flex items-center gap-2 shadow-lg shadow-sky-500/20 transition"
                >
                  <MessageSquare className="w-4 h-4" /> Launch Local AI Chat
                </Link>
                <Link
                  to={osTarget.route}
                  className="px-5 py-3 rounded-xl bg-slate-900 dark:bg-white text-white dark:text-slate-950 hover:opacity-90 font-semibold text-sm inline-flex items-center gap-2 transition"
                >
                  <Download className="w-4 h-4" /> {osTarget.label}
                </Link>
                <button
                  type="button"
                  onClick={onOpenTerminal}
                  className="px-4 py-3 rounded-xl glass-panel text-slate-950 dark:text-white hover:border-sky-500/50 font-mono text-xs inline-flex items-center gap-2 transition"
                >
                  <Terminal className="w-4 h-4 text-emerald-400" /> novalis&gt; CLI
                </button>
              </div>

              {/* Live Hardware & Org Telemetry Strip */}
              <div className="pt-4 grid grid-cols-2 sm:grid-cols-4 gap-3">
                {[
                  { label: 'CLIENT OS', value: hardware.os, accent: 'text-sky-500' },
                  { label: 'AI ENGINE', value: hardware.webgpuSupported ? 'WebGPU' : 'WASM CPU', accent: 'text-emerald-500' },
                  { label: 'AI SKILLS', value: `${NOVALIS_SKILLS.length} Ready`, accent: 'text-indigo-400' },
                  { label: 'ORG REPOS', value: `${liveGithub.stats.publicRepos} Public`, accent: 'text-amber-500' },
                ].map((stat) => (
                  <div key={stat.label} className="glass-panel rounded-xl px-3.5 py-2.5">
                    <div className="font-mono text-[10px] text-slate-800 dark:text-slate-200">{stat.label}</div>
                    <div className={`font-mono font-bold text-sm mt-0.5 ${stat.accent}`}>{stat.value}</div>
                  </div>
                ))}
              </div>
            </div>

            {/* Right Hero Crest Command Card */}
            <div className="lg:col-span-5">
              <div className="relative rounded-3xl p-6 sm:p-8 glass-panel glow-cyan overflow-hidden">
                <div className="flex items-center justify-between text-[11px] font-mono text-slate-800 dark:text-slate-200 mb-6">
                  <span>NOVALIS // CORE EMBLEM</span>
                  <span className="text-emerald-400">● 7-NODE MATRIX</span>
                </div>
                <div className="flex justify-center my-4">
                  <img
                    src={`${import.meta.env.BASE_URL}novalis-logo.png`}
                    alt="NOVALIS Official Owl Crest"
                    className="w-56 h-56 sm:w-64 sm:h-64 rounded-2xl shadow-2xl ring-1 ring-sky-400/30 animate-float"
                  />
                </div>
                <div className="mt-6 pt-5 border-t border-slate-200 dark:border-slate-800 grid grid-cols-3 gap-2 text-center font-mono text-[11px]">
                  <div className="p-2 rounded-lg bg-slate-100 dark:bg-slate-900/80">
                    <div className="text-sky-500 font-bold">{NOVALIS_APPS.length}</div>
                    <div className="text-slate-800 dark:text-slate-200 text-[10px]">APPS</div>
                  </div>
                  <div className="p-2 rounded-lg bg-slate-100 dark:bg-slate-900/80">
                    <div className="text-indigo-400 font-bold">{NOVALIS_MODELS.length}</div>
                    <div className="text-slate-800 dark:text-slate-200 text-[10px]">AI MODELS</div>
                  </div>
                  <div className="p-2 rounded-lg bg-slate-100 dark:bg-slate-900/80">
                    <div className="text-emerald-400 font-bold">$0</div>
                    <div className="text-slate-800 dark:text-slate-200 text-[10px]">CLOUD LOCK-IN</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Three Core Engineering Pillars */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10">
        <div className="max-w-2xl">
          <span className="font-mono text-xs uppercase tracking-widest text-sky-500">Architecture</span>
          <h2 className="font-display font-bold text-3xl sm:text-4xl text-black dark:text-white mt-2">
            Three Pillars. One Unified Execution Stack.
          </h2>
          <p className="text-slate-900 dark:text-slate-100 mt-3">
            Every system built under NOVALIS connects client-grade software delivery, quantitative decision
            intelligence, and verifiable AI models.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {NOVALIS_PILLARS.map((pillar) => {
            const borderTone =
              pillar.accent === 'cyan'
                ? 'hover:border-sky-500/50'
                : pillar.accent === 'emerald'
                ? 'hover:border-emerald-500/50'
                : 'hover:border-indigo-500/50';
            const badgeTone =
              pillar.accent === 'cyan'
                ? 'bg-sky-500/15 text-sky-500'
                : pillar.accent === 'emerald'
                ? 'bg-emerald-500/15 text-emerald-500'
                : 'bg-indigo-500/15 text-indigo-400';

            return (
              <Link
                key={pillar.id}
                to={pillar.route}
                className={`group rounded-2xl p-6 glass-panel transition-all ${borderTone} flex flex-col justify-between`}
              >
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <span className={`px-2.5 py-1 rounded-md font-mono text-xs font-bold ${badgeTone}`}>
                      PILLAR {pillar.code}
                    </span>
                    <ArrowRight className="w-4 h-4 text-slate-700 dark:text-slate-200 group-hover:translate-x-1 group-hover:text-sky-400 transition" />
                  </div>
                  <h3 className="font-display font-bold text-xl text-black dark:text-white">{pillar.title}</h3>
                  <div className="font-mono text-xs text-slate-800 dark:text-slate-200 mt-1 mb-3">{pillar.subtitle}</div>
                  <p className="text-sm text-slate-900 dark:text-slate-100 leading-relaxed">{pillar.description}</p>
                </div>

                <div className="mt-6 pt-4 border-t border-slate-200 dark:border-slate-800 flex flex-wrap gap-1.5">
                  {pillar.stack.map((tech) => (
                    <span
                      key={tech}
                      className="px-2 py-0.5 rounded text-[11px] font-mono bg-slate-100 dark:bg-slate-900 text-slate-900 dark:text-slate-100"
                    >
                      {tech}
                    </span>
                  ))}
                </div>
              </Link>
            );
          })}
        </div>
      </section>

      {/* Signature Platform Capabilities (The 4 Interactive Modules) */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
          <div>
            <span className="font-mono text-xs uppercase tracking-widest text-indigo-400">Interactive Platform</span>
            <h2 className="font-display font-bold text-3xl text-black dark:text-white mt-2">
              Built for Direct Distribution &amp; Local Execution
            </h2>
          </div>
          <Link to="/constellation" className="text-sm font-semibold text-sky-500 hover:text-sky-400 inline-flex items-center gap-1.5">
            Explore Constellation Map <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {[
            {
              title: 'Local In-Browser AI Chat Studio',
              desc: 'Download compact ONNX/WebGPU models directly into your browser cache and chat locally on your own GPU or CPU — 100% private, $0 server cost.',
              icon: Cpu,
              route: '/models?tab=chat',
              cta: 'Open Neural Chat',
              badge: 'WebGPU / WASM',
            },
            {
              title: 'Android & Windows App Storefront',
              desc: 'Auto-detects your operating system, verifies SHA-256 integrity hashes, and delivers direct .APK, .EXE, and .MSI downloads via GitHub Releases.',
              icon: Layers,
              route: '/apps',
              cta: 'Browse Apps',
              badge: 'Direct Releases',
            },
            {
              title: 'AI Skills Marketplace & .ZIP Bundler',
              desc: 'Inspect production SKILL.md agent workflows and export multi-skill .zip packages or 1-line CLI installers for Antigravity, Claude Code, Cursor & Gemini CLI.',
              icon: Sparkles,
              route: '/skills',
              cta: 'Compose Skills',
              badge: '1-Click Bundle',
            },
            {
              title: 'NOVALIS Ecosystem Constellation',
              desc: 'Interactive orbital neural map connecting every application, AI model, agent skill, and engineering pillar into one navigable command view.',
              icon: Network,
              route: '/constellation',
              cta: 'Launch Constellation',
              badge: 'Interactive Graph',
            },
          ].map((card) => {
            const Icon = card.icon;
            return (
              <Link
                key={card.title}
                to={card.route}
                className="group rounded-2xl p-6 glass-panel hover:border-sky-500/40 transition-all flex flex-col justify-between gap-5"
              >
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="p-2.5 rounded-xl bg-sky-500/10 text-sky-500 border border-sky-500/20">
                      <Icon className="w-5 h-5" />
                    </div>
                    <span className="px-2.5 py-1 rounded-full text-[11px] font-mono bg-slate-100 dark:bg-slate-900 text-slate-900 dark:text-slate-100 border border-slate-200 dark:border-slate-800">
                      {card.badge}
                    </span>
                  </div>
                  <h3 className="font-display font-bold text-xl text-black dark:text-white group-hover:text-sky-400 transition">
                    {card.title}
                  </h3>
                  <p className="text-sm text-slate-900 dark:text-slate-100 leading-relaxed">{card.desc}</p>
                </div>
                <div className="text-sm font-semibold text-sky-500 inline-flex items-center gap-1.5">
                  {card.cta} <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition" />
                </div>
              </Link>
            );
          })}
        </div>
      </section>

      {/* Zero-Server Trust Banner */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="rounded-3xl p-8 sm:p-10 bg-gradient-to-br from-slate-900 via-[#0B142B] to-slate-950 border border-slate-800 text-white flex flex-col lg:flex-row items-start lg:items-center justify-between gap-8">
          <div className="space-y-3 max-w-2xl">
            <div className="inline-flex items-center gap-2 text-xs font-mono text-emerald-400">
              <ShieldCheck className="w-4 h-4" /> OPEN ARCHITECTURE · VERIFIED RELEASES · ZERO SERVER BLOAT
            </div>
            <h2 className="font-display font-bold text-2xl sm:text-3xl">
              Built to endure on static edge infrastructure &amp; local hardware.
            </h2>
            <p className="text-sm text-slate-300 leading-relaxed">
              This platform runs 100% statically on GitHub Pages, pulls live metadata from GitHub Releases and Hugging
              Face Hub, and executes AI workloads directly on your PC.
            </p>
          </div>
          <div className="flex flex-wrap gap-3 shrink-0">
            <a
              href={ORG_META.githubUrl}
              target="_blank"
              rel="noreferrer"
              className="px-5 py-3 rounded-xl bg-white text-slate-950 hover:bg-slate-200 font-semibold text-sm inline-flex items-center gap-2 transition"
            >
              <Github className="w-4 h-4" /> View GitHub Org
            </a>
            <Link
              to="/vision"
              className="px-5 py-3 rounded-xl bg-sky-500/20 text-sky-300 hover:bg-sky-500/30 border border-sky-400/30 font-semibold text-sm inline-flex items-center gap-2 transition"
            >
              <Zap className="w-4 h-4" /> Read Roadmap
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}

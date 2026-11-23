import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  ArrowRight,
  ArrowUpRight,
  ChevronDown,
  Cpu,
  Download,
  Flame,
  FolderGit2,
  Gamepad2,
  Github,
  Layers,
  MessageSquare,
  Network,
  ShieldCheck,
  Sparkles,
  Terminal,
  Zap,
} from 'lucide-react';
import { KRONVEX_APPS, KRONVEX_MODELS, KRONVEX_PILLARS, KRONVEX_SKILLS, ORG_META } from '../data/catalog';
import liveGithub from '../data/live-github.json';
import { useI18n } from '../i18n/I18nContext';
import {
  KronvexLivingEmblem,
  SENTINEL_PILLARS,
  type SentinelPillarIndex,
} from '../components/KronvexLivingEmblem';
import { ScrollReveal, ScrollScrubText } from '../components/KineticScrollText';
import type { DetectedHardware } from '../types/kronvex';

interface HomePageProps {
  hardware: DetectedHardware;
  onOpenTerminal: () => void;
}

export function HomePage({ hardware, onOpenTerminal }: HomePageProps) {
  const { t } = useI18n();
  const navigate = useNavigate();
  const [sentinelPillar, setSentinelPillar] = useState<SentinelPillarIndex>(0);
  const [studioRuntime, setStudioRuntime] = useState<'webgpu' | 'wasm' | 'cli'>(
    hardware.webgpuSupported ? 'webgpu' : 'wasm'
  );
  const activeSentinel = SENTINEL_PILLARS[sentinelPillar];

  const osTarget =
    hardware.os === 'Android'
      ? { label: t.home.ctaAppsAndroid, route: '/apps' }
      : hardware.os === 'Windows'
      ? { label: t.home.ctaAppsWindows, route: '/apps' }
      : { label: t.home.ctaAppsCross, route: '/apps' };

  const pillarCopy = [t.home.pillars.apps, t.home.pillars.intel, t.home.pillars.ai];
  const pillarIcons = [Layers, Flame, Cpu];

  const platformModules = [
    {
      title: t.home.platformCards.chat.title,
      desc: t.home.platformCards.chat.desc,
      icon: Cpu,
      route: '/models?tab=chat',
      cta: t.home.platformCards.chat.cta,
      meta: 'WebGPU / WASM',
      accent: 'text-sky-600 dark:text-sky-400',
    },
    {
      title: t.home.platformCards.apps.title,
      desc: t.home.platformCards.apps.desc,
      icon: Layers,
      route: '/apps',
      cta: t.home.platformCards.apps.cta,
      meta: 'Direct Releases',
      accent: 'text-emerald-600 dark:text-emerald-400',
    },
    {
      title: t.home.platformCards.skills.title,
      desc: t.home.platformCards.skills.desc,
      icon: Sparkles,
      route: '/skills',
      cta: t.home.platformCards.skills.cta,
      meta: '1-Click .ZIP',
      accent: 'text-indigo-600 dark:text-indigo-400',
    },
    {
      title: t.home.platformCards.arcade.title,
      desc: t.home.platformCards.arcade.desc,
      icon: Gamepad2,
      route: '/arcade',
      cta: t.home.platformCards.arcade.cta,
      meta: t.home.platformCards.arcade.badge,
      accent: 'text-sky-600 dark:text-sky-400',
    },
    {
      title: t.home.platformCards.top21.title,
      desc: t.home.platformCards.top21.desc,
      icon: Flame,
      route: '/top-21',
      cta: t.home.platformCards.top21.cta,
      meta: t.home.platformCards.top21.badge,
      accent: 'text-amber-600 dark:text-amber-400',
    },
    {
      title: t.home.platformCards.constellation.title,
      desc: t.home.platformCards.constellation.desc,
      icon: Network,
      route: '/constellation',
      cta: t.home.platformCards.constellation.cta,
      meta: '7-Node Graph',
      accent: 'text-emerald-600 dark:text-emerald-400',
    },
  ];

  return (
    <div className="space-y-28 sm:space-y-32">
      {/* Open Architectural Hero — Full-Width Balanced Composition */}
      <section className="relative overflow-hidden border-b border-slate-200/70 dark:border-slate-800/70">
        <div className="relative max-w-[1560px] mx-auto px-4 sm:px-6 lg:px-10 xl:px-12 pt-14 pb-20 lg:pt-24 lg:pb-28">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-10 items-center">
            <div className="lg:col-span-7 space-y-7">
              <div className="inline-flex items-center gap-2.5 text-[11px] sm:text-xs font-mono font-semibold tracking-wider text-sky-700 dark:text-sky-300">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse shrink-0" />
                <span>{t.home.statusBadge}</span>
              </div>

              <h1 className="font-display font-bold text-4xl sm:text-5xl lg:text-6xl xl:text-[4.1rem] tracking-tight text-black dark:text-white leading-[1.06]">
                {t.home.heroPrefix}{' '}
                <span className="font-editorial italic font-normal text-[1.14em] tracking-normal bg-gradient-to-r from-sky-500 via-indigo-400 to-emerald-400 bg-clip-text text-transparent pe-1">
                  {t.home.heroHighlight}
                </span>
                {t.home.heroSuffix}
              </h1>

              <p className="text-base sm:text-lg text-slate-900 dark:text-white max-w-3xl leading-relaxed">
                {t.home.heroDesc}
              </p>

              <div className="flex flex-wrap items-center gap-3 pt-1">
                <Link
                  to="/models?tab=chat"
                  className="px-6 py-3 rounded-full bg-sky-500 hover:bg-sky-400 text-slate-950 font-semibold text-sm inline-flex items-center gap-2 shadow-lg shadow-sky-500/20 transition"
                >
                  <MessageSquare className="w-4 h-4" /> {t.home.ctaChat}
                </Link>
                <Link
                  to={osTarget.route}
                  className="px-6 py-3 rounded-full bg-black dark:bg-white text-white dark:text-black hover:opacity-90 font-semibold text-sm inline-flex items-center gap-2 transition"
                >
                  <Download className="w-4 h-4" /> {osTarget.label}
                </Link>
                <button
                  type="button"
                  onClick={onOpenTerminal}
                  dir="ltr"
                  className="px-4 py-3 rounded-full text-black dark:text-white hover:text-sky-600 dark:hover:text-sky-300 font-mono text-xs font-semibold inline-flex items-center gap-2 transition group"
                >
                  <Terminal className="w-4 h-4 text-emerald-500" />
                  <span>kronvex&gt; CLI</span>
                  <ArrowRight className="w-3.5 h-3.5 opacity-80 group-hover:translate-x-0.5 transition" />
                </button>
              </div>

              {/* Open Minimalist Inline Telemetry Strip */}
              <div className="pt-6 border-t border-slate-300/70 dark:border-slate-800/80 grid grid-cols-2 sm:grid-cols-4 gap-y-4 gap-x-6">
                {[
                  { label: t.home.statOs, value: hardware.os, accent: 'text-sky-600 dark:text-sky-400' },
                  {
                    label: t.home.statEngine,
                    value: hardware.webgpuSupported ? 'WebGPU' : 'WASM CPU',
                    accent: 'text-emerald-600 dark:text-emerald-400',
                  },
                  {
                    label: t.home.statSkills,
                    value: `${KRONVEX_SKILLS.length} ${t.home.statSkillsReady}`,
                    accent: 'text-indigo-600 dark:text-indigo-400',
                  },
                  {
                    label: t.home.statRepos,
                    value: `${liveGithub.stats.publicRepos} ${t.home.statReposPublic}`,
                    accent: 'text-amber-600 dark:text-amber-400',
                  },
                ].map((stat) => (
                  <div key={stat.label} className="space-y-0.5">
                    <div className="font-mono text-[11px] font-semibold tracking-wider text-slate-800 dark:text-slate-100">
                      {stat.label}
                    </div>
                    <div className={`font-brand font-bold text-sm tracking-wide ${stat.accent}`}>{stat.value}</div>
                  </div>
                ))}
              </div>
            </div>

            {/* Right Hero: Free-Floating Living Owl Sentinel Emblem */}
            <div className="lg:col-span-5 flex flex-col items-center justify-center">
              <div className="flex items-center gap-3 text-[11px] font-mono font-semibold text-slate-900 dark:text-white mb-3">
                <span>{t.home.emblemLabel}</span>
                <span className="opacity-40">/</span>
                <span style={{ color: activeSentinel.hex }} className="font-bold transition-colors duration-300">
                  {t.home.emblemMatrix} · {activeSentinel.code}
                </span>
              </div>

              <KronvexLivingEmblem activePillar={sentinelPillar} onSelectPillar={setSentinelPillar} />

              <div className="mt-6 flex items-center justify-center gap-6 text-xs font-mono font-semibold text-slate-900 dark:text-white">
                <span>
                  <strong className="text-sky-600 dark:text-sky-400">{KRONVEX_APPS.length}</strong> {t.home.emblemApps}
                </span>
                <span className="opacity-40">|</span>
                <span>
                  <strong className="text-indigo-600 dark:text-indigo-400">{KRONVEX_MODELS.length}</strong>{' '}
                  {t.home.emblemModels}
                </span>
                <span className="opacity-40">|</span>
                <span>
                  <strong className="text-emerald-600 dark:text-emerald-400">$0</strong> {t.home.emblemCloud}
                </span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Three Core Engineering Pillars — Full-Width Balanced Split Header + 3 Columns */}
      <section className="max-w-[1560px] mx-auto px-4 sm:px-6 lg:px-10 xl:px-12 space-y-12">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-12 items-end">
          <div className="lg:col-span-6 space-y-2.5">
            <span className="font-mono text-xs uppercase tracking-[0.2em] text-sky-600 dark:text-sky-400 font-bold">
              {t.home.archLabel}
            </span>
            <ScrollScrubText
              as="h2"
              text={t.home.archTitle}
              className="font-display font-bold text-3xl sm:text-4xl text-black dark:text-white tracking-tight"
            />
          </div>
          <ScrollReveal className="lg:col-span-6" delayMs={80}>
            <p className="text-base text-slate-900 dark:text-white leading-relaxed">{t.home.archSubtitle}</p>
          </ScrollReveal>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-10 lg:gap-14">
          {KRONVEX_PILLARS.map((pillar, idx) => {
            const loc = pillarCopy[idx] || {
              title: pillar.title,
              subtitle: pillar.subtitle,
              desc: pillar.description,
            };
            const Icon = pillarIcons[idx] || Layers;
            const accentText =
              pillar.accent === 'cyan'
                ? 'text-sky-600 dark:text-sky-400'
                : pillar.accent === 'emerald'
                ? 'text-emerald-600 dark:text-emerald-400'
                : 'text-indigo-600 dark:text-indigo-400';
            const topRule =
              pillar.accent === 'cyan'
                ? 'group-hover:border-sky-500'
                : pillar.accent === 'emerald'
                ? 'group-hover:border-emerald-500'
                : 'group-hover:border-indigo-500';

            return (
              <ScrollReveal key={pillar.id} delayMs={idx * 85} className="h-full">
                <Link
                  to={pillar.route}
                  className={`h-full group pt-6 border-t border-slate-300/80 dark:border-slate-700/80 ${topRule} transition-colors flex flex-col justify-between gap-6`}
                >
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <span className={`inline-flex items-center gap-2 font-brand text-xs font-bold tracking-wider ${accentText}`}>
                        <Icon className="w-4 h-4 shrink-0" />
                        {t.home.pillarLabel} {pillar.code}
                      </span>
                      <ArrowRight className="w-4 h-4 text-slate-800 dark:text-white group-hover:translate-x-1.5 group-hover:text-sky-500 transition rtl:rotate-180 rtl:group-hover:-translate-x-1.5" />
                    </div>

                    <div>
                      <h3 className="font-display font-bold text-2xl text-black dark:text-white group-hover:text-sky-600 dark:group-hover:text-sky-300 transition">
                        {loc.title}
                      </h3>
                      <div className="font-mono text-xs font-medium text-slate-800 dark:text-slate-100 mt-1">
                        {loc.subtitle}
                      </div>
                    </div>

                    <p className="text-sm sm:text-[15px] text-slate-900 dark:text-white leading-relaxed">{loc.desc}</p>
                  </div>

                  <div className="font-mono text-xs font-medium text-slate-800 dark:text-slate-100 tracking-wide">
                    {pillar.stack.join(' · ')}
                  </div>
                </Link>
              </ScrollReveal>
            );
          })}
        </div>
      </section>

      {/* Antigravity-Style Split Interactive Studio Showcase (Utilizing Full Horizontal Width) */}
      <section className="max-w-[1560px] mx-auto px-4 sm:px-6 lg:px-10 xl:px-12">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-14 items-center pt-12 border-t border-slate-300/80 dark:border-slate-800">
          {/* Left Editorial Pitch */}
          <div className="lg:col-span-5 space-y-6">
            <span className="font-mono text-xs uppercase tracking-[0.2em] text-emerald-600 dark:text-emerald-400 font-bold">
              KRONVEX STUDIO · LOCAL-FIRST
            </span>
            <ScrollScrubText
              as="h2"
              text={t.home.platformCards.chat.title}
              className="font-display font-bold text-3xl sm:text-4xl lg:text-[2.65rem] text-black dark:text-white tracking-tight leading-[1.12]"
            />
            <ScrollReveal delayMs={70}>
              <p className="text-base text-slate-900 dark:text-white leading-relaxed">
                {t.home.platformCards.chat.desc}
              </p>
            </ScrollReveal>
            <div className="flex flex-wrap items-center gap-6 pt-2">
              <Link
                to="/models?tab=chat"
                className="group text-sm font-bold text-sky-600 dark:text-sky-400 hover:text-sky-500 inline-flex items-center gap-2 transition"
              >
                <MessageSquare className="w-4 h-4" />
                <span>{t.home.platformCards.chat.cta}</span>
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition rtl:rotate-180 rtl:group-hover:-translate-x-1" />
              </Link>
              <button
                type="button"
                onClick={onOpenTerminal}
                dir="ltr"
                className="group text-sm font-mono font-bold text-black dark:text-white hover:text-emerald-500 inline-flex items-center gap-2 transition"
              >
                <Terminal className="w-4 h-4 text-emerald-500" />
                <span>kronvex&gt; CLI</span>
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition" />
              </button>
            </div>
          </div>

          {/* Right Open Borderless Interactive Studio (Zero Box / Frame Walls!) */}
          <ScrollReveal className="lg:col-span-7" delayMs={100}>
            <div className="relative py-2 sm:py-4">
              {/* Soft open ambient aura behind the controls (no hard box outline) */}
              <div
                aria-hidden="true"
                className="pointer-events-none absolute -inset-4 bg-[radial-gradient(ellipse_at_25%_35%,rgba(56,189,248,0.16),transparent_55%),radial-gradient(ellipse_at_80%_75%,rgba(16,185,129,0.13),transparent_55%),radial-gradient(ellipse_at_75%_20%,rgba(129,140,248,0.13),transparent_50%)] blur-2xl"
              />

              <div dir="ltr" className="relative space-y-6 text-left">
                {/* Workspace header row — open directly on canvas */}
                <div className="flex items-center justify-between gap-3 text-xs font-mono text-black dark:text-white pb-3 border-b border-slate-300/70 dark:border-slate-800">
                  <span className="inline-flex items-center gap-2 font-semibold">
                    <FolderGit2 className="w-4 h-4 text-sky-500" />
                    kronvex-local-studio
                    <ChevronDown className="w-3.5 h-3.5 opacity-70" />
                  </span>
                  <span className="inline-flex items-center gap-1.5 text-emerald-600 dark:text-emerald-400 font-bold">
                    <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                    $0 SERVER · PRIVATE
                  </span>
                </div>

                {/* Open Interactive Prompt Row (No Boxed Card Frame) */}
                <div className="space-y-5">
                  <button
                    type="button"
                    onClick={() => navigate('/models?tab=chat')}
                    className="w-full text-left text-base sm:text-lg font-medium text-black dark:text-white hover:text-sky-600 dark:hover:text-sky-300 transition"
                  >
                    Ask KRONVEX Local AI anything, inspect SKILL.md, or press Ctrl+K for actions...
                  </button>

                  <div className="flex flex-wrap items-center justify-between gap-3 pt-4 border-t border-slate-300/70 dark:border-slate-800">
                    <div className="flex flex-wrap items-center gap-4">
                      {(
                        [
                          { id: 'webgpu', label: 'WebGPU · SmolLM2 / Qwen2.5' },
                          { id: 'wasm', label: 'WASM CPU Local' },
                          { id: 'cli', label: 'kronvex> CLI' },
                        ] as const
                      ).map((opt) => (
                        <button
                          key={opt.id}
                          type="button"
                          onClick={() => {
                            setStudioRuntime(opt.id);
                            if (opt.id === 'cli') onOpenTerminal();
                          }}
                          className={`pb-1 text-xs font-mono font-bold border-b-2 transition ${
                            studioRuntime === opt.id
                              ? 'border-sky-500 text-sky-700 dark:text-sky-300'
                              : 'border-transparent text-slate-900 dark:text-white hover:text-sky-600 dark:hover:text-sky-300'
                          }`}
                        >
                          {opt.label}
                        </button>
                      ))}
                    </div>

                    <button
                      type="button"
                      onClick={() => navigate('/models?tab=chat')}
                      className="px-5 py-2 rounded-full bg-black dark:bg-white text-white dark:text-black text-xs font-bold inline-flex items-center gap-1.5 hover:opacity-90 transition"
                    >
                      Launch <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                {/* Quick Direct Action Links — open on canvas */}
                <div className="flex flex-wrap items-center gap-x-6 gap-y-2 text-xs font-mono pt-1">
                  <button
                    type="button"
                    onClick={() => navigate('/skills')}
                    className="text-slate-900 dark:text-white hover:text-sky-500 inline-flex items-center gap-1.5 transition"
                  >
                    <Sparkles className="w-3.5 h-3.5 text-indigo-500" /> Bundle AI Skills (.ZIP) →
                  </button>
                  <button
                    type="button"
                    onClick={() => navigate('/arcade')}
                    className="text-slate-900 dark:text-white hover:text-sky-500 inline-flex items-center gap-1.5 transition"
                  >
                    <Gamepad2 className="w-3.5 h-3.5 text-emerald-500" /> Tech &amp; AI Quiz + Neural Chess →
                  </button>
                  <button
                    type="button"
                    onClick={() => navigate('/top-21')}
                    className="text-slate-900 dark:text-white hover:text-sky-500 inline-flex items-center gap-1.5 transition"
                  >
                    <Flame className="w-3.5 h-3.5 text-amber-500" /> Global Top 21 Radar →
                  </button>
                </div>
              </div>
            </div>
          </ScrollReveal>
        </div>
      </section>

      {/* Interactive Platform — Full-Width Open Editorial Directory */}
      <section className="max-w-[1560px] mx-auto px-4 sm:px-6 lg:px-10 xl:px-12 space-y-10">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
          <div className="space-y-2">
            <span className="font-mono text-xs uppercase tracking-[0.2em] text-indigo-600 dark:text-indigo-400 font-bold">
              {t.home.platformLabel}
            </span>
            <ScrollScrubText
              as="h2"
              text={t.home.platformTitle}
              className="font-display font-bold text-3xl sm:text-4xl text-black dark:text-white tracking-tight"
            />
          </div>
          <Link
            to="/constellation"
            className="text-sm font-bold text-sky-600 dark:text-sky-400 hover:text-sky-500 inline-flex items-center gap-1.5 group"
          >
            {t.home.exploreConstellation}{' '}
            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition rtl:rotate-180 rtl:group-hover:-translate-x-1" />
          </Link>
        </div>

        <div className="border-t border-b border-slate-300/80 dark:border-slate-700/80 divide-y divide-slate-300/70 dark:divide-slate-800/80">
          {platformModules.map((mod, idx) => {
            const Icon = mod.icon;
            return (
              <ScrollReveal key={mod.route} delayMs={Math.min(idx * 45, 220)}>
                <Link
                  to={mod.route}
                  className="group py-6 sm:py-7 px-2 sm:px-4 -mx-2 sm:-mx-4 rounded-xl hover:bg-slate-900/[0.03] dark:hover:bg-white/[0.04] transition grid grid-cols-1 lg:grid-cols-12 gap-4 lg:gap-8 items-center"
                >
                  <div className="lg:col-span-4 flex items-center gap-3.5 min-w-0">
                    <Icon className={`w-5 h-5 shrink-0 ${mod.accent}`} />
                    <div className="min-w-0">
                      <h3 className="font-display font-bold text-lg sm:text-xl text-black dark:text-white group-hover:text-sky-600 dark:group-hover:text-sky-300 transition">
                        {mod.title}
                      </h3>
                      <span className="font-mono text-xs font-medium text-slate-800 dark:text-slate-100">{mod.meta}</span>
                    </div>
                  </div>

                  <p className="lg:col-span-6 text-sm sm:text-[15px] text-slate-900 dark:text-white leading-relaxed">
                    {mod.desc}
                  </p>

                  <div className="lg:col-span-2 flex lg:justify-end">
                    <span className="text-sm font-bold text-black dark:text-white group-hover:text-sky-600 dark:group-hover:text-sky-400 inline-flex items-center gap-1.5 whitespace-nowrap transition">
                      {mod.cta}
                      <ArrowRight className="w-4 h-4 group-hover:translate-x-1.5 transition rtl:rotate-180 rtl:group-hover:-translate-x-1.5" />
                    </span>
                  </div>
                </Link>
              </ScrollReveal>
            );
          })}
        </div>
      </section>

      {/* Open Architectural Trust & Enterprise Closing Band */}
      <section className="max-w-[1560px] mx-auto px-4 sm:px-6 lg:px-10 xl:px-12">
        <div className="pt-12 border-t border-slate-300/80 dark:border-slate-700/80 flex flex-col lg:flex-row items-start lg:items-end justify-between gap-8">
          <div className="space-y-4 max-w-3xl">
            <div className="inline-flex items-center gap-2 text-xs font-mono font-bold text-emerald-600 dark:text-emerald-400">
              <ShieldCheck className="w-4 h-4 shrink-0" /> {t.home.trustBadge}
            </div>
            <ScrollScrubText
              as="h2"
              text={t.home.trustTitle}
              className="font-display font-bold text-3xl sm:text-4xl text-black dark:text-white leading-tight"
            />
            <ScrollReveal delayMs={70}>
              <p className="text-base text-slate-900 dark:text-white leading-relaxed">{t.home.trustDesc}</p>
            </ScrollReveal>
          </div>

          <ScrollReveal delayMs={110} className="flex flex-wrap items-center gap-x-7 gap-y-4 shrink-0">
            <Link
              to="/enterprise"
              className="px-6 py-3 rounded-full bg-sky-500 hover:bg-sky-400 text-slate-950 font-bold text-sm inline-flex items-center gap-2 transition"
            >
              <Sparkles className="w-4 h-4" /> {t.home.ctaEnterprise}
            </Link>
            <a
              href={ORG_META.githubUrl}
              target="_blank"
              rel="noreferrer"
              className="group text-sm font-bold text-black dark:text-white hover:text-sky-600 dark:hover:text-sky-400 inline-flex items-center gap-2 transition"
            >
              <Github className="w-4 h-4" />
              <span>{t.home.ctaGithub}</span>
              <ArrowUpRight className="w-4 h-4 opacity-80 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition" />
            </a>
            <Link
              to="/vision"
              className="group text-sm font-bold text-black dark:text-white hover:text-sky-600 dark:hover:text-sky-400 inline-flex items-center gap-2 transition"
            >
              <Zap className="w-4 h-4 text-sky-500" />
              <span>{t.home.ctaRoadmap}</span>
              <ArrowRight className="w-4 h-4 opacity-80 group-hover:translate-x-1 transition rtl:rotate-180 rtl:group-hover:-translate-x-1" />
            </Link>
          </ScrollReveal>
        </div>
      </section>
    </div>
  );
}

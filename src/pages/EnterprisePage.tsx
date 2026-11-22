import { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import {
  ArrowRight,
  Brain,
  Building2,
  CheckCircle2,
  Cpu,
  Database,
  Gauge,
  GraduationCap,
  Layers,
  LineChart,
  Lock,
  Rocket,
  ShieldCheck,
  ShoppingBag,
  Sparkles,
  Wrench,
} from 'lucide-react';
import { useI18n } from '../i18n/I18nContext';

const SERVICE_OPTIONS = [
  {
    id: 'custom-apps',
    label: 'Custom Web, Windows & Android App',
    topic: 'Cross-Platform App Collaboration',
  },
  {
    id: 'private-ai',
    label: 'Private AI, Custom LLM & RAG System',
    topic: 'Custom AI Models & Research',
  },
  {
    id: 'quant-intel',
    label: 'Market Intelligence & Data Pipeline',
    topic: 'Partnership / Enterprise',
  },
  {
    id: 'audit',
    label: 'Lighthouse 100 & Security Hardening',
    topic: 'Partnership / Enterprise',
  },
] as const;

const ORG_STAGES = ['Startup / Founder', 'Small & Mid Business', 'Enterprise / Research Lab'] as const;
const TIMELINES = [
  'Rapid Prototype (2–4 weeks)',
  'Production Launch (1–3 months)',
  'Dedicated Engineering Partner',
] as const;

export function EnterprisePage() {
  const { t } = useI18n();
  const { hash } = useLocation();
  const navigate = useNavigate();

  const [selectedServices, setSelectedServices] = useState<string[]>(['custom-apps', 'private-ai']);
  const [orgStage, setOrgStage] = useState<(typeof ORG_STAGES)[number]>('Startup / Founder');
  const [timeline, setTimeline] = useState<(typeof TIMELINES)[number]>('Production Launch (1–3 months)');

  useEffect(() => {
    if (!hash) return;
    const id = hash.replace('#', '');
    const timer = window.setTimeout(() => {
      document.getElementById(id)?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }, 60);
    return () => window.clearTimeout(timer);
  }, [hash]);

  const toggleService = (id: string) => {
    setSelectedServices((prev) =>
      prev.includes(id) ? (prev.length > 1 ? prev.filter((x) => x !== id) : prev) : [...prev, id]
    );
  };

  const launchTailoredInquiry = () => {
    const picked = SERVICE_OPTIONS.filter((s) => selectedServices.includes(s.id));
    const primaryTopic = picked.length === 1 ? picked[0].topic : 'Partnership / Enterprise';
    const brief = [
      'Hello KRONVEX Enterprise team,',
      '',
      `Organization Stage: ${orgStage}`,
      `Target Timeline: ${timeline}`,
      `Requested Capabilities:\n${picked.map((p) => `- ${p.label}`).join('\n')}`,
      '',
      'Project Context & Goals:',
      '(Describe your workflow, users, or technical requirements here...)',
    ].join('\n');

    navigate(`/contact?topic=${encodeURIComponent(primaryTopic)}&brief=${encodeURIComponent(brief)}`);
  };

  return (
    <div className="max-w-[1560px] mx-auto px-4 sm:px-6 lg:px-10 xl:px-12 py-14 space-y-24">
      {/* Executive Hero — Full-Width 12-Column Balanced Composition */}
      <section className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-14 items-end">
        <div className="lg:col-span-8 space-y-6">
          <div className="inline-flex items-center gap-2 text-xs font-mono font-bold tracking-wider text-sky-700 dark:text-sky-300">
            <Building2 className="w-4 h-4" /> {t.enterprise.badge}
          </div>
          <h1 className="font-display font-bold text-3xl sm:text-5xl text-black dark:text-white leading-[1.1] tracking-tight">
            {t.enterprise.title}
          </h1>
          <p className="text-base sm:text-lg text-slate-900 dark:text-white leading-relaxed max-w-3xl">
            {t.enterprise.subtitle}
          </p>
          <div className="flex flex-wrap items-center gap-5 pt-2">
            <a
              href="#scope-builder"
              className="px-6 py-3 rounded-full bg-sky-500 hover:bg-sky-400 text-slate-950 font-bold text-sm inline-flex items-center gap-2 shadow-lg shadow-sky-500/20 transition"
            >
              <Sparkles className="w-4 h-4" /> {t.enterprise.ctaScope}
            </a>
            <a
              href="#industries"
              className="group text-sm font-bold text-black dark:text-white hover:text-sky-600 dark:hover:text-sky-400 inline-flex items-center gap-1.5 transition"
            >
              {t.enterprise.ctaIndustries}{' '}
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition rtl:rotate-180 rtl:group-hover:-translate-x-1" />
            </a>
          </div>
        </div>

        {/* Right Executive Highlights (Balances Viewport Horizontally) */}
        <div className="lg:col-span-4 lg:border-s border-slate-300/80 dark:border-slate-700/80 lg:ps-8 space-y-5">
          {[
            { metric: '100%', label: 'Source-Code & IP Ownership', accent: 'text-sky-600 dark:text-sky-400' },
            { metric: '100/100', label: 'Lighthouse Performance & Security Standard', accent: 'text-emerald-600 dark:text-emerald-400' },
            { metric: '$0', label: 'Unnecessary Cloud Vendor Lock-In', accent: 'text-indigo-600 dark:text-indigo-400' },
          ].map((item) => (
            <div key={item.label} className="space-y-0.5">
              <div className={`font-display font-bold text-2xl ${item.accent}`}>{item.metric}</div>
              <div className="text-xs font-mono font-medium text-slate-900 dark:text-white">{item.label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* 4 Custom Engineering Pillars — Open Architectural Grid (Hairlines, Zero Card Boxes) */}
      <section className="space-y-10">
        <div className="max-w-2xl">
          <span className="font-mono text-xs uppercase tracking-[0.2em] text-sky-600 dark:text-sky-400 font-semibold">
            {t.enterprise.capLabel}
          </span>
          <h2 className="font-display font-bold text-3xl text-black dark:text-white mt-2">
            {t.enterprise.capTitle}
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-12">
          {[
            {
              id: 'custom-apps',
              icon: Layers,
              tag: 'WEB · WINDOWS · ANDROID',
              accent: 'text-sky-600 dark:text-sky-400',
              title: 'Custom Web Platforms & Native Applications',
              desc: 'Bespoke web applications, customer portals, internal operations cockpits, Windows desktop tools, and Android apps architected around your exact business logic and brand identity.',
              bullets: [
                'React / TypeScript / Next.js / Flutter / Rust',
                'Offline-first local persistence & signed releases',
              ],
            },
            {
              id: 'private-ai',
              icon: Brain,
              tag: 'LLM · RAG · AGENTS · ON-PREM',
              accent: 'text-indigo-600 dark:text-indigo-400',
              title: 'Private AI, RAG Knowledge Engines & Agents',
              desc: 'Deploy intelligent assistants over your company’s private PDFs, databases, and internal APIs using hybrid RAG, fine-tuned LoRA adapters, deterministic tool-calling agents, or local GGUF/ONNX inference with zero third-party data leakage.',
              bullets: [
                'Hybrid Vector + BM25 RAG & citation grounding',
                'Automated eval harnesses & schema guardrails',
              ],
            },
            {
              id: 'quant-intel',
              icon: LineChart,
              tag: 'TELEMETRY · QUANT · ANALYTICS',
              accent: 'text-emerald-600 dark:text-emerald-400',
              title: 'Market Intelligence & Real-Time Data Pipelines',
              desc: 'Automated ingestion pipelines, quantitative research dashboards, volatility/risk monitors, and scheduled intelligence feeds engineered to distill high-volume data into crisp executive decisions.',
              bullets: [
                'Python / FastAPI / Polars / PostgreSQL / WebSockets',
                'Zero-ops edge caching & live anomaly alerts',
              ],
            },
            {
              id: 'audit',
              icon: Gauge,
              tag: '100/100 LIGHTHOUSE · SECURITY',
              accent: 'text-amber-600 dark:text-amber-400',
              title: 'Performance, Architecture & Security Hardening',
              desc: 'Transform slow, bloated sites or fragile CI/CD pipelines into resilient, Lighthouse 100/100 edge deployments with code splitting, modern asset pipelines, mobile UX excellence, and least-privilege security.',
              bullets: [
                'Core Web Vitals, SEO & Agentic Discovery (llms.txt)',
                'Secret hygiene, SHA-256 releases & CI automation',
              ],
            },
          ].map((cap) => {
            const Icon = cap.icon;
            return (
              <div
                key={cap.id}
                id={cap.id}
                className="scroll-mt-24 pt-6 border-t border-slate-300/80 dark:border-slate-800 space-y-4"
              >
                <div className="flex items-center justify-between gap-2">
                  <Icon className={`w-5 h-5 ${cap.accent}`} />
                  <span className={`font-mono text-[11px] font-semibold ${cap.accent}`}>{cap.tag}</span>
                </div>
                <h3 className="font-display font-bold text-xl sm:text-2xl text-black dark:text-white">{cap.title}</h3>
                <p className="text-sm text-slate-800 dark:text-white leading-relaxed">{cap.desc}</p>
                <ul className="space-y-1.5 text-xs text-slate-900 dark:text-white font-mono pt-1">
                  {cap.bullets.map((b) => (
                    <li key={b} className="flex items-center gap-2">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                      <span>{b}</span>
                    </li>
                  ))}
                </ul>
              </div>
            );
          })}
        </div>
      </section>

      {/* Industries — Open Editorial 3-Column Index */}
      <section id="industries" className="scroll-mt-24 space-y-10">
        <div className="max-w-2xl">
          <span className="font-mono text-xs uppercase tracking-[0.2em] text-indigo-600 dark:text-indigo-400 font-semibold">
            {t.enterprise.indLabel}
          </span>
          <h2 className="font-display font-bold text-3xl text-black dark:text-white mt-2">
            {t.enterprise.indTitle}
          </h2>
          <p className="text-sm text-slate-800 dark:text-white mt-2">{t.enterprise.indSub}</p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-x-10 gap-y-10">
          {[
            {
              icon: LineChart,
              title: 'Fintech & Quantitative Trading',
              desc: 'Market telemetry cockpits, options & macro signal pipelines, backtesting harnesses, and risk dashboards.',
            },
            {
              icon: Rocket,
              title: 'Tech Startups & SaaS',
              desc: 'High-velocity MVPs, flagship product web apps, Cloudflare Edge APIs, and investor-ready launch platforms.',
            },
            {
              icon: ShoppingBag,
              title: 'E-Commerce & Operations',
              desc: 'Custom storefronts, inventory automation, multi-language customer support AI assistants, and analytics.',
            },
            {
              icon: GraduationCap,
              title: 'Research Labs & Education',
              desc: 'Interactive learning arenas, scientific data portals, private document RAG, and reproducible ML tooling.',
            },
            {
              icon: Building2,
              title: 'Small & Mid-Size Businesses',
              desc: 'Bespoke internal CRMs, booking & client portals, mobile companions, and zero-server-cost websites.',
            },
            {
              icon: Wrench,
              title: 'Engineering & DevOps Teams',
              desc: 'Custom AI coding workflows (SKILL.md), internal developer portals, CLI tools, and GitHub Actions automation.',
            },
          ].map((ind) => {
            const Icon = ind.icon;
            return (
              <div
                key={ind.title}
                className="pt-5 border-t border-slate-300/70 dark:border-slate-800/80 space-y-2.5"
              >
                <Icon className="w-5 h-5 text-sky-600 dark:text-sky-400" />
                <h3 className="font-display font-bold text-lg text-black dark:text-white">{ind.title}</h3>
                <p className="text-sm text-slate-800 dark:text-white leading-relaxed">{ind.desc}</p>
              </div>
            );
          })}
        </div>
      </section>

      {/* Transparent 4-Step Delivery Process — Open Horizontal Sequence */}
      <section id="engagement" className="scroll-mt-24 space-y-10">
        <div className="max-w-2xl">
          <span className="font-mono text-xs uppercase tracking-[0.2em] text-emerald-600 dark:text-emerald-400 font-semibold">
            {t.enterprise.delivLabel}
          </span>
          <h2 className="font-display font-bold text-3xl text-black dark:text-white mt-2">
            {t.enterprise.delivTitle}
          </h2>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
          {[
            {
              step: '01',
              title: 'Discovery & Blueprint',
              desc: 'We map your business goals, workflows, and constraints into a clear technical specification and architecture plan.',
            },
            {
              step: '02',
              title: 'Rapid Working Prototype',
              desc: 'You test real interactive software early — iterating on UX, mobile responsiveness, and data contracts before scaling.',
            },
            {
              step: '03',
              title: 'Hardening & Verification',
              desc: 'Strict TypeScript, automated tests, Lighthouse 100 performance tuning, and security auditing across every surface.',
            },
            {
              step: '04',
              title: 'Handoff & Full Ownership',
              desc: 'Clean Git repositories, automated CI/CD deployment, thorough documentation, and optional long-term evolution support.',
            },
          ].map((p) => (
            <div key={p.step} className="pt-5 border-t border-slate-300/80 dark:border-slate-800 space-y-2.5">
              <div className="font-mono text-xs font-extrabold text-sky-600 dark:text-sky-400">STEP {p.step}</div>
              <h3 className="font-display font-bold text-lg text-black dark:text-white">{p.title}</h3>
              <p className="text-sm text-slate-800 dark:text-white leading-relaxed">{p.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Zero-Tracking & Ownership Trust Strip — Open Editorial */}
      <section
        id="trust"
        className="scroll-mt-24 pt-10 border-t border-slate-300/80 dark:border-slate-800 grid grid-cols-1 md:grid-cols-3 gap-10"
      >
        {[
          {
            icon: Lock,
            title: 'Zero-Tracking & Data Sovereignty',
            desc: 'Your proprietary datasets and customer records stay strictly under your infrastructure — never recycled to train external third-party models.',
          },
          {
            icon: Cpu,
            title: 'Zero-Bloat Cost Efficiency',
            desc: 'Where possible, we leverage static edge hosting, WebGPU local execution, and serverless Workers to minimize recurring cloud bills.',
          },
          {
            icon: ShieldCheck,
            title: '100% Source-Code Ownership',
            desc: 'Clean, maintainable repositories with zero vendor lock-in and full documentation so your team owns every line shipped.',
          },
        ].map((item) => {
          const Icon = item.icon;
          return (
            <div key={item.title} className="space-y-2.5">
              <Icon className="w-5 h-5 text-emerald-500" />
              <h3 className="font-display font-bold text-lg text-black dark:text-white">{item.title}</h3>
              <p className="text-sm text-slate-800 dark:text-white leading-relaxed">{item.desc}</p>
            </div>
          );
        })}
      </section>

      {/* Interactive Custom Project Scope Builder — Open Hairline-Bounded Workspace */}
      <section
        id="scope-builder"
        className="scroll-mt-24 pt-12 border-t-2 border-sky-500/40 space-y-8"
      >
        <div className="space-y-2.5 max-w-2xl">
          <div className="inline-flex items-center gap-2 text-xs font-mono font-semibold text-sky-600 dark:text-sky-400">
            <Database className="w-4 h-4" /> {t.enterprise.scopeBadge}
          </div>
          <h2 className="font-display font-bold text-2xl sm:text-3xl text-black dark:text-white">
            {t.enterprise.scopeTitle}
          </h2>
          <p className="text-sm text-slate-800 dark:text-white leading-relaxed">{t.enterprise.scopeSub}</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          <div className="lg:col-span-7 space-y-3">
            <div className="font-mono text-[11px] font-semibold uppercase tracking-wider text-slate-900 dark:text-white">
              {t.enterprise.step1}
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {SERVICE_OPTIONS.map((opt) => {
                const active = selectedServices.includes(opt.id);
                return (
                  <button
                    key={opt.id}
                    type="button"
                    onClick={() => toggleService(opt.id)}
                    className={`p-3.5 rounded-xl border text-start text-xs font-semibold flex items-center justify-between gap-2 transition ${
                      active
                        ? 'bg-sky-500/15 border-sky-500 text-black dark:text-white'
                        : 'border-slate-300 dark:border-slate-800 text-slate-800 dark:text-white hover:border-sky-500/50'
                    }`}
                  >
                    <span>{opt.label}</span>
                    <CheckCircle2
                      className={`w-4 h-4 shrink-0 ${active ? 'text-sky-500' : 'text-slate-400 dark:text-slate-600'}`}
                    />
                  </button>
                );
              })}
            </div>
          </div>

          <div className="lg:col-span-5 space-y-5">
            <div className="space-y-2.5">
              <div className="font-mono text-[11px] font-semibold uppercase tracking-wider text-slate-900 dark:text-white">
                {t.enterprise.step2}
              </div>
              <div className="flex flex-wrap gap-2">
                {ORG_STAGES.map((st) => (
                  <button
                    key={st}
                    type="button"
                    onClick={() => setOrgStage(st)}
                    className={`px-3.5 py-1.5 rounded-full text-xs font-mono border transition ${
                      orgStage === st
                        ? 'bg-emerald-500 text-slate-950 border-emerald-500 font-bold'
                        : 'border-slate-300 dark:border-slate-700 text-slate-800 dark:text-white hover:border-emerald-500/60'
                    }`}
                  >
                    {st}
                  </button>
                ))}
              </div>
            </div>

            <div className="space-y-2.5">
              <div className="font-mono text-[11px] font-semibold uppercase tracking-wider text-slate-900 dark:text-white">
                {t.enterprise.step3}
              </div>
              <div className="flex flex-wrap gap-2">
                {TIMELINES.map((tl) => (
                  <button
                    key={tl}
                    type="button"
                    onClick={() => setTimeline(tl)}
                    className={`px-3.5 py-1.5 rounded-full text-xs font-mono border transition ${
                      timeline === tl
                        ? 'bg-sky-500 text-slate-950 border-sky-500 font-bold'
                        : 'border-slate-300 dark:border-slate-700 text-slate-800 dark:text-white hover:border-sky-500/60'
                    }`}
                  >
                    {tl}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>

        <div className="pt-5 flex flex-wrap items-center justify-between gap-4 border-t border-slate-300/80 dark:border-slate-800">
          <div className="font-mono text-xs text-slate-900 dark:text-white">
            <strong className="text-sky-600 dark:text-sky-400">{selectedServices.length}</strong> · {orgStage} ·{' '}
            {timeline}
          </div>
          <button
            type="button"
            onClick={launchTailoredInquiry}
            className="px-6 py-3 rounded-full bg-sky-500 hover:bg-sky-400 text-slate-950 font-bold text-sm inline-flex items-center gap-2 transition"
          >
            {t.enterprise.requestProposal} <ArrowRight className="w-4 h-4 rtl:rotate-180" />
          </button>
        </div>
      </section>
    </div>
  );
}

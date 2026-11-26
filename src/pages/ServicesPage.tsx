import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  ArrowRight,
  Brain,
  CheckCircle2,
  ChevronDown,
  Cpu,
  Layers,
  LineChart,
  Rocket,
  ShieldCheck,
  Sparkles,
  Wrench,
} from 'lucide-react';
import { ScrollReveal, ScrollScrubText } from '../components/KineticScrollText';

const CAPABILITIES = [
  {
    code: '01',
    icon: Layers,
    accent: 'text-sky-600 dark:text-sky-400',
    title: 'Custom Cross-Platform Applications',
    summary:
      'Production web platforms, Windows desktop binaries (.EXE/.MSI), and Android apps (.APK) engineered on type-safe TypeScript & Rust/Flutter cores with deterministic SHA-256 releases.',
    deliverables: ['React 19 / TypeScript Web Apps', 'Windows & Android Packaging', 'Offline-First & 6-Language RTL'],
  },
  {
    code: '02',
    icon: Brain,
    accent: 'text-indigo-600 dark:text-indigo-400',
    title: 'AI-Native & Agentic Delivery',
    summary:
      'Private RAG pipelines, custom AI agents, portable SKILL.md workflows, MCP gateways, and zero-cloud WebGPU/ONNX inference running directly on your users’ hardware.',
    deliverables: ['Private LLM & RAG Architecture', 'Custom AI Agents & MCP Tools', 'Local WebGPU / ONNX Models'],
  },
  {
    code: '03',
    icon: LineChart,
    accent: 'text-emerald-600 dark:text-emerald-400',
    title: 'Market Intelligence & Data Pipelines',
    summary:
      'High-signal data ingestion, automated research radars, quantitative telemetry, and zero-server edge pipelines that convert raw streams into executive clarity.',
    deliverables: ['Automated Telemetry Pipelines', 'Real-Time Analytics & Dashboards', 'Zero-Server Static Edge Sync'],
  },
  {
    code: '04',
    icon: ShieldCheck,
    accent: 'text-amber-600 dark:text-amber-400',
    title: 'Performance, SEO/AEO & Security Hardening',
    summary:
      'Lighthouse 100/100 engineering, technical SEO & AI Answer-Engine (AEO/GEO) architecture, WCAG AA accessibility, and zero-tracking privacy hardening.',
    deliverables: ['Lighthouse 100/100 Optimization', 'Technical SEO + AEO / JSON-LD', 'Security Headers & 48h SLA'],
  },
];

const DELIVERY_STEPS = [
  {
    step: '01',
    title: 'Discovery & Architecture',
    detail: 'Audit goals, constraints, data sensitivity, and target platforms. Output a concrete system spec before writing code.',
  },
  {
    step: '02',
    title: 'Vertical Slice Prototype',
    detail: 'Ship a working, testable end-to-end slice fast so your team validates real UX and data flows in week one.',
  },
  {
    step: '03',
    title: 'Hardened Production Build',
    detail: 'Type-safe implementation, automated CI gates, Lighthouse 100 checks, accessibility verification, and security review.',
  },
  {
    step: '04',
    title: 'Handover, Telemetry & Scale',
    detail: 'Clean documentation, full source & IP transfer, signed releases, and optional ongoing AI-native engineering partnership.',
  },
];

const ENGAGEMENT_MODELS = [
  {
    tag: '2 – 4 WEEKS',
    name: 'Architecture & Prototype Sprint',
    idealFor: 'Founders & R&D teams validating an AI product, custom tool, or system modernization.',
    points: [
      'Complete technical blueprint & stack validation',
      'Working clickable prototype or local AI proof-of-concept',
      'Performance, security & SEO/AEO readiness baseline',
    ],
    topic: 'Architecture & Prototype Sprint',
  },
  {
    tag: '1 – 3 MONTHS',
    name: 'Full Product Delivery',
    idealFor: 'Businesses shipping a production cross-platform app, private RAG platform, or data pipeline.',
    points: [
      'End-to-end engineering across web, desktop, mobile & AI',
      'Automated CI/CD, SHA-256 release signing & zero-tracking setup',
      'Full source code ownership and engineering playbook handover',
    ],
    topic: 'Full Product Delivery',
  },
  {
    tag: 'ONGOING PARTNER',
    name: 'Dedicated AI-Native Partner',
    idealFor: 'Organizations scaling continuously with custom AI agents, workflows, and engineering rigor.',
    points: [
      'Direct collaboration with KRONVEX lead architecture',
      'Custom agentic delivery workflows (SKILL.md & MCP)',
      'Continuous performance, security & research upgrades',
    ],
    topic: 'Dedicated AI-Native Engineering Partner',
  },
];

const FAQS = [
  {
    q: 'What software and AI services does KRONVEX provide?',
    a: 'KRONVEX delivers custom web, Windows, and Android software development, private AI and RAG systems, custom AI agents and MCP workflows, market intelligence data pipelines, and Lighthouse 100 / SEO-AEO performance hardening.',
  },
  {
    q: 'Do we keep 100% ownership of the source code and IP?',
    a: 'Yes. Every custom project delivered by KRONVEX transfers full source code, build scripts, documentation, and intellectual property directly to your organization with zero vendor lock-in.',
  },
  {
    q: 'Can KRONVEX deploy private AI without sending our data to third-party clouds?',
    a: 'Yes. We specialize in local-first and private AI architectures—running quantized GGUF/ONNX models on your own infrastructure or directly inside the browser via WebGPU/WASM with zero external telemetry.',
  },
  {
    q: 'How fast can we start a project or architecture sprint?',
    a: 'Initial technical scoping takes 48 hours. An Architecture & Prototype Sprint kicks off within one week and delivers a working vertical slice in 2 to 4 weeks.',
  },
  {
    q: 'How does KRONVEX guarantee software quality and performance?',
    a: 'Every release passes strict TypeScript compilation, deterministic verification gates, WCAG accessibility checks, technical SEO/AEO audits, and zero-tracking privacy verification before handover.',
  },
  {
    q: 'How do I estimate scope or request a custom build?',
    a: 'Use our interactive Scope Builder on the Enterprise page or click any engagement model above to generate a structured technical brief with zero cookies or tracking.',
  },
];

export function ServicesPage() {
  const navigate = useNavigate();
  const [openFaq, setOpenFaq] = useState<number | null>(0);

  const startInquiry = (modelName: string) => {
    const brief = [
      'Hello KRONVEX Engineering team,',
      '',
      `Selected Engagement Model: ${modelName}`,
      '',
      'Project Goals & Technical Context:',
      '(Describe your target platform, AI requirements, or timeline here...)',
    ].join('\n');
    navigate(`/contact?topic=${encodeURIComponent('Partnership / Enterprise')}&brief=${encodeURIComponent(brief)}`);
  };

  return (
    <div className="max-w-[1560px] mx-auto px-4 sm:px-6 lg:px-10 xl:px-12 py-14 space-y-24">
      {/* Hero */}
      <section className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-14 items-end">
        <div className="lg:col-span-8 space-y-6">
          <div className="inline-flex items-center gap-2 text-xs font-mono font-bold tracking-wider text-emerald-700 dark:text-emerald-300 uppercase">
            <Wrench className="w-4 h-4" /> KRONVEX SERVICES · AI-NATIVE ENGINEERING
          </div>
          <h1 className="font-display font-bold text-3xl sm:text-5xl text-black dark:text-white leading-[1.08] tracking-tight">
            Custom Software Development &amp;{' '}
            <span className="font-editorial italic font-normal text-sky-700 dark:text-emerald-300">
              AI-Native Engineering
            </span>{' '}
            Services
          </h1>
          <p className="text-base sm:text-lg text-slate-900 dark:text-slate-100 leading-relaxed max-w-3xl">
            We partner with founders, engineering teams, and enterprises to design, build, and harden cross-platform
            applications, private AI &amp; RAG systems, custom agent workflows, and real-time market intelligence
            platforms.
          </p>
          <div className="flex flex-wrap items-center gap-4 pt-2">
            <Link
              to="/enterprise#scope-builder"
              className="px-6 py-3 rounded-full bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-sm inline-flex items-center gap-2 shadow-lg shadow-emerald-500/20 transition"
            >
              <Sparkles className="w-4 h-4" /> Build Your Project Scope
            </Link>
            <Link
              to="/work"
              className="px-5 py-3 rounded-full border border-slate-300 dark:border-white/20 hover:border-sky-500 dark:hover:border-emerald-400 text-sm font-bold text-black dark:text-white inline-flex items-center gap-2 transition"
            >
              View Engineering Case Studies <ArrowRight className="w-4 h-4 rtl:rotate-180" />
            </Link>
          </div>
        </div>

        {/* Measured Standards Strip */}
        <div className="lg:col-span-4 grid grid-cols-2 gap-4 border-t lg:border-t-0 lg:border-s border-slate-300/70 dark:border-white/15 pt-6 lg:pt-0 lg:ps-8">
          <div>
            <div className="font-brand text-2xl sm:text-3xl font-bold text-black dark:text-white">100/100</div>
            <div className="font-mono text-[11px] text-slate-700 dark:text-slate-300 mt-1">Lighthouse Performance</div>
          </div>
          <div>
            <div className="font-brand text-2xl sm:text-3xl font-bold text-emerald-600 dark:text-emerald-400">Zero</div>
            <div className="font-mono text-[11px] text-slate-700 dark:text-slate-300 mt-1">Third-Party Tracking</div>
          </div>
          <div>
            <div className="font-brand text-2xl sm:text-3xl font-bold text-sky-600 dark:text-sky-400">100%</div>
            <div className="font-mono text-[11px] text-slate-700 dark:text-slate-300 mt-1">Client Code &amp; IP Ownership</div>
          </div>
          <div>
            <div className="font-brand text-2xl sm:text-3xl font-bold text-indigo-600 dark:text-indigo-400">48h</div>
            <div className="font-mono text-[11px] text-slate-700 dark:text-slate-300 mt-1">Scoping &amp; Security SLA</div>
          </div>
        </div>
      </section>

      {/* Core Capabilities */}
      <section className="space-y-10 border-t border-slate-300/70 dark:border-white/15 pt-16">
        <div className="max-w-3xl space-y-3">
          <div className="font-mono text-xs font-bold uppercase tracking-widest text-sky-700 dark:text-sky-300">
            CORE CAPABILITIES
          </div>
          <ScrollScrubText
            as="h2"
            text="What does KRONVEX engineer for production teams?"
            className="font-display font-bold text-2xl sm:text-4xl text-black dark:text-white"
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {CAPABILITIES.map((cap, idx) => {
            const Icon = cap.icon;
            return (
              <ScrollReveal key={cap.code} delayMs={idx * 70}>
                <div className="h-full p-7 rounded-2xl border border-slate-300/80 dark:border-white/15 bg-white/75 dark:bg-white/[0.03] backdrop-blur-sm space-y-5 flex flex-col justify-between">
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <span className={`font-brand text-lg font-bold ${cap.accent}`}>{cap.code}</span>
                      <Icon className={`w-5 h-5 ${cap.accent}`} />
                    </div>
                    <h3 className="font-display font-bold text-xl text-black dark:text-white">{cap.title}</h3>
                    <p className="text-sm text-slate-800 dark:text-slate-200 leading-relaxed">{cap.summary}</p>
                  </div>
                  <ul className="pt-4 border-t border-slate-200/80 dark:border-white/10 space-y-2">
                    {cap.deliverables.map((d) => (
                      <li
                        key={d}
                        className="text-xs font-mono text-slate-900 dark:text-slate-100 flex items-center gap-2"
                      >
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                        <span>{d}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </ScrollReveal>
            );
          })}
        </div>
      </section>

      {/* 4-Stage Delivery Process */}
      <section className="space-y-10 border-t border-slate-300/70 dark:border-white/15 pt-16">
        <div className="max-w-3xl space-y-3">
          <div className="font-mono text-xs font-bold uppercase tracking-widest text-emerald-700 dark:text-emerald-300">
            DELIVERY METHODOLOGY
          </div>
          <ScrollScrubText
            as="h2"
            text="How does KRONVEX take software from concept to launch?"
            className="font-display font-bold text-2xl sm:text-4xl text-black dark:text-white"
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {DELIVERY_STEPS.map((s, idx) => (
            <ScrollReveal key={s.step} delayMs={idx * 70}>
              <div className="h-full pt-5 border-t-2 border-emerald-500/60 space-y-2.5">
                <div className="font-brand text-sm font-bold text-emerald-600 dark:text-emerald-400">
                  PHASE {s.step}
                </div>
                <h3 className="font-display font-bold text-lg text-black dark:text-white">{s.title}</h3>
                <p className="text-sm text-slate-800 dark:text-slate-200 leading-relaxed">{s.detail}</p>
              </div>
            </ScrollReveal>
          ))}
        </div>
      </section>

      {/* Engagement Models */}
      <section className="space-y-10 border-t border-slate-300/70 dark:border-white/15 pt-16">
        <div className="max-w-3xl space-y-3">
          <div className="font-mono text-xs font-bold uppercase tracking-widest text-indigo-700 dark:text-indigo-300">
            ENGAGEMENT MODELS
          </div>
          <ScrollScrubText
            as="h2"
            text="Flexible collaboration models built for speed and clarity."
            className="font-display font-bold text-2xl sm:text-4xl text-black dark:text-white"
          />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-7">
          {ENGAGEMENT_MODELS.map((m, idx) => (
            <ScrollReveal key={m.name} delayMs={idx * 80}>
              <div className="h-full p-7 rounded-2xl border border-slate-300/80 dark:border-white/15 bg-white/80 dark:bg-white/[0.03] flex flex-col justify-between gap-6">
                <div className="space-y-4">
                  <span className="inline-block px-3 py-1 rounded-full text-[11px] font-mono font-bold bg-sky-500/15 text-sky-800 dark:text-sky-300 border border-sky-500/30">
                    {m.tag}
                  </span>
                  <h3 className="font-display font-bold text-xl text-black dark:text-white">{m.name}</h3>
                  <p className="text-sm text-slate-800 dark:text-slate-200 leading-relaxed">{m.idealFor}</p>
                  <ul className="space-y-2.5 pt-2">
                    {m.points.map((pt) => (
                      <li key={pt} className="text-xs sm:text-sm text-slate-900 dark:text-slate-100 flex items-start gap-2">
                        <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                        <span>{pt}</span>
                      </li>
                    ))}
                  </ul>
                </div>
                <button
                  type="button"
                  onClick={() => startInquiry(m.topic)}
                  className="w-full py-2.5 px-4 rounded-xl bg-slate-950 dark:bg-white hover:opacity-90 text-white dark:text-slate-950 font-mono font-bold text-xs inline-flex items-center justify-center gap-2 transition"
                >
                  <Rocket className="w-3.5 h-3.5" /> Start {m.name}
                </button>
              </div>
            </ScrollReveal>
          ))}
        </div>
      </section>

      {/* FAQ Section */}
      <section className="space-y-8 border-t border-slate-300/70 dark:border-white/15 pt-16">
        <div className="max-w-3xl space-y-3">
          <div className="font-mono text-xs font-bold uppercase tracking-widest text-sky-700 dark:text-sky-300">
            FREQUENTLY ASKED QUESTIONS
          </div>
          <ScrollScrubText
            as="h2"
            text="Answers about KRONVEX engineering, IP ownership & local AI."
            className="font-display font-bold text-2xl sm:text-4xl text-black dark:text-white"
          />
        </div>

        <div className="divide-y divide-slate-300/70 dark:divide-white/15 border-y border-slate-300/70 dark:border-white/15">
          {FAQS.map((item, idx) => {
            const isOpen = openFaq === idx;
            return (
              <div key={item.q} className="py-5">
                <button
                  type="button"
                  onClick={() => setOpenFaq(isOpen ? null : idx)}
                  aria-expanded={isOpen}
                  className="w-full flex items-center justify-between gap-4 text-start font-display font-bold text-base sm:text-lg text-black dark:text-white hover:text-sky-700 dark:hover:text-emerald-300 transition"
                >
                  <span>{item.q}</span>
                  <ChevronDown
                    className={`w-5 h-5 shrink-0 transition-transform duration-200 ${isOpen ? 'rotate-180 text-emerald-500' : ''}`}
                  />
                </button>
                {isOpen && (
                  <p className="mt-3 text-sm sm:text-base text-slate-800 dark:text-slate-200 leading-relaxed max-w-4xl">
                    {item.a}
                  </p>
                )}
              </div>
            );
          })}
        </div>

        <div className="flex flex-wrap items-center justify-between gap-4 pt-4">
          <div className="flex items-center gap-2 text-sm text-slate-800 dark:text-slate-200">
            <Cpu className="w-4 h-4 text-emerald-500" />
            <span>Want to inspect how we engineer every build? Read the KRONVEX Engineering Playbook.</span>
          </div>
          <Link
            to="/playbook"
            className="text-sm font-mono font-bold text-sky-700 dark:text-emerald-300 hover:underline inline-flex items-center gap-1.5"
          >
            Open Engineering Playbook <ArrowRight className="w-4 h-4 rtl:rotate-180" />
          </Link>
        </div>
      </section>
    </div>
  );
}

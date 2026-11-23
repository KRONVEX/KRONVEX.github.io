import { ArrowUpRight, CheckCircle2, Clock, Compass, Github, Mail, ShieldCheck, Target, Zap } from 'lucide-react';
import { KRONVEX_PILLARS, KRONVEX_ROADMAP, ORG_META } from '../data/catalog';
import { ScrollReveal, ScrollScrubText } from '../components/KineticScrollText';
import { useI18n } from '../i18n/I18nContext';

export function VisionPage() {
  const { t } = useI18n();
  return (
    <div className="max-w-[1560px] mx-auto px-4 sm:px-6 lg:px-10 xl:px-12 py-14 space-y-24">
      {/* Manifesto Header — Full-Width 12-Column Balanced Composition */}
      <section className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-14 items-end">
        <div className="lg:col-span-8 space-y-5">
          <div className="inline-flex items-center gap-2 text-xs font-mono font-bold tracking-wider text-sky-700 dark:text-sky-300">
            <Compass className="w-4 h-4" /> {t.vision.badge}
          </div>
          <h1 className="font-display font-bold text-3xl sm:text-5xl text-black dark:text-white leading-[1.1] tracking-tight">
            {t.vision.title}
          </h1>
          <p className="text-base sm:text-lg text-slate-900 dark:text-white leading-relaxed max-w-3xl">
            <strong className="font-brand tracking-wider">KRONVEX</strong> is an independent engineering and applied intelligence organization founded by{' '}
            <strong>{ORG_META.founderName}</strong>. Our mission is straightforward:{' '}
            <em className="font-editorial italic rtl:not-italic text-xl sm:text-2xl text-emerald-700 dark:text-emerald-300">
              {ORG_META.tagline}
            </em>
          </p>
        </div>

        <div className="lg:col-span-4 lg:border-s border-slate-300/80 dark:border-slate-700/80 lg:ps-8 space-y-4 font-mono text-xs">
          <div>
            <div className="text-sky-600 dark:text-sky-400 font-bold">ARCHITECTURE</div>
            <div className="text-slate-900 dark:text-white mt-0.5">3 Core Pillars · 7-Node Matrix</div>
          </div>
          <div>
            <div className="text-emerald-600 dark:text-emerald-400 font-bold">SECURITY GOVERNANCE</div>
            <div className="text-slate-900 dark:text-white mt-0.5">48h Responsible Disclosure SLA</div>
          </div>
          <div>
            <div className="text-indigo-600 dark:text-indigo-400 font-bold">LEADERSHIP</div>
            <div className="text-slate-900 dark:text-white mt-0.5">{ORG_META.founderName} (@khalid-naami)</div>
          </div>
        </div>
      </section>

      {/* Strategic Goals — Open 3-Column Editorial Band */}
      <section className="grid grid-cols-1 md:grid-cols-3 gap-10">
        {[
          {
            icon: Target,
            accent: 'text-sky-600 dark:text-sky-400',
            title: 'Local-First Sovereignty',
            text: 'Software and AI models should empower users on their own hardware — fast, verifiable, private, and free from unnecessary cloud dependency.',
          },
          {
            icon: Zap,
            accent: 'text-emerald-600 dark:text-emerald-400',
            title: 'Signal Over Narrative',
            text: 'Across market intelligence and operational telemetry, we build deterministic pipelines that strip away noise and surface measurable reality.',
          },
          {
            icon: ShieldCheck,
            accent: 'text-indigo-600 dark:text-indigo-400',
            title: 'Production Discipline',
            text: 'Every release ships with explicit failure handling, SHA-256 verification, open governance, and rigorous automated evaluation.',
          },
        ].map((g, idx) => {
          const Icon = g.icon;
          return (
            <ScrollReveal key={g.title} delayMs={idx * 80}>
              <div className="pt-6 border-t border-slate-300/80 dark:border-slate-800 space-y-3">
                <Icon className={`w-5 h-5 ${g.accent}`} />
                <h2 className="font-display font-bold text-xl text-black dark:text-white">{g.title}</h2>
                <p className="text-sm text-slate-800 dark:text-white leading-relaxed">{g.text}</p>
              </div>
            </ScrollReveal>
          );
        })}
      </section>

      {/* Strategic Roadmap — Open Hairline Sequence */}
      <section id="roadmap" className="scroll-mt-24 space-y-10">
        <div>
          <span className="font-mono text-xs uppercase tracking-[0.2em] text-indigo-600 dark:text-indigo-400 font-semibold">
            {t.vision.roadmapLabel}
          </span>
          <ScrollScrubText
            as="h2"
            text={t.vision.roadmapTitle}
            className="font-display font-bold text-3xl text-black dark:text-white mt-2"
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-12">
          {KRONVEX_ROADMAP.map((phase, idx) => {
            const statusText =
              phase.status === 'completed'
                ? 'text-emerald-600 dark:text-emerald-400'
                : phase.status === 'active'
                ? 'text-sky-600 dark:text-sky-400'
                : 'text-slate-800 dark:text-slate-100';

            return (
              <ScrollReveal key={phase.phase} delayMs={idx * 70}>
                <div className="pt-6 border-t border-slate-300/80 dark:border-slate-800 space-y-4">
                  <div className="flex items-center justify-between gap-2 font-mono text-xs">
                    <span className="font-brand font-bold text-sky-600 dark:text-sky-400">
                      {phase.phase} · {phase.window}
                    </span>
                    <span className={`uppercase font-bold ${statusText}`}>● {phase.status}</span>
                  </div>
                  <h3 className="font-display font-bold text-xl sm:text-2xl text-black dark:text-white">
                    {phase.title}
                  </h3>
                  <p className="text-sm text-slate-800 dark:text-white leading-relaxed">{phase.summary}</p>
                  <ul className="space-y-2 pt-2">
                    {phase.milestones.map((m) => (
                      <li key={m} className="flex items-start gap-2.5 text-xs text-slate-800 dark:text-white">
                        {phase.status === 'completed' ? (
                          <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                        ) : (
                          <Clock className="w-4 h-4 text-sky-500 shrink-0 mt-0.5" />
                        )}
                        <span>{m}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </ScrollReveal>
            );
          })}
        </div>
      </section>

      {/* Core Divisions + Leadership — Open Split Layout */}
      <section
        id="leadership"
        className="scroll-mt-24 pt-12 border-t border-slate-300/80 dark:border-slate-800 grid grid-cols-1 lg:grid-cols-12 gap-12"
      >
        <div className="lg:col-span-7 space-y-6">
          <ScrollScrubText
            as="h2"
            text={t.vision.divisionsTitle}
            className="font-display font-bold text-2xl text-black dark:text-white"
          />
          <div className="divide-y divide-slate-300/70 dark:divide-slate-800/80">
            {KRONVEX_PILLARS.map((p) => (
              <div key={p.id} className="py-4 first:pt-0 space-y-1">
                <div className="font-mono text-xs text-sky-600 dark:text-sky-400 font-semibold">
                  {p.code} // {p.title}
                </div>
                <p className="text-sm text-slate-800 dark:text-white leading-relaxed">{p.description}</p>
              </div>
            ))}
          </div>
        </div>

        <div className="lg:col-span-5 lg:border-s border-slate-300/80 dark:border-slate-800 lg:ps-10 flex flex-col justify-between gap-8">
          <div className="space-y-3">
            <span className="font-mono text-xs text-emerald-600 dark:text-emerald-400 uppercase font-semibold">
              {t.vision.founderRole}
            </span>
            <h2 className="font-display font-bold text-2xl sm:text-3xl text-black dark:text-white">
              {ORG_META.founderName}
            </h2>
            <p className="text-sm text-slate-800 dark:text-white leading-relaxed">
              Software engineer, quantitative finance researcher, and systems architect leading KRONVEX across
              cross-platform applications, market intelligence, and mission-critical AI.
            </p>
          </div>
          <div className="space-y-3 pt-4 border-t border-slate-300/70 dark:border-slate-800/80">
            <a
              href={ORG_META.founderGithub}
              target="_blank"
              rel="noreferrer"
              className="group py-2 flex items-center justify-between text-sm font-semibold text-black dark:text-white hover:text-sky-600 dark:hover:text-sky-400 transition"
            >
              <span className="inline-flex items-center gap-2.5">
                <Github className="w-4 h-4 text-sky-500" /> @khalid-naami on GitHub
              </span>
              <ArrowUpRight className="w-4 h-4 opacity-70 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition" />
            </a>
            <a
              href={ORG_META.founderSite}
              target="_blank"
              rel="noreferrer"
              className="group py-2 flex items-center justify-between text-sm font-semibold text-black dark:text-white hover:text-sky-600 dark:hover:text-sky-400 transition"
            >
              <span className="inline-flex items-center gap-2.5">
                <Compass className="w-4 h-4 text-emerald-500" /> Research &amp; Personal Site (khalidnaami.com)
              </span>
              <ArrowUpRight className="w-4 h-4 opacity-70 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition" />
            </a>
            <a
              href={`mailto:${ORG_META.founderEmail}`}
              className="group py-2 flex items-center justify-between text-sm font-semibold text-black dark:text-white hover:text-indigo-600 dark:hover:text-indigo-400 transition"
            >
              <span className="inline-flex items-center gap-2.5">
                <Mail className="w-4 h-4 text-indigo-500" />
                <span dir="ltr">{ORG_META.founderEmail}</span>
              </span>
              <ArrowUpRight className="w-4 h-4 opacity-70 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition" />
            </a>
            <a
              href={`mailto:${ORG_META.contactEmail}`}
              className="group py-2 flex items-center justify-between text-sm font-semibold text-black dark:text-white hover:text-emerald-600 dark:hover:text-emerald-400 transition"
            >
              <span className="inline-flex items-center gap-2.5">
                <Mail className="w-4 h-4 text-emerald-500" />
                <span dir="ltr">{ORG_META.contactEmail}</span> (Official Org)
              </span>
              <ArrowUpRight className="w-4 h-4 opacity-70 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition" />
            </a>
          </div>
        </div>
      </section>
    </div>
  );
}

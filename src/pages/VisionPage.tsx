import { CheckCircle2, Clock, Compass, ExternalLink, Github, ShieldCheck, Target, Zap } from 'lucide-react';
import { NOVALIS_PILLARS, NOVALIS_ROADMAP, ORG_META } from '../data/catalog';

export function VisionPage() {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-16">
      {/* Manifesto Header */}
      <section className="space-y-5 max-w-4xl">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-mono bg-sky-500/10 text-sky-800 dark:text-sky-300 border border-sky-500/25">
          <Compass className="w-3.5 h-3.5" /> ORGANIZATION MANIFESTO &amp; STRATEGIC PLAN
        </div>
        <h1 className="font-display font-bold text-3xl sm:text-5xl text-black dark:text-white leading-tight">
          Built to Turn Real-World Complexity Into Enduring Systems.
        </h1>
        <p className="text-base sm:text-lg text-slate-900 dark:text-slate-100 leading-relaxed">
          <strong>NOVALIS</strong> is an independent engineering and applied intelligence organization founded
          by <strong>{ORG_META.founderName}</strong>. Our mission is straightforward: <em>{ORG_META.tagline}</em>
        </p>
      </section>

      {/* Strategic Goals */}
      <section className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {[
          {
            icon: Target,
            title: 'Local-First Sovereignty',
            text: 'Software and AI models should empower users on their own hardware — fast, verifiable, private, and free from unnecessary cloud dependency.',
          },
          {
            icon: Zap,
            title: 'Signal Over Narrative',
            text: 'Across market intelligence and operational telemetry, we build deterministic pipelines that strip away noise and surface measurable reality.',
          },
          {
            icon: ShieldCheck,
            title: 'Production Discipline',
            text: 'Every release ships with explicit failure handling, SHA-256 verification, open governance, and rigorous automated evaluation.',
          },
        ].map((g) => {
          const Icon = g.icon;
          return (
            <div key={g.title} className="rounded-2xl glass-panel p-6 space-y-3">
              <div className="p-2.5 rounded-xl bg-sky-500/10 text-sky-500 w-fit border border-sky-500/20">
                <Icon className="w-5 h-5" />
              </div>
              <h2 className="font-display font-bold text-xl text-black dark:text-white">{g.title}</h2>
              <p className="text-sm text-slate-900 dark:text-slate-100 leading-relaxed">{g.text}</p>
            </div>
          );
        })}
      </section>

      {/* Strategic Roadmap */}
      <section className="space-y-8">
        <div>
          <span className="font-mono text-xs uppercase tracking-widest text-indigo-400">Multi-Phase Execution</span>
          <h2 className="font-display font-bold text-3xl text-black dark:text-white mt-2">
            Strategic Roadmap
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {NOVALIS_ROADMAP.map((phase) => {
            const statusStyle =
              phase.status === 'completed'
                ? 'bg-emerald-500/15 text-emerald-500 border-emerald-500/30'
                : phase.status === 'active'
                ? 'bg-sky-500/15 text-sky-500 border-sky-500/30'
                : 'bg-slate-200/80 dark:bg-slate-800 text-slate-900 dark:text-slate-100 border-slate-300 dark:border-slate-700';

            return (
              <div key={phase.phase} className="rounded-2xl glass-panel p-6 sm:p-7 space-y-4">
                <div className="flex items-center justify-between gap-2">
                  <span className="font-mono text-xs font-bold text-sky-500">
                    {phase.phase} · {phase.window}
                  </span>
                  <span className={`px-2.5 py-0.5 rounded-full text-[11px] font-mono border uppercase ${statusStyle}`}>
                    {phase.status}
                  </span>
                </div>
                <h3 className="font-display font-bold text-xl text-black dark:text-white">{phase.title}</h3>
                <p className="text-sm text-slate-900 dark:text-slate-100 leading-relaxed">{phase.summary}</p>
                <ul className="space-y-2 pt-2 border-t border-slate-200 dark:border-slate-800">
                  {phase.milestones.map((m) => (
                    <li key={m} className="flex items-start gap-2 text-xs text-slate-950 dark:text-slate-100">
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
            );
          })}
        </div>
      </section>

      {/* Pillars Summary + Leadership */}
      <section className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <div className="lg:col-span-7 rounded-2xl glass-panel p-6 sm:p-8 space-y-4">
          <h2 className="font-display font-bold text-2xl text-black dark:text-white">Core Engineering Divisions</h2>
          <div className="space-y-4">
            {NOVALIS_PILLARS.map((p) => (
              <div key={p.id} className="p-4 rounded-xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800">
                <div className="font-mono text-xs text-sky-500 font-semibold">
                  {p.code} // {p.title}
                </div>
                <p className="text-xs text-slate-900 dark:text-slate-100 mt-1">{p.description}</p>
              </div>
            ))}
          </div>
        </div>

        <div className="lg:col-span-5 rounded-2xl glass-panel p-6 sm:p-8 flex flex-col justify-between gap-6">
          <div className="space-y-3">
            <span className="font-mono text-xs text-emerald-500 uppercase">Founder &amp; Lead Architect</span>
            <h2 className="font-display font-bold text-2xl text-black dark:text-white">{ORG_META.founderName}</h2>
            <p className="text-sm text-slate-900 dark:text-slate-100 leading-relaxed">
              Software engineer, quantitative finance researcher, and systems architect leading NOVALIS across
              cross-platform applications, market intelligence, and mission-critical AI.
            </p>
          </div>
          <div className="space-y-2.5">
            <a
              href={ORG_META.founderGithub}
              target="_blank"
              rel="noreferrer"
              className="w-full py-2.5 px-4 rounded-xl bg-slate-900 dark:bg-white text-white dark:text-slate-950 font-semibold text-xs inline-flex items-center justify-center gap-2 transition hover:opacity-90"
            >
              <Github className="w-4 h-4" /> @khalid-naami on GitHub <ExternalLink className="w-3.5 h-3.5" />
            </a>
            <a
              href={ORG_META.founderSite}
              target="_blank"
              rel="noreferrer"
              className="w-full py-2.5 px-4 rounded-xl bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-950 dark:text-white font-semibold text-xs inline-flex items-center justify-center gap-2 transition hover:border-sky-500/50"
            >
              Research &amp; Personal Site (khalidnaami.com) <ExternalLink className="w-3.5 h-3.5" />
            </a>
          </div>
        </div>
      </section>
    </div>
  );
}

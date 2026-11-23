import { useMemo, useState } from 'react';
import {
  ArrowUpRight,
  Check,
  Copy,
  Download,
  Monitor,
  ShieldCheck,
  Smartphone,
  Sparkles,
} from 'lucide-react';
import { KRONVEX_APPS } from '../data/catalog';
import { ScrollReveal, ScrollScrubText } from '../components/KineticScrollText';
import { useI18n } from '../i18n/I18nContext';
import type { DetectedHardware, PlatformType } from '../types/kronvex';

interface AppsPageProps {
  hardware: DetectedHardware;
}

export function AppsPage({ hardware }: AppsPageProps) {
  const { t } = useI18n();
  const [filter, setFilter] = useState<'all' | PlatformType>('all');
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const filteredApps = useMemo(() => {
    if (filter === 'all') return KRONVEX_APPS;
    return KRONVEX_APPS.filter((a) => a.platforms.includes(filter));
  }, [filter]);

  const copyHash = (id: string, text: string) => {
    navigator.clipboard?.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 1800);
  };

  const statusTone = (status: string) => {
    if (status === 'live') return 'text-emerald-600 dark:text-emerald-400';
    if (status === 'beta') return 'text-sky-600 dark:text-sky-400';
    if (status === 'early-access') return 'text-amber-600 dark:text-amber-400';
    return 'text-indigo-600 dark:text-indigo-400';
  };

  return (
    <div className="max-w-[1560px] mx-auto px-4 sm:px-6 lg:px-10 xl:px-12 py-14 space-y-12">
      {/* Header — Open Editorial */}
      <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-8">
        <div className="space-y-3 max-w-2xl">
          <div className="inline-flex items-center gap-2 text-xs font-mono font-semibold tracking-wider text-sky-700 dark:text-sky-300">
            <Sparkles className="w-4 h-4" /> {t.apps.badge}
          </div>
          <h1 className="font-display font-bold text-3xl sm:text-5xl text-black dark:text-white tracking-tight">
            {t.apps.title}
          </h1>
          <p className="text-base text-slate-800 dark:text-white leading-relaxed">{t.apps.subtitle}</p>
        </div>

        {/* Open Inline Auto-OS Telemetry (Zero Card Box) */}
        <div className="flex items-center gap-3 ps-4 border-s-2 border-emerald-500">
          {hardware.os === 'Android' ? (
            <Smartphone className="w-5 h-5 text-emerald-500 shrink-0" />
          ) : (
            <Monitor className="w-5 h-5 text-emerald-500 shrink-0" />
          )}
          <div>
            <div className="font-mono text-[10px] tracking-wider text-slate-800 dark:text-slate-100">
              {t.apps.detectedOs}
            </div>
            <div className="text-sm font-semibold text-black dark:text-white">
              {hardware.os} · {hardware.os === 'Android' ? 'APK' : 'Windows x64'}
            </div>
          </div>
        </div>
      </div>

      {/* Clean Minimalist Filter Bar */}
      <div className="flex flex-wrap items-center gap-6 border-b border-slate-300/80 dark:border-slate-800 pb-3">
        {[
          { id: 'all' as const, label: t.apps.allApps },
          { id: 'windows' as const, label: 'Windows (.EXE / .MSI)' },
          { id: 'android' as const, label: 'Android (.APK)' },
          { id: 'cross-platform' as const, label: t.apps.crossPlatform },
        ].map((tab) => (
          <button
            key={tab.id}
            type="button"
            onClick={() => setFilter(tab.id)}
            className={`pb-2 -mb-3.5 text-xs font-mono font-bold border-b-2 transition ${
              filter === tab.id
                ? 'border-sky-500 text-black dark:text-white'
                : 'border-transparent text-slate-800 dark:text-slate-100 hover:text-black dark:hover:text-white'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Open Release Directory (Hairline-Divided Sections — Zero Heavy Boxes) */}
      <div className="divide-y divide-slate-300/80 dark:divide-slate-800">
        {filteredApps.map((app, idx) => (
          <section key={app.id} className="py-10 first:pt-2 space-y-8">
            <div className="flex flex-col lg:flex-row lg:items-start justify-between gap-4">
              <div className="space-y-2.5 max-w-3xl">
                <div className="flex flex-wrap items-center gap-3 text-xs font-mono">
                  <span className={`font-bold uppercase ${statusTone(app.status)}`}>● {app.status}</span>
                  <span className="font-brand text-black dark:text-white font-semibold">{app.version}</span>
                  <span className="text-slate-800 dark:text-slate-100">
                    {app.pillar} · {app.license} · {app.releaseDate}
                  </span>
                </div>
                {idx === 0 ? (
                  <h2 className="font-display font-bold text-2xl sm:text-3xl text-black dark:text-white">{app.name}</h2>
                ) : (
                  <ScrollScrubText
                    as="h2"
                    text={app.name}
                    className="font-display font-bold text-2xl sm:text-3xl text-black dark:text-white"
                  />
                )}
                <p className="text-sm sm:text-base text-slate-800 dark:text-white leading-relaxed">
                  {app.description}
                </p>
              </div>
              <a
                href={app.repoUrl}
                target="_blank"
                rel="noreferrer"
                className="group text-sm font-semibold text-black dark:text-white hover:text-sky-600 dark:hover:text-sky-400 inline-flex items-center gap-1.5 shrink-0 transition"
              >
                <span>GitHub Releases</span>
                <ArrowUpRight className="w-4 h-4 opacity-70 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition" />
              </a>
            </div>

            <ScrollReveal delayMs={idx === 0 ? 0 : 60}>
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
              {/* Capabilities & System Requirements */}
              <div className="lg:col-span-5 space-y-6">
                <div>
                  <h3 className="font-mono text-[11px] font-bold uppercase tracking-wider text-slate-800 dark:text-slate-100 mb-3">
                    {t.apps.keyCapabilities}
                  </h3>
                  <ul className="space-y-2 text-sm text-slate-900 dark:text-slate-100">
                    {app.features.map((feat) => (
                      <li key={feat} className="flex items-start gap-2.5">
                        <span className="text-sky-500 font-bold">›</span>
                        <span>{feat}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="pt-4 border-t border-slate-300/70 dark:border-slate-800/80 space-y-1 text-xs font-mono text-slate-900 dark:text-white">
                  <div className="text-black dark:text-white font-semibold">{t.apps.systemReq}</div>
                  {app.requirements.windows && <div>WIN: {app.requirements.windows}</div>}
                  {app.requirements.android && <div>AND: {app.requirements.android}</div>}
                </div>
              </div>

              {/* Direct Download Artifact Rows */}
              <div className="lg:col-span-7 space-y-4">
                <h3 className="font-mono text-[11px] font-bold uppercase tracking-wider text-slate-800 dark:text-slate-100">
                  {t.apps.directArtifacts}
                </h3>
                <div className="divide-y divide-slate-300/70 dark:divide-slate-800/80 border-t border-b border-slate-300/70 dark:border-slate-800/80">
                  {app.artifacts.map((art) => {
                    const isRecommended =
                      (hardware.os === 'Windows' && art.platform === 'windows') ||
                      (hardware.os === 'Android' && art.platform === 'android');
                    const hashKey = `${app.id}-${art.label}`;
                    return (
                      <div
                        key={art.label}
                        className="py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                      >
                        <div className="space-y-0.5">
                          <div className="flex items-center gap-2 text-sm font-semibold text-black dark:text-white">
                            {art.platform === 'android' ? (
                              <Smartphone className="w-4 h-4 text-emerald-500 shrink-0" />
                            ) : (
                              <Monitor className="w-4 h-4 text-sky-500 shrink-0" />
                            )}
                            <span>{art.label}</span>
                            <span className="font-mono text-[11px] text-slate-800 dark:text-slate-100">
                              ({art.format})
                            </span>
                            {isRecommended && (
                              <span className="font-mono text-[11px] text-emerald-600 dark:text-emerald-400 font-bold">
                                · {t.apps.recommended}
                              </span>
                            )}
                          </div>
                          <div className="font-mono text-[11px] text-slate-800 dark:text-slate-100 ps-6">
                            {art.arch} · {art.size}
                          </div>
                        </div>

                        <div className="flex items-center gap-2 shrink-0">
                          <a
                            href={art.downloadUrl}
                            target="_blank"
                            rel="noreferrer"
                            className={`px-4 py-2 rounded-full text-xs font-semibold inline-flex items-center gap-1.5 transition ${
                              isRecommended
                                ? 'bg-sky-500 hover:bg-sky-400 text-slate-950 font-bold'
                                : 'border border-slate-300 dark:border-slate-700 text-black dark:text-white hover:border-sky-500'
                            }`}
                          >
                            <Download className="w-3.5 h-3.5" /> {t.apps.download} {art.format}
                          </a>
                          <button
                            type="button"
                            onClick={() => copyHash(hashKey, art.sha256)}
                            className="p-2 rounded-full border border-slate-300 dark:border-slate-700 text-slate-800 dark:text-white hover:border-sky-500 transition"
                            title={`Copy SHA-256: ${art.sha256}`}
                            aria-label={`Copy SHA-256 checksum for ${art.label}`}
                          >
                            {copiedId === hashKey ? (
                              <Check className="w-3.5 h-3.5 text-emerald-500" />
                            ) : (
                              <Copy className="w-3.5 h-3.5" />
                            )}
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
                <div className="text-[11px] font-mono text-slate-900 dark:text-white flex items-center gap-1.5">
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                  {t.apps.shaNotice}
                </div>
              </div>
              </div>
            </ScrollReveal>
          </section>
        ))}
      </div>
    </div>
  );
}

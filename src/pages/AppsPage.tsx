import { useMemo, useState } from 'react';
import {
  Check,
  Copy,
  Download,
  ExternalLink,
  Monitor,
  ShieldCheck,
  Smartphone,
  Sparkles,
} from 'lucide-react';
import { KRONVEX_APPS } from '../data/catalog';
import type { DetectedHardware, PlatformType } from '../types/kronvex';

interface AppsPageProps {
  hardware: DetectedHardware;
}

export function AppsPage({ hardware }: AppsPageProps) {
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

  const statusBadge = (status: string) => {
    if (status === 'live') return 'bg-emerald-500/15 text-emerald-500 border-emerald-500/30';
    if (status === 'beta') return 'bg-sky-500/15 text-sky-400 border-sky-500/30';
    if (status === 'early-access') return 'bg-amber-500/15 text-amber-400 border-amber-500/30';
    return 'bg-indigo-500/15 text-indigo-400 border-indigo-500/30';
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-10">
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6">
        <div className="space-y-3 max-w-2xl">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-mono bg-sky-500/10 text-sky-800 dark:text-sky-300 border border-sky-500/25">
            <Sparkles className="w-3.5 h-3.5" /> DIRECT DISTRIBUTION · GITHUB RELEASES CDN
          </div>
          <h1 className="font-display font-bold text-3xl sm:text-4xl text-black dark:text-white">
            Android &amp; Windows Applications
          </h1>
          <p className="text-slate-900 dark:text-slate-100">
            Native desktop installers (<code className="font-mono text-xs">.exe</code> /{' '}
            <code className="font-mono text-xs">.msi</code>) and signed Android packages (
            <code className="font-mono text-xs">.apk</code>) distributed directly with SHA-256 verification.
          </p>
        </div>

        {/* Auto-OS Banner */}
        <div className="glass-panel rounded-2xl px-4 py-3 flex items-center gap-3">
          <div className="p-2 rounded-xl bg-emerald-500/15 text-emerald-500">
            {hardware.os === 'Android' ? <Smartphone className="w-5 h-5" /> : <Monitor className="w-5 h-5" />}
          </div>
          <div>
            <div className="font-mono text-[10px] text-slate-800 dark:text-slate-200">AUTO-DETECTED CLIENT OS</div>
            <div className="text-sm font-semibold text-black dark:text-white">
              {hardware.os} · {hardware.os === 'Android' ? 'Showing APK Ready Builds' : 'Showing Windows x64 Builds'}
            </div>
          </div>
        </div>
      </div>

      {/* Filter Bar */}
      <div className="flex flex-wrap items-center gap-2">
        {[
          { id: 'all' as const, label: 'All Apps' },
          { id: 'windows' as const, label: 'Windows (.EXE / .MSI)' },
          { id: 'android' as const, label: 'Android (.APK)' },
          { id: 'cross-platform' as const, label: 'Cross-Platform' },
        ].map((tab) => (
          <button
            key={tab.id}
            type="button"
            onClick={() => setFilter(tab.id)}
            className={`px-4 py-2 rounded-xl text-xs font-mono font-semibold transition ${
              filter === tab.id
                ? 'bg-sky-500 text-slate-950 shadow-sm'
                : 'glass-panel text-slate-900 dark:text-slate-100 hover:border-sky-500/50'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* App Cards */}
      <div className="grid grid-cols-1 gap-6">
        {filteredApps.map((app) => (
          <div key={app.id} className="rounded-2xl glass-panel p-6 sm:p-8 space-y-6">
            <div className="flex flex-col lg:flex-row lg:items-start justify-between gap-4">
              <div className="space-y-2 max-w-3xl">
                <div className="flex flex-wrap items-center gap-2">
                  <span className={`px-2.5 py-0.5 rounded-full text-[11px] font-mono border uppercase ${statusBadge(app.status)}`}>
                    {app.status}
                  </span>
                  <span className="px-2.5 py-0.5 rounded-full text-[11px] font-mono bg-slate-100 dark:bg-slate-900 text-slate-900 dark:text-slate-100 border border-slate-200 dark:border-slate-800">
                    {app.version}
                  </span>
                  <span className="text-xs font-mono text-slate-800 dark:text-slate-200">
                    {app.pillar} · {app.license} · {app.releaseDate}
                  </span>
                </div>
                <h2 className="font-display font-bold text-2xl text-black dark:text-white">{app.name}</h2>
                <p className="text-sm text-slate-900 dark:text-slate-100 leading-relaxed">{app.description}</p>
              </div>
              <a
                href={app.repoUrl}
                target="_blank"
                rel="noreferrer"
                className="px-4 py-2 rounded-xl bg-slate-100 dark:bg-slate-900 hover:bg-slate-200 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-800 text-xs font-mono text-slate-950 dark:text-white inline-flex items-center gap-1.5 shrink-0 transition"
              >
                GitHub Releases <ExternalLink className="w-3.5 h-3.5" />
              </a>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 pt-2 border-t border-slate-200 dark:border-slate-800/80">
              {/* Features & Requirements */}
              <div className="lg:col-span-5 space-y-4">
                <div>
                  <h3 className="font-mono text-xs font-semibold uppercase tracking-wider text-slate-800 dark:text-slate-200 mb-2">
                    Key Capabilities
                  </h3>
                  <ul className="space-y-1.5 text-sm text-slate-950 dark:text-slate-100">
                    {app.features.map((feat) => (
                      <li key={feat} className="flex items-start gap-2">
                        <span className="text-sky-500 font-bold mt-0.5">›</span>
                        <span>{feat}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="p-3.5 rounded-xl bg-slate-100/80 dark:bg-slate-900/70 border border-slate-200 dark:border-slate-800 space-y-1.5 text-xs font-mono text-slate-900 dark:text-slate-100">
                  <div className="text-black dark:text-white font-semibold">System Requirements</div>
                  {app.requirements.windows && <div>WIN: {app.requirements.windows}</div>}
                  {app.requirements.android && <div>AND: {app.requirements.android}</div>}
                </div>
              </div>

              {/* Download Artifacts */}
              <div className="lg:col-span-7 space-y-3">
                <h3 className="font-mono text-xs font-semibold uppercase tracking-wider text-slate-800 dark:text-slate-200">
                  Direct Download Artifacts
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {app.artifacts.map((art) => {
                    const isRecommended =
                      (hardware.os === 'Windows' && art.platform === 'windows') ||
                      (hardware.os === 'Android' && art.platform === 'android');
                    const hashKey = `${app.id}-${art.label}`;
                    return (
                      <div
                        key={art.label}
                        className={`rounded-xl p-4 border transition flex flex-col justify-between gap-3 ${
                          isRecommended
                            ? 'bg-sky-500/5 border-sky-500/40'
                            : 'bg-slate-50 dark:bg-slate-900/60 border-slate-200 dark:border-slate-800'
                        }`}
                      >
                        <div className="space-y-1">
                          <div className="flex items-center justify-between gap-2">
                            <span className="inline-flex items-center gap-1.5 font-semibold text-sm text-black dark:text-white">
                              {art.platform === 'android' ? (
                                <Smartphone className="w-4 h-4 text-emerald-500" />
                              ) : (
                                <Monitor className="w-4 h-4 text-sky-500" />
                              )}
                              {art.label}
                            </span>
                            <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-slate-200 dark:bg-slate-800 text-slate-950 dark:text-white">
                              {art.format}
                            </span>
                          </div>
                          <div className="font-mono text-[11px] text-slate-800 dark:text-slate-200">
                            Arch: {art.arch} · Size: {art.size}
                            {isRecommended && <span className="ml-2 text-emerald-500 font-semibold">· Recommended</span>}
                          </div>
                        </div>

                        <div className="flex items-center gap-2">
                          <a
                            href={art.downloadUrl}
                            target="_blank"
                            rel="noreferrer"
                            className="flex-1 py-2 px-3 rounded-lg bg-sky-500 hover:bg-sky-400 text-slate-950 font-semibold text-xs inline-flex items-center justify-center gap-1.5 transition"
                          >
                            <Download className="w-3.5 h-3.5" /> Download {art.format}
                          </a>
                          <button
                            type="button"
                            onClick={() => copyHash(hashKey, art.sha256)}
                            className="p-2 rounded-lg bg-white dark:bg-slate-950 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-slate-100 hover:border-sky-500 transition"
                            title={`Copy SHA-256: ${art.sha256}`}
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
                <div className="text-[11px] font-mono text-slate-800 dark:text-slate-200 flex items-center gap-1.5">
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" />
                  All installers are hosted on GitHub Releases CDN — verified with SHA-256 checksums.
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

import { useMemo, useState } from 'react';
import {
  Check,
  Copy,
  Download,
  ExternalLink,
  Flame,
  GitFork,
  Github,
  Heart,
  Loader2,
  RefreshCw,
  Search,
  Sparkles,
  Star,
  TrendingUp,
} from 'lucide-react';
import staticIndex from '../data/live-index-21.json';

interface RankedGithubRepo {
  rank: number;
  fullName: string;
  name: string;
  owner: string;
  avatarUrl: string;
  description: string;
  url: string;
  stars: number;
  forks: number;
  language: string;
  topics: string[];
  createdAt: string;
  pushedAt: string;
}

interface RankedHfModel {
  rank: number;
  id: string;
  author: string;
  name: string;
  url: string;
  downloads: number;
  likes: number;
  trendingScore: number | null;
  pipelineTag: string;
  libraryName: string;
  lastModified: string;
}

interface Index21Payload {
  syncedAt: string;
  windowDays: number;
  sinceDate: string;
  live: boolean;
  githubWeekly: RankedGithubRepo[];
  githubAllTime: RankedGithubRepo[];
  hfTrendingWeekly: RankedHfModel[];
  hfMostDownloaded: RankedHfModel[];
}

function fmtCompact(n: number): string {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(2)}M`;
  if (n >= 1_000) return `${(n / 1_000).toFixed(1)}K`;
  return n.toLocaleString();
}

function getDateDaysAgo(days: number): string {
  return new Date(Date.now() - days * 24 * 60 * 60 * 1000).toISOString().slice(0, 10);
}

function rankStyle(rank: number): string {
  if (rank === 1) return 'bg-amber-400 text-black font-extrabold ring-2 ring-amber-300/60';
  if (rank === 2) return 'bg-slate-300 text-black font-extrabold';
  if (rank === 3) return 'bg-orange-400 text-black font-extrabold';
  return 'bg-slate-200 dark:bg-slate-800 text-black dark:text-white font-bold';
}

export function Index21Page() {
  const [data, setData] = useState<Index21Payload>(staticIndex as Index21Payload);
  const [sourceTab, setSourceTab] = useState<'github' | 'huggingface'>('github');
  const [ghMode, setGhMode] = useState<'weekly' | 'alltime'>('weekly');
  const [hfMode, setHfMode] = useState<'weekly' | 'downloads'>('weekly');
  const [query, setQuery] = useState('');
  const [selectedFilter, setSelectedFilter] = useState<string>('All');
  const [refreshing, setRefreshing] = useState(false);
  const [refreshStatus, setRefreshStatus] = useState<string | null>(null);
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  const activeGhList = ghMode === 'weekly' ? data.githubWeekly : data.githubAllTime;
  const activeHfList = hfMode === 'weekly' ? data.hfTrendingWeekly : data.hfMostDownloaded;

  const filterOptions = useMemo(() => {
    const counts = new Map<string, number>();
    if (sourceTab === 'github') {
      activeGhList.forEach((r) => counts.set(r.language, (counts.get(r.language) || 0) + 1));
    } else {
      activeHfList.forEach((m) => counts.set(m.pipelineTag, (counts.get(m.pipelineTag) || 0) + 1));
    }
    const sorted = Array.from(counts.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, 6)
      .map(([k]) => k);
    return ['All', ...sorted];
  }, [sourceTab, activeGhList, activeHfList]);

  const filteredGh = useMemo(() => {
    const q = query.trim().toLowerCase();
    return activeGhList.filter((r) => {
      const fOk = selectedFilter === 'All' || r.language === selectedFilter;
      const qOk =
        !q ||
        r.fullName.toLowerCase().includes(q) ||
        r.description.toLowerCase().includes(q) ||
        r.language.toLowerCase().includes(q) ||
        r.topics.some((t) => t.toLowerCase().includes(q));
      return fOk && qOk;
    });
  }, [activeGhList, query, selectedFilter]);

  const filteredHf = useMemo(() => {
    const q = query.trim().toLowerCase();
    return activeHfList.filter((m) => {
      const fOk = selectedFilter === 'All' || m.pipelineTag === selectedFilter;
      const qOk =
        !q ||
        m.id.toLowerCase().includes(q) ||
        m.pipelineTag.toLowerCase().includes(q) ||
        m.libraryName.toLowerCase().includes(q);
      return fOk && qOk;
    });
  }, [activeHfList, query, selectedFilter]);

  const maxGhStars = Math.max(activeGhList[0]?.stars || 1, 1);
  const maxHfMetric = Math.max(
    ...(activeHfList.map((m) => (hfMode === 'weekly' && m.trendingScore ? m.trendingScore : m.downloads)) || [1]),
    1
  );

  const copySnippet = (key: string, text: string) => {
    navigator.clipboard?.writeText(text);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 1600);
  };

  const handleLiveRefresh = async () => {
    setRefreshing(true);
    setRefreshStatus(null);
    const sinceDate = getDateDaysAgo(7);
    try {
      const [ghWRes, ghARes, hfWRes, hfDRes] = await Promise.allSettled([
        fetch(
          `https://api.github.com/search/repositories?q=${encodeURIComponent(`created:>=${sinceDate}`)}&sort=stars&order=desc&per_page=21`
        ).then((r) => (r.ok ? r.json() : Promise.reject(r.status))),
        fetch(
          `https://api.github.com/search/repositories?q=${encodeURIComponent('stars:>50000')}&sort=stars&order=desc&per_page=21`
        ).then((r) => (r.ok ? r.json() : Promise.reject(r.status))),
        fetch('https://huggingface.co/api/models?sort=trendingScore&direction=-1&limit=21').then((r) =>
          r.ok ? r.json() : Promise.reject(r.status)
        ),
        fetch('https://huggingface.co/api/models?sort=downloads&direction=-1&limit=21').then((r) =>
          r.ok ? r.json() : Promise.reject(r.status)
        ),
      ]);

      const next: Index21Payload = {
        ...data,
        syncedAt: new Date().toISOString(),
        sinceDate,
        live: true,
      };

      const mapGh = (r: Record<string, unknown>, idx: number): RankedGithubRepo => {
        const owner = (r.owner as Record<string, string>) || {};
        return {
          rank: idx + 1,
          fullName: String(r.full_name || ''),
          name: String(r.name || ''),
          owner: String(owner.login || ''),
          avatarUrl: String(owner.avatar_url || ''),
          description: String(r.description || 'No description provided.'),
          url: String(r.html_url || ''),
          stars: Number(r.stargazers_count || 0),
          forks: Number(r.forks_count || 0),
          language: String(r.language || 'Multi-Stack'),
          topics: Array.isArray(r.topics) ? (r.topics as string[]).slice(0, 4) : [],
          createdAt: String(r.created_at || ''),
          pushedAt: String(r.pushed_at || ''),
        };
      };

      const mapHf = (m: Record<string, unknown>, idx: number): RankedHfModel => {
        const id = String(m.id || m.modelId || '');
        const parts = id.split('/');
        return {
          rank: idx + 1,
          id,
          author: parts.length > 1 ? parts[0] : 'huggingface',
          name: parts.length > 1 ? parts.slice(1).join('/') : id,
          url: `https://huggingface.co/${id}`,
          downloads: Number(m.downloads || 0),
          likes: Number(m.likes || 0),
          trendingScore: typeof m.trendingScore === 'number' ? m.trendingScore : null,
          pipelineTag: String(m.pipeline_tag || 'general-ai'),
          libraryName: String(m.library_name || 'transformers'),
          lastModified: String(m.lastModified || ''),
        };
      };

      let updatedCount = 0;
      if (ghWRes.status === 'fulfilled' && Array.isArray(ghWRes.value?.items)) {
        next.githubWeekly = ghWRes.value.items.slice(0, 21).map(mapGh);
        updatedCount++;
      }
      if (ghARes.status === 'fulfilled' && Array.isArray(ghARes.value?.items)) {
        next.githubAllTime = ghARes.value.items.slice(0, 21).map(mapGh);
        updatedCount++;
      }
      if (hfWRes.status === 'fulfilled' && Array.isArray(hfWRes.value)) {
        next.hfTrendingWeekly = hfWRes.value.slice(0, 21).map(mapHf);
        updatedCount++;
      }
      if (hfDRes.status === 'fulfilled' && Array.isArray(hfDRes.value)) {
        next.hfMostDownloaded = hfDRes.value.slice(0, 21).map(mapHf);
        updatedCount++;
      }

      if (updatedCount > 0) {
        setData(next);
        setRefreshStatus(`Live API synced (${updatedCount}/4 feeds refreshed right now).`);
      } else {
        setRefreshStatus('Upstream APIs are temporarily rate-limited; displaying latest CI snapshot.');
      }
    } catch {
      setRefreshStatus('Could not reach live APIs; displaying latest verified CI snapshot.');
    } finally {
      setRefreshing(false);
    }
  };

  const totalWeeklyStars = data.githubWeekly.reduce((acc, r) => acc + r.stars, 0);
  const totalHfDownloads = data.hfMostDownloaded.reduce((acc, m) => acc + m.downloads, 0);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-10">
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6">
        <div className="space-y-3 max-w-3xl">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-mono font-semibold bg-amber-500/15 text-amber-900 dark:text-amber-300 border border-amber-500/30">
            <Flame className="w-3.5 h-3.5" /> TOP 21 (3 PILLARS × 7 NODES) · WEEKLY LIVE LEADERBOARD
          </div>
          <h1 className="font-display font-bold text-3xl sm:text-4xl text-black dark:text-white">
            Top 21 — Weekly GitHub &amp; Hugging Face
          </h1>
          <p className="text-slate-900 dark:text-slate-100 leading-relaxed">
            Real-time open-source radar tracking the <strong>Top 21 highest-starred GitHub repositories of the week</strong>{' '}
            and the <strong>Top 21 trending &amp; most-downloaded Hugging Face AI models</strong> — auto-refreshed every 6 hours
            with on-demand live browser sync.
          </p>
        </div>

        <div className="flex flex-col items-start lg:items-end gap-2">
          <button
            type="button"
            onClick={handleLiveRefresh}
            disabled={refreshing}
            className="px-4 py-2.5 rounded-xl bg-sky-500 hover:bg-sky-400 disabled:opacity-60 text-black font-bold text-xs inline-flex items-center gap-2 shadow-sm transition"
          >
            {refreshing ? <Loader2 className="w-4 h-4 animate-spin" /> : <RefreshCw className="w-4 h-4" />}
            {refreshing ? 'Refreshing Live APIs...' : 'Refresh Live Now'}
          </button>
          <span className="font-mono text-[11px] text-slate-800 dark:text-slate-200">
            7-Day Window: Since {data.sinceDate} · Synced {data.syncedAt.slice(0, 16).replace('T', ' ')} UTC
          </span>
        </div>
      </div>

      {refreshStatus && (
        <div className="px-4 py-2.5 rounded-xl text-xs font-mono bg-emerald-500/15 text-emerald-900 dark:text-emerald-200 border border-emerald-500/30">
          {refreshStatus}
        </div>
      )}

      {/* Executive Summary KPI Strip */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="glass-panel rounded-2xl p-4 space-y-1">
          <div className="font-mono text-[10px] font-semibold text-slate-800 dark:text-slate-200">
            #1 GITHUB BREAKOUT (7D)
          </div>
          <div className="font-display font-bold text-base text-black dark:text-white truncate">
            {data.githubWeekly[0]?.fullName || 'Syncing...'}
          </div>
          <div className="font-mono text-xs text-amber-700 dark:text-amber-300 font-semibold">
            ★ {fmtCompact(data.githubWeekly[0]?.stars || 0)} stars this week
          </div>
        </div>

        <div className="glass-panel rounded-2xl p-4 space-y-1">
          <div className="font-mono text-[10px] font-semibold text-slate-800 dark:text-slate-200">
            #1 HUGGING FACE TRENDING (7D)
          </div>
          <div className="font-display font-bold text-base text-black dark:text-white truncate">
            {data.hfTrendingWeekly[0]?.id || 'Syncing...'}
          </div>
          <div className="font-mono text-xs text-emerald-700 dark:text-emerald-300 font-semibold">
            ↓ {fmtCompact(data.hfTrendingWeekly[0]?.downloads || 0)} downloads · ♥ {fmtCompact(data.hfTrendingWeekly[0]?.likes || 0)}
          </div>
        </div>

        <div className="glass-panel rounded-2xl p-4 space-y-1">
          <div className="font-mono text-[10px] font-semibold text-slate-800 dark:text-slate-200">
            WEEKLY TOP 21 GITHUB STARS
          </div>
          <div className="font-mono font-extrabold text-2xl text-sky-700 dark:text-sky-300">
            {fmtCompact(totalWeeklyStars)}
          </div>
          <div className="font-mono text-[11px] text-slate-800 dark:text-slate-200">Combined 7-day breakout stars</div>
        </div>

        <div className="glass-panel rounded-2xl p-4 space-y-1">
          <div className="font-mono text-[10px] font-semibold text-slate-800 dark:text-slate-200">
            TOP 21 HF AI DOWNLOADS (30D)
          </div>
          <div className="font-mono font-extrabold text-2xl text-indigo-700 dark:text-indigo-300">
            {fmtCompact(totalHfDownloads)}
          </div>
          <div className="font-mono text-[11px] text-slate-800 dark:text-slate-200">Across top 21 downloaded models</div>
        </div>
      </div>

      {/* Primary Source Tabs & Sub-Toggles */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 border-b border-slate-300 dark:border-slate-800 pb-4">
        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={() => {
              setSourceTab('github');
              setSelectedFilter('All');
              setQuery('');
            }}
            className={`px-5 py-2.5 rounded-xl text-sm font-bold inline-flex items-center gap-2 transition ${
              sourceTab === 'github'
                ? 'bg-sky-500 text-black shadow-sm'
                : 'glass-panel text-black dark:text-white hover:border-sky-500'
            }`}
          >
            <Github className="w-4 h-4" /> Top 21 GitHub Projects
          </button>

          <button
            type="button"
            onClick={() => {
              setSourceTab('huggingface');
              setSelectedFilter('All');
              setQuery('');
            }}
            className={`px-5 py-2.5 rounded-xl text-sm font-bold inline-flex items-center gap-2 transition ${
              sourceTab === 'huggingface'
                ? 'bg-amber-400 text-black shadow-sm'
                : 'glass-panel text-black dark:text-white hover:border-amber-400'
            }`}
          >
            <Sparkles className="w-4 h-4" /> Top 21 Hugging Face AI
          </button>
        </div>

        {/* Timeframe / Mode Switcher */}
        <div className="flex flex-wrap items-center gap-2">
          {sourceTab === 'github' ? (
            <>
              <button
                type="button"
                onClick={() => {
                  setGhMode('weekly');
                  setSelectedFilter('All');
                }}
                className={`px-3.5 py-1.5 rounded-lg text-xs font-mono font-bold inline-flex items-center gap-1.5 transition ${
                  ghMode === 'weekly'
                    ? 'bg-emerald-500 text-black'
                    : 'glass-panel text-black dark:text-white hover:border-emerald-500'
                }`}
              >
                <TrendingUp className="w-3.5 h-3.5" /> This Week (7D Breakout)
              </button>
              <button
                type="button"
                onClick={() => {
                  setGhMode('alltime');
                  setSelectedFilter('All');
                }}
                className={`px-3.5 py-1.5 rounded-lg text-xs font-mono font-bold inline-flex items-center gap-1.5 transition ${
                  ghMode === 'alltime'
                    ? 'bg-indigo-500 text-white'
                    : 'glass-panel text-black dark:text-white hover:border-indigo-500'
                }`}
              >
                <Star className="w-3.5 h-3.5" /> All-Time Leaders
              </button>
            </>
          ) : (
            <>
              <button
                type="button"
                onClick={() => {
                  setHfMode('weekly');
                  setSelectedFilter('All');
                }}
                className={`px-3.5 py-1.5 rounded-lg text-xs font-mono font-bold inline-flex items-center gap-1.5 transition ${
                  hfMode === 'weekly'
                    ? 'bg-emerald-500 text-black'
                    : 'glass-panel text-black dark:text-white hover:border-emerald-500'
                }`}
              >
                <Flame className="w-3.5 h-3.5" /> Trending This Week
              </button>
              <button
                type="button"
                onClick={() => {
                  setHfMode('downloads');
                  setSelectedFilter('All');
                }}
                className={`px-3.5 py-1.5 rounded-lg text-xs font-mono font-bold inline-flex items-center gap-1.5 transition ${
                  hfMode === 'downloads'
                    ? 'bg-indigo-500 text-white'
                    : 'glass-panel text-black dark:text-white hover:border-indigo-500'
                }`}
              >
                <Download className="w-3.5 h-3.5" /> Highest Downloads
              </button>
            </>
          )}
        </div>
      </div>

      {/* Search & Filter Pills */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex flex-wrap items-center gap-2">
          {filterOptions.map((opt) => (
            <button
              key={opt}
              type="button"
              onClick={() => setSelectedFilter(opt)}
              className={`px-3 py-1 rounded-lg text-xs font-mono font-semibold transition ${
                selectedFilter === opt
                  ? 'bg-black dark:bg-white text-white dark:text-black'
                  : 'glass-panel text-slate-900 dark:text-slate-100 hover:border-sky-500'
              }`}
            >
              {opt}
            </button>
          ))}
        </div>

        <div className="relative w-full md:w-72">
          <Search className="w-4 h-4 text-slate-700 dark:text-slate-200 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder={sourceTab === 'github' ? 'Filter repos or language...' : 'Filter models or task...'}
            className="w-full pl-10 pr-4 py-2 rounded-xl glass-panel text-sm text-black dark:text-white placeholder-slate-600 dark:placeholder-slate-300 focus:outline-none focus:border-sky-500"
          />
        </div>
      </div>

      {/* Leaderboard List */}
      {sourceTab === 'github' ? (
        <div className="grid grid-cols-1 gap-4">
          {filteredGh.map((repo) => {
            const pct = Math.max(4, Math.round((repo.stars / maxGhStars) * 100));
            const cloneCmd = `git clone ${repo.url}.git`;
            return (
              <div
                key={repo.fullName}
                className="rounded-2xl glass-panel p-5 overflow-hidden hover:border-sky-500/60 transition flex flex-col lg:flex-row lg:items-center justify-between gap-4"
              >
                <div className="flex items-start gap-3 sm:gap-4 min-w-0 flex-1">
                  <div
                    className={`w-10 h-10 rounded-xl flex items-center justify-center font-mono text-xs shrink-0 ${rankStyle(
                      repo.rank
                    )}`}
                  >
                    #{String(repo.rank).padStart(2, '0')}
                  </div>

                  <div className="min-w-0 flex-1 space-y-1.5">
                    <div className="flex flex-wrap items-center gap-2 min-w-0 max-w-full">
                      <a
                        href={repo.url}
                        target="_blank"
                        rel="noreferrer"
                        className="font-display font-bold text-base sm:text-lg text-black dark:text-white hover:text-sky-600 dark:hover:text-sky-300 max-w-full min-w-0 inline-flex items-center gap-1.5"
                      >
                        <span className="truncate">{repo.fullName}</span>
                        <ExternalLink className="w-3.5 h-3.5 shrink-0 opacity-70" />
                      </a>
                      <span className="px-2 py-0.5 rounded text-[11px] font-mono font-semibold bg-sky-500/15 text-sky-900 dark:text-sky-200 border border-sky-500/30 shrink-0">
                        {repo.language}
                      </span>
                    </div>

                    <p className="text-sm text-slate-900 dark:text-slate-100 line-clamp-2 break-words">{repo.description}</p>

                    <div className="flex flex-wrap items-center gap-2 pt-1">
                      {repo.topics.map((t) => (
                        <span
                          key={t}
                          className="px-2 py-0.5 rounded text-[10px] font-mono bg-slate-200/80 dark:bg-slate-800 text-slate-900 dark:text-slate-100"
                        >
                          #{t}
                        </span>
                      ))}
                      {repo.createdAt && (
                        <span className="font-mono text-[10px] text-slate-800 dark:text-slate-200">
                          Created {repo.createdAt.slice(0, 10)}
                        </span>
                      )}
                    </div>

                    {/* Relative momentum bar */}
                    <div className="h-1.5 w-full max-w-md rounded-full bg-slate-200 dark:bg-slate-800 overflow-hidden mt-2">
                      <div
                        className="h-full rounded-full bg-gradient-to-r from-sky-500 to-indigo-500"
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                  </div>
                </div>

                <div className="flex flex-wrap lg:flex-col items-center lg:items-end justify-between gap-2 shrink-0">
                  <div className="flex items-center gap-3 font-mono text-sm">
                    <span className="inline-flex items-center gap-1 font-bold text-amber-700 dark:text-amber-300">
                      <Star className="w-4 h-4 fill-current" /> {fmtCompact(repo.stars)}
                    </span>
                    <span className="inline-flex items-center gap-1 text-slate-900 dark:text-slate-100">
                      <GitFork className="w-3.5 h-3.5" /> {fmtCompact(repo.forks)}
                    </span>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => copySnippet(`gh-${repo.fullName}`, cloneCmd)}
                      className="px-3 py-1.5 rounded-lg bg-slate-100 dark:bg-slate-900 border border-slate-300 dark:border-slate-700 text-xs font-mono font-semibold text-black dark:text-white hover:border-sky-500 inline-flex items-center gap-1.5 transition"
                      title={cloneCmd}
                    >
                      {copiedKey === `gh-${repo.fullName}` ? (
                        <Check className="w-3.5 h-3.5 text-emerald-500" />
                      ) : (
                        <Copy className="w-3.5 h-3.5" />
                      )}
                      {copiedKey === `gh-${repo.fullName}` ? 'Copied!' : 'git clone'}
                    </button>
                    <a
                      href={repo.url}
                      target="_blank"
                      rel="noreferrer"
                      className="px-3 py-1.5 rounded-lg bg-sky-500 hover:bg-sky-400 text-black font-bold text-xs inline-flex items-center gap-1 transition"
                    >
                      Open <ExternalLink className="w-3 h-3" />
                    </a>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4">
          {filteredHf.map((model) => {
            const metricVal = hfMode === 'weekly' && model.trendingScore ? model.trendingScore : model.downloads;
            const pct = Math.max(4, Math.round((metricVal / maxHfMetric) * 100));
            const pullCmd = `huggingface-cli download ${model.id}`;
            return (
              <div
                key={model.id}
                className="rounded-2xl glass-panel p-5 overflow-hidden hover:border-amber-400/60 transition flex flex-col lg:flex-row lg:items-center justify-between gap-4"
              >
                <div className="flex items-start gap-3 sm:gap-4 min-w-0 flex-1">
                  <div
                    className={`w-10 h-10 rounded-xl flex items-center justify-center font-mono text-xs shrink-0 ${rankStyle(
                      model.rank
                    )}`}
                  >
                    #{String(model.rank).padStart(2, '0')}
                  </div>

                  <div className="min-w-0 flex-1 space-y-1.5">
                    <div className="flex flex-wrap items-center gap-2 min-w-0 max-w-full">
                      <a
                        href={model.url}
                        target="_blank"
                        rel="noreferrer"
                        className="font-display font-bold text-base sm:text-lg text-black dark:text-white hover:text-amber-600 dark:hover:text-amber-300 max-w-full min-w-0 inline-flex items-center gap-1.5"
                      >
                        <span className="truncate">{model.id}</span>
                        <ExternalLink className="w-3.5 h-3.5 shrink-0 opacity-70" />
                      </a>
                      <span className="px-2 py-0.5 rounded text-[11px] font-mono font-semibold bg-amber-500/15 text-amber-900 dark:text-amber-200 border border-amber-500/30 shrink-0">
                        {model.pipelineTag}
                      </span>
                      <span className="px-2 py-0.5 rounded text-[11px] font-mono bg-slate-200/80 dark:bg-slate-800 text-slate-900 dark:text-slate-100 shrink-0">
                        {model.libraryName}
                      </span>
                    </div>

                    <div className="font-mono text-xs text-slate-800 dark:text-slate-200">
                      Author: <strong>{model.author}</strong>
                      {model.trendingScore !== null && (
                        <span className="ml-3 text-emerald-700 dark:text-emerald-300 font-semibold">
                          Weekly Trend Score: {model.trendingScore.toFixed(0)}
                        </span>
                      )}
                    </div>

                    <div className="h-1.5 w-full max-w-md rounded-full bg-slate-200 dark:bg-slate-800 overflow-hidden mt-2">
                      <div
                        className="h-full rounded-full bg-gradient-to-r from-amber-400 to-emerald-400"
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                  </div>
                </div>

                <div className="flex flex-wrap lg:flex-col items-center lg:items-end justify-between gap-2 shrink-0">
                  <div className="flex items-center gap-3 font-mono text-sm">
                    <span className="inline-flex items-center gap-1 font-bold text-emerald-700 dark:text-emerald-300">
                      <Download className="w-4 h-4" /> {fmtCompact(model.downloads)}
                    </span>
                    <span className="inline-flex items-center gap-1 text-rose-700 dark:text-rose-300 font-semibold">
                      <Heart className="w-3.5 h-3.5" /> {fmtCompact(model.likes)}
                    </span>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => copySnippet(`hf-${model.id}`, pullCmd)}
                      className="px-3 py-1.5 rounded-lg bg-slate-100 dark:bg-slate-900 border border-slate-300 dark:border-slate-700 text-xs font-mono font-semibold text-black dark:text-white hover:border-amber-400 inline-flex items-center gap-1.5 transition"
                      title={pullCmd}
                    >
                      {copiedKey === `hf-${model.id}` ? (
                        <Check className="w-3.5 h-3.5 text-emerald-500" />
                      ) : (
                        <Copy className="w-3.5 h-3.5" />
                      )}
                      {copiedKey === `hf-${model.id}` ? 'Copied!' : 'HF CLI'}
                    </button>
                    <a
                      href={model.url}
                      target="_blank"
                      rel="noreferrer"
                      className="px-3 py-1.5 rounded-lg bg-amber-400 hover:bg-amber-300 text-black font-bold text-xs inline-flex items-center gap-1 transition"
                    >
                      Hugging Face <ExternalLink className="w-3 h-3" />
                    </a>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

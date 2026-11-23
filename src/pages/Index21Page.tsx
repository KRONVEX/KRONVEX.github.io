import { useEffect, useMemo, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import {
  ArrowUp,
  Award,
  BookOpen,
  Building2,
  Check,
  Code2,
  Copy,
  Download,
  ExternalLink,
  FileText,
  Flame,
  GitFork,
  Github,
  Heart,
  Loader2,
  Radio,
  RefreshCw,
  Search,
  Sparkles,
  Star,
  TrendingUp,
  Zap,
} from 'lucide-react';
import staticIndex from '../data/live-index-21.json';
import {
  LANDMARK_RESEARCH_PAPERS,
  RESEARCH_DOMAIN_FILTERS,
  RESEARCH_LAB_FILTERS,
  formatPaperBibtex,
} from '../data/researchPapers';
import { ScrollReveal } from '../components/KineticScrollText';
import { useI18n } from '../i18n/I18nContext';

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
  downloads?: number;
  latestTag?: string;
  releaseCount?: number;
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
  downloadsAllTime?: number | null;
  likes: number;
  trendingScore: number | null;
  pipelineTag: string;
  libraryName: string;
  lastModified: string;
}

interface RankedDailyPaper {
  rank: number;
  arxivId: string;
  title: string;
  summary: string;
  authors: string;
  organization: string;
  keywords: string[];
  upvotes: number;
  publishedAt: string;
  arxivUrl: string;
  pdfUrl: string;
  hfUrl: string;
  githubRepo: string;
}

interface RankedLiveArxivPaper {
  rank: number;
  arxivId: string;
  title: string;
  summary: string;
  authors: string;
  lab: string;
  domain: string;
  categories: string[];
  publishedAt: string;
  arxivUrl: string;
  pdfUrl: string;
}

interface Index21Payload {
  syncedAt: string;
  windowDays: number;
  sinceDate: string;
  live: boolean;
  githubWeekly: RankedGithubRepo[];
  githubAllTime: RankedGithubRepo[];
  githubMostDownloaded?: RankedGithubRepo[];
  hfTrendingWeekly: RankedHfModel[];
  hfMostDownloaded: RankedHfModel[];
  hfAllTimeDownloaded?: RankedHfModel[];
  hfDailyPapers?: RankedDailyPaper[];
  techGiantsLivePapers?: RankedLiveArxivPaper[];
}

export interface Index21PageProps {
  defaultTab?: 'github' | 'huggingface' | 'papers';
}

function fmtCompact(n: number): string {
  if (n >= 1_000_000_000) return `${(n / 1_000_000_000).toFixed(2)}B`;
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

export function Index21Page({ defaultTab = 'github' }: Index21PageProps = {}) {
  const { t } = useI18n();
  const [searchParams, setSearchParams] = useSearchParams();
  const urlTab = searchParams.get('tab');
  const resolveTab = (raw: string | null, fallback: 'github' | 'huggingface' | 'papers') =>
    raw === 'papers' || raw === 'github' || raw === 'huggingface' ? raw : fallback;

  const [data, setData] = useState<Index21Payload>(staticIndex as Index21Payload);
  const [sourceTab, setSourceTab] = useState<'github' | 'huggingface' | 'papers'>(() =>
    resolveTab(urlTab, defaultTab)
  );
  const [ghMode, setGhMode] = useState<'weekly' | 'alltime' | 'downloads'>('weekly');
  const [hfMode, setHfMode] = useState<'weekly' | 'downloads' | 'alltime'>('weekly');
  const [paperMode, setPaperMode] = useState<'giants' | 'liveGiants' | 'daily'>(() => {
    const m = searchParams.get('mode');
    if (m === 'daily') return 'daily';
    if (m === 'live') return 'liveGiants';
    return 'giants';
  });
  const [query, setQuery] = useState('');
  const [selectedFilter, setSelectedFilter] = useState<string>('All');
  const [selectedDomain, setSelectedDomain] = useState<string>('All');
  const [refreshing, setRefreshing] = useState(false);
  const [refreshStatus, setRefreshStatus] = useState<string | null>(null);
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  useEffect(() => {
    const nextTab = resolveTab(urlTab, defaultTab);
    setSourceTab(nextTab);
    setSelectedFilter('All');
    setSelectedDomain('All');
    setQuery('');
  }, [urlTab, defaultTab]);

  const switchSourceTab = (next: 'github' | 'huggingface' | 'papers') => {
    setSourceTab(next);
    setSelectedFilter('All');
    setSelectedDomain('All');
    setQuery('');
    if (searchParams.has('tab')) {
      const updated = new URLSearchParams(searchParams);
      updated.set('tab', next);
      setSearchParams(updated, { replace: true });
    }
  };

  const ghDownloadsList = data.githubMostDownloaded || [];
  const hfAllTimeList = data.hfAllTimeDownloaded || [];
  const dailyPapersList = data.hfDailyPapers || [];
  const liveArxivPapersList = data.techGiantsLivePapers || [];

  const activeGhList =
    ghMode === 'weekly'
      ? data.githubWeekly
      : ghMode === 'alltime'
      ? data.githubAllTime
      : ghDownloadsList;

  const activeHfList =
    hfMode === 'weekly'
      ? data.hfTrendingWeekly
      : hfMode === 'downloads'
      ? data.hfMostDownloaded
      : hfAllTimeList;

  const filterOptions = useMemo(() => {
    if (sourceTab === 'papers') {
      if (paperMode === 'giants') {
        return ['All', ...RESEARCH_LAB_FILTERS];
      }
      if (paperMode === 'liveGiants') {
        return ['All', ...RESEARCH_DOMAIN_FILTERS];
      }
      const orgCounts = new Map<string, number>();
      dailyPapersList.forEach((p) => {
        if (p.organization) {
          orgCounts.set(p.organization, (orgCounts.get(p.organization) || 0) + 1);
        }
      });
      const topOrgs = Array.from(orgCounts.entries())
        .sort((a, b) => b[1] - a[1])
        .slice(0, 5)
        .map(([k]) => k);
      return ['All', 'With Code', ...topOrgs];
    }
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
  }, [sourceTab, paperMode, activeGhList, activeHfList, dailyPapersList]);

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

  const filteredGiantPapers = useMemo(() => {
    const q = query.trim().toLowerCase();
    return LANDMARK_RESEARCH_PAPERS.filter((p) => {
      const labOk = selectedFilter === 'All' || p.labGroup === selectedFilter;
      const domOk = selectedDomain === 'All' || p.domain === selectedDomain;
      const qOk =
        !q ||
        p.title.toLowerCase().includes(q) ||
        p.breakthrough.toLowerCase().includes(q) ||
        p.lab.toLowerCase().includes(q) ||
        p.labGroup.toLowerCase().includes(q) ||
        p.domain.toLowerCase().includes(q) ||
        p.category.toLowerCase().includes(q) ||
        p.authors.toLowerCase().includes(q) ||
        p.summary.toLowerCase().includes(q) ||
        p.arxivId.toLowerCase().includes(q);
      return labOk && domOk && qOk;
    });
  }, [query, selectedFilter, selectedDomain]);

  const filteredLiveArxivPapers = useMemo(() => {
    const q = query.trim().toLowerCase();
    return liveArxivPapersList.filter((p) => {
      const domOk = selectedFilter === 'All' || p.domain === selectedFilter;
      const qOk =
        !q ||
        p.title.toLowerCase().includes(q) ||
        p.summary.toLowerCase().includes(q) ||
        p.authors.toLowerCase().includes(q) ||
        p.domain.toLowerCase().includes(q) ||
        p.categories.some((c) => c.toLowerCase().includes(q)) ||
        p.arxivId.toLowerCase().includes(q);
      return domOk && qOk;
    });
  }, [liveArxivPapersList, query, selectedFilter]);

  const filteredDailyPapers = useMemo(() => {
    const q = query.trim().toLowerCase();
    return dailyPapersList.filter((p) => {
      const fOk =
        selectedFilter === 'All' ||
        (selectedFilter === 'With Code' ? Boolean(p.githubRepo) : p.organization === selectedFilter);
      const qOk =
        !q ||
        p.title.toLowerCase().includes(q) ||
        p.summary.toLowerCase().includes(q) ||
        p.authors.toLowerCase().includes(q) ||
        p.organization.toLowerCase().includes(q) ||
        p.arxivId.toLowerCase().includes(q) ||
        p.keywords.some((k) => k.toLowerCase().includes(q));
      return fOk && qOk;
    });
  }, [dailyPapersList, query, selectedFilter]);

  const maxGhMetric = Math.max(
    ...(activeGhList.map((r) => (ghMode === 'downloads' ? r.downloads || 0 : r.stars)) || [1]),
    1
  );

  const maxHfMetric = Math.max(
    ...(activeHfList.map((m) =>
      hfMode === 'weekly' && m.trendingScore
        ? m.trendingScore
        : hfMode === 'alltime' && m.downloadsAllTime
        ? m.downloadsAllTime
        : m.downloads
    ) || [1]),
    1
  );

  const maxDailyPaperUpvotes = Math.max(...(dailyPapersList.map((p) => p.upvotes || 0) || [1]), 1);

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
      const expandParams =
        'expand[]=downloads&expand[]=downloadsAllTime&expand[]=likes&expand[]=trendingScore&expand[]=pipeline_tag&expand[]=library_name&expand[]=lastModified';
      const [ghWRes, ghARes, hfWRes, hfDRes, hfPRes] = await Promise.allSettled([
        fetch(
          `https://api.github.com/search/repositories?q=${encodeURIComponent(`created:>=${sinceDate}`)}&sort=stars&order=desc&per_page=21`
        ).then((r) => (r.ok ? r.json() : Promise.reject(r.status))),
        fetch(
          `https://api.github.com/search/repositories?q=${encodeURIComponent('stars:>50000')}&sort=stars&order=desc&per_page=21`
        ).then((r) => (r.ok ? r.json() : Promise.reject(r.status))),
        fetch('https://huggingface.co/api/models?sort=trendingScore&direction=-1&limit=21').then((r) =>
          r.ok ? r.json() : Promise.reject(r.status)
        ),
        fetch(`https://huggingface.co/api/models?sort=downloads&direction=-1&limit=35&${expandParams}`).then((r) =>
          r.ok ? r.json() : Promise.reject(r.status)
        ),
        fetch('https://huggingface.co/api/daily_papers?limit=21').then((r) =>
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
          downloadsAllTime: typeof m.downloadsAllTime === 'number' ? m.downloadsAllTime : null,
          likes: Number(m.likes || 0),
          trendingScore: typeof m.trendingScore === 'number' ? m.trendingScore : null,
          pipelineTag: String(m.pipeline_tag || 'general-ai'),
          libraryName: String(m.library_name || 'transformers'),
          lastModified: String(m.lastModified || ''),
        };
      };

      const mapDailyPaper = (item: Record<string, unknown>, idx: number): RankedDailyPaper => {
        const paper = (item.paper as Record<string, unknown>) || item;
        const arxivId = String(paper.id || item.id || '').trim();
        const rawTitle = String(item.title || paper.title || 'Untitled Research Paper')
          .replace(/\s+/g, ' ')
          .trim();
        const rawSummary = String(paper.ai_summary || item.summary || paper.summary || '')
          .replace(/\s+/g, ' ')
          .trim();
        const rawAuthors = Array.isArray(paper.authors) ? paper.authors : [];
        const authorNames = rawAuthors
          .map((a) => {
            if (typeof a === 'string') return a;
            const ao = a as Record<string, unknown>;
            const u = ao.user as Record<string, unknown> | undefined;
            return String(ao.name || u?.fullname || '');
          })
          .filter(Boolean);
        const authors =
          authorNames.length > 4
            ? `${authorNames.slice(0, 4).join(', ')} et al.`
            : authorNames.join(', ') || 'Research Team';
        const orgObj = (item.organization || paper.organization) as Record<string, unknown> | undefined;
        const organization = String(orgObj?.fullname || orgObj?.name || '').trim();
        const keywords = Array.isArray(paper.ai_keywords)
          ? (paper.ai_keywords as unknown[])
              .filter((k): k is string => typeof k === 'string' && Boolean(k.trim()))
              .slice(0, 4)
          : [];
        const publishedAt = String(item.publishedAt || paper.publishedAt || '').slice(0, 10);
        const githubRepo =
          typeof paper.githubRepo === 'string' && paper.githubRepo.startsWith('http') ? paper.githubRepo : '';

        return {
          rank: idx + 1,
          arxivId,
          title: rawTitle,
          summary: rawSummary.length > 340 ? `${rawSummary.slice(0, 337)}...` : rawSummary,
          authors,
          organization,
          keywords,
          upvotes: Number(paper.upvotes ?? item.upvotes ?? 0),
          publishedAt,
          arxivUrl: arxivId ? `https://arxiv.org/abs/${arxivId}` : 'https://huggingface.co/papers',
          pdfUrl: arxivId ? `https://arxiv.org/pdf/${arxivId}` : 'https://huggingface.co/papers',
          hfUrl: arxivId ? `https://huggingface.co/papers/${arxivId}` : 'https://huggingface.co/papers',
          githubRepo,
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
        const withAllTime = (hfDRes.value as Record<string, unknown>[])
          .filter((m) => typeof m.downloadsAllTime === 'number')
          .sort((a, b) => Number(b.downloadsAllTime) - Number(a.downloadsAllTime));
        if (withAllTime.length >= 10) {
          const merged = new Map<string, RankedHfModel>();
          (next.hfAllTimeDownloaded || []).forEach((m) => merged.set(m.id, m));
          withAllTime.forEach((raw, idx) => {
            const mapped = mapHf(raw, idx);
            merged.set(mapped.id, mapped);
          });
          next.hfAllTimeDownloaded = Array.from(merged.values())
            .sort((a, b) => (b.downloadsAllTime || b.downloads) - (a.downloadsAllTime || a.downloads))
            .slice(0, 21)
            .map((m, idx) => ({ ...m, rank: idx + 1 }));
        }
        updatedCount++;
      }
      if (hfPRes.status === 'fulfilled' && Array.isArray(hfPRes.value)) {
        const sortedPapers = [...(hfPRes.value as Record<string, unknown>[])].sort((a, b) => {
          const ap = (a.paper as Record<string, unknown>) || a;
          const bp = (b.paper as Record<string, unknown>) || b;
          return Number(bp.upvotes ?? b.upvotes ?? 0) - Number(ap.upvotes ?? a.upvotes ?? 0);
        });
        next.hfDailyPapers = sortedPapers.slice(0, 21).map(mapDailyPaper);
        updatedCount++;
      }

      if (updatedCount > 0) {
        setData(next);
        setRefreshStatus(
          `Live API synced (${updatedCount}/5 live endpoints refreshed — GitHub, Hugging Face Models & Daily Papers).`
        );
      } else {
        setRefreshStatus('Upstream APIs are temporarily rate-limited; displaying latest verified CI snapshot.');
      }
    } catch {
      setRefreshStatus('Could not reach live APIs; displaying latest verified CI snapshot.');
    } finally {
      setRefreshing(false);
    }
  };

  const totalGhAllTimeDownloads = ghDownloadsList.reduce((acc, r) => acc + (r.downloads || 0), 0);
  const topStarredRepo = data.githubAllTime[0];
  const topDownloadedRepo = ghDownloadsList[0];
  const topAllTimeHf = hfAllTimeList[0] || data.hfMostDownloaded[0];
  const topDailyPaper = dailyPapersList[0];

  return (
    <div className="max-w-[1560px] mx-auto px-4 sm:px-6 lg:px-10 xl:px-12 py-12 space-y-10">
      {/* Header — Open Editorial */}
      <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6">
        <div className="space-y-3 max-w-3xl">
          <div className="inline-flex items-center gap-2 text-xs font-mono font-semibold tracking-wider text-amber-700 dark:text-amber-300">
            <Flame className="w-4 h-4" /> {t.top21.badge}
          </div>
          <h1 className="font-display font-bold text-3xl sm:text-5xl text-black dark:text-white tracking-tight">
            {t.top21.title}
          </h1>
          <p className="text-base text-slate-800 dark:text-white leading-relaxed">{t.top21.subtitle}</p>
        </div>

        <div className="flex flex-col items-start lg:items-end gap-2">
          <button
            type="button"
            onClick={handleLiveRefresh}
            disabled={refreshing}
            className="px-5 py-2.5 rounded-full bg-sky-500 hover:bg-sky-400 disabled:opacity-60 text-black font-bold text-xs inline-flex items-center gap-2 shadow-sm transition"
          >
            {refreshing ? <Loader2 className="w-4 h-4 animate-spin" /> : <RefreshCw className="w-4 h-4" />}
            {refreshing ? t.top21.refreshingBtn : t.top21.refreshBtn}
          </button>
          <span className="font-mono text-[11px] text-slate-800 dark:text-white">
            7D: {data.sinceDate} · {data.syncedAt.slice(0, 16).replace('T', ' ')} UTC
          </span>
        </div>
      </div>

      {refreshStatus && (
        <div className="px-4 py-2.5 rounded-xl text-xs font-mono bg-emerald-500/15 text-emerald-900 dark:text-emerald-200 border border-emerald-500/30">
          {refreshStatus}
        </div>
      )}

      {/* Executive Summary KPI Strip — Open Hairline Columns (Zero Boxes) */}
      {sourceTab === 'papers' ? (
        <div className="pt-6 border-t border-slate-300/80 dark:border-slate-800 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="space-y-1">
            <div className="font-mono text-[10px] font-semibold tracking-wider text-slate-800 dark:text-slate-100">
              TECH GIANTS &amp; LABS INDEXED
            </div>
            <div className="font-display font-bold text-base text-black dark:text-white truncate">
              11 Tech Giants · 4 Discovery Domains
            </div>
            <div className="font-mono text-xs text-emerald-700 dark:text-emerald-300 font-semibold truncate">
              Google · Samsung · NVIDIA · Microsoft · DeepSeek · Meta · MIT
            </div>
          </div>

          <div className="space-y-1">
            <div className="font-mono text-[10px] font-semibold tracking-wider text-slate-800 dark:text-slate-100">
              NEW BREAKTHROUGH DISCOVERIES
            </div>
            <div className="font-display font-bold text-base text-black dark:text-white truncate">
              21 Verified Discoveries (2023–2026)
            </div>
            <div className="font-mono text-xs text-sky-700 dark:text-sky-300 font-semibold">
              AI · Programming Languages &amp; Compilers · Quantum · Silicon
            </div>
          </div>

          <div className="space-y-1">
            <div className="font-mono text-[10px] font-semibold tracking-wider text-slate-800 dark:text-slate-100">
              LIVE ARXIV GIANTS &amp; PL RADAR
            </div>
            <div className="font-display font-bold text-base text-black dark:text-white truncate">
              {liveArxivPapersList[0]?.title || 'Syncing live arXiv...'}
            </div>
            <div className="font-mono text-xs text-indigo-700 dark:text-indigo-300 font-semibold">
              {liveArxivPapersList.length} newest arXiv papers · {liveArxivPapersList[0]?.publishedAt || 'Live'}
            </div>
          </div>

          <div className="space-y-1">
            <div className="font-mono text-[10px] font-semibold tracking-wider text-slate-800 dark:text-slate-100">
              #1 TRENDING DAILY PAPER (HF / ARXIV)
            </div>
            <div className="font-display font-bold text-base text-black dark:text-white truncate">
              {topDailyPaper?.title || 'Syncing daily papers...'}
            </div>
            <div className="font-mono text-xs text-amber-700 dark:text-amber-300 font-semibold">
              ▲ {topDailyPaper?.upvotes || 0} upvotes · {dailyPapersList.length} daily synced
            </div>
          </div>
        </div>
      ) : (
        <div className="pt-6 border-t border-slate-300/80 dark:border-slate-800 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="space-y-1">
            <div className="font-mono text-[10px] font-semibold tracking-wider text-slate-800 dark:text-slate-100">
              #1 GITHUB BREAKOUT (7D)
            </div>
            <div className="font-display font-bold text-base text-black dark:text-white truncate">
              {data.githubWeekly[0]?.fullName || 'Syncing...'}
            </div>
            <div className="font-mono text-xs text-amber-700 dark:text-amber-300 font-semibold">
              ★ {fmtCompact(data.githubWeekly[0]?.stars || 0)} stars this week
            </div>
          </div>

          <div className="space-y-1">
            <div className="font-mono text-[10px] font-semibold tracking-wider text-slate-800 dark:text-slate-100">
              #1 MOST STARRED (ALL-TIME)
            </div>
            <div className="font-display font-bold text-base text-black dark:text-white truncate">
              {topStarredRepo?.fullName || 'Syncing...'}
            </div>
            <div className="font-mono text-xs text-indigo-700 dark:text-indigo-300 font-semibold">
              ★ {fmtCompact(topStarredRepo?.stars || 0)} all-time stars
            </div>
          </div>

          <div className="space-y-1">
            <div className="font-mono text-[10px] font-semibold tracking-wider text-slate-800 dark:text-slate-100">
              #1 GITHUB RELEASES (ALL-TIME)
            </div>
            <div className="font-display font-bold text-base text-black dark:text-white truncate">
              {topDownloadedRepo?.fullName || 'Syncing...'}
            </div>
            <div className="font-mono text-xs text-sky-700 dark:text-sky-300 font-semibold">
              ↓ {fmtCompact(topDownloadedRepo?.downloads || 0)} ({fmtCompact(totalGhAllTimeDownloads)} top-21 total)
            </div>
          </div>

          <div className="space-y-1">
            <div className="font-mono text-[10px] font-semibold tracking-wider text-slate-800 dark:text-slate-100">
              #1 HF AI MODEL (ALL-TIME)
            </div>
            <div className="font-display font-bold text-base text-black dark:text-white truncate">
              {topAllTimeHf?.id || 'Syncing...'}
            </div>
            <div className="font-mono text-xs text-emerald-700 dark:text-emerald-300 font-semibold">
              ↓ {fmtCompact(topAllTimeHf?.downloadsAllTime || topAllTimeHf?.downloads || 0)} total downloads
            </div>
          </div>
        </div>
      )}

      {/* Primary Source Tabs & Sub-Toggles */}
      <div className="flex flex-col xl:flex-row xl:items-center justify-between gap-4 border-b border-slate-300 dark:border-slate-800 pb-4">
        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={() => switchSourceTab('github')}
            className={`px-5 py-2.5 rounded-xl text-sm font-bold inline-flex items-center gap-2 transition ${
              sourceTab === 'github'
                ? 'bg-sky-500 text-black shadow-sm'
                : 'glass-panel text-black dark:text-white hover:border-sky-500'
            }`}
          >
            <Github className="w-4 h-4" /> {t.top21.tabGithub}
          </button>

          <button
            type="button"
            onClick={() => switchSourceTab('huggingface')}
            className={`px-5 py-2.5 rounded-xl text-sm font-bold inline-flex items-center gap-2 transition ${
              sourceTab === 'huggingface'
                ? 'bg-amber-400 text-black shadow-sm'
                : 'glass-panel text-black dark:text-white hover:border-amber-400'
            }`}
          >
            <Sparkles className="w-4 h-4" /> {t.top21.tabHf}
          </button>

          <button
            type="button"
            onClick={() => switchSourceTab('papers')}
            className={`px-5 py-2.5 rounded-xl text-sm font-bold inline-flex items-center gap-2 transition ${
              sourceTab === 'papers'
                ? 'bg-emerald-500 text-black shadow-sm'
                : 'glass-panel text-black dark:text-white hover:border-emerald-500'
            }`}
          >
            <BookOpen className="w-4 h-4" /> {t.top21.tabPapers}
          </button>
        </div>

        {/* Timeframe / All-Time / Research Mode Switcher */}
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
                <TrendingUp className="w-3.5 h-3.5" /> {t.top21.ghWeekly}
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
                <Star className="w-3.5 h-3.5" /> {t.top21.ghStarred}
              </button>
              <button
                type="button"
                onClick={() => {
                  setGhMode('downloads');
                  setSelectedFilter('All');
                }}
                className={`px-3.5 py-1.5 rounded-lg text-xs font-mono font-bold inline-flex items-center gap-1.5 transition ${
                  ghMode === 'downloads'
                    ? 'bg-sky-500 text-black'
                    : 'glass-panel text-black dark:text-white hover:border-sky-500'
                }`}
              >
                <Download className="w-3.5 h-3.5" /> {t.top21.ghDownloaded}
              </button>
            </>
          ) : sourceTab === 'huggingface' ? (
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
                <Flame className="w-3.5 h-3.5" /> {t.top21.hfWeekly}
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
                <Download className="w-3.5 h-3.5" /> {t.top21.hf30d}
              </button>
              <button
                type="button"
                onClick={() => {
                  setHfMode('alltime');
                  setSelectedFilter('All');
                }}
                className={`px-3.5 py-1.5 rounded-lg text-xs font-mono font-bold inline-flex items-center gap-1.5 transition ${
                  hfMode === 'alltime'
                    ? 'bg-amber-400 text-black'
                    : 'glass-panel text-black dark:text-white hover:border-amber-400'
                }`}
              >
                <Award className="w-3.5 h-3.5" /> {t.top21.hfAllTime}
              </button>
            </>
          ) : (
            <>
              <button
                type="button"
                onClick={() => {
                  setPaperMode('giants');
                  setSelectedFilter('All');
                  setSelectedDomain('All');
                }}
                className={`px-3.5 py-1.5 rounded-lg text-xs font-mono font-bold inline-flex items-center gap-1.5 transition ${
                  paperMode === 'giants'
                    ? 'bg-emerald-500 text-black'
                    : 'glass-panel text-black dark:text-white hover:border-emerald-500'
                }`}
              >
                <Building2 className="w-3.5 h-3.5" /> {t.top21.papersGiants}
              </button>
              <button
                type="button"
                onClick={() => {
                  setPaperMode('liveGiants');
                  setSelectedFilter('All');
                  setSelectedDomain('All');
                }}
                className={`px-3.5 py-1.5 rounded-lg text-xs font-mono font-bold inline-flex items-center gap-1.5 transition ${
                  paperMode === 'liveGiants'
                    ? 'bg-sky-500 text-black'
                    : 'glass-panel text-black dark:text-white hover:border-sky-500'
                }`}
              >
                <Radio className="w-3.5 h-3.5" /> {t.top21.papersLiveGiants}
              </button>
              <button
                type="button"
                onClick={() => {
                  setPaperMode('daily');
                  setSelectedFilter('All');
                  setSelectedDomain('All');
                }}
                className={`px-3.5 py-1.5 rounded-lg text-xs font-mono font-bold inline-flex items-center gap-1.5 transition ${
                  paperMode === 'daily'
                    ? 'bg-indigo-500 text-white'
                    : 'glass-panel text-black dark:text-white hover:border-indigo-500'
                }`}
              >
                <Flame className="w-3.5 h-3.5" /> {t.top21.papersDaily}
              </button>
            </>
          )}
        </div>
      </div>

      {/* Mode Info Banner */}
      {sourceTab === 'github' && ghMode === 'downloads' && (
        <div className="px-4 py-2.5 rounded-xl text-xs font-mono bg-sky-500/10 text-sky-950 dark:text-sky-200 border border-sky-500/30">
          Ranked by verified cumulative GitHub Releases asset downloads across flagship open-source repositories — synced every 6 hours via GitHub Actions.
        </div>
      )}
      {sourceTab === 'huggingface' && hfMode === 'alltime' && (
        <div className="px-4 py-2.5 rounded-xl text-xs font-mono bg-amber-500/10 text-amber-950 dark:text-amber-200 border border-amber-500/30">
          Ranked by verified cumulative all-time downloads (<code className="font-mono">downloadsAllTime</code>) on Hugging Face Hub.
        </div>
      )}
      {sourceTab === 'papers' && paperMode === 'giants' && (
        <div className="px-4 py-2.5 rounded-xl text-xs font-mono bg-emerald-500/10 text-emerald-950 dark:text-emerald-200 border border-emerald-500/30">
          21 verified new breakthrough discovery papers (2023–2026) across AI, Programming Languages &amp; Compilers, Quantum &amp; Silicon Hardware, and World Models from Google DeepMind, Google Quantum AI, Samsung AI &amp; Electronics, NVIDIA, Microsoft, DeepSeek, Meta AI, MIT CSAIL, Anthropic, OpenAI, Apple &amp; Alibaba Qwen.
        </div>
      )}
      {sourceTab === 'papers' && paperMode === 'liveGiants' && (
        <div className="px-4 py-2.5 rounded-xl text-xs font-mono bg-sky-500/10 text-sky-950 dark:text-sky-200 border border-sky-500/30">
          Auto-synced every 6 hours from live <code className="font-mono">export.arxiv.org</code> tracking the newest discoveries across AI (<code className="font-mono">cs.AI/LG</code>), Programming Languages &amp; Compilers (<code className="font-mono">cs.PL/SE</code>), Hardware Silicon (<code className="font-mono">cs.AR</code>), and Quantum (<code className="font-mono">quant-ph</code>).
        </div>
      )}
      {sourceTab === 'papers' && paperMode === 'daily' && (
        <div className="px-4 py-2.5 rounded-xl text-xs font-mono bg-indigo-500/10 text-indigo-950 dark:text-indigo-200 border border-indigo-500/30">
          Live Top 21 trending AI &amp; Computer Science papers ranked by community upvotes on Hugging Face Daily Papers &amp; arXiv — auto-synced every 6 hours + live refreshable.
        </div>
      )}

      {/* Discovery Domain Filter Row (for Tech Giant Breakthroughs) */}
      {sourceTab === 'papers' && paperMode === 'giants' && (
        <div className="flex flex-wrap items-center gap-2">
          {(['All', ...RESEARCH_DOMAIN_FILTERS] as const).map((dom) => (
            <button
              key={dom}
              type="button"
              onClick={() => setSelectedDomain(dom)}
              className={`px-3.5 py-1.5 rounded-full text-xs font-mono font-bold transition ${
                selectedDomain === dom
                  ? 'bg-emerald-500 text-black shadow-sm'
                  : 'border border-emerald-500/40 text-emerald-950 dark:text-emerald-200 hover:bg-emerald-500/15'
              }`}
            >
              {dom === 'All' ? t.top21.allDomains : dom}
            </button>
          ))}
        </div>
      )}

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
                  : 'glass-panel text-slate-900 dark:text-slate-100 hover:border-emerald-500'
              }`}
            >
              {opt === 'All' && sourceTab === 'papers'
                ? paperMode === 'giants'
                  ? t.top21.allLabs
                  : paperMode === 'liveGiants'
                  ? t.top21.allDomains
                  : opt
                : opt}
            </button>
          ))}
        </div>

        <div className="relative w-full md:w-80 shrink-0">
          <Search className="w-4 h-4 text-slate-900 dark:text-white absolute start-3.5 top-1/2 -translate-y-1/2" />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder={
              sourceTab === 'github'
                ? t.top21.filterGhPlaceholder
                : sourceTab === 'huggingface'
                ? t.top21.filterHfPlaceholder
                : t.top21.filterPapersPlaceholder
            }
            className="w-full ps-10 pe-4 py-2 rounded-xl glass-panel text-sm text-black dark:text-white placeholder-slate-600 dark:placeholder-slate-300 focus:outline-none focus:border-emerald-500"
          />
        </div>
      </div>

      {/* Open Editorial Leaderboard List (Clean Hairline Rows — Zero Box Soup) */}
      {sourceTab === 'github' ? (
        <div className="border-t border-b border-slate-300/80 dark:border-slate-800 divide-y divide-slate-300/70 dark:divide-slate-800/80">
          {filteredGh.map((repo) => {
            const metricVal = ghMode === 'downloads' ? repo.downloads || 0 : repo.stars;
            const pct = Math.max(4, Math.round((metricVal / maxGhMetric) * 100));
            const cloneCmd = `git clone ${repo.url}.git`;
            return (
              <ScrollReveal
                key={`${ghMode}-${repo.fullName}`}
                className="py-5 px-2 sm:px-3 -mx-2 sm:-mx-3 rounded-xl overflow-hidden hover:bg-slate-900/[0.03] dark:hover:bg-white/[0.03] flex flex-col lg:flex-row lg:items-center justify-between gap-4"
              >
                <div className="flex items-start gap-3 sm:gap-4 min-w-0 flex-1">
                  <div
                    className={`w-10 h-10 rounded-xl flex items-center justify-center font-brand text-xs tracking-wider shrink-0 ${rankStyle(
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
                      {ghMode === 'downloads' && repo.latestTag && (
                        <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-emerald-500/15 text-emerald-900 dark:text-emerald-200 border border-emerald-500/30 shrink-0">
                          {repo.latestTag}
                        </span>
                      )}
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
                        <span className="font-mono text-[10px] text-slate-800 dark:text-white">
                          Created {repo.createdAt.slice(0, 10)}
                        </span>
                      )}
                    </div>

                    {/* Relative momentum bar */}
                    <div className="h-1.5 w-full max-w-md rounded-full bg-slate-200 dark:bg-slate-800 overflow-hidden mt-2">
                      <div
                        className={`h-full rounded-full ${
                          ghMode === 'downloads'
                            ? 'bg-gradient-to-r from-emerald-400 to-sky-500'
                            : 'bg-gradient-to-r from-sky-500 to-indigo-500'
                        }`}
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                  </div>
                </div>

                <div className="flex flex-wrap lg:flex-col items-center lg:items-end justify-between gap-2 shrink-0">
                  <div className="flex flex-wrap items-center gap-3 font-mono text-sm">
                    {ghMode === 'downloads' && typeof repo.downloads === 'number' && (
                      <span className="inline-flex items-center gap-1 font-extrabold text-emerald-700 dark:text-emerald-300">
                        <Download className="w-4 h-4" /> {fmtCompact(repo.downloads)}
                      </span>
                    )}
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
                      href={ghMode === 'downloads' ? `${repo.url}/releases` : repo.url}
                      target="_blank"
                      rel="noreferrer"
                      className="px-3 py-1.5 rounded-lg bg-sky-500 hover:bg-sky-400 text-black font-bold text-xs inline-flex items-center gap-1 transition"
                    >
                      {ghMode === 'downloads' ? t.top21.releasesBtn : t.top21.openBtn} <ExternalLink className="w-3 h-3" />
                    </a>
                  </div>
                </div>
              </ScrollReveal>
            );
          })}
        </div>
      ) : sourceTab === 'huggingface' ? (
        <div className="border-t border-b border-slate-300/80 dark:border-slate-800 divide-y divide-slate-300/70 dark:divide-slate-800/80">
          {filteredHf.map((model) => {
            const metricVal =
              hfMode === 'weekly' && model.trendingScore
                ? model.trendingScore
                : hfMode === 'alltime' && model.downloadsAllTime
                ? model.downloadsAllTime
                : model.downloads;
            const pct = Math.max(4, Math.round((metricVal / maxHfMetric) * 100));
            const pullCmd = `huggingface-cli download ${model.id}`;
            return (
              <ScrollReveal
                key={`${hfMode}-${model.id}`}
                className="py-5 px-2 sm:px-3 -mx-2 sm:-mx-3 rounded-xl overflow-hidden hover:bg-slate-900/[0.03] dark:hover:bg-white/[0.03] flex flex-col lg:flex-row lg:items-center justify-between gap-4"
              >
                <div className="flex items-start gap-3 sm:gap-4 min-w-0 flex-1">
                  <div
                    className={`w-10 h-10 rounded-xl flex items-center justify-center font-brand text-xs tracking-wider shrink-0 ${rankStyle(
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

                    <div className="font-mono text-xs text-slate-800 dark:text-white flex flex-wrap items-center gap-x-3 gap-y-1">
                      <span>
                        Author: <strong>{model.author}</strong>
                      </span>
                      {hfMode === 'alltime' && model.downloads > 0 && (
                        <span className="text-sky-700 dark:text-sky-300 font-semibold">
                          30D: {fmtCompact(model.downloads)}
                        </span>
                      )}
                      {model.trendingScore !== null && (
                        <span className="text-emerald-700 dark:text-emerald-300 font-semibold">
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
                      <Download className="w-4 h-4" />{' '}
                      {hfMode === 'alltime' && model.downloadsAllTime
                        ? `${fmtCompact(model.downloadsAllTime)} all-time`
                        : fmtCompact(model.downloads)}
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
              </ScrollReveal>
            );
          })}
        </div>
      ) : paperMode === 'giants' ? (
        <div className="border-t border-b border-slate-300/80 dark:border-slate-800 divide-y divide-slate-300/70 dark:divide-slate-800/80">
          {filteredGiantPapers.length === 0 ? (
            <div className="py-12 text-center font-mono text-sm text-slate-900 dark:text-slate-100">
              No matching research papers found. Try clearing your filter or search query.
            </div>
          ) : (
            filteredGiantPapers.map((paper) => {
              const bibtex = formatPaperBibtex(paper.arxivId, paper.title, paper.authors, paper.year);
              const bibKey = `bib-giant-${paper.arxivId}`;
              return (
                <ScrollReveal
                  key={paper.arxivId}
                  className="py-5 px-2 sm:px-3 -mx-2 sm:-mx-3 rounded-xl overflow-hidden hover:bg-slate-900/[0.03] dark:hover:bg-white/[0.03] flex flex-col lg:flex-row lg:items-center justify-between gap-4"
                >
                  <div className="flex items-start gap-3 sm:gap-4 min-w-0 flex-1">
                    <div
                      className={`w-10 h-10 rounded-xl flex items-center justify-center font-brand text-xs tracking-wider shrink-0 ${rankStyle(
                        paper.rank
                      )}`}
                    >
                      #{String(paper.rank).padStart(2, '0')}
                    </div>

                    <div className="min-w-0 flex-1 space-y-1.5">
                      <div className="flex flex-wrap items-center gap-2 min-w-0 max-w-full">
                        <a
                          href={paper.arxivUrl}
                          target="_blank"
                          rel="noreferrer"
                          className="font-display font-bold text-base sm:text-lg text-black dark:text-white hover:text-emerald-600 dark:hover:text-emerald-300 leading-snug inline-flex items-center gap-1.5"
                        >
                          <span>{paper.title}</span>
                          <ExternalLink className="w-3.5 h-3.5 shrink-0 opacity-70" />
                        </a>
                      </div>

                      <div className="flex flex-wrap items-center gap-2">
                        <span className="px-2 py-0.5 rounded text-[11px] font-mono font-bold bg-emerald-500/15 text-emerald-950 dark:text-emerald-200 border border-emerald-500/35 shrink-0">
                          {paper.lab}
                        </span>
                        <span className="px-2 py-0.5 rounded text-[11px] font-mono font-semibold bg-indigo-500/15 text-indigo-950 dark:text-indigo-200 border border-indigo-500/35 shrink-0">
                          {paper.domain}
                        </span>
                        <span className="px-2 py-0.5 rounded text-[11px] font-mono font-semibold bg-sky-500/15 text-sky-950 dark:text-sky-200 border border-sky-500/30 shrink-0">
                          {paper.category}
                        </span>
                        <span
                          dir="ltr"
                          className="px-2 py-0.5 rounded text-[11px] font-mono bg-slate-200/80 dark:bg-slate-800 text-slate-900 dark:text-slate-100 shrink-0"
                        >
                          arXiv:{paper.arxivId}
                        </span>
                        <span className="font-mono text-[11px] text-slate-800 dark:text-slate-200">
                          {paper.published}
                        </span>
                      </div>

                      <div className="inline-flex items-start gap-1.5 text-xs sm:text-[13px] font-semibold text-emerald-800 dark:text-emerald-300">
                        <Zap className="w-3.5 h-3.5 shrink-0 mt-0.5" />
                        <span>
                          <strong className="font-brand uppercase text-[11px] tracking-wider">{t.top21.discoveryLabel}:</strong>{' '}
                          <span className="font-editorial italic font-normal text-[17px] sm:text-[18px] leading-snug text-emerald-900 dark:text-emerald-200">
                            {paper.breakthrough}
                          </span>
                        </span>
                      </div>

                      <p className="text-sm text-slate-900 dark:text-slate-100 leading-relaxed break-words">
                        {paper.summary}
                      </p>

                      <div className="font-mono text-[11px] text-slate-800 dark:text-slate-200 truncate">
                        Authors: {paper.authors}
                      </div>
                    </div>
                  </div>

                  <div className="flex flex-wrap lg:flex-col items-center lg:items-end justify-between gap-2 shrink-0">
                    <div className="flex items-center gap-2 font-mono text-xs font-bold text-emerald-700 dark:text-emerald-300">
                      <span>{paper.labGroup}</span>
                      <span className="opacity-50">·</span>
                      <span>{paper.year}</span>
                    </div>

                    <div className="flex flex-wrap items-center gap-2">
                      <button
                        type="button"
                        onClick={() => copySnippet(bibKey, bibtex)}
                        className="px-3 py-1.5 rounded-lg bg-slate-100 dark:bg-slate-900 border border-slate-300 dark:border-slate-700 text-xs font-mono font-semibold text-black dark:text-white hover:border-emerald-500 inline-flex items-center gap-1.5 transition"
                        title="Copy BibTeX citation"
                      >
                        {copiedKey === bibKey ? (
                          <Check className="w-3.5 h-3.5 text-emerald-500" />
                        ) : (
                          <Copy className="w-3.5 h-3.5" />
                        )}
                        {copiedKey === bibKey ? 'Copied!' : 'BibTeX'}
                      </button>
                      <a
                        href={paper.labPortalUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="px-3 py-1.5 rounded-lg bg-slate-100 dark:bg-slate-900 border border-slate-300 dark:border-slate-700 text-xs font-mono font-semibold text-black dark:text-white hover:border-sky-500 inline-flex items-center gap-1 transition"
                      >
                        {t.top21.labPortalBtn} <ExternalLink className="w-3 h-3" />
                      </a>
                      <a
                        href={paper.arxivUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="px-3 py-1.5 rounded-lg bg-slate-900 dark:bg-white hover:bg-slate-800 dark:hover:bg-slate-200 text-white dark:text-black font-bold text-xs inline-flex items-center gap-1 transition"
                      >
                        arXiv <ExternalLink className="w-3 h-3" />
                      </a>
                      <a
                        href={paper.pdfUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="px-3 py-1.5 rounded-lg bg-emerald-500 hover:bg-emerald-400 text-black font-bold text-xs inline-flex items-center gap-1 transition"
                      >
                        <FileText className="w-3.5 h-3.5" /> {t.top21.pdfBtn}
                      </a>
                    </div>
                  </div>
                </ScrollReveal>
              );
            })
          )}
        </div>
      ) : paperMode === 'liveGiants' ? (
        <div className="border-t border-b border-slate-300/80 dark:border-slate-800 divide-y divide-slate-300/70 dark:divide-slate-800/80">
          {filteredLiveArxivPapers.length === 0 ? (
            <div className="py-12 text-center font-mono text-sm text-slate-900 dark:text-slate-100">
              No live arXiv breakthroughs match this filter. Try selecting All Domains or clearing search.
            </div>
          ) : (
            filteredLiveArxivPapers.map((paper) => {
              const yearNum = Number(paper.publishedAt.slice(0, 4)) || new Date().getFullYear();
              const bibtex = formatPaperBibtex(paper.arxivId, paper.title, paper.authors, yearNum);
              const bibKey = `bib-live-${paper.arxivId}`;
              return (
                <ScrollReveal
                  key={paper.arxivId}
                  className="py-5 px-2 sm:px-3 -mx-2 sm:-mx-3 rounded-xl overflow-hidden hover:bg-slate-900/[0.03] dark:hover:bg-white/[0.03] flex flex-col lg:flex-row lg:items-center justify-between gap-4"
                >
                  <div className="flex items-start gap-3 sm:gap-4 min-w-0 flex-1">
                    <div
                      className={`w-10 h-10 rounded-xl flex items-center justify-center font-brand text-xs tracking-wider shrink-0 ${rankStyle(
                        paper.rank
                      )}`}
                    >
                      #{String(paper.rank).padStart(2, '0')}
                    </div>

                    <div className="min-w-0 flex-1 space-y-1.5">
                      <div className="flex flex-wrap items-center gap-2 min-w-0 max-w-full">
                        <a
                          href={paper.arxivUrl}
                          target="_blank"
                          rel="noreferrer"
                          className="font-display font-bold text-base sm:text-lg text-black dark:text-white hover:text-sky-600 dark:hover:text-sky-300 leading-snug inline-flex items-center gap-1.5"
                        >
                          <span>{paper.title}</span>
                          <ExternalLink className="w-3.5 h-3.5 shrink-0 opacity-70" />
                        </a>
                      </div>

                      <div className="flex flex-wrap items-center gap-2">
                        <span className="px-2 py-0.5 rounded text-[11px] font-mono font-bold bg-sky-500/15 text-sky-950 dark:text-sky-200 border border-sky-500/35 shrink-0">
                          {paper.domain}
                        </span>
                        {paper.categories.map((cat) => (
                          <span
                            key={cat}
                            dir="ltr"
                            className="px-2 py-0.5 rounded text-[11px] font-mono font-semibold bg-emerald-500/15 text-emerald-950 dark:text-emerald-200 border border-emerald-500/30 shrink-0"
                          >
                            {cat}
                          </span>
                        ))}
                        <span
                          dir="ltr"
                          className="px-2 py-0.5 rounded text-[11px] font-mono bg-slate-200/80 dark:bg-slate-800 text-slate-900 dark:text-slate-100 shrink-0"
                        >
                          arXiv:{paper.arxivId}
                        </span>
                        <span className="font-mono text-[11px] text-slate-800 dark:text-slate-200">
                          {paper.publishedAt}
                        </span>
                      </div>

                      <p className="text-sm text-slate-900 dark:text-slate-100 leading-relaxed line-clamp-2 break-words">
                        {paper.summary}
                      </p>

                      <div className="font-mono text-[11px] text-slate-800 dark:text-slate-200 truncate">
                        Authors: {paper.authors}
                      </div>
                    </div>
                  </div>

                  <div className="flex flex-wrap lg:flex-col items-center lg:items-end justify-between gap-2 shrink-0">
                    <div className="font-mono text-xs font-bold text-sky-700 dark:text-sky-300">
                      NEW · {paper.publishedAt}
                    </div>

                    <div className="flex flex-wrap items-center gap-2">
                      <button
                        type="button"
                        onClick={() => copySnippet(bibKey, bibtex)}
                        className="px-3 py-1.5 rounded-lg bg-slate-100 dark:bg-slate-900 border border-slate-300 dark:border-slate-700 text-xs font-mono font-semibold text-black dark:text-white hover:border-sky-500 inline-flex items-center gap-1.5 transition"
                        title="Copy BibTeX citation"
                      >
                        {copiedKey === bibKey ? (
                          <Check className="w-3.5 h-3.5 text-emerald-500" />
                        ) : (
                          <Copy className="w-3.5 h-3.5" />
                        )}
                        {copiedKey === bibKey ? 'Copied!' : 'BibTeX'}
                      </button>
                      <a
                        href={paper.arxivUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="px-3 py-1.5 rounded-lg bg-slate-900 dark:bg-white hover:bg-slate-800 dark:hover:bg-slate-200 text-white dark:text-black font-bold text-xs inline-flex items-center gap-1 transition"
                      >
                        arXiv <ExternalLink className="w-3 h-3" />
                      </a>
                      <a
                        href={paper.pdfUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="px-3 py-1.5 rounded-lg bg-emerald-500 hover:bg-emerald-400 text-black font-bold text-xs inline-flex items-center gap-1 transition"
                      >
                        <FileText className="w-3.5 h-3.5" /> {t.top21.pdfBtn}
                      </a>
                    </div>
                  </div>
                </ScrollReveal>
              );
            })
          )}
        </div>
      ) : (
        <div className="border-t border-b border-slate-300/80 dark:border-slate-800 divide-y divide-slate-300/70 dark:divide-slate-800/80">
          {filteredDailyPapers.length === 0 ? (
            <div className="py-12 text-center font-mono text-sm text-slate-900 dark:text-slate-100">
              No daily trending papers match this filter. Try clicking “Refresh Live Now” or clearing your filter.
            </div>
          ) : (
            filteredDailyPapers.map((paper) => {
              const yearNum = Number(paper.publishedAt.slice(0, 4)) || new Date().getFullYear();
              const bibtex = formatPaperBibtex(paper.arxivId, paper.title, paper.authors, yearNum);
              const bibKey = `bib-daily-${paper.arxivId}`;
              const pct = Math.max(6, Math.round(((paper.upvotes || 0) / maxDailyPaperUpvotes) * 100));
              return (
                <ScrollReveal
                  key={paper.arxivId || paper.rank}
                  className="py-5 px-2 sm:px-3 -mx-2 sm:-mx-3 rounded-xl overflow-hidden hover:bg-slate-900/[0.03] dark:hover:bg-white/[0.03] flex flex-col lg:flex-row lg:items-center justify-between gap-4"
                >
                  <div className="flex items-start gap-3 sm:gap-4 min-w-0 flex-1">
                    <div
                      className={`w-10 h-10 rounded-xl flex items-center justify-center font-brand text-xs tracking-wider shrink-0 ${rankStyle(
                        paper.rank
                      )}`}
                    >
                      #{String(paper.rank).padStart(2, '0')}
                    </div>

                    <div className="min-w-0 flex-1 space-y-1.5">
                      <div className="flex flex-wrap items-center gap-2 min-w-0 max-w-full">
                        <a
                          href={paper.hfUrl}
                          target="_blank"
                          rel="noreferrer"
                          className="font-display font-bold text-base sm:text-lg text-black dark:text-white hover:text-indigo-600 dark:hover:text-indigo-300 leading-snug inline-flex items-center gap-1.5"
                        >
                          <span>{paper.title}</span>
                          <ExternalLink className="w-3.5 h-3.5 shrink-0 opacity-70" />
                        </a>
                      </div>

                      <div className="flex flex-wrap items-center gap-2">
                        {paper.organization && (
                          <span className="px-2 py-0.5 rounded text-[11px] font-mono font-bold bg-indigo-500/15 text-indigo-950 dark:text-indigo-200 border border-indigo-500/35 shrink-0">
                            {paper.organization}
                          </span>
                        )}
                        {paper.arxivId && (
                          <span
                            dir="ltr"
                            className="px-2 py-0.5 rounded text-[11px] font-mono bg-slate-200/80 dark:bg-slate-800 text-slate-900 dark:text-slate-100 shrink-0"
                          >
                            arXiv:{paper.arxivId}
                          </span>
                        )}
                        {paper.publishedAt && (
                          <span className="font-mono text-[11px] text-slate-800 dark:text-slate-200">
                            {paper.publishedAt}
                          </span>
                        )}
                      </div>

                      {paper.summary && (
                        <p className="text-sm text-slate-900 dark:text-slate-100 leading-relaxed line-clamp-2 break-words">
                          {paper.summary}
                        </p>
                      )}

                      <div className="flex flex-wrap items-center gap-2 pt-0.5">
                        <span className="font-mono text-[11px] text-slate-800 dark:text-slate-200">
                          {paper.authors}
                        </span>
                        {paper.keywords.slice(0, 3).map((kw) => (
                          <span
                            key={kw}
                            className="px-2 py-0.5 rounded text-[10px] font-mono bg-slate-200/80 dark:bg-slate-800 text-slate-900 dark:text-slate-100"
                          >
                            #{kw}
                          </span>
                        ))}
                      </div>

                      <div className="h-1.5 w-full max-w-md rounded-full bg-slate-200 dark:bg-slate-800 overflow-hidden mt-2">
                        <div
                          className="h-full rounded-full bg-gradient-to-r from-indigo-500 to-emerald-400"
                          style={{ width: `${pct}%` }}
                        />
                      </div>
                    </div>
                  </div>

                  <div className="flex flex-wrap lg:flex-col items-center lg:items-end justify-between gap-2 shrink-0">
                    <div className="flex items-center gap-2 font-mono text-sm font-bold text-indigo-700 dark:text-indigo-300">
                      <span className="inline-flex items-center gap-1">
                        <ArrowUp className="w-4 h-4" /> {paper.upvotes} upvotes
                      </span>
                    </div>

                    <div className="flex flex-wrap items-center gap-2">
                      <button
                        type="button"
                        onClick={() => copySnippet(bibKey, bibtex)}
                        className="px-3 py-1.5 rounded-lg bg-slate-100 dark:bg-slate-900 border border-slate-300 dark:border-slate-700 text-xs font-mono font-semibold text-black dark:text-white hover:border-indigo-500 inline-flex items-center gap-1.5 transition"
                        title="Copy BibTeX citation"
                      >
                        {copiedKey === bibKey ? (
                          <Check className="w-3.5 h-3.5 text-emerald-500" />
                        ) : (
                          <Copy className="w-3.5 h-3.5" />
                        )}
                        {copiedKey === bibKey ? 'Copied!' : 'BibTeX'}
                      </button>
                      {paper.githubRepo && (
                        <a
                          href={paper.githubRepo}
                          target="_blank"
                          rel="noreferrer"
                          className="px-3 py-1.5 rounded-lg bg-slate-100 dark:bg-slate-900 border border-slate-300 dark:border-slate-700 text-xs font-mono font-semibold text-black dark:text-white hover:border-sky-500 inline-flex items-center gap-1 transition"
                        >
                          <Code2 className="w-3.5 h-3.5" /> Code
                        </a>
                      )}
                      <a
                        href={paper.arxivUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="px-3 py-1.5 rounded-lg bg-slate-900 dark:bg-white hover:bg-slate-800 dark:hover:bg-slate-200 text-white dark:text-black font-bold text-xs inline-flex items-center gap-1 transition"
                      >
                        arXiv <ExternalLink className="w-3 h-3" />
                      </a>
                      <a
                        href={paper.pdfUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="px-3 py-1.5 rounded-lg bg-emerald-500 hover:bg-emerald-400 text-black font-bold text-xs inline-flex items-center gap-1 transition"
                      >
                        <FileText className="w-3.5 h-3.5" /> {t.top21.pdfBtn}
                      </a>
                    </div>
                  </div>
                </ScrollReveal>
              );
            })
          )}
        </div>
      )}
    </div>
  );
}

import dns from 'node:dns';
import fs from 'node:fs';
import path from 'node:path';

dns.setDefaultResultOrder?.('ipv4first');

const ORG = process.env.ORG_NAME || 'KRONVEX';
const TOKEN = process.env.GITHUB_TOKEN || process.env.ORG_ACCESS_TOKEN || '';
const OUT_ORG_FILE = path.resolve(process.cwd(), 'src/data/live-github.json');
const OUT_INDEX21_FILE = path.resolve(process.cwd(), 'src/data/live-index-21.json');

// Curated pool of the world's highest-download open-source GitHub Release repositories.
// Synced live against GitHub Releases API to rank the Top 21 by cumulative release downloads.
const GITHUB_RELEASE_TITANS = [
  'yt-dlp/yt-dlp',
  'microsoft/PowerToys',
  'obsproject/obs-studio',
  'ollama/ollama',
  'notepad-plus-plus/notepad-plus-plus',
  'obsidianmd/obsidian-releases',
  'godotengine/godot',
  'neovim/neovim',
  'ggml-org/llama.cpp',
  'rustdesk/rustdesk',
  'localsend/localsend',
  'oven-sh/bun',
  'denoland/deno',
  'ventoy/Ventoy',
  'cli/cli',
  'docker/compose',
  'BtbN/FFmpeg-Builds',
  'HandBrake/HandBrake',
  'keepassxreboot/keepassxc',
  'audacity/audacity',
  'BurntSushi/ripgrep',
  'junegunn/fzf',
  'jqlang/jq',
  'electron/electron',
];

// Iconic all-time high-download Hugging Face models combined with top 30d leaders
// to ensure the All-Time Most Downloaded Top 21 captures historic legends too.
const HF_ALLTIME_CANDIDATES = [
  'google-bert/bert-base-uncased',
  'sentence-transformers/all-MiniLM-L6-v2',
  'FacebookAI/roberta-base',
  'openai-community/gpt2',
  'openai/clip-vit-large-patch14',
  'openai/clip-vit-base-patch32',
  'distilbert/distilbert-base-uncased',
  'FacebookAI/xlm-roberta-base',
  'sentence-transformers/all-mpnet-base-v2',
  'openai/whisper-large-v3',
  'BAAI/bge-large-en-v1.5',
  'BAAI/bge-m3',
  'google-t5/t5-base',
  'timm/resnet50.a1_in1k',
  'Qwen/Qwen2.5-7B-Instruct',
  'meta-llama/Llama-3.1-8B-Instruct',
  'google/electra-base-discriminator',
  'microsoft/deberta-v3-base',
  'facebook/bart-large-mnli',
  'intfloat/multilingual-e5-large',
];

async function fetchJson(url, useGithubAuth = false, retries = 2) {
  const headers = {
    Accept: 'application/json',
    'User-Agent': 'KRONVEX-Platform-Sync/3.0',
  };
  if (useGithubAuth) {
    headers.Accept = 'application/vnd.github+json';
    if (TOKEN) headers.Authorization = `Bearer ${TOKEN}`;
  }
  let lastErr;
  for (let attempt = 0; attempt <= retries; attempt++) {
    try {
      const res = await fetch(url, { headers, signal: AbortSignal.timeout(15000) });
      if (!res.ok) throw new Error(`HTTP ${res.status} for ${url}`);
      return await res.json();
    } catch (err) {
      lastErr = err;
      if (attempt < retries) await new Promise((r) => setTimeout(r, 600 * (attempt + 1)));
    }
  }
  throw lastErr;
}

function getDateDaysAgo(days) {
  const d = new Date(Date.now() - days * 24 * 60 * 60 * 1000);
  return d.toISOString().slice(0, 10);
}

function mapGithubRepo(r, idx) {
  return {
    rank: idx + 1,
    fullName: r.full_name,
    name: r.name,
    owner: r.owner?.login || '',
    avatarUrl: r.owner?.avatar_url || '',
    description: r.description || 'No description provided.',
    url: r.html_url,
    stars: r.stargazers_count || 0,
    forks: r.forks_count || 0,
    language: r.language || 'Multi-Stack',
    topics: (r.topics || []).slice(0, 4),
    createdAt: r.created_at || '',
    pushedAt: r.pushed_at || '',
  };
}

function mapHfModel(m, idx) {
  const modelId = m.id || m.modelId || '';
  const parts = modelId.split('/');
  return {
    rank: idx + 1,
    id: modelId,
    author: parts.length > 1 ? parts[0] : 'huggingface',
    name: parts.length > 1 ? parts.slice(1).join('/') : modelId,
    url: `https://huggingface.co/${modelId}`,
    downloads: m.downloads || 0,
    downloadsAllTime: typeof m.downloadsAllTime === 'number' ? m.downloadsAllTime : null,
    likes: m.likes || 0,
    trendingScore: typeof m.trendingScore === 'number' ? m.trendingScore : null,
    pipelineTag: m.pipeline_tag || 'general-ai',
    libraryName: m.library_name || 'transformers',
    lastModified: m.lastModified || '',
  };
}

async function syncOrgCatalog() {
  const fallback = {
    org: ORG,
    syncedAt: new Date().toISOString(),
    live: false,
    stats: { publicRepos: 1, totalStars: 0, totalForks: 0, totalDownloads: 0 },
    repos: [],
    releases: [],
  };

  try {
    const rawRepos = await fetchJson(
      `https://api.github.com/orgs/${encodeURIComponent(ORG)}/repos?type=public&sort=pushed&per_page=50`,
      true
    );

    const repos = [];
    const releases = [];
    let totalStars = 0;
    let totalForks = 0;
    let totalDownloads = 0;

    for (const r of rawRepos) {
      if (r.fork || r.archived) continue;
      totalStars += r.stargazers_count || 0;
      totalForks += r.forks_count || 0;
      repos.push({
        name: r.name,
        description: r.description || '',
        url: r.html_url,
        language: r.language || 'Multi-Stack',
        stars: r.stargazers_count || 0,
        forks: r.forks_count || 0,
        topics: r.topics || [],
        pushedAt: r.pushed_at || '',
      });

      try {
        const rels = await fetchJson(
          `https://api.github.com/repos/${encodeURIComponent(ORG)}/${encodeURIComponent(r.name)}/releases?per_page=3`,
          true
        );
        for (const rel of rels) {
          const assets = (rel.assets || []).map((a) => {
            totalDownloads += a.download_count || 0;
            return {
              name: a.name,
              sizeBytes: a.size || 0,
              downloads: a.download_count || 0,
              downloadUrl: a.browser_download_url,
            };
          });
          releases.push({
            repo: r.name,
            tag: rel.tag_name,
            title: rel.name || rel.tag_name,
            url: rel.html_url,
            publishedAt: rel.published_at || '',
            assets,
          });
        }
      } catch {
        // Ignore repos with no releases
      }
    }

    const payload = {
      org: ORG,
      syncedAt: new Date().toISOString(),
      live: true,
      stats: { publicRepos: repos.length, totalStars, totalForks, totalDownloads },
      repos,
      releases,
    };

    fs.mkdirSync(path.dirname(OUT_ORG_FILE), { recursive: true });
    fs.writeFileSync(OUT_ORG_FILE, JSON.stringify(payload, null, 2) + '\n', 'utf-8');
    console.log(`[SYNC] Org catalog updated (${repos.length} repos, ${releases.length} releases)`);
  } catch (err) {
    console.warn(`[SYNC] Org catalog fetch skipped (${err.message}); preserving baseline.`);
    if (!fs.existsSync(OUT_ORG_FILE)) {
      fs.mkdirSync(path.dirname(OUT_ORG_FILE), { recursive: true });
      fs.writeFileSync(OUT_ORG_FILE, JSON.stringify(fallback, null, 2) + '\n', 'utf-8');
    }
  }
}

async function fetchGithubMostDownloaded() {
  const results = [];
  // Fetch in modest batches to respect GitHub REST rate limits
  const batchSize = 6;
  for (let i = 0; i < GITHUB_RELEASE_TITANS.length; i += batchSize) {
    const batch = GITHUB_RELEASE_TITANS.slice(i, i + batchSize);
    const settled = await Promise.allSettled(
      batch.map(async (fullName) => {
        const [repoMeta, releases] = await Promise.all([
          fetchJson(`https://api.github.com/repos/${fullName}`, true),
          fetchJson(`https://api.github.com/repos/${fullName}/releases?per_page=100`, true),
        ]);
        let totalDownloads = 0;
        let latestTag = '';
        if (Array.isArray(releases)) {
          latestTag = releases[0]?.tag_name || '';
          for (const rel of releases) {
            for (const asset of rel.assets || []) {
              totalDownloads += asset.download_count || 0;
            }
          }
        }
        return {
          fullName: repoMeta.full_name || fullName,
          name: repoMeta.name || fullName.split('/')[1],
          owner: repoMeta.owner?.login || fullName.split('/')[0],
          avatarUrl: repoMeta.owner?.avatar_url || '',
          description: repoMeta.description || 'Open-source flagship project.',
          url: repoMeta.html_url || `https://github.com/${fullName}`,
          stars: repoMeta.stargazers_count || 0,
          forks: repoMeta.forks_count || 0,
          downloads: totalDownloads,
          latestTag,
          releaseCount: Array.isArray(releases) ? releases.length : 0,
          language: repoMeta.language || 'Multi-Stack',
          topics: (repoMeta.topics || []).slice(0, 4),
          createdAt: repoMeta.created_at || '',
          pushedAt: repoMeta.pushed_at || '',
        };
      })
    );
    for (const item of settled) {
      if (item.status === 'fulfilled' && item.value.downloads > 0) {
        results.push(item.value);
      }
    }
  }

  results.sort((a, b) => b.downloads - a.downloads);
  return results.slice(0, 21).map((r, idx) => ({ rank: idx + 1, ...r }));
}

async function fetchHfAllTimeDownloaded(top30dRaw = []) {
  const byId = new Map();

  for (const m of top30dRaw) {
    const id = m.id || m.modelId;
    if (id && typeof m.downloadsAllTime === 'number') {
      byId.set(id, m);
    }
  }

  // Query top 40 by 30d downloads with downloadsAllTime expanded
  try {
    const expandParams = [
      'downloads',
      'downloadsAllTime',
      'likes',
      'trendingScore',
      'pipeline_tag',
      'library_name',
      'lastModified',
    ]
      .map((f) => `expand[]=${encodeURIComponent(f)}`)
      .join('&');
    const data = await fetchJson(
      `https://huggingface.co/api/models?sort=downloads&direction=-1&limit=40&${expandParams}`,
      false
    );
    if (Array.isArray(data)) {
      for (const m of data) {
        const id = m.id || m.modelId;
        if (id && typeof m.downloadsAllTime === 'number') byId.set(id, m);
      }
    }
  } catch (err) {
    console.warn(`[SYNC] HF expanded top list skipped (${err.message})`);
  }

  // Also fetch curated historic legends to capture all-time download leaders
  const batchSize = 6;
  for (let i = 0; i < HF_ALLTIME_CANDIDATES.length; i += batchSize) {
    const batch = HF_ALLTIME_CANDIDATES.slice(i, i + batchSize).filter((id) => !byId.has(id));
    if (batch.length === 0) continue;
    const settled = await Promise.allSettled(
      batch.map((id) =>
        fetchJson(
          `https://huggingface.co/api/models/${id}?expand[]=downloads&expand[]=downloadsAllTime&expand[]=likes&expand[]=trendingScore&expand[]=pipeline_tag&expand[]=library_name&expand[]=lastModified`,
          false
        )
      )
    );
    for (const s of settled) {
      if (s.status === 'fulfilled' && s.value?.id && typeof s.value.downloadsAllTime === 'number') {
        byId.set(s.value.id, s.value);
      }
    }
  }

  const all = Array.from(byId.values())
    .filter((m) => (m.downloadsAllTime || 0) > 0)
    .sort((a, b) => (b.downloadsAllTime || 0) - (a.downloadsAllTime || 0));

  return all.slice(0, 21).map((m, idx) => mapHfModel(m, idx));
}

function mapHfDailyPaper(item, idx) {
  const paper = item?.paper || item || {};
  const arxivId = String(paper.id || item?.id || '').trim();
  const rawTitle = String(item?.title || paper.title || 'Untitled Research Paper')
    .replace(/\s+/g, ' ')
    .trim();
  const rawSummary = String(paper.ai_summary || item?.summary || paper.summary || '')
    .replace(/\s+/g, ' ')
    .trim();
  const authorsArr = Array.isArray(paper.authors)
    ? paper.authors
        .map((a) => (typeof a === 'string' ? a : a?.name || a?.user?.fullname || ''))
        .filter(Boolean)
    : [];
  const authors =
    authorsArr.length > 4
      ? `${authorsArr.slice(0, 4).join(', ')} et al.`
      : authorsArr.join(', ') || 'Research Team';
  const orgObj = item?.organization || paper.organization || null;
  const organization = String(orgObj?.fullname || orgObj?.name || '').trim();
  const keywords = Array.isArray(paper.ai_keywords)
    ? paper.ai_keywords.filter((k) => typeof k === 'string' && k.trim()).slice(0, 4)
    : [];
  const publishedAt = String(item?.publishedAt || paper.publishedAt || '').slice(0, 10);
  const githubRepo = typeof paper.githubRepo === 'string' && paper.githubRepo.startsWith('http')
    ? paper.githubRepo
    : '';

  return {
    rank: idx + 1,
    arxivId,
    title: rawTitle,
    summary: rawSummary.length > 340 ? `${rawSummary.slice(0, 337)}...` : rawSummary,
    authors,
    organization,
    keywords,
    upvotes: Number(paper.upvotes ?? item?.upvotes ?? 0),
    publishedAt,
    arxivUrl: arxivId ? `https://arxiv.org/abs/${arxivId}` : 'https://huggingface.co/papers',
    pdfUrl: arxivId ? `https://arxiv.org/pdf/${arxivId}` : 'https://huggingface.co/papers',
    hfUrl: arxivId ? `https://huggingface.co/papers/${arxivId}` : 'https://huggingface.co/papers',
    githubRepo,
  };
}

function detectTechGiantLab(text) {
  const s = text.toLowerCase();
  if (s.includes('deepmind') || s.includes('google quantum') || s.includes('google research') || s.includes('google brain')) {
    return 'Google / DeepMind';
  }
  if (s.includes('samsung')) return 'Samsung AI';
  if (s.includes('nvidia') || s.includes('cuda') || s.includes('tensorrt')) return 'NVIDIA';
  if (s.includes('microsoft')) return 'Microsoft';
  if (s.includes('deepseek')) return 'DeepSeek';
  if (s.includes('anthropic') || s.includes('claude')) return 'Anthropic';
  if (s.includes('openai')) return 'OpenAI';
  if (s.includes('meta ai') || s.includes('meta fair') || s.includes('llama')) return 'Meta AI';
  if (s.includes('apple')) return 'Apple';
  if (s.includes('qwen') || s.includes('alibaba')) return 'Alibaba Qwen';
  return 'Frontier Systems & PL';
}

function detectArxivDomain(categories = [], text = '') {
  const cats = categories.map((c) => c.toLowerCase());
  const s = text.toLowerCase();
  if (cats.some((c) => c.startsWith('cs.pl') || c.startsWith('cs.se')) || /\b(compiler|llvm|programming language|triton|type system|rust|wasm)\b/.test(s)) {
    return 'Programming & Compilers';
  }
  if (cats.some((c) => c.startsWith('quant-ph') || c.startsWith('cs.ar')) || /\b(quantum|silicon|accelerator|pim|npu|hardware|asic|fpga)\b/.test(s)) {
    return 'Quantum & Hardware';
  }
  if (cats.some((c) => c.startsWith('cs.ro') || c.startsWith('physics') || c.startsWith('cond-mat')) || /\b(world model|robotics|materials|physical ai)\b/.test(s)) {
    return 'World Models & Science';
  }
  return 'AI Breakthrough';
}

function parseArxivAtomXml(xml) {
  const entries = [];
  const blocks = xml.split('<entry>').slice(1);
  for (const b of blocks) {
    const idMatch = b.match(/<id>https?:\/\/arxiv\.org\/abs\/([^<]+)<\/id>/);
    const titleMatch = b.match(/<title>([\s\S]*?)<\/title>/);
    const pubMatch = b.match(/<published>([^<]+)<\/published>/);
    const summaryMatch = b.match(/<summary>([\s\S]*?)<\/summary>/);
    const authorsArr = [...b.matchAll(/<author>[\s\S]*?<name>([^<]+)<\/name>[\s\S]*?<\/author>/g)].map((m) =>
      m[1].trim()
    );
    const categories = [...b.matchAll(/<category term="([^"]+)"/g)].map((m) => m[1]).slice(0, 3);
    if (!idMatch || !titleMatch) continue;
    const arxivId = idMatch[1].replace(/v\d+$/, '').trim();
    const title = titleMatch[1].replace(/\s+/g, ' ').trim();
    const rawSummary = summaryMatch ? summaryMatch[1].replace(/\s+/g, ' ').trim() : '';
    const summary = rawSummary.length > 340 ? `${rawSummary.slice(0, 337)}...` : rawSummary;
    const authors =
      authorsArr.length > 4
        ? `${authorsArr.slice(0, 4).join(', ')} et al.`
        : authorsArr.join(', ') || 'Research Team';
    const publishedAt = pubMatch ? pubMatch[1].slice(0, 10) : '';
    const combinedText = `${title} ${rawSummary} ${authors}`;
    entries.push({
      arxivId,
      title,
      summary,
      authors,
      lab: detectTechGiantLab(combinedText),
      domain: detectArxivDomain(categories, combinedText),
      categories,
      publishedAt,
      arxivUrl: `https://arxiv.org/abs/${arxivId}`,
      pdfUrl: `https://arxiv.org/pdf/${arxivId}`,
    });
  }
  return entries;
}

async function fetchTechGiantsLiveArxiv() {
  const headers = { 'User-Agent': 'KRONVEX-Research-Radar/3.1 (https://kronvex.org)' };
  const queries = [
    '(abs:"Google DeepMind" OR abs:"Google Research" OR abs:"Google Quantum" OR abs:"Samsung" OR abs:"NVIDIA" OR abs:"Microsoft Research" OR abs:"OpenAI" OR abs:"Anthropic" OR abs:"DeepSeek" OR abs:"Meta AI") AND (cat:cs.AI OR cat:cs.LG OR cat:cs.AR OR cat:quant-ph)',
    '(cat:cs.PL OR (cat:cs.SE AND (abs:"compiler" OR abs:"programming language" OR abs:"LLVM" OR abs:"Triton" OR abs:"CUDA" OR abs:"Rust"))) AND (abs:"new" OR abs:"novel" OR abs:"discover" OR abs:"framework" OR abs:"language" OR abs:"compiler")',
  ];

  const byId = new Map();
  for (let i = 0; i < queries.length; i++) {
    if (i > 0) await new Promise((r) => setTimeout(r, 1100));
    const maxRes = i === 0 ? 15 : 10;
    const url = `https://export.arxiv.org/api/query?search_query=${encodeURIComponent(queries[i])}&sortBy=submittedDate&sortOrder=descending&max_results=${maxRes}`;
    const res = await fetch(url, { headers });
    if (!res.ok) throw new Error(`arXiv HTTP ${res.status}`);
    const xml = await res.text();
    for (const item of parseArxivAtomXml(xml)) {
      if (!byId.has(item.arxivId)) byId.set(item.arxivId, item);
    }
  }

  return Array.from(byId.values())
    .sort((a, b) => b.publishedAt.localeCompare(a.publishedAt))
    .slice(0, 21)
    .map((p, idx) => ({ rank: idx + 1, ...p }));
}

async function syncGlobalIndex21() {
  const sinceDate = getDateDaysAgo(7);
  let existing = null;
  if (fs.existsSync(OUT_INDEX21_FILE)) {
    try {
      existing = JSON.parse(fs.readFileSync(OUT_INDEX21_FILE, 'utf-8'));
    } catch {
      existing = null;
    }
  }

  let githubWeekly = existing?.githubWeekly || [];
  let githubAllTime = existing?.githubAllTime || [];
  let githubMostDownloaded = existing?.githubMostDownloaded || [];
  let hfTrendingWeekly = existing?.hfTrendingWeekly || [];
  let hfMostDownloaded = existing?.hfMostDownloaded || [];
  let hfAllTimeDownloaded = existing?.hfAllTimeDownloaded || [];
  let hfDailyPapers = existing?.hfDailyPapers || [];
  let techGiantsLivePapers = existing?.techGiantsLivePapers || [];
  let anyLive = false;

  // 1. GitHub Top 21 Weekly Breakout (created in past 7 days, highest stars)
  try {
    const qWeekly = encodeURIComponent(`created:>=${sinceDate}`);
    const data = await fetchJson(
      `https://api.github.com/search/repositories?q=${qWeekly}&sort=stars&order=desc&per_page=21`,
      true
    );
    if (Array.isArray(data.items) && data.items.length > 0) {
      githubWeekly = data.items.slice(0, 21).map(mapGithubRepo);
      anyLive = true;
      console.log(`[SYNC] GitHub Weekly Top 21 fetched (since ${sinceDate})`);
    }
  } catch (err) {
    console.warn(`[SYNC] GitHub Weekly Top 21 skipped (${err.message})`);
  }

  // 2. GitHub Top 21 All-Time Most Starred
  try {
    const qAll = encodeURIComponent('stars:>50000');
    const data = await fetchJson(
      `https://api.github.com/search/repositories?q=${qAll}&sort=stars&order=desc&per_page=21`,
      true
    );
    if (Array.isArray(data.items) && data.items.length > 0) {
      githubAllTime = data.items.slice(0, 21).map(mapGithubRepo);
      anyLive = true;
      console.log('[SYNC] GitHub All-Time Most Starred Top 21 fetched');
    }
  } catch (err) {
    console.warn(`[SYNC] GitHub All-Time Most Starred skipped (${err.message})`);
  }

  // 3. GitHub Top 21 All-Time Most Downloaded (Cumulative GitHub Releases)
  try {
    const dlList = await fetchGithubMostDownloaded();
    if (dlList.length >= 10) {
      githubMostDownloaded = dlList;
      anyLive = true;
      console.log(`[SYNC] GitHub All-Time Most Downloaded Top ${dlList.length} fetched`);
    }
  } catch (err) {
    console.warn(`[SYNC] GitHub All-Time Most Downloaded skipped (${err.message})`);
  }

  // 4. Hugging Face Top 21 Weekly Trending AI Models
  try {
    const data = await fetchJson('https://huggingface.co/api/models?sort=trendingScore&direction=-1&limit=21', false);
    if (Array.isArray(data) && data.length > 0) {
      hfTrendingWeekly = data.slice(0, 21).map(mapHfModel);
      anyLive = true;
      console.log('[SYNC] Hugging Face Weekly Trending Top 21 fetched');
    }
  } catch (err) {
    console.warn(`[SYNC] Hugging Face Weekly Trending skipped (${err.message})`);
  }

  // 5. Hugging Face Top 21 Most Downloaded AI Models (30D)
  let raw30d = [];
  try {
    const data = await fetchJson(
      'https://huggingface.co/api/models?sort=downloads&direction=-1&limit=21&expand[]=downloads&expand[]=downloadsAllTime&expand[]=likes&expand[]=trendingScore&expand[]=pipeline_tag&expand[]=library_name&expand[]=lastModified',
      false
    );
    if (Array.isArray(data) && data.length > 0) {
      raw30d = data;
      hfMostDownloaded = data.slice(0, 21).map(mapHfModel);
      anyLive = true;
      console.log('[SYNC] Hugging Face 30D Most Downloaded Top 21 fetched');
    }
  } catch (err) {
    console.warn(`[SYNC] Hugging Face 30D Most Downloaded skipped (${err.message})`);
  }

  // 6. Hugging Face Top 21 All-Time Most Downloaded AI Models
  try {
    const hfAllTime = await fetchHfAllTimeDownloaded(raw30d);
    if (hfAllTime.length >= 10) {
      hfAllTimeDownloaded = hfAllTime;
      anyLive = true;
      console.log(`[SYNC] Hugging Face All-Time Most Downloaded Top ${hfAllTime.length} fetched`);
    }
  } catch (err) {
    console.warn(`[SYNC] Hugging Face All-Time Most Downloaded skipped (${err.message})`);
  }

  // 7. Hugging Face / arXiv Top 21 Live Daily Trending Research Papers
  try {
    const data = await fetchJson('https://huggingface.co/api/daily_papers?limit=21', false);
    if (Array.isArray(data) && data.length > 0) {
      const sorted = [...data].sort(
        (a, b) => Number(b?.paper?.upvotes ?? b?.upvotes ?? 0) - Number(a?.paper?.upvotes ?? a?.upvotes ?? 0)
      );
      hfDailyPapers = sorted.slice(0, 21).map(mapHfDailyPaper);
      anyLive = true;
      console.log(`[SYNC] Hugging Face / arXiv Daily Papers Top ${hfDailyPapers.length} fetched`);
    }
  } catch (err) {
    console.warn(`[SYNC] Hugging Face Daily Papers skipped (${err.message})`);
  }

  // 8. Live Tech Giants & Programming Languages Breakthrough Radar (arXiv API)
  try {
    const giantsLive = await fetchTechGiantsLiveArxiv();
    if (giantsLive.length >= 10) {
      techGiantsLivePapers = giantsLive;
      anyLive = true;
      console.log(`[SYNC] Tech Giants & PL Live arXiv Radar Top ${giantsLive.length} fetched`);
    }
  } catch (err) {
    console.warn(`[SYNC] Tech Giants & PL Live arXiv Radar skipped (${err.message})`);
  }

  const payload = {
    syncedAt: new Date().toISOString(),
    windowDays: 7,
    sinceDate,
    live: anyLive || Boolean(existing?.live),
    githubWeekly,
    githubAllTime,
    githubMostDownloaded,
    hfTrendingWeekly,
    hfMostDownloaded,
    hfAllTimeDownloaded,
    hfDailyPapers,
    techGiantsLivePapers,
  };

  fs.mkdirSync(path.dirname(OUT_INDEX21_FILE), { recursive: true });
  fs.writeFileSync(OUT_INDEX21_FILE, JSON.stringify(payload, null, 2) + '\n', 'utf-8');
  console.log(`[SYNC] Saved ${OUT_INDEX21_FILE}`);
}

await syncOrgCatalog();
await syncGlobalIndex21();

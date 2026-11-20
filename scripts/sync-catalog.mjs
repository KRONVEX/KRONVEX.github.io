import fs from 'node:fs';
import path from 'node:path';

const ORG = process.env.ORG_NAME || 'N-O-V-A-L-I-S';
const TOKEN = process.env.GITHUB_TOKEN || process.env.ORG_ACCESS_TOKEN || '';
const OUT_ORG_FILE = path.resolve(process.cwd(), 'src/data/live-github.json');
const OUT_INDEX21_FILE = path.resolve(process.cwd(), 'src/data/live-index-21.json');

async function fetchJson(url, useGithubAuth = false) {
  const headers = {
    Accept: 'application/json',
    'User-Agent': 'NOVALIS-Platform-Sync/2.0',
  };
  if (useGithubAuth) {
    headers.Accept = 'application/vnd.github+json';
    if (TOKEN) headers.Authorization = `Bearer ${TOKEN}`;
  }
  const res = await fetch(url, { headers });
  if (!res.ok) throw new Error(`HTTP ${res.status} for ${url}`);
  return res.json();
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
  let hfTrendingWeekly = existing?.hfTrendingWeekly || [];
  let hfMostDownloaded = existing?.hfMostDownloaded || [];
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

  // 2. GitHub Top 21 All-Time Highest Starred
  try {
    const qAll = encodeURIComponent('stars:>50000');
    const data = await fetchJson(
      `https://api.github.com/search/repositories?q=${qAll}&sort=stars&order=desc&per_page=21`,
      true
    );
    if (Array.isArray(data.items) && data.items.length > 0) {
      githubAllTime = data.items.slice(0, 21).map(mapGithubRepo);
      anyLive = true;
      console.log('[SYNC] GitHub All-Time Top 21 fetched');
    }
  } catch (err) {
    console.warn(`[SYNC] GitHub All-Time Top 21 skipped (${err.message})`);
  }

  // 3. Hugging Face Top 21 Weekly Trending AI Models
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

  // 4. Hugging Face Top 21 Most Downloaded AI Models
  try {
    const data = await fetchJson('https://huggingface.co/api/models?sort=downloads&direction=-1&limit=21', false);
    if (Array.isArray(data) && data.length > 0) {
      hfMostDownloaded = data.slice(0, 21).map(mapHfModel);
      anyLive = true;
      console.log('[SYNC] Hugging Face Most Downloaded Top 21 fetched');
    }
  } catch (err) {
    console.warn(`[SYNC] Hugging Face Most Downloaded skipped (${err.message})`);
  }

  const payload = {
    syncedAt: new Date().toISOString(),
    windowDays: 7,
    sinceDate,
    live: anyLive || Boolean(existing?.live),
    githubWeekly,
    githubAllTime,
    hfTrendingWeekly,
    hfMostDownloaded,
  };

  fs.mkdirSync(path.dirname(OUT_INDEX21_FILE), { recursive: true });
  fs.writeFileSync(OUT_INDEX21_FILE, JSON.stringify(payload, null, 2) + '\n', 'utf-8');
  console.log(`[SYNC] Saved ${OUT_INDEX21_FILE}`);
}

await syncOrgCatalog();
await syncGlobalIndex21();

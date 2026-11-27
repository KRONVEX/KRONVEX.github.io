import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  ArrowRight,
  BookOpen,
  Check,
  Code2,
  Copy,
  Download,
  ExternalLink,
  Globe,
  Layers,
  Play,
  ShieldCheck,
  Sparkles,
  Terminal,
  Zap,
} from 'lucide-react';
import { ScrollReveal, ScrollScrubText } from '../components/KineticScrollText';
import mcpMeta from '../data/mcp-meta.json';

type SnippetLang = 'curl' | 'js' | 'python' | 'cli';

interface EndpointPreset {
  id: string;
  method: 'GET' | 'POST';
  path: string;
  tag: string;
  summary: string;
  body?: string;
}

const ENDPOINT_PRESETS: EndpointPreset[] = [
  { id: 'health', method: 'GET', path: '/v1/health', tag: 'System', summary: 'Operational health, surfaces & endpoint index' },
  { id: 'search', method: 'GET', path: '/v1/search?q=webgpu&limit=4&fields=type,id,title,url', tag: 'System', summary: 'Unified fuzzy search with field projection' },
  { id: 'apps', method: 'GET', path: '/v1/apps', tag: 'Catalog', summary: 'Signed cross-platform Windows & Android apps' },
  { id: 'recommend', method: 'GET', path: '/v1/models/recommend?ramGb=16', tag: 'Catalog', summary: 'Local AI model fit recommendations by RAM' },
  { id: 'skills', method: 'GET', path: '/v1/skills?fields=id,name,category,tags', tag: 'Catalog', summary: 'Curated SKILL.md agent workflows' },
  { id: 'bibtex', method: 'GET', path: '/v1/research/1/bibtex', tag: 'Intel', summary: 'Verified arXiv BibTeX citation for Paper #1' },
  { id: 'top21', method: 'GET', path: '/v1/top21?board=github&limit=5', tag: 'Intel', summary: 'Live 6h GitHub & Hugging Face Top 21 radar' },
  { id: 'playbook', method: 'GET', path: '/v1/playbook?q=mcp', tag: 'Knowledge', summary: 'Engineering laws & AI/MCP/GEO glossary' },
  { id: 'work', method: 'GET', path: '/v1/work', tag: 'Catalog', summary: 'Verified live production case studies' },
  {
    id: 'batch',
    method: 'POST',
    path: '/v1/batch',
    tag: 'Batch',
    summary: 'Execute up to 10 read calls in 1 HTTP round-trip',
    body: JSON.stringify(
      {
        calls: [
          { id: 'models', path: '/v1/models/recommend?ramGb=16' },
          { id: 'paper1', path: '/v1/research/1/bibtex' },
        ],
      },
      null,
      2
    ),
  },
];

function buildCodeSnippet(lang: SnippetLang, preset: EndpointPreset): string {
  const url = `https://api.kronvex.org${preset.path}`;
  if (lang === 'curl') {
    if (preset.method === 'POST' && preset.body) {
      return `curl -sS -X POST "${url}" \\\n  -H "Content-Type: application/json" \\\n  -d '${preset.body.replace(/\n\s*/g, ' ')}'`;
    }
    return `curl -sS "${url}"`;
  }
  if (lang === 'js') {
    if (preset.method === 'POST' && preset.body) {
      return `const res = await fetch("${url}", {\n  method: "POST",\n  headers: { "Content-Type": "application/json" },\n  body: JSON.stringify(${preset.body})\n});\nconst { ok, data } = await res.json();\nconsole.log(data);`;
    }
    return `const res = await fetch("${url}");\nconst { ok, tier, ms, data } = await res.json();\nconsole.log({ ok, tier, ms, data });`;
  }
  if (lang === 'python') {
    if (preset.method === 'POST' && preset.body) {
      return `import requests\nres = requests.post("${url}", json=${preset.body})\nprint(res.json()["data"])`;
    }
    return `import requests\nres = requests.get("${url}")\nprint(res.json()["data"])`;
  }
  if (preset.id === 'search') return 'kronvex search "webgpu" --limit 4 --json';
  if (preset.id === 'recommend') return 'kronvex models recommend --json';
  if (preset.id === 'bibtex') return 'kronvex research bibtex 1 --json';
  if (preset.id === 'top21') return 'kronvex top21 github --limit 5 --json';
  if (preset.id === 'playbook') return 'kronvex playbook mcp --json';
  return 'kronvex doctor --json';
}

export function ApiDocsPage() {
  const [selectedId, setSelectedId] = useState<string>('search');
  const [snippetLang, setSnippetLang] = useState<SnippetLang>('curl');
  const [copiedCode, setCopiedCode] = useState(false);
  const [loading, setLoading] = useState(false);
  const [liveResult, setLiveResult] = useState<{ status: number; ms: number; source: string; body: string } | null>(null);

  const activePreset = ENDPOINT_PRESETS.find((e) => e.id === selectedId) ?? ENDPOINT_PRESETS[0];
  const snippet = useMemo(() => buildCodeSnippet(snippetLang, activePreset), [snippetLang, activePreset]);

  const copySnippet = () => {
    navigator.clipboard?.writeText(snippet).catch(() => {});
    setCopiedCode(true);
    window.setTimeout(() => setCopiedCode(false), 1800);
  };

  const runLiveRequest = async () => {
    setLoading(true);
    const t0 = performance.now();
    const candidates = [`https://api.kronvex.org${activePreset.path}`, `https://mcp.kronvex.org${activePreset.path}`];

    for (const targetUrl of candidates) {
      try {
        const res = await fetch(targetUrl, {
          method: activePreset.method,
          headers: activePreset.body ? { 'Content-Type': 'application/json' } : { Accept: 'application/json' },
          body: activePreset.body,
        });
        const text = await res.text();
        let pretty = text;
        try {
          pretty = JSON.stringify(JSON.parse(text), null, 2);
        } catch {
          // Keep raw text
        }
        setLiveResult({
          status: res.status,
          ms: Math.round(performance.now() - t0),
          source: new URL(targetUrl).host,
          body: pretty,
        });
        setLoading(false);
        return;
      } catch {
        // Try next candidate
      }
    }

    // Graceful fallback to static /api/catalog.json preview
    try {
      const res = await fetch('/api/catalog.json');
      const data = await res.json();
      setLiveResult({
        status: 200,
        ms: Math.round(performance.now() - t0),
        source: 'kronvex.org/api/catalog.json (static fallback)',
        body: JSON.stringify({ ok: true, class: 'ok', tier: 1, note: 'Bind api.kronvex.org on Cloudflare Worker for full dynamic /v1/* routing', sampleCounts: { apps: data.apps?.length, models: data.models?.length, skills: data.skills?.length } }, null, 2),
      });
    } catch (err) {
      setLiveResult({
        status: 0,
        ms: Math.round(performance.now() - t0),
        source: 'network-error',
        body: JSON.stringify({ ok: false, error: err instanceof Error ? err.message : 'Request failed' }, null, 2),
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-[1560px] mx-auto px-4 sm:px-6 lg:px-10 xl:px-12 py-14 space-y-20">
      {/* Hero */}
      <section className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-end">
        <div className="lg:col-span-8 space-y-5">
          <div className="inline-flex items-center gap-2 text-xs font-mono font-bold tracking-wider text-emerald-700 dark:text-emerald-300 uppercase">
            <Globe className="w-4 h-4" /> KRONVEX OFFICIAL PUBLIC REST API v1 · OPENAPI 3.1.0
          </div>
          <h1 className="font-display font-bold text-3xl sm:text-5xl text-black dark:text-white leading-[1.08] tracking-tight">
            One Unified Edge API for{' '}
            <span className="font-editorial italic font-normal text-sky-700 dark:text-emerald-300">
              Apps, Automation &amp; AI Agents.
            </span>
          </h1>
          <p className="text-base sm:text-lg text-slate-900 dark:text-slate-100 leading-relaxed max-w-3xl">
            Zero-auth, Tier-1 plain-HTTP JSON API hosted on Cloudflare Edge at{' '}
            <strong>https://api.kronvex.org/v1/*</strong>. Engineered with standardized{' '}
            <code>{'{ ok, class, tier: 1, ms, data }'}</code> envelopes, <code>fields=</code> token projection,{' '}
            <code>POST /v1/batch</code> multi-call execution, formal OpenAPI 3.1.0 contract, and ready-to-import Postman
            &amp; <code>api-anything</code> specs.
          </p>
          <div className="flex flex-wrap items-center gap-3 pt-1">
            <a
              href="/openapi.json"
              target="_blank"
              rel="noopener noreferrer"
              className="px-6 py-3 rounded-full bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-sm inline-flex items-center gap-2 shadow-lg shadow-emerald-500/20 transition"
            >
              <BookOpen className="w-4 h-4" /> OpenAPI 3.1.0 (/openapi.json) <ExternalLink className="w-3.5 h-3.5" />
            </a>
            <a
              href="/api/kronvex.postman_collection.json"
              download="kronvex.postman_collection.json"
              className="px-5 py-3 rounded-full border border-slate-300 dark:border-white/20 hover:border-sky-500 dark:hover:border-emerald-400 text-sm font-bold text-black dark:text-white inline-flex items-center gap-2 transition"
            >
              <Download className="w-4 h-4" /> Postman Collection
            </a>
            <a
              href="/api/kronvex.api-anything.json"
              target="_blank"
              rel="noopener noreferrer"
              className="px-5 py-3 rounded-full border border-slate-300 dark:border-white/20 hover:border-sky-500 dark:hover:border-emerald-400 text-sm font-bold text-black dark:text-white inline-flex items-center gap-2 transition"
            >
              api-anything Spec <ExternalLink className="w-3.5 h-3.5" />
            </a>
          </div>
        </div>

        {/* Metrics Strip */}
        <div className="lg:col-span-4 grid grid-cols-2 gap-4 border-t lg:border-t-0 lg:border-s border-slate-300/70 dark:border-white/15 pt-6 lg:pt-0 lg:ps-8">
          <div>
            <div className="font-brand text-2xl sm:text-3xl font-bold text-emerald-700 dark:text-emerald-300">
              {mcpMeta.apiEndpointsCount ?? 17} Paths
            </div>
            <div className="font-mono text-[11px] text-slate-700 dark:text-slate-300 mt-1">
              OpenAPI 3.1 · REST + Batch
            </div>
          </div>
          <div>
            <div className="font-brand text-2xl sm:text-3xl font-bold text-black dark:text-white">Tier 1</div>
            <div className="font-mono text-[11px] text-slate-700 dark:text-slate-300 mt-1">
              Plain HTTP · Zero API Keys
            </div>
          </div>
          <div>
            <div className="font-brand text-2xl sm:text-3xl font-bold text-black dark:text-white">3 Surfaces</div>
            <div className="font-mono text-[11px] text-slate-700 dark:text-slate-300 mt-1">
              REST /v1 · OpenAPI · /mcp
            </div>
          </div>
          <div>
            <div className="font-brand text-2xl sm:text-3xl font-bold text-black dark:text-white">$0 / mo</div>
            <div className="font-mono text-[11px] text-slate-700 dark:text-slate-300 mt-1">
              Cloudflare Edge · 100k/day
            </div>
          </div>
        </div>
      </section>

      {/* Interactive Live API Playground */}
      <ScrollReveal>
        <section className="p-6 sm:p-8 rounded-3xl border border-slate-300/80 dark:border-white/15 bg-white/80 dark:bg-white/[0.03] backdrop-blur-sm space-y-6">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-200/80 dark:border-white/10 pb-5">
            <div>
              <div className="font-mono text-xs font-bold uppercase tracking-wider text-sky-700 dark:text-sky-300 flex items-center gap-1.5">
                <Zap className="w-3.5 h-3.5" /> Interactive REST Explorer
              </div>
              <h2 className="font-display font-bold text-2xl text-black dark:text-white mt-1">
                Test Live Endpoints &amp; Generate Code
              </h2>
            </div>

            <button
              type="button"
              onClick={runLiveRequest}
              disabled={loading}
              className="px-5 py-2.5 rounded-full bg-emerald-500 hover:bg-emerald-400 disabled:opacity-60 text-slate-950 font-mono font-bold text-xs inline-flex items-center gap-2 self-start transition"
            >
              <Play className="w-3.5 h-3.5" /> {loading ? 'Executing...' : `Send ${activePreset.method} Request`}
            </button>
          </div>

          {/* Endpoint Selector Pills */}
          <div className="flex flex-wrap gap-2">
            {ENDPOINT_PRESETS.map((ep) => (
              <button
                key={ep.id}
                type="button"
                onClick={() => {
                  setSelectedId(ep.id);
                  setLiveResult(null);
                }}
                className={`px-3 py-1.5 rounded-full text-xs font-mono font-bold border transition inline-flex items-center gap-1.5 ${
                  selectedId === ep.id
                    ? 'bg-slate-950 dark:bg-white text-white dark:text-slate-950 border-slate-950 dark:border-white'
                    : 'border-slate-300 dark:border-white/20 text-slate-800 dark:text-slate-200 hover:border-emerald-500'
                }`}
              >
                <span className={ep.method === 'POST' ? 'text-amber-500' : 'text-emerald-500'}>{ep.method}</span>
                <span>{ep.path.split('?')[0]}</span>
              </button>
            ))}
          </div>

          <p className="text-xs sm:text-sm text-slate-700 dark:text-slate-300">
            <strong className="font-mono text-emerald-700 dark:text-emerald-300">
              {activePreset.method} https://api.kronvex.org{activePreset.path}
            </strong>{' '}
            — {activePreset.summary}
          </p>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {/* Code Snippet Panel */}
            <div className="rounded-2xl border border-slate-300/80 dark:border-white/15 bg-slate-950 overflow-hidden">
              <div className="flex items-center justify-between px-4 py-2 border-b border-white/10">
                <div className="flex items-center gap-1.5">
                  {(['curl', 'js', 'python', 'cli'] as SnippetLang[]).map((l) => (
                    <button
                      key={l}
                      type="button"
                      onClick={() => setSnippetLang(l)}
                      className={`px-2.5 py-1 rounded text-[11px] font-mono font-bold transition ${
                        snippetLang === l ? 'bg-emerald-500 text-slate-950' : 'text-slate-300 hover:bg-white/10'
                      }`}
                    >
                      {l.toUpperCase()}
                    </button>
                  ))}
                </div>
                <button
                  type="button"
                  onClick={copySnippet}
                  className="inline-flex items-center gap-1 text-xs font-mono text-slate-300 hover:text-white"
                >
                  {copiedCode ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                  {copiedCode ? 'Copied' : 'Copy'}
                </button>
              </div>
              <pre className="p-4 text-xs font-mono text-sky-200 overflow-x-auto max-h-80 leading-relaxed">
                <code>{snippet}</code>
              </pre>
            </div>

            {/* Live Response Panel */}
            <div className="rounded-2xl border border-slate-300/80 dark:border-white/15 bg-slate-950 overflow-hidden">
              <div className="px-4 py-2 border-b border-white/10 text-xs font-mono text-emerald-300 flex items-center justify-between">
                <span className="inline-flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5" /> Live JSON Response
                </span>
                {liveResult && (
                  <span className="text-slate-300">
                    HTTP {liveResult.status} · {liveResult.ms}ms · {liveResult.source}
                  </span>
                )}
              </div>
              <pre className="p-4 text-xs font-mono text-emerald-200 overflow-x-auto max-h-80 leading-relaxed">
                <code>
                  {liveResult
                    ? liveResult.body
                    : '// Click "Send Request" above to inspect the live Tier-1 JSON envelope from Cloudflare Edge.'}
                </code>
              </pre>
            </div>
          </div>
        </section>
      </ScrollReveal>

      {/* Endpoint Directory + Contracts */}
      <ScrollReveal>
        <section className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          <div className="lg:col-span-8 space-y-4">
            <div className="font-mono text-xs font-bold uppercase tracking-wider text-emerald-700 dark:text-emerald-300 flex items-center gap-1.5">
              <Code2 className="w-3.5 h-3.5" /> Full REST v1 Endpoint Matrix
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
              {ENDPOINT_PRESETS.map((ep) => (
                <div
                  key={ep.id}
                  className="p-4 rounded-2xl border border-slate-300/80 dark:border-white/15 bg-white/80 dark:bg-white/[0.03] space-y-1.5"
                >
                  <div className="flex items-center justify-between gap-2 font-mono text-xs">
                    <span className={ep.method === 'POST' ? 'font-bold text-amber-600 dark:text-amber-400' : 'font-bold text-emerald-600 dark:text-emerald-400'}>
                      {ep.method} {ep.path.split('?')[0]}
                    </span>
                    <span className="px-2 py-0.5 rounded-full text-[10px] bg-sky-500/15 text-sky-800 dark:text-sky-300">
                      {ep.tag}
                    </span>
                  </div>
                  <p className="text-xs text-slate-700 dark:text-slate-300">{ep.summary}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="lg:col-span-4 space-y-4">
            <div className="font-mono text-xs font-bold uppercase tracking-wider text-sky-700 dark:text-sky-300 flex items-center gap-1.5">
              <ShieldCheck className="w-3.5 h-3.5" /> Machine-Readable Contracts
            </div>
            <div className="p-5 rounded-2xl border border-slate-300/80 dark:border-white/15 bg-white/80 dark:bg-white/[0.03] space-y-3">
              {[
                { label: 'OpenAPI 3.1.0 Contract', href: '/openapi.json', note: 'Import into Swagger, Postman, GPT Actions' },
                { label: 'Postman Collection v2.1', href: '/api/kronvex.postman_collection.json', note: 'Pre-configured tests & variables' },
                { label: 'api-anything Tier-1 Spec', href: '/api/kronvex.api-anything.json', note: 'Zero-scraping agent discovery spec' },
                { label: 'MCP Discovery Manifest', href: '/.well-known/mcp.json', note: 'Streamable HTTP + local stdio' },
                { label: 'Agent Card (A2A)', href: '/.well-known/agent-card.json', note: 'Agent-to-Agent registry card' },
              ].map((doc) => (
                <a
                  key={doc.href}
                  href={doc.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-between gap-3 p-3 rounded-xl border border-slate-200 dark:border-white/10 hover:border-emerald-500 transition"
                >
                  <div>
                    <div className="text-sm font-bold text-black dark:text-white">{doc.label}</div>
                    <div className="text-[11px] font-mono text-slate-600 dark:text-slate-400">{doc.note}</div>
                  </div>
                  <ExternalLink className="w-4 h-4 text-emerald-500 shrink-0" />
                </a>
              ))}
            </div>
          </div>
        </section>
      </ScrollReveal>

      {/* Bottom CTA */}
      <section className="border-t border-slate-300/70 dark:border-white/15 pt-12 flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="space-y-2 max-w-2xl">
          <ScrollScrubText
            as="h2"
            text="Prefer MCP or a native Terminal CLI on top of this same API?"
            className="font-display font-bold text-2xl sm:text-3xl text-black dark:text-white"
          />
          <p className="text-sm text-slate-800 dark:text-slate-200">
            Connect via <code>https://mcp.kronvex.org/mcp</code> or install the 33-tool zero-dependency{' '}
            <code>kronvex</code> CLI.
          </p>
        </div>
        <div className="flex flex-wrap gap-3">
          <Link
            to="/cli"
            className="px-6 py-3 rounded-full bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-sm inline-flex items-center gap-2 transition"
          >
            <Terminal className="w-4 h-4" /> Install KRONVEX CLI
          </Link>
          <Link
            to="/mcp"
            className="px-5 py-3 rounded-full border border-slate-300 dark:border-white/20 text-black dark:text-white font-bold text-sm inline-flex items-center gap-2 hover:border-sky-500 transition"
          >
            <Layers className="w-4 h-4" /> Open MCP Hub <ArrowRight className="w-4 h-4 rtl:rotate-180" />
          </Link>
        </div>
      </section>
    </div>
  );
}

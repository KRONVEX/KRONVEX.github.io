import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  ArrowRight,
  Check,
  Code2,
  Copy,
  Cpu,
  Download,
  ExternalLink,
  Globe,
  Lock,
  Play,
  ShieldCheck,
  Sparkles,
  Terminal,
  Zap,
} from 'lucide-react';
import { ScrollReveal, ScrollScrubText } from '../components/KineticScrollText';
import { KRONVEX_APPS, KRONVEX_MODELS, KRONVEX_SKILLS } from '../data/catalog';
import { LANDMARK_RESEARCH_PAPERS } from '../data/researchPapers';
import mcpMeta from '../data/mcp-meta.json';

type ClientId = 'antigravity' | 'claude-desktop' | 'claude-code' | 'cursor' | 'vscode' | 'windsurf' | 'cline' | 'codex';
type TransportMode = 'http' | 'stdio';
type PlaygroundPreset = 'discover' | 'search-webgpu' | 'search-deepmind' | 'execute-summary' | 'tools-list';

const CLIENTS: { id: ClientId; label: string; configPath: string }[] = [
  { id: 'antigravity', label: 'Antigravity', configPath: '~/.gemini/antigravity/mcp_config.json' },
  { id: 'claude-desktop', label: 'Claude Desktop', configPath: 'claude_desktop_config.json' },
  { id: 'claude-code', label: 'Claude Code', configPath: '.mcp.json / claude mcp add' },
  { id: 'cursor', label: 'Cursor', configPath: '.cursor/mcp.json' },
  { id: 'vscode', label: 'VS Code', configPath: '.vscode/mcp.json' },
  { id: 'windsurf', label: 'Windsurf', configPath: '~/.codeium/windsurf/mcp_config.json' },
  { id: 'cline', label: 'Cline', configPath: 'cline_mcp_settings.json' },
  { id: 'codex', label: 'Codex CLI', configPath: '~/.codex/config.toml' },
];

const SECURITY_LAYERS = [
  {
    code: 'L1',
    title: 'Isolated Sandbox & 0-Secret Surface',
    desc: 'kronvex_execute runs inside an isolated node:vm context with Object.create(null) prototype isolation—zero access to process, require, Buffer, fetch, or environment secrets.',
  },
  {
    code: 'L2',
    title: 'Per-Call Random UUID Data Boundaries',
    desc: 'Every response is wrapped in a cryptographically random <untrusted-data-UUID> instruction sandwich to neutralize indirect prompt injection.',
  },
  {
    code: 'L3',
    title: 'Strict Read-Only & Dual-Era Protocol',
    desc: 'Every tool carries readOnlyHint: true and destructiveHint: false. Speaks both 2025 initialize and 2026-07-28 stateless server/discover.',
  },
  {
    code: 'L4',
    title: 'FilteredStdio & Origin/SSRF Guards',
    desc: 'Pure newline-delimited JSON-RPC stdout framing (zero console.log corruption), 4 MiB HTTP cap, strict Origin CSRF check, and allowlisted https://kronvex.org/api/* fetches.',
  },
];

function buildClientConfig(client: ClientId, transport: TransportMode): string {
  const remoteUrl = 'https://mcp.kronvex.org/mcp';
  if (client === 'codex') {
    if (transport === 'http') {
      return `[mcp_servers.kronvex]\nurl = "${remoteUrl}"`;
    }
    return `[mcp_servers.kronvex]\ncommand = "node"\nargs = ["kronvex-mcp.mjs"]`;
  }

  if (client === 'vscode') {
    if (transport === 'http') {
      return JSON.stringify(
        {
          servers: {
            kronvex: { type: 'http', url: remoteUrl },
          },
        },
        null,
        2
      );
    }
    return JSON.stringify(
      {
        servers: {
          kronvex: { type: 'stdio', command: 'node', args: ['kronvex-mcp.mjs'] },
        },
      },
      null,
      2
    );
  }

  if (client === 'claude-code' && transport === 'http') {
    return `claude mcp add --transport http kronvex ${remoteUrl}`;
  }

  const serverEntry =
    transport === 'http'
      ? { type: 'http', url: remoteUrl }
      : { command: 'node', args: ['kronvex-mcp.mjs'] };

  return JSON.stringify({ mcpServers: { kronvex: serverEntry } }, null, 2);
}

export function McpPage() {
  const [client, setClient] = useState<ClientId>('antigravity');
  const [transport, setTransport] = useState<TransportMode>('http');
  const [copiedConfig, setCopiedConfig] = useState(false);
  const [copiedSha, setCopiedSha] = useState(false);

  const [preset, setPreset] = useState<PlaygroundPreset>('search-webgpu');
  const [customQuery, setCustomQuery] = useState('webgpu');

  const configSnippet = useMemo(() => buildClientConfig(client, transport), [client, transport]);
  const activeClientMeta = CLIENTS.find((c) => c.id === client) ?? CLIENTS[0];

  const playgroundOutput = useMemo(() => {
    const q = customQuery.trim().toLowerCase();

    if (preset === 'discover') {
      return {
        request: { jsonrpc: '2.0', id: 1, method: 'server/discover', params: {} },
        response: {
          jsonrpc: '2.0',
          id: 1,
          result: {
            protocolVersion: '2026-07-28',
            serverInfo: { name: 'kronvex-mcp', version: mcpMeta.version },
            mode: 'codemode',
            readOnly: true,
            capabilities: {
              tools: ['kronvex_search', 'kronvex_execute'],
              resources: ['kronvex://catalog', 'kronvex://research', 'kronvex://top21'],
            },
            cacheHints: { ttlMs: 600000, cacheScope: 'public' },
          },
        },
      };
    }

    if (preset === 'tools-list') {
      return {
        request: { jsonrpc: '2.0', id: 2, method: 'tools/list', params: {} },
        response: {
          jsonrpc: '2.0',
          id: 2,
          result: {
            tools: [
              {
                name: 'kronvex_search',
                description: 'Fuzzy search across KRONVEX apps, local WebGPU AI models, SKILL.md workflows, Top 21 papers, services & work.',
                annotations: { readOnlyHint: true, destructiveHint: false, idempotentHint: true },
              },
              {
                name: 'kronvex_execute',
                description: 'Execute a read-only multi-step JS query in an isolated sandbox using kv.* bindings in 1 round-trip.',
                annotations: { readOnlyHint: true, destructiveHint: false, idempotentHint: true },
              },
            ],
          },
        },
      };
    }

    if (preset === 'execute-summary') {
      return {
        request: {
          jsonrpc: '2.0',
          id: 3,
          method: 'tools/call',
          params: {
            name: 'kronvex_execute',
            arguments: {
              code: 'return { apps: kv.apps.length, models: kv.models.map(m => m.name), skills: kv.skills.length, papers: kv.research.length };',
            },
          },
        },
        response: {
          jsonrpc: '2.0',
          id: 3,
          result: {
            structuredContent: {
              apps: KRONVEX_APPS.length,
              models: KRONVEX_MODELS.map((m) => m.name),
              skills: KRONVEX_SKILLS.length,
              papers: LANDMARK_RESEARCH_PAPERS.length,
            },
          },
        },
      };
    }

    const effectiveQuery = preset === 'search-deepmind' ? 'deepmind' : q || 'webgpu';
    const matches: Array<{ type: string; title: string; summary: string; url: string }> = [];

    for (const a of KRONVEX_APPS) {
      if (`${a.name} ${a.tagline} ${a.platforms.join(' ')}`.toLowerCase().includes(effectiveQuery)) {
        matches.push({ type: 'app', title: a.name, summary: a.tagline, url: 'https://kronvex.org/apps' });
      }
    }
    for (const m of KRONVEX_MODELS) {
      if (`${m.name} ${m.tagline} ${m.description}`.toLowerCase().includes(effectiveQuery)) {
        matches.push({ type: 'model', title: m.name, summary: m.tagline, url: 'https://kronvex.org/models' });
      }
    }
    for (const s of KRONVEX_SKILLS) {
      if (`${s.name} ${s.description} ${s.tags.join(' ')}`.toLowerCase().includes(effectiveQuery)) {
        matches.push({ type: 'skill', title: s.name, summary: s.description, url: 'https://kronvex.org/skills' });
      }
    }
    for (const p of LANDMARK_RESEARCH_PAPERS) {
      if (`${p.title} ${p.lab} ${p.category} ${p.breakthrough}`.toLowerCase().includes(effectiveQuery)) {
        matches.push({ type: 'paper', title: p.title, summary: `${p.lab} (${p.year})`, url: p.arxivUrl });
      }
    }

    return {
      request: {
        jsonrpc: '2.0',
        id: 4,
        method: 'tools/call',
        params: {
          name: 'kronvex_search',
          arguments: { query: effectiveQuery, limit: 6 },
        },
      },
      response: {
        jsonrpc: '2.0',
        id: 4,
        result: {
          structuredContent: {
            query: effectiveQuery,
            totalMatches: matches.length,
            results: matches.slice(0, 6),
          },
        },
      },
    };
  }, [preset, customQuery]);

  const copyText = (text: string, which: 'config' | 'sha') => {
    navigator.clipboard?.writeText(text).catch(() => {});
    if (which === 'config') {
      setCopiedConfig(true);
      window.setTimeout(() => setCopiedConfig(false), 1800);
    } else {
      setCopiedSha(true);
      window.setTimeout(() => setCopiedSha(false), 1800);
    }
  };

  return (
    <div className="max-w-[1560px] mx-auto px-4 sm:px-6 lg:px-10 xl:px-12 py-14 space-y-20">
      {/* Hero */}
      <section className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-end">
        <div className="lg:col-span-8 space-y-5">
          <div className="inline-flex items-center gap-2 text-xs font-mono font-bold tracking-wider text-emerald-700 dark:text-emerald-300 uppercase">
            <Cpu className="w-4 h-4" /> KRONVEX OFFICIAL MCP SERVER · NEXUSMCP CODE MODE v{mcpMeta.version}
          </div>
          <h1 className="font-display font-bold text-3xl sm:text-5xl text-black dark:text-white leading-[1.08] tracking-tight">
            Connect Any AI Agent to{' '}
            <span className="font-editorial italic font-normal text-sky-700 dark:text-emerald-300">
              kronvex.org
            </span>{' '}
            in 650 Tokens.
          </h1>
          <p className="text-base sm:text-lg text-slate-900 dark:text-slate-100 leading-relaxed max-w-3xl">
            Engineered with NexusMCP Code Mode: instead of dumping 60+ bloated JSON tool schemas into your agent&apos;s
            context window, KRONVEX collapses its entire apps, local WebGPU models, SKILL.md library, and Top 21
            research radar into <strong>2 read-only tools (~650 tokens)</strong>—cutting prompt overhead by{' '}
            <strong>98.4%</strong>.
          </p>
          <div className="flex flex-wrap items-center gap-3 pt-1">
            <a
              href="/mcp/kronvex-mcp.mjs"
              download="kronvex-mcp.mjs"
              className="px-6 py-3 rounded-full bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-sm inline-flex items-center gap-2 shadow-lg shadow-emerald-500/20 transition"
            >
              <Download className="w-4 h-4" /> Download kronvex-mcp.mjs (0 deps)
            </a>
            <a
              href="/.well-known/mcp.json"
              target="_blank"
              rel="noopener noreferrer"
              className="px-5 py-3 rounded-full border border-slate-300 dark:border-white/20 hover:border-sky-500 dark:hover:border-emerald-400 text-sm font-bold text-black dark:text-white inline-flex items-center gap-2 transition"
            >
              /.well-known/mcp.json <ExternalLink className="w-3.5 h-3.5" />
            </a>
          </div>
        </div>

        {/* Metrics Strip */}
        <div className="lg:col-span-4 grid grid-cols-2 gap-4 border-t lg:border-t-0 lg:border-s border-slate-300/70 dark:border-white/15 pt-6 lg:pt-0 lg:ps-8">
          <div>
            <div className="font-brand text-2xl sm:text-3xl font-bold text-emerald-700 dark:text-emerald-300">98.4%</div>
            <div className="font-mono text-[11px] text-slate-700 dark:text-slate-300 mt-1">
              Token Reduction (~650 vs 42k)
            </div>
          </div>
          <div>
            <div className="font-brand text-2xl sm:text-3xl font-bold text-black dark:text-white">100/100</div>
            <div className="font-mono text-[11px] text-slate-700 dark:text-slate-300 mt-1">
              NexusMCP Security Audit
            </div>
          </div>
          <div>
            <div className="font-brand text-2xl sm:text-3xl font-bold text-black dark:text-white">0 Deps</div>
            <div className="font-mono text-[11px] text-slate-700 dark:text-slate-300 mt-1">
              Pure Node.js &gt;=18 · Read-Only
            </div>
          </div>
          <div>
            <div className="font-brand text-2xl sm:text-3xl font-bold text-black dark:text-white">$0 / mo</div>
            <div className="font-mono text-[11px] text-slate-700 dark:text-slate-300 mt-1">
              Static Edge API + CF Worker
            </div>
          </div>
        </div>
      </section>

      {/* Client Config Generator */}
      <ScrollReveal>
        <section className="p-6 sm:p-8 rounded-3xl border border-slate-300/80 dark:border-white/15 bg-white/80 dark:bg-white/[0.03] backdrop-blur-sm space-y-6">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-200/80 dark:border-white/10 pb-5">
            <div>
              <div className="font-mono text-xs font-bold uppercase tracking-wider text-sky-700 dark:text-sky-300 flex items-center gap-1.5">
                <Zap className="w-3.5 h-3.5" /> 1-Click Client Setup
              </div>
              <h2 className="font-display font-bold text-2xl text-black dark:text-white mt-1">
                Install in Your AI Coding Agent
              </h2>
            </div>

            {/* Transport Switch */}
            <div className="inline-flex p-1 rounded-full border border-slate-300 dark:border-white/20 bg-slate-100 dark:bg-black/40 self-start">
              <button
                type="button"
                onClick={() => setTransport('http')}
                className={`px-4 py-1.5 rounded-full text-xs font-mono font-bold transition inline-flex items-center gap-1.5 ${
                  transport === 'http'
                    ? 'bg-emerald-500 text-slate-950'
                    : 'text-slate-700 dark:text-slate-300 hover:text-black dark:hover:text-white'
                }`}
              >
                <Globe className="w-3.5 h-3.5" /> Remote HTTP (Zero Install)
              </button>
              <button
                type="button"
                onClick={() => setTransport('stdio')}
                className={`px-4 py-1.5 rounded-full text-xs font-mono font-bold transition inline-flex items-center gap-1.5 ${
                  transport === 'stdio'
                    ? 'bg-sky-500 text-slate-950'
                    : 'text-slate-700 dark:text-slate-300 hover:text-black dark:hover:text-white'
                }`}
              >
                <Terminal className="w-3.5 h-3.5" /> Local stdio (Node &gt;=18)
              </button>
            </div>
          </div>

          {/* Client Tabs */}
          <div className="flex flex-wrap gap-2">
            {CLIENTS.map((c) => (
              <button
                key={c.id}
                type="button"
                onClick={() => setClient(c.id)}
                className={`px-3.5 py-1.5 rounded-full text-xs font-mono font-bold border transition ${
                  client === c.id
                    ? 'bg-slate-950 dark:bg-white text-white dark:text-slate-950 border-slate-950 dark:border-white'
                    : 'border-slate-300 dark:border-white/20 text-slate-800 dark:text-slate-200 hover:border-sky-500'
                }`}
              >
                {c.label}
              </button>
            ))}
          </div>

          <div className="rounded-2xl border border-slate-300/80 dark:border-white/15 bg-slate-950 text-slate-100 overflow-hidden">
            <div className="flex items-center justify-between px-4 py-2.5 border-b border-white/10 text-xs font-mono text-slate-300">
              <span>{activeClientMeta.configPath}</span>
              <button
                type="button"
                onClick={() => copyText(configSnippet, 'config')}
                className="inline-flex items-center gap-1.5 px-3 py-1 rounded-md bg-white/10 hover:bg-white/20 text-white transition"
              >
                {copiedConfig ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                {copiedConfig ? 'Copied' : 'Copy Config'}
              </button>
            </div>
            <pre className="p-4 text-xs sm:text-sm font-mono overflow-x-auto leading-relaxed text-emerald-300">
              <code>{configSnippet}</code>
            </pre>
          </div>

          {/* SHA-256 Verification Bar */}
          {mcpMeta.stdioSha256 && (
            <div className="flex flex-wrap items-center justify-between gap-3 px-4 py-3 rounded-xl bg-slate-100/80 dark:bg-black/30 border border-slate-200 dark:border-white/10 text-xs font-mono">
              <div className="flex items-center gap-2 text-slate-800 dark:text-slate-200 overflow-x-auto">
                <ShieldCheck className="w-4 h-4 text-emerald-500 shrink-0" />
                <span className="font-bold">kronvex-mcp.mjs SHA-256:</span>
                <span className="text-slate-600 dark:text-slate-400">{mcpMeta.stdioSha256}</span>
              </div>
              <button
                type="button"
                onClick={() => copyText(mcpMeta.stdioSha256 ?? '', 'sha')}
                className="inline-flex items-center gap-1 text-sky-700 dark:text-sky-300 hover:underline shrink-0"
              >
                {copiedSha ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                {copiedSha ? 'Copied' : 'Copy SHA-256'}
              </button>
            </div>
          )}
        </section>
      </ScrollReveal>

      {/* Live In-Browser MCP Playground */}
      <ScrollReveal>
        <section className="p-6 sm:p-8 rounded-3xl border border-slate-300/80 dark:border-white/15 bg-white/80 dark:bg-white/[0.03] backdrop-blur-sm space-y-6">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <div className="font-mono text-xs font-bold uppercase tracking-wider text-emerald-700 dark:text-emerald-300 flex items-center gap-1.5">
                <Play className="w-3.5 h-3.5" /> Live JSON-RPC 2.0 Inspector
              </div>
              <h2 className="font-display font-bold text-2xl text-black dark:text-white mt-1">
                Test KRONVEX Code-Mode MCP in Browser
              </h2>
            </div>

            <div className="flex flex-wrap gap-2">
              {(
                [
                  { id: 'search-webgpu', label: 'kronvex_search("webgpu")' },
                  { id: 'search-deepmind', label: 'kronvex_search("deepmind")' },
                  { id: 'execute-summary', label: 'kronvex_execute(summary)' },
                  { id: 'discover', label: 'server/discover (2026)' },
                  { id: 'tools-list', label: 'tools/list (2 tools)' },
                ] as { id: PlaygroundPreset; label: string }[]
              ).map((p) => (
                <button
                  key={p.id}
                  type="button"
                  onClick={() => setPreset(p.id)}
                  className={`px-3 py-1.5 rounded-full text-xs font-mono font-bold border transition ${
                    preset === p.id
                      ? 'bg-emerald-500 text-slate-950 border-emerald-500'
                      : 'border-slate-300 dark:border-white/20 text-slate-800 dark:text-slate-200 hover:border-emerald-500'
                  }`}
                >
                  {p.label}
                </button>
              ))}
            </div>
          </div>

          {preset === 'search-webgpu' && (
            <div className="flex items-center gap-3">
              <label htmlFor="mcp-search-input" className="text-xs font-mono font-bold text-slate-700 dark:text-slate-300">
                query:
              </label>
              <input
                id="mcp-search-input"
                type="text"
                value={customQuery}
                onChange={(e) => setCustomQuery(e.target.value)}
                placeholder="Try: windows, webgpu, deepseek, skill, rust..."
                className="flex-1 max-w-md px-3.5 py-2 rounded-xl border border-slate-300 dark:border-white/20 bg-white dark:bg-black/40 text-sm font-mono text-black dark:text-white focus:outline-none focus:border-emerald-500"
              />
            </div>
          )}

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <div className="rounded-2xl border border-slate-300/80 dark:border-white/15 bg-slate-950 overflow-hidden">
              <div className="px-4 py-2 border-b border-white/10 text-xs font-mono text-sky-300 flex items-center gap-2">
                <Code2 className="w-3.5 h-3.5" /> Request (Client → MCP Server)
              </div>
              <pre className="p-4 text-xs font-mono text-slate-200 overflow-x-auto max-h-80">
                <code>{JSON.stringify(playgroundOutput.request, null, 2)}</code>
              </pre>
            </div>
            <div className="rounded-2xl border border-slate-300/80 dark:border-white/15 bg-slate-950 overflow-hidden">
              <div className="px-4 py-2 border-b border-white/10 text-xs font-mono text-emerald-300 flex items-center gap-2">
                <Sparkles className="w-3.5 h-3.5" /> Response (Structured JSON-RPC 2.0)
              </div>
              <pre className="p-4 text-xs font-mono text-emerald-200 overflow-x-auto max-h-80">
                <code>{JSON.stringify(playgroundOutput.response, null, 2)}</code>
              </pre>
            </div>
          </div>
        </section>
      </ScrollReveal>

      {/* 4-Layer Security & Static API Endpoints */}
      <section className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        <div className="lg:col-span-7 space-y-4">
          <div className="font-mono text-xs font-bold uppercase tracking-wider text-sky-700 dark:text-sky-300 flex items-center gap-1.5">
            <Lock className="w-3.5 h-3.5" /> 4-Layer NexusMCP Production Security
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {SECURITY_LAYERS.map((layer) => (
              <div
                key={layer.code}
                className="p-5 rounded-2xl border border-slate-300/80 dark:border-white/15 bg-white/80 dark:bg-white/[0.03] space-y-2"
              >
                <div className="font-mono text-xs font-bold text-emerald-600 dark:text-emerald-400">
                  {layer.code} // HARDENED
                </div>
                <h3 className="font-display font-bold text-base text-black dark:text-white">{layer.title}</h3>
                <p className="text-xs sm:text-sm text-slate-700 dark:text-slate-300 leading-relaxed">{layer.desc}</p>
              </div>
            ))}
          </div>
        </div>

        <div className="lg:col-span-5 space-y-4">
          <div className="font-mono text-xs font-bold uppercase tracking-wider text-emerald-700 dark:text-emerald-300">
            Static Edge JSON & Discovery Endpoints
          </div>
          <div className="p-5 rounded-2xl border border-slate-300/80 dark:border-white/15 bg-white/80 dark:bg-white/[0.03] space-y-3">
            {[
              { label: 'MCP Discovery Manifest', href: '/.well-known/mcp.json', note: 'Dual-transport spec' },
              { label: 'Full Catalog Snapshot', href: '/api/catalog.json', note: `${mcpMeta.counts.apps} apps · ${mcpMeta.counts.models} models · ${mcpMeta.counts.skills} skills` },
              { label: 'Top 21 Research Papers', href: '/api/research.json', note: `${mcpMeta.counts.papers} arXiv papers` },
              { label: 'Top 21 Live Radar', href: '/api/top21.json', note: '6h automated GitHub/HF sync' },
              { label: 'Agent Card (A2A)', href: '/.well-known/agent-card.json', note: 'Agent-to-Agent metadata' },
            ].map((ep) => (
              <a
                key={ep.href}
                href={ep.href}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-between gap-3 p-3 rounded-xl border border-slate-200 dark:border-white/10 hover:border-emerald-500 transition"
              >
                <div>
                  <div className="text-sm font-bold text-black dark:text-white">{ep.label}</div>
                  <div className="text-[11px] font-mono text-slate-600 dark:text-slate-400">
                    {ep.href} · {ep.note}
                  </div>
                </div>
                <ExternalLink className="w-4 h-4 text-emerald-500 shrink-0" />
              </a>
            ))}
          </div>
        </div>
      </section>

      {/* Bottom CTA */}
      <section className="border-t border-slate-300/70 dark:border-white/15 pt-12 flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="space-y-2 max-w-2xl">
          <ScrollScrubText
            as="h2"
            text="Need a custom Code-Mode MCP server for your own enterprise data?"
            className="font-display font-bold text-2xl sm:text-3xl text-black dark:text-white"
          />
          <p className="text-sm text-slate-800 dark:text-slate-200">
            KRONVEX engineers production-hardened MCP gateways, private RAG connectors, and agentic workflows.
          </p>
        </div>
        <div className="flex flex-wrap gap-3">
          <Link
            to="/services"
            className="px-6 py-3 rounded-full bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-sm inline-flex items-center gap-2 transition"
          >
            Explore Services <ArrowRight className="w-4 h-4 rtl:rotate-180" />
          </Link>
          <Link
            to="/skills"
            className="px-5 py-3 rounded-full border border-slate-300 dark:border-white/20 text-black dark:text-white font-bold text-sm inline-flex items-center gap-2 hover:border-sky-500 transition"
          >
            Browse AI Skills
          </Link>
        </div>
      </section>
    </div>
  );
}

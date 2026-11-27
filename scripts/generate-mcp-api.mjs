import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import { fileURLToPath } from 'node:url';
import { build } from 'esbuild';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const publicDir = path.join(root, 'public');
const apiDir = path.join(publicDir, 'api');
const wellKnownDir = path.join(publicDir, '.well-known');

fs.mkdirSync(apiDir, { recursive: true });
fs.mkdirSync(wellKnownDir, { recursive: true });

async function loadTsModule(entryRelPath) {
  const result = await build({
    entryPoints: [path.join(root, entryRelPath)],
    bundle: true,
    write: false,
    format: 'esm',
    platform: 'node',
    target: 'node18',
    logLevel: 'silent',
  });
  const code = result.outputFiles[0].text;
  const dataUrl = `data:text/javascript;base64,${Buffer.from(code, 'utf-8').toString('base64')}`;
  return import(dataUrl);
}

const catalogMod = await loadTsModule('src/data/catalog.ts');
const papersMod = await loadTsModule('src/data/researchPapers.ts');
const liveGithub = JSON.parse(fs.readFileSync(path.join(root, 'src/data/live-github.json'), 'utf-8'));
const liveIndex21 = JSON.parse(fs.readFileSync(path.join(root, 'src/data/live-index-21.json'), 'utf-8'));

const generatedAt = new Date().toISOString();

// 1. /api/catalog.json
const catalogPayload = {
  schemaVersion: '1.0.0',
  generatedAt,
  syncedAt: liveGithub.syncedAt,
  organization: catalogMod.ORG_META,
  pillars: catalogMod.KRONVEX_PILLARS,
  apps: catalogMod.KRONVEX_APPS,
  models: catalogMod.KRONVEX_MODELS,
  skills: catalogMod.KRONVEX_SKILLS.map((s) => ({
    id: s.id,
    name: s.name,
    category: s.category,
    version: s.version,
    summary: s.description,
    description: s.description,
    compatibleAgents: s.compatibleAgents,
    tags: s.tags,
    fileName: s.fileName,
    contentPreview: typeof s.content === 'string' ? s.content.slice(0, 600) : '',
  })),
  services: [
    {
      id: 'custom-cross-platform',
      name: 'Custom Cross-Platform Software (Web, Windows & Android)',
      url: 'https://kronvex.org/services',
      stack: ['React 19', 'TypeScript', 'Rust', 'Flutter', 'Vite 6'],
    },
    {
      id: 'private-ai-rag',
      name: 'Private AI, Local WebGPU/ONNX & Enterprise RAG Systems',
      url: 'https://kronvex.org/services',
      stack: ['WebGPU', 'ONNX', 'GGUF', 'PyTorch', 'MCP'],
    },
    {
      id: 'market-intelligence',
      name: 'Quantitative Market Intelligence & Real-Time Pipelines',
      url: 'https://kronvex.org/services',
      stack: ['Python', 'FastAPI', 'PostgreSQL', 'WebSockets'],
    },
    {
      id: 'security-seo-geo',
      name: 'Performance, Security & SEO/GEO/AEO Hardening Audits',
      url: 'https://kronvex.org/services',
      stack: ['Cloudflare HSTS/CSP', 'JSON-LD', 'llms.txt', 'MCP'],
    },
  ],
  caseStudies: [
    {
      id: 'kronvex-platform',
      title: 'KRONVEX Global Edge Platform (kronvex.org)',
      category: 'Systems',
      metrics: { lighthouse: '100/100', rankPulseSeo: '100/100', rankPulseGeo: '97/100', seomator: '98/100', aeolint: '98/100', serverCost: '$0/mo' },
      url: 'https://kronvex.org/work',
    },
    {
      id: 'local-webgpu-studio',
      title: 'In-Browser Local WebGPU & WASM AI Chat Studio',
      category: 'AI Core',
      metrics: { dataSentExternally: '0 Bytes', trackedModels: catalogMod.KRONVEX_MODELS.length, execution: '100% Local' },
      url: 'https://kronvex.org/models?tab=chat',
    },
    {
      id: 'top21-research-radar',
      title: 'Automated Top 21 Global Research & Open-Source Radar',
      category: 'Market Intel',
      metrics: { frontierPapers: papersMod.LANDMARK_RESEARCH_PAPERS.length, refreshCadence: 'Every 6h', databaseInfra: 'Zero' },
      url: 'https://kronvex.org/research',
    },
    {
      id: 'agent-skills-bundler',
      title: 'Modular AI Agent Skills Marketplace & .ZIP Composer',
      category: 'AI Core',
      metrics: { curatedSkills: catalogMod.KRONVEX_SKILLS.length, initialBundleImpact: '0 KB (Lazy)', compatibleRuntimes: '4+' },
      url: 'https://kronvex.org/skills',
    },
    {
      id: 'kronvex-mcp-gateway',
      title: 'Official KRONVEX Code-Mode MCP Gateway (mcp.kronvex.org)',
      category: 'AI Core',
      metrics: { tokenReduction: '98.4% (~650 tokens)', securityAudit: '100/100', transports: 'Streamable HTTP + stdio', serverCost: '$0/mo' },
      url: 'https://kronvex.org/mcp',
    },
  ],
  githubStats: liveGithub.stats,
  repositories: liveGithub.repos,
};

fs.writeFileSync(path.join(apiDir, 'catalog.json'), JSON.stringify(catalogPayload, null, 2), 'utf-8');

// 2. /api/research.json
const researchPayload = {
  schemaVersion: '1.0.0',
  generatedAt,
  count: papersMod.LANDMARK_RESEARCH_PAPERS.length,
  papers: papersMod.LANDMARK_RESEARCH_PAPERS,
};
fs.writeFileSync(path.join(apiDir, 'research.json'), JSON.stringify(researchPayload, null, 2), 'utf-8');

// 3. /api/top21.json
const top21Payload = {
  schemaVersion: '1.0.0',
  generatedAt,
  syncedAt: liveIndex21.syncedAt ?? liveGithub.syncedAt,
  ...liveIndex21,
};
fs.writeFileSync(path.join(apiDir, 'top21.json'), JSON.stringify(top21Payload, null, 2), 'utf-8');

// 4. Compute SHA-256 of public/mcp/kronvex-mcp.mjs if present
const stdioServerPath = path.join(publicDir, 'mcp', 'kronvex-mcp.mjs');
let stdioSha256 = null;
let stdioBytes = 0;
if (fs.existsSync(stdioServerPath)) {
  const buf = fs.readFileSync(stdioServerPath);
  stdioSha256 = crypto.createHash('sha256').update(buf).digest('hex');
  stdioBytes = buf.length;
}

// 5. /.well-known/mcp.json (Official MCP Discovery Manifest)
const mcpManifest = {
  schemaVersion: '2026-07-28',
  name: 'kronvex-mcp',
  displayName: 'KRONVEX Official MCP Server',
  version: '1.0.0',
  architecture: 'NexusMCP Code Mode (2-tool ~650-token surface + Classic escape hatch)',
  description:
    'Official read-only Model Context Protocol server for KRONVEX (kronvex.org) — query cross-platform apps, local WebGPU AI models, SKILL.md agent workflows, Top 21 GitHub/Hugging Face/arXiv research radar, engineering services, and case studies.',
  provider: {
    organization: 'KRONVEX',
    url: 'https://kronvex.org',
    documentationUrl: 'https://kronvex.org/mcp',
    contact: 'kronvex1@gmail.com',
  },
  transports: {
    streamableHttp: {
      url: 'https://mcp.kronvex.org/mcp',
      protocolVersions: ['2026-07-28', '2025-03-26'],
      stateless: true,
      authentication: 'none (public read-only)',
    },
    stdio: {
      downloadUrl: 'https://kronvex.org/mcp/kronvex-mcp.mjs',
      runtime: 'node >= 18 (0 dependencies)',
      sha256: stdioSha256,
      bytes: stdioBytes,
      command: 'node',
      args: ['kronvex-mcp.mjs'],
      classicArgs: ['kronvex-mcp.mjs', '--mode', 'classic'],
    },
  },
  tools: {
    codeMode: ['kronvex_search', 'kronvex_execute'],
    classicMode: [
      'kronvex_list_apps',
      'kronvex_list_models',
      'kronvex_list_skills',
      'kronvex_search_research',
      'kronvex_get_top21',
      'kronvex_get_services',
    ],
  },
  security: {
    readOnlyByDefault: true,
    sandbox: 'isolated node:vm (no process/require/env/fetch)',
    untrustedDataBoundaries: 'per-call random UUID instruction sandwich',
    stdoutFraming: 'FilteredStdio (zero console.log corruption)',
    ssrfPolicy: 'strictly restricted to https://kronvex.org/api/*',
  },
  staticEndpoints: {
    catalog: 'https://kronvex.org/api/catalog.json',
    research: 'https://kronvex.org/api/research.json',
    top21: 'https://kronvex.org/api/top21.json',
  },
};

fs.writeFileSync(path.join(wellKnownDir, 'mcp.json'), JSON.stringify(mcpManifest, null, 2), 'utf-8');

// Also write compact metadata to src/data/mcp-meta.json for McpPage.tsx to import at build time
fs.writeFileSync(
  path.join(root, 'src/data/mcp-meta.json'),
  JSON.stringify(
    {
      version: mcpManifest.version,
      generatedAt,
      stdioSha256,
      stdioBytes,
      counts: {
        apps: catalogPayload.apps.length,
        models: catalogPayload.models.length,
        skills: catalogPayload.skills.length,
        papers: researchPayload.count,
        services: catalogPayload.services.length,
        caseStudies: catalogPayload.caseStudies.length,
      },
    },
    null,
    2
  ),
  'utf-8'
);

console.log(
  `[MCP-API] Generated /api/catalog.json, /api/research.json, /api/top21.json & /.well-known/mcp.json (kronvex-mcp.mjs sha256=${stdioSha256 ? stdioSha256.slice(0, 12) : 'pending'}).`
);

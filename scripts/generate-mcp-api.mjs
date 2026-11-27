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
    {
      id: 'kronvex-official-cli',
      title: 'KRONVEX Official Terminal CLI (kronvex / kvx v2.0.1)',
      category: 'Systems',
      metrics: { capabilities: 33, dependencies: '0 Deps (Node >=18)', protocols: 'REPL + --json + stream-json', mcpClient: 'Live mcp.kronvex.org/mcp' },
      url: 'https://kronvex.org/cli',
    },
    {
      id: 'kronvex-public-rest-api',
      title: 'KRONVEX Unified REST API v1 & OpenAPI 3.1 (api.kronvex.org)',
      category: 'Systems',
      metrics: { surfaces: 'REST /v1 + OpenAPI 3.1 + MCP', envelope: 'api-anything Tier-1 JSON', batchLimit: '10 ops / call', serverCost: '$0/mo' },
      url: 'https://kronvex.org/api-docs',
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

// 4. Compute SHA-256 of public/mcp/kronvex-mcp.mjs and public/cli/kronvex.mjs
const stdioServerPath = path.join(publicDir, 'mcp', 'kronvex-mcp.mjs');
let stdioSha256 = null;
let stdioBytes = 0;
if (fs.existsSync(stdioServerPath)) {
  const buf = fs.readFileSync(stdioServerPath);
  stdioSha256 = crypto.createHash('sha256').update(buf).digest('hex');
  stdioBytes = buf.length;
}

const cliPath = path.join(publicDir, 'cli', 'kronvex.mjs');
let cliSha256 = null;
let cliBytes = 0;
if (fs.existsSync(cliPath)) {
  const buf = fs.readFileSync(cliPath);
  cliSha256 = crypto.createHash('sha256').update(buf).digest('hex');
  cliBytes = buf.length;
}

// 5. /.well-known/mcp.json
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
    openapi: 'https://kronvex.org/openapi.json',
    restApi: 'https://api.kronvex.org/v1/health',
  },
};
fs.writeFileSync(path.join(wellKnownDir, 'mcp.json'), JSON.stringify(mcpManifest, null, 2), 'utf-8');

// 6. /openapi.json — Formal OpenAPI 3.1.0 Contract for KRONVEX Public REST API v1
const envelopeRef = { $ref: '#/components/schemas/ApiEnvelope' };
const errRef = { $ref: '#/components/schemas/ApiError' };

const openapiSpec = {
  openapi: '3.1.0',
  info: {
    title: 'KRONVEX Official Public REST API',
    version: '1.0.0',
    summary: 'Zero-auth, Tier-1 read-only REST API, OpenAPI 3.1 contract & Streamable HTTP MCP gateway for kronvex.org.',
    description:
      'Unified edge API inspired by api-anything and NexusMCP. Serves deterministic JSON envelopes ({ ok, class, tier: 1, version, ms, data }) with field projection, batch execution, local AI hardware-fit recommendations, and BibTeX exports at $0 recurring server cost.',
    contact: { name: 'KRONVEX Organization', url: 'https://kronvex.org/api-docs', email: 'kronvex1@gmail.com' },
    license: { name: 'Apache-2.0', url: 'https://www.apache.org/licenses/LICENSE-2.0.html' },
  },
  servers: [
    { url: 'https://api.kronvex.org', description: 'KRONVEX Production Edge REST API (Cloudflare Workers)' },
    { url: 'https://mcp.kronvex.org', description: 'KRONVEX Unified MCP + REST Edge Endpoint' },
  ],
  tags: [
    { name: 'System', description: 'Health, discovery & batch operations' },
    { name: 'Catalog', description: 'Apps, local AI models, SKILL.md library, services & verified work' },
    { name: 'Intelligence', description: 'Top 21 frontier research papers, BibTeX & GitHub/HF radar' },
    { name: 'Knowledge', description: 'Engineering playbook laws & AI/SEO technical glossary' },
  ],
  paths: {
    '/v1/health': {
      get: {
        tags: ['System'],
        operationId: 'getHealth',
        summary: 'API health, version & endpoint directory',
        responses: { 200: { description: 'Operational status', content: { 'application/json': { schema: envelopeRef } } } },
      },
    },
    '/v1/search': {
      get: {
        tags: ['System'],
        operationId: 'searchKronvex',
        summary: 'Unified fuzzy search across KRONVEX datasets with optional field projection',
        parameters: [
          { name: 'q', in: 'query', required: true, schema: { type: 'string' }, description: 'Search query (e.g. webgpu, deepmind, mcp)' },
          { name: 'category', in: 'query', schema: { type: 'string', enum: ['all', 'apps', 'models', 'skills', 'research', 'services', 'work'], default: 'all' } },
          { name: 'limit', in: 'query', schema: { type: 'integer', minimum: 1, maximum: 25, default: 10 } },
          { name: 'fields', in: 'query', schema: { type: 'string' }, description: 'Comma-separated field projection list (e.g. id,title,url)' },
        ],
        responses: {
          200: { description: 'Ranked search matches', content: { 'application/json': { schema: envelopeRef } } },
          400: { description: 'Missing query parameter', content: { 'application/json': { schema: errRef } } },
        },
      },
    },
    '/v1/apps': {
      get: {
        tags: ['Catalog'],
        operationId: 'listApps',
        summary: 'List signed cross-platform Windows & Android apps',
        parameters: [{ name: 'fields', in: 'query', schema: { type: 'string' } }],
        responses: { 200: { description: 'Apps catalog', content: { 'application/json': { schema: envelopeRef } } } },
      },
    },
    '/v1/apps/{id}': {
      get: {
        tags: ['Catalog'],
        operationId: 'getAppById',
        summary: 'Get a single KRONVEX application with artifacts & requirements',
        parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' } }],
        responses: {
          200: { description: 'Application record', content: { 'application/json': { schema: envelopeRef } } },
          404: { description: 'App not found', content: { 'application/json': { schema: errRef } } },
        },
      },
    },
    '/v1/models': {
      get: {
        tags: ['Catalog'],
        operationId: 'listModels',
        summary: 'List verified local-first WebGPU/ONNX & GGUF AI models',
        parameters: [{ name: 'fields', in: 'query', schema: { type: 'string' } }],
        responses: { 200: { description: 'Models catalog', content: { 'application/json': { schema: envelopeRef } } } },
      },
    },
    '/v1/models/recommend': {
      get: {
        tags: ['Catalog'],
        operationId: 'recommendModels',
        summary: 'Recommend local AI models that fit a given host RAM budget (GB)',
        parameters: [{ name: 'ramGb', in: 'query', schema: { type: 'number', minimum: 2, maximum: 512, default: 16 } }],
        responses: { 200: { description: 'Hardware-fitted model recommendations', content: { 'application/json': { schema: envelopeRef } } } },
      },
    },
    '/v1/models/{id}': {
      get: {
        tags: ['Catalog'],
        operationId: 'getModelById',
        summary: 'Get a single AI model specification by ID',
        parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' } }],
        responses: {
          200: { description: 'Model record', content: { 'application/json': { schema: envelopeRef } } },
          404: { description: 'Model not found', content: { 'application/json': { schema: errRef } } },
        },
      },
    },
    '/v1/skills': {
      get: {
        tags: ['Catalog'],
        operationId: 'listSkills',
        summary: 'List curated SKILL.md workflows for AI coding agents',
        parameters: [{ name: 'fields', in: 'query', schema: { type: 'string' } }],
        responses: { 200: { description: 'Skills catalog', content: { 'application/json': { schema: envelopeRef } } } },
      },
    },
    '/v1/skills/{id}': {
      get: {
        tags: ['Catalog'],
        operationId: 'getSkillById',
        summary: 'Get a single SKILL.md entry by ID',
        parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' } }],
        responses: {
          200: { description: 'Skill record', content: { 'application/json': { schema: envelopeRef } } },
          404: { description: 'Skill not found', content: { 'application/json': { schema: errRef } } },
        },
      },
    },
    '/v1/research': {
      get: {
        tags: ['Intelligence'],
        operationId: 'listResearch',
        summary: 'List or filter the Top 21 frontier AI & computing arXiv papers',
        parameters: [
          { name: 'q', in: 'query', schema: { type: 'string' }, description: 'Optional keyword/lab filter' },
          { name: 'limit', in: 'query', schema: { type: 'integer', minimum: 1, maximum: 21, default: 21 } },
          { name: 'fields', in: 'query', schema: { type: 'string' } },
        ],
        responses: { 200: { description: 'Research papers list', content: { 'application/json': { schema: envelopeRef } } } },
      },
    },
    '/v1/research/{id}': {
      get: {
        tags: ['Intelligence'],
        operationId: 'getResearchPaper',
        summary: 'Get a frontier paper by rank (1-21) or arXiv ID',
        parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' } }],
        responses: {
          200: { description: 'Paper details', content: { 'application/json': { schema: envelopeRef } } },
          404: { description: 'Paper not found', content: { 'application/json': { schema: errRef } } },
        },
      },
    },
    '/v1/research/{id}/bibtex': {
      get: {
        tags: ['Intelligence'],
        operationId: 'getPaperBibtex',
        summary: 'Export verified BibTeX citation for a paper by rank or arXiv ID',
        parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' } }],
        responses: {
          200: { description: 'BibTeX payload', content: { 'application/json': { schema: envelopeRef } } },
          404: { description: 'Paper not found', content: { 'application/json': { schema: errRef } } },
        },
      },
    },
    '/v1/top21': {
      get: {
        tags: ['Intelligence'],
        operationId: 'getTop21',
        summary: 'Get live 6-hour synced Top 21 GitHub & Hugging Face leaderboards',
        parameters: [
          { name: 'board', in: 'query', schema: { type: 'string', enum: ['github', 'hf', 'weekly', 'all'], default: 'github' } },
          { name: 'limit', in: 'query', schema: { type: 'integer', minimum: 1, maximum: 21, default: 10 } },
        ],
        responses: { 200: { description: 'Leaderboard snapshot', content: { 'application/json': { schema: envelopeRef } } } },
      },
    },
    '/v1/services': {
      get: {
        tags: ['Catalog'],
        operationId: 'listServices',
        summary: 'List KRONVEX custom software & AI-native engineering services',
        responses: { 200: { description: 'Services catalog', content: { 'application/json': { schema: envelopeRef } } } },
      },
    },
    '/v1/work': {
      get: {
        tags: ['Catalog'],
        operationId: 'listCaseStudies',
        summary: 'List verified production engineering case studies with live telemetry',
        responses: { 200: { description: 'Case studies list', content: { 'application/json': { schema: envelopeRef } } } },
      },
    },
    '/v1/playbook': {
      get: {
        tags: ['Knowledge'],
        operationId: 'getPlaybook',
        summary: 'Query KRONVEX 6 engineering laws & 16-term AI/MCP/GEO technical glossary',
        parameters: [{ name: 'q', in: 'query', schema: { type: 'string' } }],
        responses: { 200: { description: 'Playbook & glossary', content: { 'application/json': { schema: envelopeRef } } } },
      },
    },
    '/v1/batch': {
      post: {
        tags: ['System'],
        operationId: 'executeBatch',
        summary: 'Execute up to 10 read-only REST operations in 1 HTTP round-trip (api-anything pattern)',
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['calls'],
                properties: {
                  calls: {
                    type: 'array',
                    minItems: 1,
                    maxItems: 10,
                    items: {
                      type: 'object',
                      required: ['path'],
                      properties: {
                        id: { type: 'string' },
                        path: { type: 'string', example: '/v1/search?q=webgpu&limit=3' },
                      },
                    },
                  },
                },
              },
            },
          },
        },
        responses: {
          200: { description: 'Batch execution results', content: { 'application/json': { schema: envelopeRef } } },
          400: { description: 'Invalid batch request', content: { 'application/json': { schema: errRef } } },
        },
      },
    },
  },
  components: {
    schemas: {
      ApiEnvelope: {
        type: 'object',
        required: ['ok', 'class', 'tier', 'version', 'ms', 'data'],
        properties: {
          ok: { type: 'boolean', example: true },
          class: { type: 'string', enum: ['ok', 'input', 'not_found', 'method', 'rate', 'error'] },
          tier: { type: 'integer', example: 1 },
          version: { type: 'string', example: '1.0.0' },
          ms: { type: 'integer', example: 14 },
          data: {},
          nextRequest: {
            type: 'object',
            properties: {
              method: { type: 'string' },
              path: { type: 'string' },
            },
          },
        },
      },
      ApiError: {
        type: 'object',
        required: ['ok', 'class', 'reason'],
        properties: {
          ok: { type: 'boolean', example: false },
          class: { type: 'string', example: 'input' },
          reason: { type: 'string' },
          next: { type: 'string' },
        },
      },
    },
  },
};

fs.writeFileSync(path.join(publicDir, 'openapi.json'), JSON.stringify(openapiSpec, null, 2), 'utf-8');

// 7. /api/kronvex.postman_collection.json — Ready-to-Import Postman Collection v2.1
const mkPostmanReq = (name, method, relPath, body = null) => ({
  name,
  event: [
    {
      listen: 'test',
      script: {
        type: 'text/javascript',
        exec: [
          'pm.test("HTTP 200 OK", () => pm.response.to.have.status(200));',
          'pm.test("Envelope ok=true & tier=1", () => { const j = pm.response.json(); pm.expect(j.ok).to.eql(true); pm.expect(j.tier).to.eql(1); });',
        ],
      },
    },
  ],
  request: {
    method,
    header: body ? [{ key: 'Content-Type', value: 'application/json' }] : [{ key: 'Accept', value: 'application/json' }],
    url: `{{baseUrl}}${relPath}`,
    ...(body ? { body: { mode: 'raw', raw: JSON.stringify(body, null, 2) } } : {}),
  },
});

const postmanCollection = {
  info: {
    name: 'KRONVEX Official Public REST API v1',
    description: 'Zero-auth Tier-1 REST API for kronvex.org (Apps, Local WebGPU AI Models, SKILL.md Workflows, Top 21 Research + BibTeX, Playbook & Batch Runner).',
    schema: 'https://schema.getpostman.com/json/collection/v2.1.0/collection.json',
  },
  variable: [{ key: 'baseUrl', value: 'https://api.kronvex.org', type: 'string' }],
  item: [
    mkPostmanReq('GET Health', 'GET', '/v1/health'),
    mkPostmanReq('GET Unified Search (webgpu)', 'GET', '/v1/search?q=webgpu&limit=5&fields=type,id,title,url'),
    mkPostmanReq('GET Apps Catalog', 'GET', '/v1/apps'),
    mkPostmanReq('GET Local AI Models', 'GET', '/v1/models'),
    mkPostmanReq('GET Model Hardware Fit (16GB RAM)', 'GET', '/v1/models/recommend?ramGb=16'),
    mkPostmanReq('GET AI Agent Skills', 'GET', '/v1/skills'),
    mkPostmanReq('GET Top 21 Research Papers', 'GET', '/v1/research?limit=5'),
    mkPostmanReq('GET Paper #1 BibTeX', 'GET', '/v1/research/1/bibtex'),
    mkPostmanReq('GET Top 21 GitHub Radar', 'GET', '/v1/top21?board=github&limit=5'),
    mkPostmanReq('GET Services', 'GET', '/v1/services'),
    mkPostmanReq('GET Verified Case Studies', 'GET', '/v1/work'),
    mkPostmanReq('GET Playbook & Glossary', 'GET', '/v1/playbook?q=mcp'),
    mkPostmanReq('POST Batch Multi-Call', 'POST', '/v1/batch', {
      calls: [
        { id: 'models', path: '/v1/models/recommend?ramGb=16' },
        { id: 'paper1', path: '/v1/research/1/bibtex' },
      ],
    }),
  ],
};
fs.writeFileSync(path.join(apiDir, 'kronvex.postman_collection.json'), JSON.stringify(postmanCollection, null, 2), 'utf-8');

// 8. /api/kronvex.api-anything.json — Authentic api-anything Tier-1 Site Spec
const apiAnythingSpec = {
  name: 'kronvex',
  displayName: 'KRONVEX Platform',
  baseUrl: 'https://api.kronvex.org',
  openapiUrl: 'https://kronvex.org/openapi.json',
  mcpUrl: 'https://mcp.kronvex.org/mcp',
  description: 'Official KRONVEX Tier-1 plain-HTTP read operations for cross-platform apps, local WebGPU AI models, SKILL.md workflows, Top 21 research papers + BibTeX, and engineering case studies.',
  operations: [
    {
      name: 'search',
      description: 'Search across KRONVEX apps, models, skills, papers, services & work.',
      request: { method: 'GET', url: 'https://api.kronvex.org/v1/search?q={q}&category={category}&limit={limit}' },
      params: [
        { name: 'q', type: 'string', required: true, example: 'webgpu' },
        { name: 'category', type: 'string', required: false, example: 'all' },
        { name: 'limit', type: 'number', required: false, example: 5 },
      ],
      readOnly: true,
      minTier: 1,
    },
    {
      name: 'recommendModels',
      description: 'Recommend local WebGPU/GGUF AI models fitting a host RAM size in GB.',
      request: { method: 'GET', url: 'https://api.kronvex.org/v1/models/recommend?ramGb={ramGb}' },
      params: [{ name: 'ramGb', type: 'number', required: false, example: 16 }],
      readOnly: true,
      minTier: 1,
    },
    {
      name: 'getPaperBibtex',
      description: 'Fetch verified BibTeX citation for a Top 21 frontier AI research paper.',
      request: { method: 'GET', url: 'https://api.kronvex.org/v1/research/{id}/bibtex' },
      params: [{ name: 'id', type: 'string', required: true, example: '1' }],
      readOnly: true,
      minTier: 1,
    },
    {
      name: 'getTop21',
      description: 'Fetch live 6-hour synced GitHub or Hugging Face Top 21 leaderboards.',
      request: { method: 'GET', url: 'https://api.kronvex.org/v1/top21?board={board}&limit={limit}' },
      params: [
        { name: 'board', type: 'string', required: false, example: 'github' },
        { name: 'limit', type: 'number', required: false, example: 10 },
      ],
      readOnly: true,
      minTier: 1,
    },
  ],
};
fs.writeFileSync(path.join(apiDir, 'kronvex.api-anything.json'), JSON.stringify(apiAnythingSpec, null, 2), 'utf-8');

// 9. Build-time metadata for McpPage.tsx, CliPage.tsx, ApiDocsPage.tsx
fs.writeFileSync(
  path.join(root, 'src/data/mcp-meta.json'),
  JSON.stringify(
    {
      version: mcpManifest.version,
      generatedAt,
      stdioSha256,
      stdioBytes,
      cliSha256,
      cliBytes,
      apiEndpointsCount: Object.keys(openapiSpec.paths).length,
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
  `[MCP-API] Generated /api/*.json, /openapi.json (${Object.keys(openapiSpec.paths).length} REST paths), Postman collection, api-anything spec & /.well-known/mcp.json.`
);

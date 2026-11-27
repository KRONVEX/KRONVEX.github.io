import fs from 'node:fs';
import path from 'node:path';

const distDir = path.resolve(process.cwd(), 'dist');
fs.writeFileSync(path.join(distDir, '.nojekyll'), '', 'utf-8');
console.log('[POSTBUILD] Created dist/.nojekyll for GitHub Pages.');

const indexPath = path.join(distDir, 'index.html');
const baseHtml = fs.readFileSync(indexPath, 'utf-8');

const ROUTES = [
  {
    slug: 'apps',
    title: 'KRONVEX Apps — Signed Windows & Android Releases',
    description: 'Download signed Windows (.EXE/.MSI) and Android (.APK) apps from KRONVEX with SHA-256 verification and zero tracking.',
    h1: 'Signed Windows & Android Cross-Platform Applications',
  },
  {
    slug: 'models',
    title: 'KRONVEX AI Models — Local WebGPU & GGUF Studio',
    description: 'Run quantized ONNX AI models locally in your browser via WebGPU/WASM or download GGUF weights with hardware detection.',
    h1: 'Local-First AI Models & In-Browser WebGPU Chat Studio',
  },
  {
    slug: 'skills',
    title: 'KRONVEX AI Skills — Modular SKILL.md Marketplace',
    description: 'Browse, preview, and bundle production-ready SKILL.md modules as .ZIP packages for Antigravity, Claude Code, Cursor & Gemini CLI.',
    h1: 'AI Agent Skills Marketplace & Modular .ZIP Bundler',
  },
  {
    slug: 'top-21',
    title: 'Top 21 Radar — GitHub, Hugging Face & Research',
    description: 'Live Top 21 weekly GitHub breakouts, All-Time legends, Hugging Face AI models, and landmark AI research papers.',
    h1: 'Top 21 Global Tech, Open-Source & AI Research Radar',
  },
  {
    slug: 'research',
    title: 'Top 21 AI & Tech Research Papers | KRONVEX',
    description: 'Verified landmark arXiv breakthroughs from DeepMind, OpenAI, Anthropic, NVIDIA, DeepSeek, Microsoft, Samsung AI & MIT with BibTeX.',
    h1: 'Top 21 AI, Computing & Frontier Research Papers',
  },
  {
    slug: 'papers',
    title: 'Top 21 AI & Tech Research Papers | KRONVEX',
    description: 'Verified landmark arXiv breakthroughs from DeepMind, OpenAI, Anthropic, NVIDIA, DeepSeek, Microsoft, Samsung AI & MIT with BibTeX.',
    h1: 'Top 21 AI, Computing & Frontier Research Papers',
    canonicalSlug: 'research',
  },
  {
    slug: 'arcade',
    title: 'KRONVEX Arcade — Tech Quiz, AI Chess & Orbital',
    description: 'Play the trilingual (EN/FR/AR) Tech & AI Quiz Arena, local Alpha-Beta Neural Chess, and 60fps Orbital Defender.',
    h1: 'KRONVEX Arcade — Tech Quiz, Neural Chess & Orbital Defender',
  },
  {
    slug: 'games',
    title: 'KRONVEX Arcade — Tech Quiz, AI Chess & Orbital',
    description: 'Play the trilingual (EN/FR/AR) Tech & AI Quiz Arena, local Alpha-Beta Neural Chess, and 60fps Orbital Defender.',
    h1: 'KRONVEX Arcade — Tech Quiz, Neural Chess & Orbital Defender',
    canonicalSlug: 'arcade',
  },
  {
    slug: 'constellation',
    title: 'Ecosystem Constellation — Interactive Map | KRONVEX',
    description: 'Explore the interactive orbital topology connecting KRONVEX pillars, apps, local AI models, and agent skills.',
    h1: 'KRONVEX Ecosystem Constellation & Orbital Map',
  },
  {
    slug: 'enterprise',
    title: 'KRONVEX Enterprise — Custom Apps & Private AI',
    description: 'Custom cross-platform Windows, Android & web engineering, private LLM/RAG systems, market data pipelines, and scope builder.',
    h1: 'Enterprise Software Engineering & Private AI Systems',
  },
  {
    slug: 'solutions',
    title: 'KRONVEX Enterprise — Custom Apps & Private AI',
    description: 'Custom cross-platform Windows, Android & web engineering, private LLM/RAG systems, market data pipelines, and scope builder.',
    h1: 'Enterprise Software Engineering & Private AI Systems',
    canonicalSlug: 'enterprise',
  },
  {
    slug: 'services',
    title: 'Custom Software Development & AI Services | KRONVEX',
    description: 'Custom web, Windows & Android software development, private AI & RAG systems, AI agent workflows, and real-time data pipelines.',
    h1: 'Custom Software Development & AI-Native Engineering Services',
  },
  {
    slug: 'work',
    title: 'Engineering Case Studies & Verified Work | KRONVEX',
    description: 'Inspect live KRONVEX software and AI case studies: zero-server 100/100 web architecture, local WebGPU AI studio, and Top 21 research radar.',
    h1: 'Engineering Case Studies & Verified Proof of Work',
  },
  {
    slug: 'case-studies',
    title: 'Engineering Case Studies & Verified Work | KRONVEX',
    description: 'Inspect live KRONVEX software and AI case studies: zero-server 100/100 web architecture, local WebGPU AI studio, and Top 21 research radar.',
    h1: 'Engineering Case Studies & Verified Proof of Work',
    canonicalSlug: 'work',
  },
  {
    slug: 'playbook',
    title: 'Engineering Playbook & AI Systems Glossary | KRONVEX',
    description: 'Open KRONVEX engineering playbook and searchable technical glossary covering AI-native development, RAG, MCP, WebGPU, AEO & GEO.',
    h1: 'KRONVEX Engineering Playbook & Technical Glossary',
  },
  {
    slug: 'glossary',
    title: 'Engineering Playbook & AI Systems Glossary | KRONVEX',
    description: 'Open KRONVEX engineering playbook and searchable technical glossary covering AI-native development, RAG, MCP, WebGPU, AEO & GEO.',
    h1: 'KRONVEX Engineering Playbook & Technical Glossary',
    canonicalSlug: 'playbook',
  },
  {
    slug: 'mcp',
    title: 'KRONVEX MCP Server — Code-Mode AI Agent Gateway',
    description: 'Connect Antigravity, Claude, Cursor & VS Code to kronvex.org via NexusMCP Code Mode (~650 tokens, 98.4% token reduction, Remote HTTP & local stdio).',
    h1: 'KRONVEX Official MCP Server — NexusMCP Code Mode',
  },
  {
    slug: 'mcp-server',
    title: 'KRONVEX MCP Server — Code-Mode AI Agent Gateway',
    description: 'Connect Antigravity, Claude, Cursor & VS Code to kronvex.org via NexusMCP Code Mode (~650 tokens, 98.4% token reduction, Remote HTTP & local stdio).',
    h1: 'KRONVEX Official MCP Server — NexusMCP Code Mode',
    canonicalSlug: 'mcp',
  },
  {
    slug: 'cli',
    title: 'KRONVEX Official CLI (kronvex / kvx) — Agent-Native Terminal',
    description: 'Install the zero-dependency KRONVEX Terminal CLI with interactive ReplSkin, --json & stream-json agent output, live MCP client, BibTeX export & SKILL.md installer.',
    h1: 'KRONVEX Official Terminal CLI (kronvex / kvx)',
  },
  {
    slug: 'terminal',
    title: 'KRONVEX Official CLI (kronvex / kvx) — Agent-Native Terminal',
    description: 'Install the zero-dependency KRONVEX Terminal CLI with interactive ReplSkin, --json & stream-json agent output, live MCP client, BibTeX export & SKILL.md installer.',
    h1: 'KRONVEX Official Terminal CLI (kronvex / kvx)',
    canonicalSlug: 'cli',
  },
  {
    slug: 'api-docs',
    title: 'KRONVEX Public REST API v1 & OpenAPI 3.1 | Developers',
    description: 'Interactive KRONVEX REST API v1 documentation & live explorer (https://api.kronvex.org/v1/*), OpenAPI 3.1.0 contract, Postman collection & api-anything spec.',
    h1: 'KRONVEX Official Public REST API v1 & OpenAPI 3.1',
  },
  {
    slug: 'developers',
    title: 'KRONVEX Public REST API v1 & OpenAPI 3.1 | Developers',
    description: 'Interactive KRONVEX REST API v1 documentation & live explorer (https://api.kronvex.org/v1/*), OpenAPI 3.1.0 contract, Postman collection & api-anything spec.',
    h1: 'KRONVEX Official Public REST API v1 & OpenAPI 3.1',
    canonicalSlug: 'api-docs',
  },
  {
    slug: 'vision',
    title: 'Vision, Privacy & Strategic Roadmap | KRONVEX',
    description: 'Read the KRONVEX engineering manifesto, zero-tracking privacy guarantees, open-source governance, and multi-phase roadmap.',
    h1: 'KRONVEX Vision, Zero-Tracking Privacy & Roadmap',
  },
  {
    slug: 'contact',
    title: 'Contact & Partnerships | KRONVEX Organization',
    description: 'Connect with KRONVEX leadership, research inquiries, enterprise partnerships, and responsible security disclosures.',
    h1: 'Contact KRONVEX Engineering & Research Leadership',
  },
];

function escapeHtml(str) {
  return str.replace(/&/g, '&amp;').replace(/"/g, '&quot;');
}

for (const r of ROUTES) {
  const canonicalUrl = `https://kronvex.org/${r.canonicalSlug ?? r.slug}`;
  const safeTitle = escapeHtml(r.title);
  const safeDesc = escapeHtml(r.description);
  const safeH1 = escapeHtml(r.h1);

  let html = baseHtml
    .replace(/<title>[\s\S]*?<\/title>/, `<title>${safeTitle}</title>`)
    .replace(
      /<meta\s+name="description"\s+content="[^"]*"\s*\/>/,
      `<meta name="description" content="${safeDesc}" />`
    )
    .replace(
      /<link\s+rel="canonical"\s+href="[^"]*"\s*\/>/,
      `<link rel="canonical" href="${canonicalUrl}" />`
    )
    .replace(
      /<meta\s+property="og:url"\s+content="[^"]*"\s*\/>/,
      `<meta property="og:url" content="${canonicalUrl}" />`
    )
    .replace(
      /<meta\s+property="og:title"\s+content="[^"]*"\s*\/>/,
      `<meta property="og:title" content="${safeTitle}" />`
    )
    .replace(
      /<meta\s+property="og:description"\s+content="[^"]*"\s*\/>/,
      `<meta property="og:description" content="${safeDesc}" />`
    )
    .replace(
      /<meta\s+name="twitter:title"\s+content="[^"]*"\s*\/>/,
      `<meta name="twitter:title" content="${safeTitle}" />`
    )
    .replace(
      /<meta\s+name="twitter:description"\s+content="[^"]*"\s*\/>/,
      `<meta name="twitter:description" content="${safeDesc}" />`
    )
    .replace(/<h1>[\s\S]*?<\/h1>/, `<h1>${safeH1}</h1>`);

  const targetDir = path.join(distDir, r.slug);
  fs.mkdirSync(targetDir, { recursive: true });
  fs.writeFileSync(path.join(targetDir, 'index.html'), html, 'utf-8');
}

console.log(`[POSTBUILD] Generated ${ROUTES.length} static HTTP-200 route entrypoints for GitHub Pages.`);

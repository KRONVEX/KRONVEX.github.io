import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, BookOpen, CheckCircle2, Search, ShieldCheck, Sparkles } from 'lucide-react';
import { ScrollReveal, ScrollScrubText } from '../components/KineticScrollText';

type GlossaryCategory = 'All' | 'AI & Agents' | 'Systems & Web' | 'SEO & GEO';

interface GlossaryTerm {
  term: string;
  category: Exclude<GlossaryCategory, 'All'>;
  definition: string;
  whyItMatters: string;
}

const PLAYBOOK_LAWS = [
  {
    num: '01',
    title: 'Zero-Server & Local-First by Default',
    body: 'Never pay for idle cloud compute when static edge distribution and client-side WebGPU/WASM execution deliver lower latency, higher privacy, and zero vendor lock-in.',
  },
  {
    num: '02',
    title: 'Evidence-Driven Performance (100 / 100)',
    body: 'Every route is lazy-loaded, assets use modern WebP/SVG vector geometry, fonts swap cleanly, and CLS stays strictly at 0.00 across Mobile and Desktop.',
  },
  {
    num: '03',
    title: 'Agentic Engineering & Deterministic Gates',
    body: 'AI coding agents accelerate velocity only when bounded by strict TypeScript compilation, reproducible CI pipelines, and automated audit gates.',
  },
  {
    num: '04',
    title: 'Strict Zero-Tracking Privacy',
    body: 'No third-party ad pixels, no behavioral cookies, and no silent telemetry. Users inspect models, build scopes, and run tools entirely on their own devices.',
  },
  {
    num: '05',
    title: 'Static HTTP-200 & AI Search Readiness',
    body: 'Every public route serves real HTTP 200 HTML with per-route canonical tags, rich JSON-LD structured data, llms.txt, AGENTS.md, and /.well-known/agent-card.json.',
  },
  {
    num: '06',
    title: 'Cryptographic Release Integrity',
    body: 'Signed binary releases publish verifiable SHA-256 checksums, transparent changelogs, and a 48-hour responsible security disclosure SLA.',
  },
];

const GLOSSARY: GlossaryTerm[] = [
  {
    term: 'AI-Native Software Development',
    category: 'AI & Agents',
    definition:
      'Building software where AI models, structured tool calling, and automated verification are architectural primitives from day one rather than bolted-on chat widgets.',
    whyItMatters: 'Cuts delivery cycles dramatically while unlocking workflows impossible in static CRUD apps.',
  },
  {
    term: 'Agentic Delivery',
    category: 'AI & Agents',
    definition:
      'An engineering workflow combining senior architects with autonomous AI agents guided by explicit specs, skills, and automated verification gates.',
    whyItMatters: 'Turns repetitive scaffolding and auditing into deterministic, repeatable pipelines.',
  },
  {
    term: 'RAG (Retrieval-Augmented Generation)',
    category: 'AI & Agents',
    definition:
      'Grounding an LLM’s responses in verified private documents or live databases retrieved at query time before generating an answer.',
    whyItMatters: 'Prevents hallucinations and keeps proprietary enterprise knowledge accurate without costly retraining.',
  },
  {
    term: 'MCP (Model Context Protocol)',
    category: 'AI & Agents',
    definition:
      'An open JSON-RPC protocol that standardizes how AI models and coding agents discover and invoke external tools, APIs, and local data sources.',
    whyItMatters: 'Eliminates brittle one-off integrations between AI assistants and engineering infrastructure.',
  },
  {
    term: 'SKILL.md Agent Modules',
    category: 'AI & Agents',
    definition:
      'Portable, declarative Markdown runbooks and scripts loaded progressively by AI coding agents to execute complex engineering tasks reliably.',
    whyItMatters: 'Encodes team best practices once and shares them across Antigravity, Claude Code, Cursor, and Gemini CLI.',
  },
  {
    term: 'WebGPU Local Inference',
    category: 'AI & Agents',
    definition:
      'Running quantized neural networks (ONNX/GGUF) directly on the visitor’s GPU inside the web browser without sending prompts to a remote API server.',
    whyItMatters: 'Guarantees 100% prompt privacy and $0 per-token inference cost for web applications.',
  },
  {
    term: 'GGUF & ONNX Quantization',
    category: 'AI & Agents',
    definition:
      'Compressing neural network weights from 16-bit floats to 4-bit or 8-bit formats (Q4/Q8) for fast local execution on consumer CPUs, GPUs, and browsers.',
    whyItMatters: 'Reduces memory requirements by 3–4× while preserving high reasoning quality.',
  },
  {
    term: 'Zero-Tracking Architecture',
    category: 'Systems & Web',
    definition:
      'Designing web and desktop applications that operate with zero third-party analytics scripts, zero behavioral cookies, and zero hidden user profiling.',
    whyItMatters: 'Eliminates GDPR/cookie-banner friction, accelerates page loads, and builds instant user trust.',
  },
  {
    term: 'Static HTTP-200 Prerendering',
    category: 'Systems & Web',
    definition:
      'Generating real per-route HTML entrypoints at build time so deep links return HTTP 200 OK with route-specific metadata instead of 404 SPA fallbacks.',
    whyItMatters: 'Prevents crawl errors in Google Search Console and ensures rich social link previews on every page.',
  },
  {
    term: 'Core Web Vitals (LCP, CLS, INP)',
    category: 'Systems & Web',
    definition:
      'Google’s three user-experience metrics measuring loading speed (Largest Contentful Paint), visual stability (Cumulative Layout Shift), and interactivity.',
    whyItMatters: 'Directly affects both real user retention and Google Search rankings.',
  },
  {
    term: 'Full (Strict) TLS & Edge Proxy',
    category: 'Systems & Web',
    definition:
      'End-to-end HTTPS encryption where the edge CDN validates a trusted CA certificate on the origin server before serving traffic over HTTP/3 and Brotli.',
    whyItMatters: 'Prevents man-in-the-middle attacks and redirect loops while boosting global speed.',
  },
  {
    term: 'SHA-256 Release Verification',
    category: 'Systems & Web',
    definition:
      'Publishing cryptographic SHA-256 digests alongside every downloadable .EXE, .MSI, or .APK binary so users can verify zero tampering.',
    whyItMatters: 'Essential supply-chain security practice for distributing trusted desktop and mobile apps.',
  },
  {
    term: 'AEO (Answer Engine Optimization)',
    category: 'SEO & GEO',
    definition:
      'Structuring headings, direct opening summaries, and FAQ blocks so AI answer engines (ChatGPT Search, Perplexity, Google AI Overviews) cite your site directly.',
    whyItMatters: 'Captures high-intent discovery even when users read AI summaries instead of clicking ten blue links.',
  },
  {
    term: 'GEO (Generative Engine Optimization)',
    category: 'SEO & GEO',
    definition:
      'Optimizing entity authority, machine-readable manifests (llms.txt, AGENTS.md, agent-card.json), and semantic HTML for generative search crawlers.',
    whyItMatters: 'Ensures AI models accurately describe your organization, products, and services.',
  },
  {
    term: 'llms.txt & AGENTS.md',
    category: 'SEO & GEO',
    definition:
      'Lightweight plain-text Markdown manifests at the root of a domain summarizing canonical routes, capabilities, and usage policies for LLMs and autonomous agents.',
    whyItMatters: 'Gives AI crawlers clean, hallucination-free ground truth in a single HTTP request.',
  },
  {
    term: 'JSON-LD Structured Data',
    category: 'SEO & GEO',
    definition:
      'Embedded Schema.org JSON graphs (Organization, WebSite, Service, OfferCatalog, FAQPage, BreadcrumbList) that explicitly declare entities to search engines.',
    whyItMatters: 'Unlocks Google Rich Results, Knowledge Graph entity linking, and high-confidence AI extraction.',
  },
];

export function PlaybookPage() {
  const [cat, setCat] = useState<GlossaryCategory>('All');
  const [query, setQuery] = useState('');

  const filteredTerms = useMemo(() => {
    const q = query.trim().toLowerCase();
    return GLOSSARY.filter((item) => {
      if (cat !== 'All' && item.category !== cat) return false;
      if (!q) return true;
      return (
        item.term.toLowerCase().includes(q) ||
        item.definition.toLowerCase().includes(q) ||
        item.whyItMatters.toLowerCase().includes(q)
      );
    });
  }, [cat, query]);

  return (
    <div className="max-w-[1560px] mx-auto px-4 sm:px-6 lg:px-10 xl:px-12 py-14 space-y-24">
      {/* Hero */}
      <section className="space-y-6 max-w-4xl">
        <div className="inline-flex items-center gap-2 text-xs font-mono font-bold tracking-wider text-emerald-700 dark:text-emerald-300 uppercase">
          <BookOpen className="w-4 h-4" /> KRONVEX ENGINEERING PLAYBOOK &amp; TECHNICAL GLOSSARY
        </div>
        <h1 className="font-display font-bold text-3xl sm:text-5xl text-black dark:text-white leading-[1.08] tracking-tight">
          How We Engineer{' '}
          <span className="font-editorial italic font-normal text-sky-700 dark:text-emerald-300">
            Resilient AI Systems
          </span>
        </h1>
        <p className="text-base sm:text-lg text-slate-900 dark:text-slate-100 leading-relaxed max-w-3xl">
          Our open engineering playbook documents the exact architectural standards behind every KRONVEX release—paired
          with a concise technical glossary of AI-native development, local inference, and modern SEO/GEO concepts.
        </p>
      </section>

      {/* Part 1: 6 Playbook Laws */}
      <section className="space-y-10 border-t border-slate-300/70 dark:border-white/15 pt-16">
        <div className="max-w-3xl space-y-3">
          <div className="font-mono text-xs font-bold uppercase tracking-widest text-sky-700 dark:text-sky-300">
            PART I · THE KRONVEX PLAYBOOK
          </div>
          <ScrollScrubText
            as="h2"
            text="Six non-negotiable engineering laws governing every build."
            className="font-display font-bold text-2xl sm:text-4xl text-black dark:text-white"
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-7">
          {PLAYBOOK_LAWS.map((law, idx) => (
            <ScrollReveal key={law.num} delayMs={idx * 60}>
              <div className="h-full p-6 rounded-2xl border border-slate-300/80 dark:border-white/15 bg-white/75 dark:bg-white/[0.03] space-y-3">
                <div className="font-brand text-base font-bold text-emerald-600 dark:text-emerald-400">
                  LAW {law.num}
                </div>
                <h3 className="font-display font-bold text-lg text-black dark:text-white">{law.title}</h3>
                <p className="text-sm text-slate-800 dark:text-slate-200 leading-relaxed">{law.body}</p>
              </div>
            </ScrollReveal>
          ))}
        </div>
      </section>

      {/* Part 2: Searchable AI & Systems Glossary */}
      <section id="glossary" className="space-y-8 border-t border-slate-300/70 dark:border-white/15 pt-16">
        <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6">
          <div className="max-w-2xl space-y-3">
            <div className="font-mono text-xs font-bold uppercase tracking-widest text-emerald-700 dark:text-emerald-300">
              PART II · TECHNICAL GLOSSARY ({GLOSSARY.length} TERMS)
            </div>
            <ScrollScrubText
              as="h2"
              text="Clear definitions for AI-native engineering, agents & modern web search."
              className="font-display font-bold text-2xl sm:text-4xl text-black dark:text-white"
            />
          </div>

          <div className="flex flex-col sm:flex-row gap-3 w-full lg:w-auto">
            <div className="relative flex-1 sm:w-64">
              <Search className="w-4 h-4 text-slate-500 absolute start-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
              <input
                type="search"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search terms (RAG, MCP, AEO...)"
                aria-label="Search glossary terms"
                className="w-full ps-10 pe-4 py-2 rounded-full bg-white dark:bg-white/5 border border-slate-300 dark:border-white/20 text-sm text-black dark:text-white focus:outline-none focus:border-emerald-400"
              />
            </div>
            <div className="flex flex-wrap gap-1.5">
              {(['All', 'AI & Agents', 'Systems & Web', 'SEO & GEO'] as GlossaryCategory[]).map((c) => (
                <button
                  key={c}
                  type="button"
                  onClick={() => setCat(c)}
                  className={`px-3.5 py-2 rounded-full text-xs font-mono font-bold border transition ${
                    cat === c
                      ? 'bg-emerald-500 text-slate-950 border-emerald-500'
                      : 'border-slate-300 dark:border-white/20 text-slate-900 dark:text-slate-100 hover:border-emerald-400'
                  }`}
                >
                  {c}
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {filteredTerms.map((item) => (
            <article
              key={item.term}
              className="p-6 rounded-2xl border border-slate-300/80 dark:border-white/15 bg-white/80 dark:bg-white/[0.03] space-y-3"
            >
              <div className="flex items-center justify-between gap-2">
                <h3 className="font-display font-bold text-lg text-black dark:text-white">{item.term}</h3>
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold bg-sky-500/15 text-sky-800 dark:text-sky-300 border border-sky-500/30 shrink-0">
                  {item.category}
                </span>
              </div>
              <p className="text-sm text-slate-800 dark:text-slate-200 leading-relaxed">{item.definition}</p>
              <div className="pt-2 border-t border-slate-200/80 dark:border-white/10 text-xs text-emerald-800 dark:text-emerald-300 flex items-start gap-2">
                <CheckCircle2 className="w-3.5 h-3.5 shrink-0 mt-0.5" />
                <span>
                  <strong>Why it matters:</strong> {item.whyItMatters}
                </span>
              </div>
            </article>
          ))}
        </div>

        {filteredTerms.length === 0 && (
          <div className="py-10 text-center text-sm font-mono text-slate-700 dark:text-slate-300">
            No glossary terms match &ldquo;{query}&rdquo;.
          </div>
        )}
      </section>

      {/* CTA */}
      <section className="border-t border-slate-300/70 dark:border-white/15 pt-14 flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="flex items-center gap-3">
          <ShieldCheck className="w-6 h-6 text-emerald-500 shrink-0" />
          <p className="text-sm sm:text-base text-slate-900 dark:text-slate-100">
            Want to apply this engineering playbook directly to your product or private AI stack?
          </p>
        </div>
        <div className="flex flex-wrap gap-3 shrink-0">
          <Link
            to="/services"
            className="px-5 py-2.5 rounded-full bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs font-mono inline-flex items-center gap-2 transition"
          >
            <Sparkles className="w-3.5 h-3.5" /> Explore Services
          </Link>
          <Link
            to="/work"
            className="px-5 py-2.5 rounded-full border border-slate-300 dark:border-white/20 text-black dark:text-white font-bold text-xs font-mono inline-flex items-center gap-2 hover:border-sky-500 transition"
          >
            See Case Studies <ArrowRight className="w-3.5 h-3.5 rtl:rotate-180" />
          </Link>
        </div>
      </section>
    </div>
  );
}

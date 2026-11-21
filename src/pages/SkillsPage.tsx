import { useMemo, useState } from 'react';
import JSZip from 'jszip';
import {
  Check,
  CheckSquare,
  Copy,
  Download,
  Eye,
  Package,
  Search,
  Sparkles,
  Square,
  X,
} from 'lucide-react';
import { KRONVEX_SKILLS } from '../data/catalog';
import type { KronvexSkill } from '../types/kronvex';

const CATEGORIES = ['All', 'Market Intelligence', 'Cross-Platform', 'Mission-Critical AI', 'Security & DevOps', 'Engineering'] as const;

export function SkillsPage() {
  const [category, setCategory] = useState<(typeof CATEGORIES)[number]>('All');
  const [query, setQuery] = useState('');
  const [selectedIds, setSelectedIds] = useState<string[]>([KRONVEX_SKILLS[0].id, KRONVEX_SKILLS[1].id]);
  const [previewSkill, setPreviewSkill] = useState<KronvexSkill | null>(null);
  const [copiedSlug, setCopiedSlug] = useState<string | null>(null);
  const [exporting, setExporting] = useState(false);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return KRONVEX_SKILLS.filter((s) => {
      const catOk = category === 'All' || s.category === category;
      const qOk =
        !q ||
        s.name.toLowerCase().includes(q) ||
        s.tagline.toLowerCase().includes(q) ||
        s.tags.some((t) => t.toLowerCase().includes(q));
      return catOk && qOk;
    });
  }, [category, query]);

  const toggleSelect = (id: string) => {
    setSelectedIds((prev) => (prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]));
  };

  const selectedSkills = useMemo(
    () => KRONVEX_SKILLS.filter((s) => selectedIds.includes(s.id)),
    [selectedIds]
  );

  const exportZipBundle = async () => {
    if (selectedSkills.length === 0) return;
    setExporting(true);
    try {
      const zip = new JSZip();
      const root = zip.folder('kronvex-ai-skills');
      root?.file(
        'README.md',
        `# KRONVEX AI Skills Bundle\n\nIncluded skills (${selectedSkills.length}):\n` +
          selectedSkills.map((s) => `- \`${s.slug}/SKILL.md\` — ${s.tagline}`).join('\n') +
          `\n\nDrop any skill folder into your agent's \`skills/\` directory (Antigravity, Claude Code, Cursor, Gemini CLI).\n`
      );
      selectedSkills.forEach((s) => {
        root?.folder(s.slug)?.file('SKILL.md', s.skillMarkdown.trim() + '\n');
      });
      const blob = await zip.generateAsync({ type: 'blob' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `kronvex-skills-bundle-${selectedSkills.length}.zip`;
      a.click();
      URL.revokeObjectURL(url);
    } finally {
      setExporting(false);
    }
  };

  const copySkillMd = (skill: KronvexSkill) => {
    navigator.clipboard?.writeText(skill.skillMarkdown);
    setCopiedSlug(skill.slug);
    setTimeout(() => setCopiedSlug(null), 1600);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-10">
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6">
        <div className="space-y-3 max-w-2xl">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-mono bg-emerald-500/10 text-emerald-800 dark:text-emerald-300 border border-emerald-500/25">
            <Sparkles className="w-3.5 h-3.5" /> AI AGENT SKILLS STUDIO · 1-CLICK .ZIP COMPOSER
          </div>
          <h1 className="font-display font-bold text-3xl sm:text-4xl text-black dark:text-white">
            AI Skills &amp; Agent Workflows
          </h1>
          <p className="text-slate-900 dark:text-slate-100">
            Production-ready <code className="font-mono text-xs">SKILL.md</code> modules engineered for Antigravity,
            Claude Code, Cursor, and Gemini CLI. Preview any skill or select multiple skills to export a ready-to-drop{' '}
            <code className="font-mono text-xs">.zip</code> bundle right in your browser.
          </p>
        </div>

        <div className="relative w-full lg:w-80">
          <Search className="w-4 h-4 text-slate-700 dark:text-slate-200 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search skills or tags..."
            className="w-full pl-10 pr-4 py-2.5 rounded-xl glass-panel text-sm text-black dark:text-white placeholder-slate-400 dark:placeholder-slate-300 focus:outline-none focus:border-sky-500"
          />
        </div>
      </div>

      {/* Category Filter */}
      <div className="flex flex-wrap gap-2">
        {CATEGORIES.map((cat) => (
          <button
            key={cat}
            type="button"
            onClick={() => setCategory(cat)}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-mono font-semibold transition ${
              category === cat
                ? 'bg-emerald-500 text-slate-950 shadow-sm'
                : 'glass-panel text-slate-900 dark:text-slate-100 hover:border-emerald-500/50'
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Skills Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filtered.map((skill) => {
          const checked = selectedIds.includes(skill.id);
          return (
            <div
              key={skill.id}
              className={`rounded-2xl p-6 glass-panel flex flex-col justify-between gap-5 transition-all ${
                checked ? 'ring-2 ring-emerald-500/60 border-emerald-500/50' : 'hover:border-sky-500/40'
              }`}
            >
              <div className="space-y-3">
                <div className="flex items-start justify-between gap-2">
                  <span className="px-2.5 py-0.5 rounded-md text-[10px] font-mono bg-slate-100 dark:bg-slate-900 text-sky-700 dark:text-sky-300 border border-slate-200 dark:border-slate-800">
                    {skill.category}
                  </span>
                  <button
                    type="button"
                    onClick={() => toggleSelect(skill.id)}
                    className={`inline-flex items-center gap-1 text-xs font-mono transition ${
                      checked ? 'text-emerald-500 font-semibold' : 'text-slate-700 dark:text-slate-200 hover:text-slate-200'
                    }`}
                  >
                    {checked ? <CheckSquare className="w-4 h-4" /> : <Square className="w-4 h-4" />}
                    {checked ? 'Selected' : 'Bundle'}
                  </button>
                </div>

                <div>
                  <h2 className="font-display font-bold text-lg text-black dark:text-white">{skill.name}</h2>
                  <div className="font-mono text-[11px] text-slate-800 dark:text-slate-200 mt-0.5">
                    {skill.slug} · v{skill.version}
                  </div>
                </div>

                <p className="text-xs text-slate-900 dark:text-slate-100 leading-relaxed">{skill.description}</p>

                {/* Visual Workflow Pipeline */}
                <div className="pt-1 flex flex-wrap items-center gap-1 text-[10px] font-mono">
                  {skill.pipeline.map((step, i) => (
                    <span key={step} className="inline-flex items-center gap-1">
                      <span className="px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-900 text-slate-950 dark:text-slate-100">
                        {step}
                      </span>
                      {i < skill.pipeline.length - 1 && <span className="text-sky-500">→</span>}
                    </span>
                  ))}
                </div>
              </div>

              <div className="space-y-3 pt-4 border-t border-slate-200 dark:border-slate-800">
                <div className="flex flex-wrap gap-1">
                  {skill.compatibleAgents.map((ag) => (
                    <span
                      key={ag}
                      className="px-2 py-0.5 rounded text-[10px] font-mono bg-indigo-500/10 text-indigo-800 dark:text-indigo-300"
                    >
                      {ag}
                    </span>
                  ))}
                </div>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setPreviewSkill(skill)}
                    className="flex-1 py-2 px-3 rounded-lg bg-slate-900 dark:bg-slate-800 hover:bg-slate-800 dark:hover:bg-slate-700 text-white text-xs font-semibold inline-flex items-center justify-center gap-1.5 transition"
                  >
                    <Eye className="w-3.5 h-3.5" /> Inspect SKILL.md
                  </button>
                  <button
                    type="button"
                    onClick={() => copySkillMd(skill)}
                    className="p-2 rounded-lg bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-slate-100 hover:border-sky-500"
                    title="Copy SKILL.md"
                  >
                    {copiedSlug === skill.slug ? (
                      <Check className="w-4 h-4 text-emerald-500" />
                    ) : (
                      <Copy className="w-4 h-4" />
                    )}
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Sticky 1-Click Skill Bundle Composer Tray (stops cleanly above Footer) */}
      {selectedSkills.length > 0 && (
        <div className="sticky bottom-4 z-30 mx-auto w-full max-w-2xl rounded-2xl bg-[#080E1C]/95 backdrop-blur-xl border border-emerald-500/40 px-4 sm:px-5 py-3.5 shadow-2xl shadow-emerald-950/50 flex flex-col sm:flex-row items-center justify-between gap-3 text-white">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-emerald-500/20 text-emerald-400">
              <Package className="w-5 h-5" />
            </div>
            <div>
              <div className="text-sm font-semibold">
                Skill Composer: {selectedSkills.length} skill{selectedSkills.length > 1 ? 's' : ''} queued
              </div>
              <div className="text-[11px] font-mono text-slate-200">
                Packages structured SKILL.md folders directly in your browser
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <button
              type="button"
              onClick={() => setSelectedIds([])}
              className="px-3 py-2 rounded-lg text-xs font-mono text-slate-200 hover:text-white"
            >
              Clear
            </button>
            <button
              type="button"
              onClick={exportZipBundle}
              disabled={exporting}
              className="px-4 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-semibold text-xs inline-flex items-center gap-1.5 transition"
            >
              <Download className="w-3.5 h-3.5" /> {exporting ? 'Building ZIP...' : 'Download .ZIP Bundle'}
            </button>
          </div>
        </div>
      )}

      {/* SKILL.md Inspector Modal */}
      {previewSkill && (
        <div
          className="fixed inset-0 !mt-0 z-[60] flex items-center justify-center p-4 bg-slate-950/75 backdrop-blur-sm"
          onClick={() => setPreviewSkill(null)}
        >
          <div
            className="w-full max-w-2xl rounded-2xl overflow-hidden bg-[#080E1C] border border-slate-700 text-slate-100 shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex flex-wrap sm:flex-nowrap items-center justify-between gap-3 px-4 sm:px-5 py-3.5 border-b border-slate-800 bg-[#050914]">
              <div className="min-w-0 flex-1">
                <div className="font-mono text-xs text-emerald-400 truncate">{previewSkill.slug}/SKILL.md</div>
                <div className="font-display font-bold text-sm sm:text-base text-white truncate">{previewSkill.name}</div>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                <button
                  type="button"
                  onClick={() => copySkillMd(previewSkill)}
                  className="px-3 py-1.5 rounded-lg bg-sky-500 hover:bg-sky-400 text-slate-950 text-xs font-semibold inline-flex items-center gap-1.5 whitespace-nowrap shrink-0"
                >
                  {copiedSlug === previewSkill.slug ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                  {copiedSlug === previewSkill.slug ? 'Copied!' : 'Copy Markdown'}
                </button>
                <button
                  type="button"
                  onClick={() => setPreviewSkill(null)}
                  className="p-1.5 rounded-lg text-slate-200 hover:text-white hover:bg-slate-800 shrink-0"
                  aria-label="Close modal"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>
            <pre className="p-5 text-xs font-mono text-slate-200 overflow-x-auto max-h-[65vh] whitespace-pre-wrap leading-relaxed">
              {previewSkill.skillMarkdown}
            </pre>
          </div>
        </div>
      )}
    </div>
  );
}

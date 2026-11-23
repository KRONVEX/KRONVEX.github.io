import { useMemo, useState } from 'react';
import JSZip from 'jszip';
import {
  ArrowRight,
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
import { ScrollReveal } from '../components/KineticScrollText';
import { useI18n } from '../i18n/I18nContext';
import type { KronvexSkill } from '../types/kronvex';

const CATEGORIES = [
  'All',
  'Market Intelligence',
  'Cross-Platform',
  'Mission-Critical AI',
  'Security & DevOps',
  'Engineering',
] as const;

export function SkillsPage() {
  const { t } = useI18n();
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
        s.tags.some((tag) => tag.toLowerCase().includes(q));
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
    <div className="max-w-[1560px] mx-auto px-4 sm:px-6 lg:px-10 xl:px-12 py-14 space-y-12">
      {/* Header — Open Editorial */}
      <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6">
        <div className="space-y-3 max-w-2xl">
          <div className="inline-flex items-center gap-2 text-xs font-mono font-semibold tracking-wider text-emerald-700 dark:text-emerald-300">
            <Sparkles className="w-4 h-4" /> {t.skills.badge}
          </div>
          <h1 className="font-display font-bold text-3xl sm:text-5xl text-black dark:text-white tracking-tight">
            {t.skills.title}
          </h1>
          <p className="text-base text-slate-800 dark:text-white leading-relaxed">{t.skills.subtitle}</p>
        </div>

        <div className="relative w-full lg:w-80">
          <Search className="w-4 h-4 text-slate-800 dark:text-white absolute start-3.5 top-1/2 -translate-y-1/2" />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder={t.skills.searchPlaceholder}
            className="w-full ps-10 pe-4 py-2.5 rounded-full bg-white/80 dark:bg-slate-900/70 border border-slate-300 dark:border-slate-700 text-sm text-black dark:text-white placeholder-slate-500 dark:placeholder-slate-200 focus:outline-none focus:border-sky-500 transition"
          />
        </div>
      </div>

      {/* Category Filter — Minimalist Underline Bar */}
      <div className="flex flex-wrap gap-6 border-b border-slate-300/80 dark:border-slate-800 pb-3">
        {CATEGORIES.map((cat) => (
          <button
            key={cat}
            type="button"
            onClick={() => setCategory(cat)}
            className={`pb-2 -mb-3.5 text-xs font-mono font-bold border-b-2 transition ${
              category === cat
                ? 'border-emerald-500 text-black dark:text-white'
                : 'border-transparent text-slate-800 dark:text-slate-100 hover:text-black dark:hover:text-white'
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Open Editorial Skills Grid (Top Accent Hairline, Zero Box Walls) */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-x-10 gap-y-12">
        {filtered.map((skill, idx) => {
          const checked = selectedIds.includes(skill.id);
          return (
            <ScrollReveal key={skill.id} delayMs={(idx % 3) * 65} className="h-full">
              <div
                className={`h-full pt-6 border-t-2 flex flex-col justify-between gap-6 transition-colors ${
                  checked
                    ? 'border-emerald-500'
                    : 'border-slate-300/80 dark:border-slate-800 hover:border-sky-500/70'
                }`}
              >
              <div className="space-y-3.5">
                <div className="flex items-center justify-between gap-2">
                  <span className="font-mono text-[11px] font-semibold text-sky-700 dark:text-sky-300">
                    {skill.category}
                  </span>
                  <button
                    type="button"
                    onClick={() => toggleSelect(skill.id)}
                    className={`inline-flex items-center gap-1.5 text-xs font-mono transition ${
                      checked
                        ? 'text-emerald-600 dark:text-emerald-400 font-bold'
                        : 'text-slate-800 dark:text-slate-100 hover:text-black dark:hover:text-white'
                    }`}
                  >
                    {checked ? <CheckSquare className="w-4 h-4" /> : <Square className="w-4 h-4" />}
                    {checked ? t.skills.selectedBtn : t.skills.bundleBtn}
                  </button>
                </div>

                <div>
                  <h2 className="font-display font-bold text-xl text-black dark:text-white">{skill.name}</h2>
                  <div className="font-mono text-[11px] text-slate-800 dark:text-slate-100 mt-0.5">
                    {skill.slug} · v{skill.version}
                  </div>
                </div>

                <p className="text-sm text-slate-800 dark:text-white leading-relaxed">{skill.description}</p>

                {/* Open Workflow Pipeline */}
                <div className="pt-1 flex flex-wrap items-center gap-1.5 text-[11px] font-mono text-slate-900 dark:text-white">
                  {skill.pipeline.map((step, i) => (
                    <span key={step} className="inline-flex items-center gap-1.5">
                      <span>{step}</span>
                      {i < skill.pipeline.length - 1 && <span className="text-sky-500">→</span>}
                    </span>
                  ))}
                </div>
              </div>

              <div className="space-y-3 pt-4 border-t border-slate-300/60 dark:border-slate-800/80">
                <div className="font-mono text-[10px] text-indigo-700 dark:text-indigo-300">
                  {skill.compatibleAgents.join(' · ')}
                </div>

                <div className="flex items-center justify-between gap-3">
                  <button
                    type="button"
                    onClick={() => setPreviewSkill(skill)}
                    className="group text-sm font-semibold text-black dark:text-white hover:text-sky-600 dark:hover:text-sky-400 inline-flex items-center gap-1.5 transition"
                  >
                    <Eye className="w-4 h-4 text-sky-500" />
                    <span>{t.skills.inspectBtn}</span>
                    <ArrowRight className="w-3.5 h-3.5 opacity-70 group-hover:translate-x-1 transition rtl:rotate-180 rtl:group-hover:-translate-x-1" />
                  </button>
                  <button
                    type="button"
                    onClick={() => copySkillMd(skill)}
                    className="p-2 rounded-full border border-slate-300 dark:border-slate-700 text-slate-800 dark:text-white hover:border-sky-500 transition"
                    title="Copy SKILL.md"
                    aria-label={`Copy ${skill.name} SKILL.md`}
                  >
                    {copiedSlug === skill.slug ? (
                      <Check className="w-3.5 h-3.5 text-emerald-500" />
                    ) : (
                      <Copy className="w-3.5 h-3.5" />
                    )}
                  </button>
                </div>
              </div>
              </div>
            </ScrollReveal>
          );
        })}
      </div>

      {/* Sticky 1-Click Skill Bundle Composer Tray */}
      {selectedSkills.length > 0 && (
        <div className="sticky bottom-4 z-30 mx-auto w-full max-w-2xl rounded-full bg-[#080E1C]/95 backdrop-blur-xl border border-emerald-500/40 px-5 py-3 shadow-2xl shadow-emerald-950/50 flex flex-col sm:flex-row items-center justify-between gap-3 text-white">
          <div className="flex items-center gap-3">
            <Package className="w-5 h-5 text-emerald-400 shrink-0" />
            <div>
              <div className="text-sm font-semibold">
                {t.skills.composerTitle}: {selectedSkills.length}
              </div>
              <div className="text-[11px] font-mono text-slate-300">{t.skills.composerSub}</div>
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <button
              type="button"
              onClick={() => setSelectedIds([])}
              className="px-3 py-1.5 rounded-full text-xs font-mono text-slate-300 hover:text-white"
            >
              {t.skills.clearBtn}
            </button>
            <button
              type="button"
              onClick={exportZipBundle}
              disabled={exporting}
              className="px-4 py-2 rounded-full bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs inline-flex items-center gap-1.5 transition"
            >
              <Download className="w-3.5 h-3.5" /> {exporting ? t.skills.buildingZip : t.skills.downloadZipBtn}
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
                <div className="font-display font-bold text-sm sm:text-base text-white truncate">
                  {previewSkill.name}
                </div>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                <button
                  type="button"
                  onClick={() => copySkillMd(previewSkill)}
                  className="px-3 py-1.5 rounded-full bg-sky-500 hover:bg-sky-400 text-slate-950 text-xs font-bold inline-flex items-center gap-1.5 whitespace-nowrap shrink-0"
                >
                  {copiedSlug === previewSkill.slug ? (
                    <Check className="w-3.5 h-3.5" />
                  ) : (
                    <Copy className="w-3.5 h-3.5" />
                  )}
                  {copiedSlug === previewSkill.slug ? t.contact.copied : 'Copy Markdown'}
                </button>
                <button
                  type="button"
                  onClick={() => setPreviewSkill(null)}
                  className="p-1.5 rounded-full text-slate-200 hover:text-white hover:bg-slate-800 shrink-0"
                  aria-label="Close modal"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>
            <pre
              dir="ltr"
              className="p-5 text-xs font-mono text-slate-200 overflow-x-auto max-h-[65vh] whitespace-pre-wrap leading-relaxed text-left"
            >
              {previewSkill.skillMarkdown}
            </pre>
          </div>
        </div>
      )}
    </div>
  );
}

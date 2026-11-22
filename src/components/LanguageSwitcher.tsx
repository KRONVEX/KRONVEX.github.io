import { useEffect, useRef, useState } from 'react';
import { Check, ChevronDown, Languages } from 'lucide-react';
import { LOCALE_OPTIONS } from '../i18n/types';
import { useI18n } from '../i18n/I18nContext';

export function LanguageSwitcher() {
  const { locale, dir, setLocale, t } = useI18n();
  const [open, setOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const activeOpt = LOCALE_OPTIONS.find((o) => o.code === locale) || LOCALE_OPTIONS[0];
  const otherOpts = LOCALE_OPTIONS.filter((o) => o.code !== activeOpt.code);

  useEffect(() => {
    if (!open) return;
    const onPointerDown = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setOpen(false);
    };
    document.addEventListener('mousedown', onPointerDown);
    window.addEventListener('keydown', onKeyDown);
    return () => {
      document.removeEventListener('mousedown', onPointerDown);
      window.removeEventListener('keydown', onKeyDown);
    };
  }, [open]);

  return (
    <div ref={containerRef} className="relative shrink-0">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-label={t.nav.languageLabel}
        title={t.nav.languageLabel}
        className="inline-flex items-center gap-1 sm:gap-1.5 px-2 sm:px-2.5 py-1.5 rounded-full text-xs font-mono font-semibold whitespace-nowrap shrink-0 bg-slate-100 dark:bg-slate-900/90 hover:bg-slate-200 dark:hover:bg-slate-800 border border-slate-300 dark:border-slate-700/80 text-black dark:text-white transition"
      >
        <Languages className="w-3.5 h-3.5 text-sky-600 dark:text-sky-400 shrink-0" />
        <span>{activeOpt.badge}</span>
        <ChevronDown
          className={`w-3.5 h-3.5 text-slate-800 dark:text-white transition-transform duration-150 shrink-0 ${
            open ? 'rotate-180' : ''
          }`}
        />
      </button>

      {open && (
        <div
          role="listbox"
          aria-label={t.nav.languageLabel}
          dir="ltr"
          className={`fixed inset-x-3 top-[4.25rem] sm:absolute sm:inset-x-auto sm:top-full ${
            dir === 'rtl' ? 'sm:left-0' : 'sm:right-0'
          } sm:mt-2 sm:w-72 max-h-80 overflow-y-auto rounded-2xl p-2 bg-white dark:bg-[#0B1120] border border-slate-300 dark:border-slate-700/90 shadow-2xl shadow-slate-950/20 dark:shadow-black/60 z-[70]`}
        >
          {/* Active Locale Pinned at Top (Antigravity Style) */}
          <button
            type="button"
            role="option"
            aria-selected={true}
            onClick={() => setOpen(false)}
            className="w-full px-3 py-2.5 rounded-xl flex items-center justify-between gap-2 text-left text-sm bg-sky-500/15 text-sky-700 dark:text-sky-300 font-semibold transition"
          >
            <span className="truncate">{activeOpt.nativeName}</span>
            <span className="inline-flex items-center gap-2 shrink-0">
              <Check className="w-4 h-4 text-sky-600 dark:text-sky-400 shrink-0" />
              <span className="px-2 py-0.5 rounded-md text-[11px] font-mono font-semibold border bg-sky-500/15 text-sky-700 dark:text-sky-200 border-sky-500/40">
                {activeOpt.badge}
              </span>
            </span>
          </button>

          <div className="my-1.5 border-t border-slate-200 dark:border-slate-800" />

          <div className="space-y-0.5">
            {otherOpts.map((opt) => (
              <button
                key={opt.code}
                type="button"
                role="option"
                aria-selected={false}
                onClick={() => {
                  setLocale(opt.code);
                  setOpen(false);
                }}
                className="w-full px-3 py-2.5 rounded-xl flex items-center justify-between gap-2 text-left text-sm text-slate-900 dark:text-slate-100 hover:bg-slate-100 dark:hover:bg-slate-800/80 transition"
              >
                <span className="truncate">{opt.nativeName}</span>
                <span className="px-2 py-0.5 rounded-md text-[11px] font-mono font-semibold border bg-slate-100 dark:bg-slate-900 text-slate-800 dark:text-slate-100 border-slate-200 dark:border-slate-700 shrink-0">
                  {opt.badge}
                </span>
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

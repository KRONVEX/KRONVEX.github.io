import { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import {
  Command,
  Cpu,
  Flame,
  Gamepad2,
  Globe,
  Layers,
  Menu,
  Moon,
  Network,
  Sparkles,
  Sun,
  Terminal,
  X,
  Compass,
} from 'lucide-react';
import type { DetectedHardware } from '../types/kronvex';
import { useI18n } from '../i18n/I18nContext';
import { LanguageSwitcher } from './LanguageSwitcher';

interface NavbarProps {
  darkMode: boolean;
  onToggleTheme: () => void;
  onOpenCommand: (mode?: 'palette' | 'terminal') => void;
  hardware: DetectedHardware;
}

export function Navbar({ darkMode, onToggleTheme, onOpenCommand }: NavbarProps) {
  const { pathname } = useLocation();
  const { t } = useI18n();
  const [mobileOpen, setMobileOpen] = useState(false);

  const navItems = [
    { to: '/', label: t.nav.home, icon: Globe },
    { to: '/apps', label: t.nav.apps, icon: Layers },
    { to: '/models', label: t.nav.models, icon: Cpu },
    { to: '/skills', label: t.nav.skills, icon: Sparkles },
    { to: '/top-21', label: t.nav.top21, icon: Flame },
    { to: '/arcade', label: t.nav.arcade, icon: Gamepad2 },
    { to: '/constellation', label: t.nav.constellation, icon: Network },
    { to: '/vision', label: t.nav.vision, icon: Compass },
  ];

  return (
    <header className="sticky top-0 z-40 border-b border-slate-200/80 dark:border-slate-800/80 bg-white/85 dark:bg-[#050811]/85 backdrop-blur-xl">
      <div className="max-w-[1560px] mx-auto px-3 sm:px-6 lg:px-10 xl:px-12 h-16 flex items-center justify-between gap-2 xl:gap-4">
        {/* Brand */}
        <Link to="/" className="flex items-center gap-2 sm:gap-2.5 group shrink-0">
          <div className="relative">
            <img
              src={`${import.meta.env.BASE_URL}kronvex-logo-96.webp`}
              alt="KRONVEX Crest"
              width={36}
              height={36}
              decoding="async"
              className="w-9 h-9 rounded-lg object-cover ring-1 ring-sky-400/40 group-hover:ring-sky-400 transition-all shadow-sm"
            />
            <span className="absolute -bottom-0.5 -end-0.5 w-2.5 h-2.5 rounded-full bg-emerald-400 ring-2 ring-white dark:ring-[#050811]" />
          </div>
          <div className="leading-tight whitespace-nowrap">
            <span className="font-brand font-bold tracking-[0.18em] text-sm sm:text-base text-black dark:text-white block">
              KRONVEX
            </span>
            <span className="font-mono text-[10px] text-sky-700 dark:text-sky-300 hidden sm:block lg:hidden xl:block">
              {t.nav.tagline}
            </span>
          </div>
        </Link>

        {/* Desktop Nav */}
        <nav className="hidden lg:flex items-center gap-0.5 min-w-0" aria-label="Main navigation">
          {navItems.map((item) => {
            const active = pathname === item.to;
            const Icon = item.icon;
            return (
              <Link
                key={item.to}
                to={item.to}
                className={`px-2 xl:px-2.5 py-1.5 rounded-lg text-xs xl:text-[13px] font-medium inline-flex items-center gap-1.5 whitespace-nowrap shrink-0 transition-all ${
                  active
                    ? 'bg-sky-500/15 text-sky-800 dark:text-sky-300 ring-1 ring-sky-500/30'
                    : 'text-slate-900 dark:text-slate-100 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800/60'
                }`}
              >
                <Icon className="w-3.5 h-3.5 opacity-80 shrink-0" />
                {item.label}
              </Link>
            );
          })}
        </nav>

        {/* Actions */}
        <div className="flex items-center gap-1.5 shrink-0">
          <button
            type="button"
            onClick={() => onOpenCommand('palette')}
            className="inline-flex items-center gap-1.5 px-2 sm:px-2.5 py-1.5 rounded-lg text-xs font-mono whitespace-nowrap shrink-0 bg-slate-100 dark:bg-slate-900/90 hover:bg-slate-200 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-700/80 text-slate-950 dark:text-white transition"
            title={`${t.nav.search} (Ctrl+K)`}
            aria-label={t.nav.search}
          >
            <Command className="w-3.5 h-3.5 text-sky-500 shrink-0" />
            <span className="hidden xl:inline">{t.nav.search}</span>
            <kbd className="hidden 2xl:inline px-1.5 py-0.5 text-[10px] rounded whitespace-nowrap bg-white dark:bg-slate-950 border border-slate-300 dark:border-slate-700 text-black dark:text-white">
              Ctrl K
            </kbd>
          </button>

          <button
            type="button"
            onClick={() => onOpenCommand('terminal')}
            className="hidden sm:inline-flex p-2 rounded-lg bg-slate-100 dark:bg-slate-900/90 hover:bg-slate-200 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-700/80 text-sky-700 dark:text-sky-300 transition"
            title={t.nav.openCli}
            aria-label={t.nav.openCli}
          >
            <Terminal className="w-4 h-4" />
          </button>

          <button
            type="button"
            onClick={onToggleTheme}
            className="p-2 rounded-lg bg-slate-100 dark:bg-slate-900/90 hover:bg-slate-200 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-700/80 text-slate-950 dark:text-white transition"
            title={darkMode ? t.nav.lightMode : t.nav.darkMode}
            aria-label={darkMode ? t.nav.lightMode : t.nav.darkMode}
          >
            {darkMode ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-indigo-600" />}
          </button>

          <LanguageSwitcher />

          <button
            type="button"
            onClick={() => setMobileOpen((v) => !v)}
            className="lg:hidden p-2 rounded-lg bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-950 dark:text-white"
            aria-label="Toggle Menu"
          >
            {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Mobile Nav */}
      {mobileOpen && (
        <div className="lg:hidden border-t border-slate-200 dark:border-slate-800 bg-white dark:bg-[#070B14] px-4 py-3 space-y-1">
          {navItems.map((item) => {
            const active = pathname === item.to;
            const Icon = item.icon;
            return (
              <Link
                key={item.to}
                to={item.to}
                onClick={() => setMobileOpen(false)}
                className={`flex items-center gap-2.5 px-3 py-2.5 rounded-lg text-sm font-medium ${
                  active
                    ? 'bg-sky-500/15 text-sky-800 dark:text-sky-300'
                    : 'text-slate-950 dark:text-slate-100 hover:bg-slate-100 dark:hover:bg-slate-800/60'
                }`}
              >
                <Icon className="w-4 h-4" />
                {item.label}
              </Link>
            );
          })}
          <button
            type="button"
            onClick={() => {
              setMobileOpen(false);
              onOpenCommand('terminal');
            }}
            className="w-full sm:hidden flex items-center gap-2.5 px-3 py-2.5 rounded-lg text-sm font-mono font-semibold text-sky-700 dark:text-sky-300 hover:bg-slate-100 dark:hover:bg-slate-800/60"
          >
            <Terminal className="w-4 h-4" />
            kronvex&gt; CLI
          </button>
        </div>
      )}
    </header>
  );
}

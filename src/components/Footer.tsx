import { Link } from 'react-router-dom';
import { Github, Mail, ShieldCheck, ExternalLink } from 'lucide-react';
import { ORG_META } from '../data/catalog';
import liveGithub from '../data/live-github.json';

export function Footer() {
  const year = new Date().getFullYear();

  return (
    <footer className="border-t border-slate-300 dark:border-slate-800 bg-slate-50 dark:bg-[#050811] mt-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div className="md:col-span-2 space-y-4">
            <div className="flex items-center gap-3">
              <img
                src={`${import.meta.env.BASE_URL}kronvex-logo-96.webp`}
                alt="KRONVEX Logo"
                width={36}
                height={36}
                loading="lazy"
                decoding="async"
                className="w-9 h-9 rounded-lg ring-1 ring-sky-400/40"
              />
              <div>
                <div className="font-display font-bold tracking-[0.18em] text-black dark:text-white">
                  KRONVEX
                </div>
                <div className="font-mono text-[11px] font-medium text-slate-800 dark:text-slate-200">
                  CROSS-PLATFORM · MARKET INTELLIGENCE · MISSION-CRITICAL AI
                </div>
              </div>
            </div>
            <p className="text-sm text-slate-900 dark:text-slate-100 max-w-md leading-relaxed">
              {ORG_META.tagline} Engineered as a 100% static, privacy-first, local-execution platform hosted on GitHub Pages.
            </p>
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-mono font-semibold bg-emerald-500/15 text-emerald-900 dark:text-emerald-200 border border-emerald-600/30 dark:border-emerald-400/30">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              Zero-Server Local-First Architecture · Synced {liveGithub.syncedAt.slice(0, 10)}
            </div>
          </div>

          <div>
            <h3 className="font-mono text-xs font-bold uppercase tracking-wider text-black dark:text-white mb-3">
              Platform
            </h3>
            <ul className="space-y-2 text-sm text-slate-900 dark:text-slate-100">
              <li><Link to="/apps" className="hover:text-sky-600 dark:hover:text-sky-300 transition">Android &amp; Windows Apps</Link></li>
              <li><Link to="/models" className="hover:text-sky-600 dark:hover:text-sky-300 transition">AI Models &amp; Local Chat</Link></li>
              <li><Link to="/skills" className="hover:text-sky-600 dark:hover:text-sky-300 transition">AI Skills Marketplace</Link></li>
              <li><Link to="/top-21" className="hover:text-sky-600 dark:hover:text-sky-300 transition">Top 21 (Weekly Leaderboard)</Link></li>
              <li><Link to="/constellation" className="hover:text-sky-600 dark:hover:text-sky-300 transition">Ecosystem Constellation</Link></li>
              <li><Link to="/vision" className="hover:text-sky-600 dark:hover:text-sky-300 transition">Vision &amp; Roadmap</Link></li>
            </ul>
          </div>

          <div>
            <h3 className="font-mono text-xs font-bold uppercase tracking-wider text-black dark:text-white mb-3">
              Governance &amp; Links
            </h3>
            <ul className="space-y-2 text-sm text-slate-900 dark:text-slate-100">
              <li>
                <a href={ORG_META.githubUrl} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1.5 hover:text-sky-600 dark:hover:text-sky-300 transition">
                  <Github className="w-3.5 h-3.5" /> GitHub Organization <ExternalLink className="w-3 h-3 opacity-70" />
                </a>
              </li>
              <li>
                <a href={`${ORG_META.orgProfileRepoUrl}/blob/main/SECURITY.md`} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1.5 hover:text-sky-600 dark:hover:text-sky-300 transition">
                  <ShieldCheck className="w-3.5 h-3.5" /> Security Policy
                </a>
              </li>
              <li>
                <a href={`${ORG_META.orgProfileRepoUrl}/blob/main/CONTRIBUTING.md`} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1.5 hover:text-sky-600 dark:hover:text-sky-300 transition">
                  Contributing Guide
                </a>
              </li>
              <li>
                {ORG_META.contactEmail ? (
                  <a href={`mailto:${ORG_META.contactEmail}`} className="inline-flex items-center gap-1.5 hover:text-sky-600 dark:hover:text-sky-300 transition">
                    <Mail className="w-3.5 h-3.5" /> {ORG_META.contactEmail}
                  </a>
                ) : (
                  <Link to="/contact" className="inline-flex items-center gap-1.5 hover:text-sky-600 dark:hover:text-sky-300 transition">
                    <Mail className="w-3.5 h-3.5" /> Contact Channels
                  </Link>
                )}
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-10 pt-6 border-t border-slate-300 dark:border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-slate-800 dark:text-slate-200 font-mono">
          <span>© {year} KRONVEX Organization. Founded by {ORG_META.founderName}.</span>
          <span>Press Ctrl+K anywhere for KRONVEX OS Command Terminal</span>
        </div>
      </div>
    </footer>
  );
}

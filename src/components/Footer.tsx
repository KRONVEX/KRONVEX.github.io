import { Link } from 'react-router-dom';
import { ExternalLink, Terminal } from 'lucide-react';
import { ORG_META } from '../data/catalog';
import liveGithub from '../data/live-github.json';
import { ScrollReveal } from './KineticScrollText';
import { useI18n } from '../i18n/I18nContext';

interface FooterProps {
  onOpenTerminal?: () => void;
}

interface FooterLinkItem {
  label: string;
  to?: string;
  href?: string;
  action?: 'terminal';
}

interface FooterGroup {
  heading: string;
  items: FooterLinkItem[];
}

export function Footer({ onOpenTerminal }: FooterProps) {
  const { t } = useI18n();
  const year = new Date().getFullYear();

  const footerColumns: FooterGroup[][] = [
    // Column 1: Products & Capabilities
    [
      {
        heading: t.footer.groups.products,
        items: [
          { label: t.footer.links.pulseDesktop, to: '/apps' },
          { label: t.footer.links.sentinelMobile, to: '/apps' },
          { label: t.footer.links.aiRunner, to: '/apps' },
          { label: t.footer.links.browserAiStudio, to: '/models?tab=chat' },
          { label: t.footer.links.skillsBundler, to: '/skills' },
          { label: t.footer.links.top21Radar, to: '/top-21' },
          { label: t.footer.links.researchPapers, to: '/research' },
        ],
      },
      {
        heading: t.footer.groups.capabilities,
        items: [
          { label: t.footer.links.crossPlatform, to: '/apps' },
          { label: t.footer.links.marketIntel, to: '/constellation' },
          { label: t.footer.links.localWebGpu, to: '/models' },
          { label: t.footer.links.agentSkills, to: '/skills' },
          { label: t.footer.links.interactiveArcade, to: '/arcade' },
        ],
      },
    ],
    // Column 2: Enterprise & Industries
    [
      {
        heading: t.footer.groups.enterprise,
        items: [
          { label: t.footer.links.servicesEngagement, to: '/services' },
          { label: t.footer.links.workCaseStudies, to: '/work' },
          { label: t.footer.links.enterpriseOverview, to: '/enterprise' },
          { label: t.footer.links.customApps, to: '/enterprise#custom-apps' },
          { label: t.footer.links.privateAiRag, to: '/enterprise#private-ai' },
          { label: t.footer.links.marketDataPipelines, to: '/enterprise#quant-intel' },
          { label: t.footer.links.perfSecurityAudits, to: '/enterprise#audit' },
          { label: t.footer.links.scopeProject, to: '/enterprise#scope-builder' },
        ],
      },
      {
        heading: t.footer.groups.industries,
        items: [
          { label: t.footer.links.fintechQuant, to: '/enterprise#industries' },
          { label: t.footer.links.startupsSaas, to: '/enterprise#industries' },
          { label: t.footer.links.ecommerceOps, to: '/enterprise#industries' },
          { label: t.footer.links.researchEdu, to: '/enterprise#industries' },
          { label: t.footer.links.smbBusiness, to: '/enterprise#industries' },
        ],
      },
    ],
    // Column 3: Developers & Interactive Lab
    [
      {
        heading: t.footer.groups.developers,
        items: [
          { label: t.footer.links.publicApi, to: '/api-docs' },
          { label: t.footer.links.officialCli, to: '/cli' },
          { label: t.footer.links.mcpServer, to: '/mcp' },
          { label: t.footer.links.engineeringPlaybook, to: '/playbook' },
          { label: t.footer.links.githubOrg, href: ORG_META.githubUrl },
          { label: t.footer.links.platformReleases, href: 'https://github.com/KRONVEX/KRONVEX.github.io/releases' },
          { label: t.footer.links.platformDocs, href: 'https://github.com/KRONVEX/KRONVEX.github.io#readme' },
          { label: t.footer.links.controlPlane, href: ORG_META.orgProfileRepoUrl },
          { label: t.footer.links.constellation, to: '/constellation' },
          { label: t.footer.links.agentDiscovery, href: '/llms.txt' },
        ],
      },
      {
        heading: t.footer.groups.interactiveLab,
        items: [
          { label: t.footer.links.techAiQuiz, to: '/arcade' },
          { label: t.footer.links.neuralChess, to: '/arcade?game=chess' },
          { label: t.footer.links.orbitalDefender, to: '/arcade?game=orbital' },
          { label: t.footer.links.kronvexCli, action: 'terminal' },
        ],
      },
    ],
    // Column 4: Organization & Governance / Trust
    [
      {
        heading: t.footer.groups.organization,
        items: [
          { label: t.footer.links.visionManifesto, to: '/vision' },
          { label: t.footer.links.strategicRoadmap, to: '/vision#roadmap' },
          { label: t.footer.links.leadership, to: '/vision#leadership' },
          { label: t.footer.links.contactInquiries, to: '/contact' },
          { label: t.footer.links.researchWeb, href: ORG_META.founderSite },
        ],
      },
      {
        heading: t.footer.groups.governance,
        items: [
          { label: t.footer.links.securityPolicy, href: `${ORG_META.orgProfileRepoUrl}/blob/main/SECURITY.md` },
          { label: t.footer.links.responsibleDisclosure, href: `${ORG_META.orgProfileRepoUrl}/blob/main/SECURITY.md` },
          { label: t.footer.links.contributing, href: `${ORG_META.orgProfileRepoUrl}/blob/main/CONTRIBUTING.md` },
          { label: t.footer.links.codeOfConduct, href: `${ORG_META.orgProfileRepoUrl}/blob/main/CODE_OF_CONDUCT.md` },
          { label: t.footer.links.zeroTracking, to: '/enterprise#trust' },
        ],
      },
    ],
  ];

  return (
    <footer className="relative border-t border-slate-300/70 dark:border-emerald-500/20 bg-transparent mt-24">
      <div className="max-w-[1560px] mx-auto px-4 sm:px-6 lg:px-10 xl:px-12 pt-14 pb-10">
        {/* Top Brand + Enterprise Callout Strip */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 pb-10 mb-10 border-b border-slate-300/70 dark:border-white/15">
          <div className="flex items-center gap-3.5">
            <img
              src={`${import.meta.env.BASE_URL}kronvex-logo-96.webp`}
              alt="KRONVEX Logo"
              width={40}
              height={40}
              loading="lazy"
              decoding="async"
              className="w-10 h-10 rounded-xl ring-1 ring-sky-400/40 shrink-0"
            />
            <div>
              <div className="font-brand font-bold tracking-[0.2em] text-base text-black dark:text-white">
                KRONVEX
              </div>
              <div className="font-mono text-[11px] font-medium text-slate-900 dark:text-slate-100">
                {t.footer.tagline}
              </div>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2.5">
            <span className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-mono font-semibold bg-emerald-500/15 text-emerald-900 dark:text-emerald-200 border border-emerald-600/30 dark:border-emerald-400/30">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              {t.footer.syncedBadge} {liveGithub.syncedAt.slice(0, 10)}
            </span>
            <Link
              to="/enterprise#scope-builder"
              className="px-4 py-1.5 rounded-full text-xs font-mono font-bold bg-sky-500 hover:bg-sky-400 text-slate-950 transition"
            >
              {t.footer.partnerCta}
            </Link>
          </div>
        </div>

        {/* 4-Column Executive Mega-Footer Directory */}
        <ScrollReveal>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-x-6 sm:gap-x-10 gap-y-10">
          {footerColumns.map((column, colIdx) => (
            <div key={colIdx} className="space-y-8">
              {column.map((group) => (
                <div key={group.heading} className="space-y-3">
                  <h3 className="text-xs font-mono font-bold uppercase tracking-wider text-black dark:text-white">
                    {group.heading}
                  </h3>
                  <ul className="space-y-2.5 text-[13.5px]">
                    {group.items.map((item) => (
                      <li key={item.label}>
                        {item.action === 'terminal' ? (
                          <button
                            type="button"
                            onClick={onOpenTerminal}
                            className="inline-flex items-center gap-1.5 text-slate-900 dark:text-white hover:text-emerald-700 dark:hover:text-emerald-300 transition text-start"
                          >
                            <Terminal className="w-3.5 h-3.5 opacity-80 shrink-0" />
                            <span>{item.label}</span>
                          </button>
                        ) : item.to ? (
                          <Link
                            to={item.to}
                            className="text-slate-900 dark:text-white hover:text-emerald-700 dark:hover:text-emerald-300 transition"
                          >
                            {item.label}
                          </Link>
                        ) : (
                          <a
                            href={item.href}
                            target={item.href?.startsWith('http') ? '_blank' : undefined}
                            rel={item.href?.startsWith('http') ? 'noopener noreferrer' : undefined}
                            className="inline-flex items-center gap-1 text-slate-900 dark:text-white hover:text-emerald-700 dark:hover:text-emerald-300 transition"
                          >
                            <span>{item.label}</span>
                            {item.href?.startsWith('http') && (
                              <ExternalLink className="w-3 h-3 opacity-75 shrink-0" />
                            )}
                          </a>
                        )}
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          ))}
          </div>
        </ScrollReveal>

        {/* Bottom Copyright & Shortcut Bar */}
        <div className="mt-12 pt-6 border-t border-slate-300/70 dark:border-white/15 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-slate-900 dark:text-white font-mono">
          <span>
            © {year} {t.footer.copyright} {ORG_META.founderName}.
          </span>
          <span>{t.footer.shortcutHint}</span>
        </div>
      </div>
    </footer>
  );
}

import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ArrowRight, CheckCircle2, ChevronDown, Cpu, Rocket, Sparkles, Wrench } from 'lucide-react';
import { ScrollReveal, ScrollScrubText } from '../components/KineticScrollText';
import { useI18n } from '../i18n/I18nContext';
import { SERVICES_CONTENT, type ServiceIconId } from '../data/servicesContent';

const ACCENT_MAP = {
  cyan: {
    fill: '#00D4FF',
    stroke: '#0284C7',
    badge: 'text-sky-700 dark:text-sky-300',
    topRule: 'group-hover:border-sky-500 dark:group-hover:border-[#00D4FF]',
    titleHover: 'group-hover:text-sky-700 dark:group-hover:text-[#00D4FF]',
  },
  azure: {
    fill: '#188AFF',
    stroke: '#1D4ED8',
    badge: 'text-blue-700 dark:text-sky-300',
    topRule: 'group-hover:border-blue-600 dark:group-hover:border-[#188AFF]',
    titleHover: 'group-hover:text-blue-700 dark:group-hover:text-sky-300',
  },
  green: {
    fill: '#22E53A',
    stroke: '#059669',
    badge: 'text-emerald-700 dark:text-emerald-300',
    topRule: 'group-hover:border-emerald-500 dark:group-hover:border-[#22E53A]',
    titleHover: 'group-hover:text-emerald-700 dark:group-hover:text-emerald-300',
  },
  gold: {
    fill: '#FFAC12',
    stroke: '#D97706',
    badge: 'text-amber-700 dark:text-amber-300',
    topRule: 'group-hover:border-amber-500 dark:group-hover:border-[#FFE024]',
    titleHover: 'group-hover:text-amber-700 dark:group-hover:text-amber-300',
  },
  ruby: {
    fill: '#FF2E4C',
    stroke: '#DC2626',
    badge: 'text-rose-700 dark:text-rose-300',
    topRule: 'group-hover:border-rose-500 dark:group-hover:border-[#FF2E4C]',
    titleHover: 'group-hover:text-rose-700 dark:group-hover:text-rose-300',
  },
} as const;

const STAT_TONES = {
  ink: 'text-black dark:text-white',
  green: 'text-emerald-700 dark:text-emerald-400',
  cyan: 'text-sky-700 dark:text-sky-400',
  gold: 'text-amber-700 dark:text-amber-300',
} as const;

/** Custom zero-GPU duotone geometric SVG icons styled in the authentic KRONVEX Owl palette */
function ServiceGlyph({ id, accent }: { id: ServiceIconId; accent: keyof typeof ACCENT_MAP }) {
  const c = ACCENT_MAP[accent];
  return (
    <svg
      viewBox="0 0 40 40"
      width="40"
      height="40"
      fill="none"
      aria-hidden="true"
      className="w-10 h-10 shrink-0 transition-transform duration-300 ease-out group-hover:-translate-y-0.5"
    >
      {id === 'strategy' && (
        <>
          <circle cx="20" cy="20" r="14" fill={c.fill} fillOpacity="0.22" stroke={c.stroke} strokeWidth="1.8" />
          <circle cx="20" cy="20" r="8.5" fill={c.fill} fillOpacity="0.38" stroke={c.stroke} strokeWidth="1.6" />
          <circle cx="20" cy="20" r="3.2" fill="currentColor" />
        </>
      )}
      {id === 'design' && (
        <>
          <path
            d="M20 6C13.9 6 9 10.7 9 16.5C9 20.4 11.2 23.7 14.5 25.5V28.5C14.5 29.6 15.4 30.5 16.5 30.5H23.5C24.6 30.5 25.5 29.6 25.5 28.5V25.5C28.8 23.7 31 20.4 31 16.5C31 10.7 26.1 6 20 6Z"
            fill={c.fill}
            fillOpacity="0.26"
            stroke={c.stroke}
            strokeWidth="1.8"
            strokeLinejoin="round"
          />
          <path d="M16 34H24" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" />
          <path d="M17.2 19.5C17.2 17.5 18.5 16 20 16C21.5 16 22.8 17.5 22.8 19.5C22.8 21.2 21.5 22.2 20 22.2V25.5" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" />
        </>
      )}
      {id === 'apps' && (
        <>
          <circle cx="19" cy="19" r="12.5" fill={c.fill} fillOpacity="0.22" stroke={c.stroke} strokeWidth="1.8" />
          <ellipse cx="19" cy="19" rx="5.5" ry="12.5" stroke={c.stroke} strokeWidth="1.5" />
          <path d="M7.5 15H30.5M7.5 23H30.5" stroke={c.stroke} strokeWidth="1.5" />
          <polygon points="24,22 34,27 28.5,29 27,34.5" fill="currentColor" />
        </>
      )}
      {id === 'ai' && (
        <>
          <polygon points="20,5 33,12.5 33,27.5 20,35 7,27.5 7,12.5" fill={c.fill} fillOpacity="0.22" stroke={c.stroke} strokeWidth="1.8" strokeLinejoin="round" />
          <circle cx="20" cy="20" r="4.5" fill={c.fill} stroke="currentColor" strokeWidth="1.6" />
          <path d="M20 10V15.5M20 24.5V30M11.5 15L16 17.6M24 22.4L28.5 25M28.5 15L24 17.6M16 22.4L11.5 25" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
        </>
      )}
      {id === 'api' && (
        <>
          <rect x="6" y="8" width="28" height="24" rx="5" fill={c.fill} fillOpacity="0.2" stroke={c.stroke} strokeWidth="1.8" />
          <path d="M14 16L10 20L14 24M26 16L30 20L26 24M21.5 14.5L18.5 25.5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
        </>
      )}
      {id === 'cloud' && (
        <>
          <path
            d="M12.5 25.5H28.5C32.1 25.5 35 22.8 35 19.4C35 16.3 32.6 13.8 29.4 13.4C28.4 9.2 24.6 6 20 6C15.1 6 11.1 9.6 10.5 14.3C7.4 14.9 5 17.5 5 20.6C5 23.3 8.3 25.5 12.5 25.5Z"
            fill={c.fill}
            fillOpacity="0.26"
            stroke={c.stroke}
            strokeWidth="1.8"
            strokeLinejoin="round"
          />
          <path d="M15 25.5V32.5M20 25.5V34.5M25 25.5V32.5" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
          <circle cx="15" cy="33" r="1.6" fill="currentColor" />
          <circle cx="20" cy="35" r="1.6" fill="currentColor" />
          <circle cx="25" cy="33" r="1.6" fill="currentColor" />
        </>
      )}
      {id === 'intel' && (
        <>
          <rect x="7" y="21" width="5.5" height="12" rx="1.5" fill={c.fill} fillOpacity="0.35" stroke={c.stroke} strokeWidth="1.6" />
          <rect x="17.2" y="14" width="5.5" height="19" rx="1.5" fill={c.fill} fillOpacity="0.55" stroke={c.stroke} strokeWidth="1.6" />
          <rect x="27.5" y="8" width="5.5" height="25" rx="1.5" fill={c.fill} fillOpacity="0.8" stroke={c.stroke} strokeWidth="1.6" />
          <path d="M8 15L16 10L23 12L32 5.5" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
        </>
      )}
      {id === 'security' && (
        <>
          <path
            d="M20 5L32 9.5V19.5C32 27 26.8 32.8 20 35.5C13.2 32.8 8 27 8 19.5V9.5L20 5Z"
            fill={c.fill}
            fillOpacity="0.24"
            stroke={c.stroke}
            strokeWidth="1.8"
            strokeLinejoin="round"
          />
          <path d="M15 20.5L18.5 24L25.5 16.5" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />
        </>
      )}
      {id === 'seo' && (
        <>
          <circle cx="18" cy="18" r="10.5" fill={c.fill} fillOpacity="0.24" stroke={c.stroke} strokeWidth="1.8" />
          <path d="M26 26L33.5 33.5" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" />
          <path d="M13 20.5L16.5 17L19 19.5L23.5 14" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round" />
        </>
      )}
    </svg>
  );
}

export function ServicesPage() {
  const navigate = useNavigate();
  const { locale } = useI18n();
  const copy = SERVICES_CONTENT[locale] ?? SERVICES_CONTENT.en;
  const [openFaq, setOpenFaq] = useState<number | null>(0);

  const startInquiry = (selectedName: string) => {
    const brief = [
      copy.inquiryGreeting,
      '',
      `${copy.inquirySelectedLabel} ${selectedName}`,
      '',
      copy.inquiryGoalsLabel,
      copy.inquiryPlaceholder,
    ].join('\n');
    navigate(`/contact?topic=${encodeURIComponent('Partnership / Enterprise')}&brief=${encodeURIComponent(brief)}`);
  };

  return (
    <div className="max-w-[1560px] mx-auto px-4 sm:px-6 lg:px-10 xl:px-12 py-14 space-y-24">
      {/* Hero */}
      <section className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-14 items-end">
        <div className="lg:col-span-8 space-y-6">
          <div className="inline-flex items-center gap-2 text-xs font-mono font-bold tracking-wider text-emerald-700 dark:text-emerald-300 uppercase">
            <Wrench className="w-4 h-4 shrink-0" /> {copy.heroEyebrow}
          </div>
          <h1 className="font-display font-bold text-3xl sm:text-5xl text-black dark:text-white leading-[1.1] tracking-tight">
            {copy.heroTitlePrefix}
            <span className="font-editorial italic font-normal text-sky-700 dark:text-emerald-300">
              {copy.heroTitleAccent}
            </span>
            {copy.heroTitleSuffix}
          </h1>
          <p className="text-base sm:text-lg text-slate-900 dark:text-slate-100 leading-relaxed max-w-3xl">
            {copy.heroSubtitle}
          </p>
          <div className="inline-flex items-center gap-2 px-3.5 py-2 rounded-lg border border-emerald-500/35 bg-emerald-500/10 text-xs font-mono font-bold text-emerald-900 dark:text-emerald-200">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
            <span>{copy.turnkeyBadge}</span>
          </div>
          <div className="flex flex-wrap items-center gap-4 pt-1">
            <Link
              to="/enterprise#scope-builder"
              className="px-6 py-3 rounded-full bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-sm inline-flex items-center gap-2 shadow-lg shadow-emerald-500/20 transition"
            >
              <Sparkles className="w-4 h-4 shrink-0" /> {copy.ctaScope}
            </Link>
            <Link
              to="/work"
              className="px-5 py-3 rounded-full border border-slate-300 dark:border-white/20 hover:border-sky-500 dark:hover:border-emerald-400 text-sm font-bold text-black dark:text-white inline-flex items-center gap-2 transition"
            >
              {copy.ctaWork} <ArrowRight className="w-4 h-4 rtl:rotate-180 shrink-0" />
            </Link>
          </div>
        </div>

        {/* Measured Standards Strip */}
        <div className="lg:col-span-4 grid grid-cols-2 gap-4 border-t lg:border-t-0 lg:border-s border-slate-300/70 dark:border-white/15 pt-6 lg:pt-0 lg:ps-8">
          {copy.stats.map((st) => (
            <div key={st.label}>
              <div className={`font-brand text-2xl sm:text-3xl font-bold ${STAT_TONES[st.tone]}`}>{st.value}</div>
              <div className="font-mono text-[11px] text-slate-700 dark:text-slate-300 mt-1">{st.label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* 3x3 Architectural Hairline Service Matrix */}
      <section className="space-y-10 border-t border-slate-300/70 dark:border-white/15 pt-16">
        <div className="max-w-4xl space-y-3">
          <div className="font-mono text-xs font-bold uppercase tracking-widest text-sky-700 dark:text-sky-300">
            {copy.gridEyebrow}
          </div>
          <ScrollScrubText
            as="h2"
            text={copy.gridTitle}
            className="font-display font-bold text-2xl sm:text-4xl text-black dark:text-white"
          />
          <p className="text-sm sm:text-base text-slate-800 dark:text-slate-200 leading-relaxed max-w-3xl">
            {copy.gridSubtitle}
          </p>
        </div>

        {/* Open Transparent 3x3 Editorial Grid — Zero Opaque Boxes, Flowing Directly Over Live Canvas */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-x-10 lg:gap-x-14 gap-y-12">
          {copy.services.map((svc, idx) => {
            const theme = ACCENT_MAP[svc.accent];
            return (
              <ScrollReveal key={svc.id} delayMs={(idx % 3) * 65} className="h-full">
                <article
                  className={`group h-full pt-7 border-t border-slate-300/80 dark:border-white/15 ${theme.topRule} transition-colors duration-200 flex flex-col justify-between gap-6`}
                >
                  <div className="space-y-5">
                    <div className="flex items-start justify-between gap-4 text-slate-900 dark:text-white">
                      <ServiceGlyph id={svc.icon} accent={svc.accent} />
                      <span className={`font-mono text-xs font-bold tracking-wider ${theme.badge}`}>{svc.code}</span>
                    </div>

                    <div className="space-y-2.5">
                      <h3
                        className={`font-display font-bold text-xl sm:text-[22px] text-black dark:text-white leading-snug tracking-tight transition-colors ${theme.titleHover}`}
                      >
                        {svc.title}
                      </h3>
                      <p className="text-sm sm:text-[15px] text-slate-900 dark:text-slate-100 leading-relaxed">
                        {svc.summary}
                      </p>
                    </div>
                  </div>

                  <div className="pt-4 border-t border-slate-300/50 dark:border-white/10 space-y-3.5">
                    <div className={`font-mono text-xs font-semibold tracking-wide ${theme.badge}`}>
                      {svc.tags.join(' · ')}
                    </div>
                    <button
                      type="button"
                      onClick={() => startInquiry(svc.topic)}
                      className="inline-flex items-center gap-1.5 text-xs font-mono font-bold text-black dark:text-white hover:text-sky-700 dark:hover:text-emerald-300 transition"
                    >
                      <span>{copy.requestServiceLabel}</span>
                      <ArrowRight className="w-3.5 h-3.5 rtl:rotate-180 transition-transform duration-200 group-hover:translate-x-1 rtl:group-hover:-translate-x-1" />
                    </button>
                  </div>
                </article>
              </ScrollReveal>
            );
          })}
        </div>
      </section>

      {/* 4-Stage Delivery Process */}
      <section className="space-y-10 border-t border-slate-300/70 dark:border-white/15 pt-16">
        <div className="max-w-3xl space-y-3">
          <div className="font-mono text-xs font-bold uppercase tracking-widest text-emerald-700 dark:text-emerald-300">
            {copy.processEyebrow}
          </div>
          <ScrollScrubText
            as="h2"
            text={copy.processTitle}
            className="font-display font-bold text-2xl sm:text-4xl text-black dark:text-white"
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {copy.steps.map((s, idx) => (
            <ScrollReveal key={s.step} delayMs={idx * 70}>
              <div className="h-full pt-5 border-t-2 border-emerald-500/60 space-y-2.5">
                <div className="font-brand text-sm font-bold text-emerald-700 dark:text-emerald-400">
                  {copy.phaseLabel} {s.step}
                </div>
                <h3 className="font-display font-bold text-lg text-black dark:text-white">{s.title}</h3>
                <p className="text-sm text-slate-800 dark:text-slate-200 leading-relaxed">{s.detail}</p>
              </div>
            </ScrollReveal>
          ))}
        </div>
      </section>

      {/* Engagement Models */}
      <section className="space-y-10 border-t border-slate-300/70 dark:border-white/15 pt-16">
        <div className="max-w-3xl space-y-3">
          <div className="font-mono text-xs font-bold uppercase tracking-widest text-sky-700 dark:text-sky-300">
            {copy.modelsEyebrow}
          </div>
          <ScrollScrubText
            as="h2"
            text={copy.modelsTitle}
            className="font-display font-bold text-2xl sm:text-4xl text-black dark:text-white"
          />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-10 lg:gap-12">
          {copy.models.map((m, idx) => (
            <ScrollReveal key={m.name} delayMs={idx * 80} className="h-full">
              <div className="h-full pt-7 border-t-2 border-slate-300/80 dark:border-white/15 hover:border-sky-500 dark:hover:border-emerald-400 transition-colors flex flex-col justify-between gap-7">
                <div className="space-y-4">
                  <span className="inline-block font-mono text-[11px] font-bold tracking-wider uppercase text-sky-700 dark:text-sky-300">
                    {m.tag}
                  </span>
                  <h3 className="font-display font-bold text-xl sm:text-2xl text-black dark:text-white">{m.name}</h3>
                  <p className="text-sm text-slate-900 dark:text-slate-100 leading-relaxed">{m.idealFor}</p>
                  <ul className="space-y-2.5 pt-2">
                    {m.points.map((pt) => (
                      <li key={pt} className="text-xs sm:text-sm text-slate-900 dark:text-slate-100 flex items-start gap-2">
                        <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" />
                        <span>{pt}</span>
                      </li>
                    ))}
                  </ul>
                </div>
                <button
                  type="button"
                  onClick={() => startInquiry(m.topic)}
                  className="w-full py-2.5 px-4 rounded-full bg-slate-950 dark:bg-white hover:opacity-90 text-white dark:text-slate-950 font-mono font-bold text-xs inline-flex items-center justify-center gap-2 transition"
                >
                  <Rocket className="w-3.5 h-3.5 shrink-0" /> {copy.startPrefix} {m.name}
                </button>
              </div>
            </ScrollReveal>
          ))}
        </div>
      </section>

      {/* FAQ Section */}
      <section className="space-y-8 border-t border-slate-300/70 dark:border-white/15 pt-16">
        <div className="max-w-3xl space-y-3">
          <div className="font-mono text-xs font-bold uppercase tracking-widest text-sky-700 dark:text-sky-300">
            {copy.faqEyebrow}
          </div>
          <ScrollScrubText
            as="h2"
            text={copy.faqTitle}
            className="font-display font-bold text-2xl sm:text-4xl text-black dark:text-white"
          />
        </div>

        <div className="divide-y divide-slate-300/70 dark:divide-white/15 border-y border-slate-300/70 dark:border-white/15">
          {copy.faqs.map((item, idx) => {
            const isOpen = openFaq === idx;
            return (
              <div key={item.q} className="py-5">
                <button
                  type="button"
                  onClick={() => setOpenFaq(isOpen ? null : idx)}
                  aria-expanded={isOpen}
                  className="w-full flex items-center justify-between gap-4 text-start font-display font-bold text-base sm:text-lg text-black dark:text-white hover:text-sky-700 dark:hover:text-emerald-300 transition"
                >
                  <span>{item.q}</span>
                  <ChevronDown
                    className={`w-5 h-5 shrink-0 transition-transform duration-200 ${isOpen ? 'rotate-180 text-emerald-500' : ''}`}
                  />
                </button>
                {isOpen && (
                  <p className="mt-3 text-sm sm:text-base text-slate-800 dark:text-slate-200 leading-relaxed max-w-4xl">
                    {item.a}
                  </p>
                )}
              </div>
            );
          })}
        </div>

        <div className="flex flex-wrap items-center justify-between gap-4 pt-4">
          <div className="flex items-center gap-2 text-sm text-slate-800 dark:text-slate-200">
            <Cpu className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
            <span>{copy.playbookPrompt}</span>
          </div>
          <Link
            to="/playbook"
            className="text-sm font-mono font-bold text-sky-700 dark:text-emerald-300 hover:underline inline-flex items-center gap-1.5"
          >
            {copy.playbookCta} <ArrowRight className="w-4 h-4 rtl:rotate-180" />
          </Link>
        </div>
      </section>
    </div>
  );
}

import { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { ArrowUpRight, Check, Copy, Github, Mail, MessageSquare, ShieldAlert } from 'lucide-react';
import { ORG_META } from '../data/catalog';
import { useI18n } from '../i18n/I18nContext';

const VALID_TOPICS = [
  'Partnership / Enterprise',
  'Custom AI Models & Research',
  'Cross-Platform App Collaboration',
  'Investor / Strategic Inquiry',
  'Security Disclosure',
];

export function ContactPage() {
  const { t } = useI18n();
  const [searchParams] = useSearchParams();
  const [name, setName] = useState('');
  const [topic, setTopic] = useState(() => {
    const qTopic = searchParams.get('topic');
    return qTopic && VALID_TOPICS.includes(qTopic) ? qTopic : 'Partnership / Enterprise';
  });
  const [message, setMessage] = useState(() => searchParams.get('brief') || '');
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    const qTopic = searchParams.get('topic');
    const qBrief = searchParams.get('brief');
    if (qTopic && VALID_TOPICS.includes(qTopic)) setTopic(qTopic);
    if (qBrief) setMessage(qBrief);
  }, [searchParams]);

  const formattedBody = `Organization / Name: ${name || 'Not provided'}\nTopic: ${topic}\n\n${
    message || 'Hello KRONVEX team,'
  }`;

  const githubIssueHref = `${ORG_META.orgProfileRepoUrl}/issues/new?title=${encodeURIComponent(
    `[Inquiry] ${topic}`
  )}&body=${encodeURIComponent(formattedBody)}`;

  const copyInquiry = () => {
    navigator.clipboard?.writeText(`Subject: [KRONVEX] ${topic}\n\n${formattedBody}`);
    setCopied(true);
    setTimeout(() => setCopied(false), 1800);
  };

  return (
    <div className="max-w-[1560px] mx-auto px-4 sm:px-6 lg:px-10 xl:px-12 py-14 space-y-14">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-end">
        <div className="lg:col-span-8 space-y-3">
          <div className="inline-flex items-center gap-2 text-xs font-mono font-bold tracking-wider text-sky-700 dark:text-sky-300">
            <Mail className="w-4 h-4" /> {t.contact.badge}
          </div>
          <h1 className="font-display font-bold text-3xl sm:text-5xl text-black dark:text-white tracking-tight">
            {t.contact.title}
          </h1>
          <p className="text-base text-slate-900 dark:text-white leading-relaxed max-w-3xl">{t.contact.subtitle}</p>
        </div>
        <div className="lg:col-span-4 lg:border-s border-slate-300/80 dark:border-slate-700/80 lg:ps-8 font-mono text-xs space-y-1">
          <div className="text-emerald-600 dark:text-emerald-400 font-bold">● ZERO-TRACKING CLIENT COMPOSER</div>
          <div className="text-slate-900 dark:text-white">Direct GitHub Issue routing &amp; 48h security SLA</div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 pt-8 border-t border-slate-300/80 dark:border-slate-800">
        {/* Direct Channels — Open Editorial Directory (Zero Card Boxes) */}
        <div className="lg:col-span-5 divide-y divide-slate-300/70 dark:divide-slate-800/80">
          <a
            href={ORG_META.githubUrl}
            target="_blank"
            rel="noreferrer"
            className="group block py-6 first:pt-0 space-y-2 transition"
          >
            <div className="flex items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <Github className="w-5 h-5 text-sky-600 dark:text-sky-400 shrink-0" />
                <div>
                  <div className="font-mono text-[10px] font-semibold tracking-wider text-slate-800 dark:text-slate-100">
                    GITHUB ORGANIZATION
                  </div>
                  <div className="font-display font-bold text-lg text-black dark:text-white group-hover:text-sky-600 dark:group-hover:text-sky-400 transition">
                    github.com/KRONVEX
                  </div>
                </div>
              </div>
              <ArrowUpRight className="w-4 h-4 text-slate-800 dark:text-slate-100 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 group-hover:text-sky-500 transition" />
            </div>
            <p className="text-sm text-slate-800 dark:text-white leading-relaxed ps-8">
              Open issues, submit feature proposals, inspect releases, or contribute directly to our repositories.
            </p>
          </a>

          <div className="py-6 space-y-2">
            <div className="flex items-center gap-3">
              <Mail className="w-5 h-5 text-indigo-600 dark:text-indigo-400 shrink-0" />
              <div>
                <div className="font-mono text-[10px] font-semibold tracking-wider text-slate-800 dark:text-slate-100">
                  DEDICATED ORG EMAIL
                </div>
                <div className="font-display font-bold text-lg text-black dark:text-white">
                  {ORG_META.contactEmail || 'Coming Soon (Custom Domain)'}
                </div>
              </div>
            </div>
            <p className="text-sm text-slate-800 dark:text-white leading-relaxed ps-8">
              An official domain-backed organization email address will be published here once the KRONVEX custom
              domain is attached. Until then, connect via GitHub Organization channels.
            </p>
          </div>

          <a
            href={`${ORG_META.orgProfileRepoUrl}/blob/main/SECURITY.md`}
            target="_blank"
            rel="noreferrer"
            className="group block py-6 space-y-2 transition"
          >
            <div className="flex items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <ShieldAlert className="w-5 h-5 text-emerald-600 dark:text-emerald-400 shrink-0" />
                <div>
                  <div className="font-mono text-[10px] font-semibold tracking-wider text-slate-800 dark:text-slate-100">
                    SECURITY DISCLOSURE
                  </div>
                  <div className="font-display font-bold text-lg text-black dark:text-white group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition">
                    SECURITY.md Policy
                  </div>
                </div>
              </div>
              <ArrowUpRight className="w-4 h-4 text-slate-800 dark:text-slate-100 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 group-hover:text-emerald-500 transition" />
            </div>
            <p className="text-sm text-slate-800 dark:text-white leading-relaxed ps-8">
              48-hour acknowledgment SLA for responsibly disclosed vulnerabilities via GitHub Private Security
              Advisories.
            </p>
          </a>
        </div>

        {/* Zero-Backend Inquiry Composer — Open Borderless Form Area */}
        <div className="lg:col-span-7 lg:border-s border-slate-300/80 dark:border-slate-800 lg:ps-10 space-y-6">
          <div>
            <h2 className="font-display font-bold text-2xl text-black dark:text-white">{t.contact.composerTitle}</h2>
            <p className="text-sm text-slate-900 dark:text-white mt-1">{t.contact.composerSub}</p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            <div className="space-y-1.5">
              <label className="text-xs font-mono font-semibold text-slate-900 dark:text-slate-100">
                {t.contact.nameLabel}
              </label>
              <input
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Jane Doe · Acme Labs"
                className="w-full px-3.5 py-2.5 rounded-xl bg-white/80 dark:bg-slate-900/70 border border-slate-300 dark:border-slate-700 text-sm text-black dark:text-white placeholder-slate-500 dark:placeholder-slate-200 focus:outline-none focus:border-sky-500 transition"
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-mono font-semibold text-slate-900 dark:text-slate-100">
                {t.contact.categoryLabel}
              </label>
              <select
                value={topic}
                onChange={(e) => setTopic(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl bg-white/80 dark:bg-slate-900/70 border border-slate-300 dark:border-slate-700 text-sm text-black dark:text-white focus:outline-none focus:border-sky-500 transition"
              >
                <option>Partnership / Enterprise</option>
                <option>Custom AI Models &amp; Research</option>
                <option>Cross-Platform App Collaboration</option>
                <option>Investor / Strategic Inquiry</option>
                <option>Security Disclosure</option>
              </select>
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-mono font-semibold text-slate-900 dark:text-slate-100">
              {t.contact.messageLabel}
            </label>
            <textarea
              rows={5}
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder={t.contact.messagePlaceholder}
              className="w-full px-3.5 py-2.5 rounded-xl bg-white/80 dark:bg-slate-900/70 border border-slate-300 dark:border-slate-700 text-sm text-black dark:text-white placeholder-slate-500 dark:placeholder-slate-200 focus:outline-none focus:border-sky-500 transition"
            />
          </div>

          <div className="flex flex-wrap items-center gap-4 pt-1">
            <a
              href={githubIssueHref}
              target="_blank"
              rel="noreferrer"
              className="px-6 py-2.5 rounded-full bg-sky-500 hover:bg-sky-400 text-black font-bold text-sm inline-flex items-center gap-2 transition"
            >
              <MessageSquare className="w-4 h-4" /> {t.contact.submitGithub}
            </a>
            <button
              type="button"
              onClick={copyInquiry}
              className="px-4 py-2.5 rounded-full border border-slate-300 dark:border-slate-700 text-black dark:text-white font-semibold text-sm inline-flex items-center gap-2 hover:border-sky-500 transition"
            >
              {copied ? <Check className="w-4 h-4 text-emerald-500" /> : <Copy className="w-4 h-4" />}
              {copied ? t.contact.copied : t.contact.copyInquiry}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

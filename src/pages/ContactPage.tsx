import { useState } from 'react';
import { Check, Copy, ExternalLink, Github, Mail, MessageSquare, ShieldAlert } from 'lucide-react';
import { ORG_META } from '../data/catalog';

export function ContactPage() {
  const [name, setName] = useState('');
  const [topic, setTopic] = useState('Partnership / Enterprise');
  const [message, setMessage] = useState('');
  const [copied, setCopied] = useState(false);

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
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-12">
      <div className="space-y-3 max-w-2xl">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-mono font-semibold bg-sky-500/15 text-sky-900 dark:text-sky-200 border border-sky-600/30 dark:border-sky-400/30">
          <Mail className="w-3.5 h-3.5" /> DIRECT CHANNELS · ZERO TRACKING
        </div>
        <h1 className="font-display font-bold text-3xl sm:text-4xl text-black dark:text-white">
          Connect with KRONVEX
        </h1>
        <p className="text-slate-900 dark:text-slate-100 leading-relaxed">
          Reach out for strategic partnerships, applied AI &amp; quantitative research collaborations, open-source
          contributions, or private security disclosures.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Direct Channels */}
        <div className="lg:col-span-5 space-y-4">
          <a
            href={ORG_META.githubUrl}
            target="_blank"
            rel="noreferrer"
            className="block rounded-2xl glass-panel p-6 hover:border-sky-500 transition"
          >
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-xl bg-sky-500/15 text-sky-700 dark:text-sky-300">
                  <Github className="w-5 h-5" />
                </div>
                <div>
                  <div className="font-mono text-[10px] font-semibold text-slate-800 dark:text-slate-200">
                    GITHUB ORGANIZATION
                  </div>
                  <div className="font-bold text-black dark:text-white">github.com/KRONVEX</div>
                </div>
              </div>
              <ExternalLink className="w-4 h-4 text-slate-800 dark:text-slate-200" />
            </div>
            <p className="text-xs text-slate-900 dark:text-slate-100 leading-relaxed">
              Open issues, submit feature proposals, inspect releases, or contribute directly to our repositories.
            </p>
          </a>

          <div className="rounded-2xl glass-panel p-6">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-xl bg-indigo-500/15 text-indigo-700 dark:text-indigo-300">
                  <Mail className="w-5 h-5" />
                </div>
                <div>
                  <div className="font-mono text-[10px] font-semibold text-slate-800 dark:text-slate-200">
                    DEDICATED ORG EMAIL
                  </div>
                  <div className="font-bold text-black dark:text-white">
                    {ORG_META.contactEmail || 'Coming Soon (Custom Domain)'}
                  </div>
                </div>
              </div>
            </div>
            <p className="text-xs text-slate-900 dark:text-slate-100 leading-relaxed">
              An official domain-backed organization email address will be published here once the KRONVEX
              custom domain is attached. Until then, connect via GitHub Organization channels.
            </p>
          </div>

          <a
            href={`${ORG_META.orgProfileRepoUrl}/blob/main/SECURITY.md`}
            target="_blank"
            rel="noreferrer"
            className="block rounded-2xl glass-panel p-6 hover:border-emerald-500 transition"
          >
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-xl bg-emerald-500/15 text-emerald-700 dark:text-emerald-300">
                  <ShieldAlert className="w-5 h-5" />
                </div>
                <div>
                  <div className="font-mono text-[10px] font-semibold text-slate-800 dark:text-slate-200">
                    SECURITY DISCLOSURE
                  </div>
                  <div className="font-bold text-black dark:text-white">SECURITY.md Policy</div>
                </div>
              </div>
              <ExternalLink className="w-4 h-4 text-slate-800 dark:text-slate-200" />
            </div>
            <p className="text-xs text-slate-900 dark:text-slate-100 leading-relaxed">
              48-hour acknowledgment SLA for responsibly disclosed vulnerabilities via GitHub Private Security Advisories.
            </p>
          </a>
        </div>

        {/* Zero-Backend Inquiry Composer */}
        <div className="lg:col-span-7 rounded-2xl glass-panel p-6 sm:p-8 space-y-5">
          <div>
            <h2 className="font-display font-bold text-xl text-black dark:text-white">
              Compose Structured Inquiry
            </h2>
            <p className="text-xs text-slate-800 dark:text-slate-200 mt-1">
              100% client-side — opens a pre-formatted GitHub inquiry or copies cleanly to your clipboard with zero
              third-party tracking.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-xs font-mono font-semibold text-slate-900 dark:text-slate-100">
                Your Name / Organization
              </label>
              <input
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Jane Doe · Acme Labs"
                className="w-full px-3.5 py-2.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-400 dark:border-slate-700 text-sm text-black dark:text-white placeholder-slate-500 dark:placeholder-slate-400 focus:outline-none focus:border-sky-500"
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-mono font-semibold text-slate-900 dark:text-slate-100">
                Inquiry Category
              </label>
              <select
                value={topic}
                onChange={(e) => setTopic(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-400 dark:border-slate-700 text-sm text-black dark:text-white focus:outline-none focus:border-sky-500"
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
            <label className="text-xs font-mono font-semibold text-slate-900 dark:text-slate-100">Message</label>
            <textarea
              rows={5}
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Tell us about your project, partnership idea, or technical question..."
              className="w-full px-3.5 py-2.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-400 dark:border-slate-700 text-sm text-black dark:text-white placeholder-slate-500 dark:placeholder-slate-400 focus:outline-none focus:border-sky-500"
            />
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <a
              href={githubIssueHref}
              target="_blank"
              rel="noreferrer"
              className="px-5 py-2.5 rounded-xl bg-sky-500 hover:bg-sky-400 text-black font-bold text-sm inline-flex items-center gap-2 transition"
            >
              <MessageSquare className="w-4 h-4" /> Submit via GitHub
            </a>
            <button
              type="button"
              onClick={copyInquiry}
              className="px-4 py-2.5 rounded-xl bg-slate-100 dark:bg-slate-900 border border-slate-400 dark:border-slate-700 text-black dark:text-white font-semibold text-sm inline-flex items-center gap-2 hover:border-sky-500 transition"
            >
              {copied ? <Check className="w-4 h-4 text-emerald-500" /> : <Copy className="w-4 h-4" />}
              {copied ? 'Copied!' : 'Copy Formatted Inquiry'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

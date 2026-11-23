import { useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import {
  ArrowUpRight,
  Check,
  Copy,
  Cpu,
  Download,
  MessageSquare,
  Terminal,
  Zap,
} from 'lucide-react';
import { KRONVEX_MODELS } from '../data/catalog';
import { evaluateHardwareFit } from '../utils/hardware';
import { LocalAiChat } from '../components/LocalAiChat';
import { ScrollReveal, ScrollScrubText } from '../components/KineticScrollText';
import { useI18n } from '../i18n/I18nContext';
import type { DetectedHardware } from '../types/kronvex';

interface ModelsPageProps {
  hardware: DetectedHardware;
}

export function ModelsPage({ hardware }: ModelsPageProps) {
  const { t } = useI18n();
  const [searchParams, setSearchParams] = useSearchParams();
  const initialTab = searchParams.get('tab') === 'chat' ? 'chat' : 'catalog';
  const [activeTab, setActiveTab] = useState<'catalog' | 'chat'>(initialTab);
  const [chatModelId, setChatModelId] = useState<string | undefined>(undefined);
  const [selectedVariantMap, setSelectedVariantMap] = useState<Record<string, string>>({});
  const [cmdTabMap, setCmdTabMap] = useState<Record<string, 'ollama' | 'llamacpp' | 'python'>>({});
  const [copiedCmd, setCopiedCmd] = useState<string | null>(null);

  const switchTab = (tab: 'catalog' | 'chat', modelId?: string) => {
    setActiveTab(tab);
    if (modelId) setChatModelId(modelId);
    setSearchParams(tab === 'chat' ? { tab: 'chat' } : {});
  };

  const copyCommand = (id: string, cmd: string) => {
    navigator.clipboard?.writeText(cmd);
    setCopiedCmd(id);
    setTimeout(() => setCopiedCmd(null), 1600);
  };

  return (
    <div className="max-w-[1560px] mx-auto px-4 sm:px-6 lg:px-10 xl:px-12 py-14 space-y-12">
      {/* Header & Open Inline Hardware Telemetry */}
      <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-8">
        <div className="space-y-3 max-w-2xl">
          <div className="inline-flex items-center gap-2 text-xs font-mono font-semibold tracking-wider text-indigo-700 dark:text-indigo-300">
            <Cpu className="w-4 h-4" /> {t.models.badge}
          </div>
          <h1 className="font-display font-bold text-3xl sm:text-5xl text-black dark:text-white tracking-tight">
            {t.models.title}
          </h1>
          <p className="text-base text-slate-800 dark:text-white leading-relaxed">{t.models.subtitle}</p>
        </div>

        {/* Open Inline Hardware Detector Strip (Zero Box Wall) */}
        <div className="space-y-2 ps-4 border-s-2 border-emerald-500 min-w-[260px]">
          <div className="flex items-center justify-between gap-4 font-mono text-[10px] tracking-wider text-slate-800 dark:text-slate-100">
            <span>{t.models.detectorTitle}</span>
            <span className="text-emerald-600 dark:text-emerald-400 font-bold">{t.models.active}</span>
          </div>
          <div className="flex items-center gap-5 font-mono text-xs">
            <div>
              <div className="text-[10px] text-slate-800 dark:text-slate-100">THREADS</div>
              <div className="font-bold text-black dark:text-white">{hardware.cpuCores} CPU</div>
            </div>
            <span className="opacity-25">|</span>
            <div>
              <div className="text-[10px] text-slate-800 dark:text-slate-100">RAM EST</div>
              <div className="font-bold text-black dark:text-white">
                {hardware.ramGb ? `${hardware.ramGb} GB+` : '8 GB+'}
              </div>
            </div>
            <span className="opacity-25">|</span>
            <div>
              <div className="text-[10px] text-slate-800 dark:text-slate-100">ACCEL</div>
              <div
                className={`font-bold ${
                  hardware.webgpuSupported ? 'text-emerald-600 dark:text-emerald-400' : 'text-sky-600 dark:text-sky-400'
                }`}
              >
                {hardware.webgpuSupported ? 'WebGPU' : 'WASM'}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Primary View Switcher */}
      <div className="flex flex-wrap items-center gap-3 border-b border-slate-300/80 dark:border-slate-800 pb-4">
        <button
          type="button"
          onClick={() => switchTab('catalog')}
          className={`px-5 py-2.5 rounded-full text-sm font-semibold inline-flex items-center gap-2 transition ${
            activeTab === 'catalog'
              ? 'bg-sky-500 text-slate-950 font-bold shadow-sm'
              : 'border border-slate-300 dark:border-slate-700 text-black dark:text-white hover:border-sky-500'
          }`}
        >
          <Download className="w-4 h-4" /> {t.models.tabCatalog} ({KRONVEX_MODELS.length})
        </button>
        <button
          type="button"
          onClick={() => switchTab('chat')}
          className={`px-5 py-2.5 rounded-full text-sm font-semibold inline-flex items-center gap-2 transition ${
            activeTab === 'chat'
              ? 'bg-emerald-500 text-slate-950 font-bold shadow-sm'
              : 'border border-slate-300 dark:border-slate-700 text-black dark:text-white hover:border-emerald-500'
          }`}
        >
          <MessageSquare className="w-4 h-4" /> {t.models.tabChat}
          <span className="px-1.5 py-0.5 rounded-full text-[10px] font-mono bg-black/15">LIVE</span>
        </button>
      </div>

      {/* Content */}
      {activeTab === 'chat' ? (
        <LocalAiChat hardware={hardware} initialModelId={chatModelId} />
      ) : (
        <div className="divide-y divide-slate-300/80 dark:divide-slate-800">
          {KRONVEX_MODELS.map((model, idx) => {
            const activeVarId = selectedVariantMap[model.id] || model.variants[0].id;
            const activeVar = model.variants.find((v) => v.id === activeVarId) || model.variants[0];
            const fit = evaluateHardwareFit(hardware, activeVar);
            const activeCmdTab = cmdTabMap[model.id] || 'ollama';
            const cmdText = model.runCommands[activeCmdTab];

            const fitText =
              fit.tone === 'emerald'
                ? 'text-emerald-600 dark:text-emerald-400'
                : fit.tone === 'cyan'
                ? 'text-sky-600 dark:text-sky-400'
                : 'text-amber-600 dark:text-amber-400';

            return (
              <section key={model.id} className="py-10 first:pt-2 space-y-7">
                <div className="flex flex-col lg:flex-row lg:items-start justify-between gap-4">
                  <div className="space-y-2.5 max-w-3xl">
                    <div className="flex flex-wrap items-center gap-3 font-mono text-xs">
                      <span className="font-brand font-bold text-indigo-600 dark:text-indigo-400">{model.parameters} PARAMS</span>
                      <span className="text-slate-800 dark:text-slate-100">
                        {model.contextLength} CTX · {model.license}
                      </span>
                      <span className={`font-bold ${fitText}`}>● {fit.label}</span>
                    </div>
                    {idx === 0 ? (
                      <h2 className="font-display font-bold text-2xl sm:text-3xl text-black dark:text-white">
                        {model.name}
                      </h2>
                    ) : (
                      <ScrollScrubText
                        as="h2"
                        text={model.name}
                        className="font-display font-bold text-2xl sm:text-3xl text-black dark:text-white"
                      />
                    )}
                    <p className="text-sm sm:text-base text-slate-800 dark:text-white leading-relaxed">
                      {model.description}
                    </p>
                  </div>

                  {model.browserRunnable && (
                    <button
                      type="button"
                      onClick={() => switchTab('chat', model.id)}
                      className="px-5 py-2.5 rounded-full bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs inline-flex items-center gap-1.5 shadow-sm shrink-0 transition"
                    >
                      <Zap className="w-4 h-4" /> {t.models.loadChatBtn}
                    </button>
                  )}
                </div>

                <ScrollReveal delayMs={idx === 0 ? 0 : 50} className="space-y-7">
                  {/* Inline Open Benchmark Strip (No Boxes!) */}
                <div className="flex flex-wrap items-center gap-x-8 gap-y-3 py-3 border-y border-slate-300/60 dark:border-slate-800/80">
                  {model.benchmarks.map((b) => (
                    <div key={b.metric} className="flex items-baseline gap-2.5 font-mono">
                      <span className="text-[10px] uppercase tracking-wider text-slate-800 dark:text-slate-100">
                        {b.metric}
                      </span>
                      <span className="font-bold text-sm text-black dark:text-white">{b.score}</span>
                    </div>
                  ))}
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                  {/* Quantization Selector & Direct Download */}
                  <div className="lg:col-span-6 space-y-4">
                    <div className="font-mono text-[11px] font-bold uppercase tracking-wider text-slate-800 dark:text-slate-100">
                      {t.models.selectQuant}
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {model.variants.map((v) => (
                        <button
                          key={v.id}
                          type="button"
                          onClick={() => setSelectedVariantMap((prev) => ({ ...prev, [model.id]: v.id }))}
                          className={`px-3 py-1.5 rounded-full text-xs font-mono transition border ${
                            activeVar.id === v.id
                              ? 'bg-sky-500/15 text-sky-800 dark:text-sky-300 border-sky-500 font-bold'
                              : 'border-slate-300 dark:border-slate-700 text-slate-800 dark:text-white hover:border-sky-500/50'
                          }`}
                        >
                          {v.format} · {v.quantization} ({v.sizeLabel})
                        </button>
                      ))}
                    </div>

                    <div className="space-y-2.5 text-xs pt-1">
                      <div className="text-slate-800 dark:text-white">{fit.detail}</div>
                      <div className="font-mono text-[11px] text-slate-800 dark:text-slate-100">
                        Min RAM: {activeVar.minRamGb} GB · Rec VRAM: {activeVar.recommendedVramGb} GB ·{' '}
                        {activeVar.sha256}
                      </div>
                      <a
                        href={activeVar.downloadUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="mt-1 px-5 py-2.5 rounded-full bg-sky-500 hover:bg-sky-400 text-slate-950 font-bold text-xs inline-flex items-center gap-2 transition"
                      >
                        <Download className="w-3.5 h-3.5" /> {t.models.directDownload} ({activeVar.format} ·{' '}
                        {activeVar.sizeLabel})
                        <ArrowUpRight className="w-3.5 h-3.5" />
                      </a>
                    </div>
                  </div>

                  {/* Quick Local Run Snippets (Structured Code Terminal Kept Crisp) */}
                  <div className="lg:col-span-6 space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="font-mono text-[11px] font-bold uppercase tracking-wider text-slate-800 dark:text-slate-100 inline-flex items-center gap-1.5">
                        <Terminal className="w-3.5 h-3.5 text-sky-500" /> {t.models.runLocally}
                      </span>
                      <div className="flex items-center gap-2">
                        {(['ollama', 'llamacpp', 'python'] as const).map((tabKey) => (
                          <button
                            key={tabKey}
                            type="button"
                            onClick={() => setCmdTabMap((prev) => ({ ...prev, [model.id]: tabKey }))}
                            className={`px-2 py-0.5 text-[11px] font-mono border-b-2 transition ${
                              activeCmdTab === tabKey
                                ? 'border-sky-500 text-black dark:text-white font-bold'
                                : 'border-transparent text-slate-800 dark:text-slate-100 hover:text-black dark:hover:text-white'
                            }`}
                          >
                            {tabKey}
                          </button>
                        ))}
                      </div>
                    </div>

                    <div
                      dir="ltr"
                      className="relative rounded-xl bg-[#050914] border border-slate-800 p-4 font-mono text-xs text-sky-300 overflow-x-auto text-left"
                    >
                      <pre className="whitespace-pre-wrap pr-8">{cmdText}</pre>
                      <button
                        type="button"
                        onClick={() => copyCommand(`${model.id}-${activeCmdTab}`, cmdText)}
                        className="absolute top-3 right-3 p-1.5 rounded-md bg-slate-900 border border-slate-700 text-slate-300 hover:text-white"
                        title="Copy command"
                      >
                        {copiedCmd === `${model.id}-${activeCmdTab}` ? (
                          <Check className="w-3.5 h-3.5 text-emerald-400" />
                        ) : (
                          <Copy className="w-3.5 h-3.5" />
                        )}
                      </button>
                    </div>
                  </div>
                </div>
                </ScrollReveal>
              </section>
            );
          })}
        </div>
      )}
    </div>
  );
}

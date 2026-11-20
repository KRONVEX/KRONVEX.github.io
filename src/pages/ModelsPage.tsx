import { useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import {
  Check,
  Copy,
  Cpu,
  Download,
  ExternalLink,
  MessageSquare,
  Terminal,
  Zap,
} from 'lucide-react';
import { NOVALIS_MODELS } from '../data/catalog';
import { evaluateHardwareFit } from '../utils/hardware';
import { LocalAiChat } from '../components/LocalAiChat';
import type { DetectedHardware } from '../types/novalis';

interface ModelsPageProps {
  hardware: DetectedHardware;
}

export function ModelsPage({ hardware }: ModelsPageProps) {
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
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-10">
      {/* Header & Local Hardware Fit Bar */}
      <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6">
        <div className="space-y-3 max-w-2xl">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-mono bg-indigo-500/10 text-indigo-800 dark:text-indigo-300 border border-indigo-500/25">
            <Cpu className="w-3.5 h-3.5" /> LOCAL-FIRST NEURAL MODELS · ZERO SERVER COST
          </div>
          <h1 className="font-display font-bold text-3xl sm:text-4xl text-black dark:text-white">
            AI Models &amp; Local Browser Chat Studio
          </h1>
          <p className="text-slate-900 dark:text-slate-100">
            Download NOVALIS model weights directly to your PC (GGUF / ONNX / Safetensors) or load a compact
            ONNX model directly inside your browser to chat locally via WebGPU &amp; WebAssembly.
          </p>
        </div>

        {/* Live Client Hardware Detector Card */}
        <div className="glass-panel rounded-2xl p-4 space-y-1.5 min-w-[280px]">
          <div className="flex items-center justify-between font-mono text-[10px] text-slate-800 dark:text-slate-200">
            <span>AUTO HARDWARE FIT DETECTOR</span>
            <span className="text-emerald-500 font-semibold">● ACTIVE</span>
          </div>
          <div className="grid grid-cols-3 gap-2 pt-1 font-mono text-xs">
            <div className="p-2 rounded-lg bg-slate-100 dark:bg-slate-900">
              <div className="text-[10px] text-slate-800 dark:text-slate-200">THREADS</div>
              <div className="font-bold text-black dark:text-white">{hardware.cpuCores} CPU</div>
            </div>
            <div className="p-2 rounded-lg bg-slate-100 dark:bg-slate-900">
              <div className="text-[10px] text-slate-800 dark:text-slate-200">RAM EST</div>
              <div className="font-bold text-black dark:text-white">
                {hardware.ramGb ? `${hardware.ramGb} GB+` : '8 GB+'}
              </div>
            </div>
            <div className="p-2 rounded-lg bg-slate-100 dark:bg-slate-900">
              <div className="text-[10px] text-slate-800 dark:text-slate-200">ACCEL</div>
              <div className={`font-bold ${hardware.webgpuSupported ? 'text-emerald-500' : 'text-sky-500'}`}>
                {hardware.webgpuSupported ? 'WebGPU' : 'WASM'}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Primary View Switcher: Model Catalog vs Dedicated Local Chat */}
      <div className="flex flex-wrap items-center gap-3 border-b border-slate-200 dark:border-slate-800 pb-4">
        <button
          type="button"
          onClick={() => switchTab('catalog')}
          className={`px-5 py-2.5 rounded-xl text-sm font-semibold inline-flex items-center gap-2 transition ${
            activeTab === 'catalog'
              ? 'bg-sky-500 text-slate-950 shadow-sm'
              : 'glass-panel text-slate-950 dark:text-slate-100 hover:border-sky-500/50'
          }`}
        >
          <Download className="w-4 h-4" /> Model Weights &amp; Downloads ({NOVALIS_MODELS.length})
        </button>
        <button
          type="button"
          onClick={() => switchTab('chat')}
          className={`px-5 py-2.5 rounded-xl text-sm font-semibold inline-flex items-center gap-2 transition ${
            activeTab === 'chat'
              ? 'bg-emerald-500 text-slate-950 shadow-sm'
              : 'glass-panel text-slate-950 dark:text-slate-100 hover:border-emerald-500/50'
          }`}
        >
          <MessageSquare className="w-4 h-4" /> Local In-Browser AI Chat Studio
          <span className="px-1.5 py-0.5 rounded text-[10px] font-mono bg-black/15">LIVE</span>
        </button>
      </div>

      {/* Content */}
      {activeTab === 'chat' ? (
        <LocalAiChat hardware={hardware} initialModelId={chatModelId} />
      ) : (
        <div className="grid grid-cols-1 gap-6">
          {NOVALIS_MODELS.map((model) => {
            const activeVarId = selectedVariantMap[model.id] || model.variants[0].id;
            const activeVar = model.variants.find((v) => v.id === activeVarId) || model.variants[0];
            const fit = evaluateHardwareFit(hardware, activeVar);
            const activeCmdTab = cmdTabMap[model.id] || 'ollama';
            const cmdText = model.runCommands[activeCmdTab];

            const fitTone =
              fit.tone === 'emerald'
                ? 'bg-emerald-500/15 text-emerald-800 dark:text-emerald-300 border-emerald-500/30'
                : fit.tone === 'cyan'
                ? 'bg-sky-500/15 text-sky-800 dark:text-sky-300 border-sky-500/30'
                : 'bg-amber-500/15 text-amber-600 dark:text-amber-300 border-amber-500/30';

            return (
              <div key={model.id} className="rounded-2xl glass-panel p-6 sm:p-8 space-y-6">
                <div className="flex flex-col lg:flex-row lg:items-start justify-between gap-4">
                  <div className="space-y-2 max-w-3xl">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="px-2.5 py-0.5 rounded-full text-[11px] font-mono bg-indigo-500/15 text-indigo-800 dark:text-indigo-300 border border-indigo-500/30">
                        {model.parameters} PARAMS
                      </span>
                      <span className="px-2.5 py-0.5 rounded-full text-[11px] font-mono bg-slate-100 dark:bg-slate-900 text-slate-900 dark:text-slate-100 border border-slate-200 dark:border-slate-800">
                        {model.contextLength} CTX · {model.license}
                      </span>
                      <span className={`px-2.5 py-0.5 rounded-full text-[11px] font-mono border ${fitTone}`}>
                        {fit.label}
                      </span>
                    </div>
                    <h2 className="font-display font-bold text-2xl text-black dark:text-white">{model.name}</h2>
                    <p className="text-sm text-slate-900 dark:text-slate-100 leading-relaxed">{model.description}</p>
                  </div>

                  {model.browserRunnable && (
                    <button
                      type="button"
                      onClick={() => switchTab('chat', model.id)}
                      className="px-4 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-semibold text-xs inline-flex items-center gap-1.5 shadow-sm shrink-0 transition"
                    >
                      <Zap className="w-4 h-4" /> Load &amp; Chat on My PC
                    </button>
                  )}
                </div>

                {/* Benchmarks */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  {model.benchmarks.map((b) => (
                    <div
                      key={b.metric}
                      className="px-4 py-3 rounded-xl bg-slate-100/80 dark:bg-slate-900/70 border border-slate-200 dark:border-slate-800"
                    >
                      <div className="font-mono text-[10px] text-slate-800 dark:text-slate-200 uppercase">{b.metric}</div>
                      <div className="font-mono font-bold text-sm text-black dark:text-white mt-0.5">{b.score}</div>
                    </div>
                  ))}
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 pt-2 border-t border-slate-200 dark:border-slate-800/80">
                  {/* Quantization Selector & Direct Download */}
                  <div className="lg:col-span-6 space-y-3">
                    <div className="font-mono text-xs font-semibold uppercase tracking-wider text-slate-800 dark:text-slate-200">
                      Select Quantization / Format
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {model.variants.map((v) => (
                        <button
                          key={v.id}
                          type="button"
                          onClick={() => setSelectedVariantMap((prev) => ({ ...prev, [model.id]: v.id }))}
                          className={`px-3 py-1.5 rounded-lg text-xs font-mono transition border ${
                            activeVar.id === v.id
                              ? 'bg-sky-500/15 text-sky-800 dark:text-sky-300 border-sky-500/50 font-semibold'
                              : 'bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-slate-100 border-slate-200 dark:border-slate-800'
                          }`}
                        >
                          {v.format} · {v.quantization} ({v.sizeLabel})
                        </button>
                      ))}
                    </div>

                    <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-900/70 border border-slate-200 dark:border-slate-800 space-y-2 text-xs">
                      <div className="text-slate-900 dark:text-slate-100">{fit.detail}</div>
                      <div className="font-mono text-[11px] text-slate-800 dark:text-slate-200">
                        Min RAM: {activeVar.minRamGb} GB · Rec VRAM: {activeVar.recommendedVramGb} GB · {activeVar.sha256}
                      </div>
                      <a
                        href={activeVar.downloadUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="mt-2 w-full py-2.5 px-4 rounded-lg bg-sky-500 hover:bg-sky-400 text-slate-950 font-semibold text-xs inline-flex items-center justify-center gap-1.5 transition"
                      >
                        <Download className="w-3.5 h-3.5" /> Direct Download ({activeVar.format} · {activeVar.sizeLabel})
                        <ExternalLink className="w-3 h-3" />
                      </a>
                    </div>
                  </div>

                  {/* Quick Local Run Snippets */}
                  <div className="lg:col-span-6 space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="font-mono text-xs font-semibold uppercase tracking-wider text-slate-800 dark:text-slate-200 inline-flex items-center gap-1.5">
                        <Terminal className="w-3.5 h-3.5 text-sky-500" /> Run Locally on Your PC
                      </span>
                      <div className="flex items-center gap-1">
                        {(['ollama', 'llamacpp', 'python'] as const).map((t) => (
                          <button
                            key={t}
                            type="button"
                            onClick={() => setCmdTabMap((prev) => ({ ...prev, [model.id]: t }))}
                            className={`px-2 py-0.5 rounded text-[11px] font-mono ${
                              activeCmdTab === t
                                ? 'bg-slate-900 dark:bg-sky-500/20 text-white dark:text-sky-300'
                                : 'text-slate-800 dark:text-slate-200 hover:text-slate-800 dark:hover:text-slate-200'
                            }`}
                          >
                            {t}
                          </button>
                        ))}
                      </div>
                    </div>

                    <div className="relative rounded-xl bg-[#050914] border border-slate-800 p-4 font-mono text-xs text-sky-300 overflow-x-auto">
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
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

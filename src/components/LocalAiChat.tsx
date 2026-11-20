import { useEffect, useMemo, useRef, useState } from 'react';
import {
  Bot,
  Cpu,
  Download,
  Loader2,
  Send,
  ShieldCheck,
  Sliders,
  Sparkles,
  Trash2,
  User,
  Zap,
  FileDown,
} from 'lucide-react';
import { NOVALIS_MODELS } from '../data/catalog';
import type { DetectedHardware, NovalisModel } from '../types/novalis';

interface LocalAiChatProps {
  hardware: DetectedHardware;
  initialModelId?: string;
}

interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  meta?: string;
}

type GeneratorFn = (
  input: Array<{ role: string; content: string }>,
  opts: Record<string, unknown>
) => Promise<Array<{ generated_text?: Array<{ role: string; content: string }> | string }>>;

const STARTER_PROMPTS = [
  'Summarize how NOVALIS runs AI models locally on a user PC with zero server cost.',
  'Design a clean architecture for a cross-platform Windows & Android telemetry app.',
  'Explain what makes a quantitative market intelligence signal reliable vs noisy.',
];

export function LocalAiChat({ hardware, initialModelId }: LocalAiChatProps) {
  const browserModels = useMemo(() => NOVALIS_MODELS.filter((m) => m.browserRunnable), []);
  const [selectedId, setSelectedId] = useState<string>(
    initialModelId && browserModels.some((m) => m.id === initialModelId)
      ? initialModelId
      : browserModels[0]?.id || ''
  );

  const selectedModel: NovalisModel | undefined = useMemo(
    () => browserModels.find((m) => m.id === selectedId) || browserModels[0],
    [browserModels, selectedId]
  );

  const [engineState, setEngineState] = useState<'idle' | 'loading' | 'ready' | 'error'>('idle');
  const [loadedModelId, setLoadedModelId] = useState<string | null>(null);
  const [activeDevice, setActiveDevice] = useState<'webgpu' | 'wasm'>('wasm');
  const [progressPct, setProgressPct] = useState<number>(0);
  const [progressStatus, setProgressStatus] = useState<string>('');
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const [systemPrompt, setSystemPrompt] = useState<string>(
    'You are NOVALIS Local AI, a concise, accurate engineering and applied intelligence assistant running locally on the user device.'
  );
  const [maxTokens, setMaxTokens] = useState<number>(180);
  const [temperature, setTemperature] = useState<number>(0.4);
  const [showSettings, setShowSettings] = useState<boolean>(false);

  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'welcome',
      role: 'assistant',
      content:
        'Welcome to **NOVALIS Neural Chat Studio**.\n\nClick **"Download & Load Model on My PC"** above to pull quantized ONNX weights directly into your browser cache (100% local execution on your CPU/WebGPU, zero server cost). Once loaded, every prompt executes privately on your machine.',
      meta: 'LOCAL-FIRST RUNTIME · $0 SERVER COST',
    },
  ]);
  const [draft, setDraft] = useState<string>('');
  const [generating, setGenerating] = useState<boolean>(false);

  const generatorRef = useRef<GeneratorFn | null>(null);
  const endRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (initialModelId && browserModels.some((m) => m.id === initialModelId)) {
      setSelectedId(initialModelId);
    }
  }, [initialModelId, browserModels]);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, generating]);

  const handleLoadModel = async () => {
    if (!selectedModel?.hfBrowserModelId) return;
    setEngineState('loading');
    setErrorMsg(null);
    setProgressPct(2);
    setProgressStatus('Initializing Transformers.js WebGPU / WASM runtime...');

    try {
      // Dynamic CDN ESM import keeps the initial GitHub Pages bundle ultra-lightweight
      const cdnUrl = 'https://cdn.jsdelivr.net/npm/@huggingface/transformers@3.4.0';
      const transformers = (await import(/* @vite-ignore */ cdnUrl)) as {
        pipeline: (
          task: string,
          model: string,
          options: Record<string, unknown>
        ) => Promise<GeneratorFn>;
        env?: { allowLocalModels?: boolean; useBrowserCache?: boolean };
      };

      if (transformers.env) {
        transformers.env.allowLocalModels = false;
        transformers.env.useBrowserCache = true;
      }

      const preferredDevice: 'webgpu' | 'wasm' = hardware.webgpuSupported ? 'webgpu' : 'wasm';
      const onProgress = (info: { status?: string; file?: string; progress?: number }) => {
        if (typeof info.progress === 'number') {
          setProgressPct(Math.max(3, Math.min(99, Math.round(info.progress))));
        }
        if (info.file) {
          setProgressStatus(`Caching on your PC: ${info.file}`);
        } else if (info.status) {
          setProgressStatus(info.status);
        }
      };

      let pipe: GeneratorFn;
      try {
        pipe = await transformers.pipeline('text-generation', selectedModel.hfBrowserModelId, {
          device: preferredDevice,
          dtype: preferredDevice === 'webgpu' ? 'q4f16' : 'q4',
          progress_callback: onProgress,
        });
        setActiveDevice(preferredDevice);
      } catch {
        // Automatic fallback to WASM CPU if WebGPU shader compilation fails on an older GPU
        setProgressStatus('Switching to WebAssembly CPU backend for maximum compatibility...');
        pipe = await transformers.pipeline('text-generation', selectedModel.hfBrowserModelId, {
          device: 'wasm',
          dtype: 'q4',
          progress_callback: onProgress,
        });
        setActiveDevice('wasm');
      }

      generatorRef.current = pipe;
      setLoadedModelId(selectedModel.id);
      setProgressPct(100);
      setProgressStatus(`Ready locally on your ${preferredDevice.toUpperCase()} runtime.`);
      setEngineState('ready');
      setMessages((prev) => [
        ...prev,
        {
          id: `loaded-${Date.now()}`,
          role: 'assistant',
          content: `**${selectedModel.name}** is now loaded and cached locally on your PC! Ask anything — inference runs 100% inside your browser tab.`,
          meta: `LOADED · ${selectedModel.parameters} · LOCAL CACHE`,
        },
      ]);
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Failed to initialize local model runtime.';
      setErrorMsg(msg);
      setEngineState('error');
    }
  };

  const handleSend = async (overrideText?: string) => {
    const prompt = (overrideText ?? draft).trim();
    if (!prompt || generating) return;

    const userMsg: ChatMessage = {
      id: `u-${Date.now()}`,
      role: 'user',
      content: prompt,
    };
    setMessages((prev) => [...prev, userMsg]);
    setDraft('');

    // If real weights aren't downloaded yet, give a clear, helpful local preview response
    if (engineState !== 'ready' || !generatorRef.current || loadedModelId !== selectedModel?.id) {
      setGenerating(true);
      await new Promise((r) => setTimeout(r, 380));
      setMessages((prev) => [
        ...prev,
        {
          id: `sim-${Date.now()}`,
          role: 'assistant',
          content:
            `Model weights are not downloaded to your browser cache yet.\n\nClick **"Download & Load Model on My PC"** above to fetch **${selectedModel?.name}** (~${selectedModel?.approxBrowserDownloadMb} MB) directly from Hugging Face onto your device and run genuine local inference for:\n> "${prompt}"`,
          meta: 'STANDBY · CLICK LOAD TO RUN LOCALLY',
        },
      ]);
      setGenerating(false);
      return;
    }

    setGenerating(true);
    const t0 = performance.now();
    try {
      const convo = [
        { role: 'system', content: systemPrompt },
        ...messages
          .filter((m) => m.id !== 'welcome' && !m.id.startsWith('loaded-') && !m.id.startsWith('sim-'))
          .slice(-6)
          .map((m) => ({ role: m.role, content: m.content })),
        { role: 'user', content: prompt },
      ];

      const result = await generatorRef.current(convo, {
        max_new_tokens: maxTokens,
        temperature: Math.max(0.05, temperature),
        do_sample: temperature > 0.1,
      });

      const elapsedSec = Math.max((performance.now() - t0) / 1000, 0.05);
      const gen = result?.[0]?.generated_text;
      let replyText = '';
      if (Array.isArray(gen) && gen.length > 0) {
        replyText = gen[gen.length - 1]?.content || '';
      } else if (typeof gen === 'string') {
        replyText = gen;
      }
      if (!replyText.trim()) {
        replyText = 'Model returned an empty response. Try increasing Max Tokens or rephrasing.';
      }
      const approxTokens = Math.max(1, Math.round(replyText.split(/\s+/).length * 1.3));
      const tokPerSec = (approxTokens / elapsedSec).toFixed(1);

      setMessages((prev) => [
        ...prev,
        {
          id: `a-${Date.now()}`,
          role: 'assistant',
          content: replyText.trim(),
          meta: `${selectedModel?.name} · ${activeDevice.toUpperCase()} · ~${tokPerSec} tok/s · ${elapsedSec.toFixed(1)}s`,
        },
      ]);
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Inference error';
      setMessages((prev) => [
        ...prev,
        {
          id: `err-${Date.now()}`,
          role: 'assistant',
          content: `Local inference encountered an error: ${msg}`,
          meta: 'LOCAL RUNTIME ERROR',
        },
      ]);
    } finally {
      setGenerating(false);
    }
  };

  const exportTranscript = () => {
    const md = messages
      .map((m) => `### ${m.role === 'user' ? 'User' : 'NOVALIS AI'}\n\n${m.content}\n`)
      .join('\n---\n\n');
    const blob = new Blob([md], { type: 'text/markdown;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `novalis-chat-${Date.now()}.md`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const isSelectedLoaded = engineState === 'ready' && loadedModelId === selectedModel?.id;

  return (
    <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#080E1C] overflow-hidden shadow-xl">
      {/* Studio Control Header */}
      <div className="p-4 sm:p-5 border-b border-slate-200 dark:border-slate-800 bg-slate-50/90 dark:bg-[#050914] flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div className="flex flex-wrap items-center gap-3">
          <div className="p-2 rounded-xl bg-sky-500/15 text-sky-500 border border-sky-500/30">
            <Bot className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="font-display font-bold text-base text-black dark:text-white">
                NOVALIS Local Neural Chat
              </h3>
              <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-emerald-500/15 text-emerald-800 dark:text-emerald-300 border border-emerald-500/30">
                100% ON YOUR PC
              </span>
            </div>
            <p className="text-xs text-slate-800 dark:text-slate-200">
              Downloads ONNX weights directly into your browser cache — zero backend cost, zero data sent to servers.
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <select
            value={selectedId}
            onChange={(e) => setSelectedId(e.target.value)}
            disabled={engineState === 'loading'}
            className="px-3 py-2 rounded-lg text-xs font-mono bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 text-black dark:text-white focus:outline-none focus:border-sky-500"
          >
            {browserModels.map((m) => (
              <option key={m.id} value={m.id}>
                {m.name} (~{m.approxBrowserDownloadMb} MB)
              </option>
            ))}
          </select>

          <button
            type="button"
            onClick={handleLoadModel}
            disabled={engineState === 'loading' || isSelectedLoaded}
            className={`px-4 py-2 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition ${
              isSelectedLoaded
                ? 'bg-emerald-500/15 text-emerald-800 dark:text-emerald-300 border border-emerald-500/30 cursor-default'
                : 'bg-sky-500 hover:bg-sky-400 text-slate-950 shadow-sm disabled:opacity-60'
            }`}
          >
            {engineState === 'loading' ? (
              <>
                <Loader2 className="w-3.5 h-3.5 animate-spin" /> Downloading ({progressPct}%)
              </>
            ) : isSelectedLoaded ? (
              <>
                <Zap className="w-3.5 h-3.5" /> Loaded ({activeDevice.toUpperCase()})
              </>
            ) : (
              <>
                <Download className="w-3.5 h-3.5" /> Download &amp; Load Model on My PC
              </>
            )}
          </button>

          <button
            type="button"
            onClick={() => setShowSettings((v) => !v)}
            className="p-2 rounded-lg bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-slate-100 hover:border-sky-500"
            title="Inference parameters"
          >
            <Sliders className="w-4 h-4" />
          </button>
          <button
            type="button"
            onClick={exportTranscript}
            className="p-2 rounded-lg bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-slate-100 hover:border-sky-500"
            title="Export chat as Markdown"
          >
            <FileDown className="w-4 h-4" />
          </button>
          <button
            type="button"
            onClick={() => setMessages(messages.slice(0, 1))}
            className="p-2 rounded-lg bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-slate-100 hover:border-rose-500 hover:text-rose-400"
            title="Clear chat"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Progress / Error Banner */}
      {engineState === 'loading' && (
        <div className="px-5 py-3 bg-sky-500/10 border-b border-sky-500/20">
          <div className="flex items-center justify-between text-xs font-mono text-sky-700 dark:text-sky-300 mb-1.5">
            <span className="truncate">{progressStatus}</span>
            <span>{progressPct}%</span>
          </div>
          <div className="h-1.5 rounded-full bg-slate-200 dark:bg-slate-800 overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-sky-400 to-indigo-400 transition-all duration-300"
              style={{ width: `${progressPct}%` }}
            />
          </div>
        </div>
      )}

      {errorMsg && (
        <div className="px-5 py-2.5 bg-rose-500/10 border-b border-rose-500/20 text-xs font-mono text-rose-600 dark:text-rose-300">
          Runtime notice: {errorMsg} — Check browser WebGPU/WASM permissions or network access to Hugging Face Hub.
        </div>
      )}

      {/* Collapsible Inference Settings */}
      {showSettings && (
        <div className="p-4 border-b border-slate-200 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-900/50 grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
          <div className="md:col-span-1 space-y-1">
            <label className="font-mono text-slate-800 dark:text-slate-200 block">Temperature: {temperature.toFixed(2)}</label>
            <input
              type="range"
              min="0.1"
              max="1.2"
              step="0.05"
              value={temperature}
              onChange={(e) => setTemperature(parseFloat(e.target.value))}
              className="w-full accent-sky-500"
            />
            <label className="font-mono text-slate-800 dark:text-slate-200 block pt-1">Max New Tokens: {maxTokens}</label>
            <input
              type="range"
              min="64"
              max="512"
              step="32"
              value={maxTokens}
              onChange={(e) => setMaxTokens(parseInt(e.target.value, 10))}
              className="w-full accent-sky-500"
            />
          </div>
          <div className="md:col-span-2 space-y-1">
            <label className="font-mono text-slate-800 dark:text-slate-200 block">System Prompt</label>
            <textarea
              rows={3}
              value={systemPrompt}
              onChange={(e) => setSystemPrompt(e.target.value)}
              className="w-full p-2.5 rounded-lg bg-white dark:bg-[#050914] border border-slate-300 dark:border-slate-700 text-black dark:text-white font-mono text-xs focus:outline-none focus:border-sky-500"
            />
          </div>
        </div>
      )}

      {/* Message Stream */}
      <div className="h-[420px] overflow-y-auto p-4 sm:p-6 space-y-4">
        {messages.map((m) => (
          <div key={m.id} className={`flex gap-3 ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
            {m.role === 'assistant' && (
              <div className="w-8 h-8 rounded-lg bg-sky-500/15 border border-sky-500/30 flex items-center justify-center shrink-0 mt-0.5 text-sky-500">
                <Sparkles className="w-4 h-4" />
              </div>
            )}
            <div
              className={`max-w-[85%] rounded-2xl px-4 py-3 text-sm leading-relaxed ${
                m.role === 'user'
                  ? 'bg-sky-500 text-slate-950 font-medium'
                  : 'bg-slate-100 dark:bg-slate-900/90 border border-slate-200 dark:border-slate-800 text-black dark:text-white'
              }`}
            >
              <div className="whitespace-pre-wrap">{m.content}</div>
              {m.meta && (
                <div className="mt-2 pt-1.5 border-t border-slate-200/70 dark:border-slate-800 text-[10px] font-mono text-slate-800 dark:text-slate-200">
                  {m.meta}
                </div>
              )}
            </div>
            {m.role === 'user' && (
              <div className="w-8 h-8 rounded-lg bg-indigo-500/15 border border-indigo-500/30 flex items-center justify-center shrink-0 mt-0.5 text-indigo-400">
                <User className="w-4 h-4" />
              </div>
            )}
          </div>
        ))}

        {generating && (
          <div className="flex items-center gap-2 text-xs font-mono text-sky-500 pl-11">
            <Loader2 className="w-3.5 h-3.5 animate-spin" /> Generating locally on your device...
          </div>
        )}
        <div ref={endRef} />
      </div>

      {/* Starter Prompts & Input Bar */}
      <div className="p-4 border-t border-slate-200 dark:border-slate-800 bg-slate-50/70 dark:bg-[#050914] space-y-3">
        <div className="flex flex-wrap gap-2">
          {STARTER_PROMPTS.map((sp) => (
            <button
              key={sp}
              type="button"
              onClick={() => handleSend(sp)}
              className="px-2.5 py-1 rounded-md text-[11px] bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-slate-100 hover:border-sky-500/50 hover:text-sky-500 transition text-left"
            >
              {sp}
            </button>
          ))}
        </div>

        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSend();
          }}
          className="flex items-center gap-2"
        >
          <input
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            placeholder={
              isSelectedLoaded
                ? `Message ${selectedModel?.name} (running locally on your PC)...`
                : 'Type a message or click "Download & Load Model on My PC" to run real local AI...'
            }
            className="flex-1 px-4 py-3 rounded-xl bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 text-sm text-black dark:text-white placeholder-slate-400 dark:placeholder-slate-300 focus:outline-none focus:border-sky-500"
          />
          <button
            type="submit"
            disabled={generating || !draft.trim()}
            className="px-4 py-3 rounded-xl bg-sky-500 hover:bg-sky-400 disabled:opacity-50 text-slate-950 font-semibold text-sm flex items-center gap-1.5 transition"
          >
            <Send className="w-4 h-4" />
            <span className="hidden sm:inline">Send</span>
          </button>
        </form>

        <div className="flex flex-wrap items-center justify-between gap-2 text-[11px] font-mono text-slate-800 dark:text-slate-200">
          <span className="inline-flex items-center gap-1.5">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" />
            Zero API Keys · Zero Cloud Logging · Runs on Client Hardware
          </span>
          <span className="inline-flex items-center gap-1.5">
            <Cpu className="w-3.5 h-3.5 text-sky-500" />
            Detected: {hardware.cpuCores} Threads · {hardware.webgpuSupported ? 'WebGPU Ready' : 'WASM CPU Mode'}
          </span>
        </div>
      </div>
    </div>
  );
}

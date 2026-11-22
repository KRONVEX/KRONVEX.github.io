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
import { KRONVEX_MODELS } from '../data/catalog';
import type { DetectedHardware, KronvexModel } from '../types/kronvex';

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
  'Summarize how KRONVEX runs AI models locally on a user PC with zero server cost.',
  'Design a clean architecture for a cross-platform Windows & Android telemetry app.',
  'Explain what makes a quantitative market intelligence signal reliable vs noisy.',
];

function renderFormattedText(text: string) {
  const tokens = text.split(/(\*\*[^*]+\*\*|`[^`]+`)/g);
  return tokens.map((tok, i) => {
    if (tok.startsWith('**') && tok.endsWith('**') && tok.length > 4) {
      return (
        <strong key={i} className="font-semibold">
          {tok.slice(2, -2)}
        </strong>
      );
    }
    if (tok.startsWith('`') && tok.endsWith('`') && tok.length > 2) {
      return (
        <code
          key={i}
          className="px-1 py-0.5 rounded bg-slate-200/90 dark:bg-slate-800 font-mono text-[12px]"
        >
          {tok.slice(1, -1)}
        </code>
      );
    }
    return <span key={i}>{tok}</span>;
  });
}

export function LocalAiChat({ hardware, initialModelId }: LocalAiChatProps) {
  const browserModels = useMemo(() => KRONVEX_MODELS.filter((m) => m.browserRunnable), []);
  const [selectedId, setSelectedId] = useState<string>(
    initialModelId && browserModels.some((m) => m.id === initialModelId)
      ? initialModelId
      : browserModels[0]?.id || ''
  );

  const selectedModel: KronvexModel | undefined = useMemo(
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
    'You are KRONVEX Local AI, a concise, accurate engineering and applied intelligence assistant running locally on the user device.'
  );
  const [maxTokens, setMaxTokens] = useState<number>(180);
  const [temperature, setTemperature] = useState<number>(0.4);
  const [showSettings, setShowSettings] = useState<boolean>(false);

  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'welcome',
      role: 'assistant',
      content:
        'Welcome to **KRONVEX Neural Chat Studio**.\n\nClick **"Download & Load Model on My PC"** above to pull quantized ONNX weights directly into your browser cache (100% local execution on your CPU/WebGPU, zero server cost). Once loaded, every prompt executes privately on your machine.',
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
      .map((m) => `### ${m.role === 'user' ? 'User' : 'KRONVEX AI'}\n\n${m.content}\n`)
      .join('\n---\n\n');
    const blob = new Blob([md], { type: 'text/markdown;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `kronvex-chat-${Date.now()}.md`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const isSelectedLoaded = engineState === 'ready' && loadedModelId === selectedModel?.id;

  return (
    <div className="space-y-6">
      {/* Open Studio Control Header (Zero Outer Box Frame) */}
      <div className="pb-5 border-b border-slate-300/80 dark:border-slate-800 flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div className="flex items-start gap-3">
          <Bot className="w-5 h-5 text-sky-500 shrink-0 mt-0.5" />
          <div className="min-w-0 space-y-1">
            <div className="flex flex-wrap items-center gap-2.5">
              <h3 className="font-display font-bold text-lg text-black dark:text-white">
                KRONVEX Local Neural Chat
              </h3>
              <span className="font-mono text-[11px] font-bold text-emerald-600 dark:text-emerald-400">
                ● 100% ON YOUR PC
              </span>
            </div>
            <p className="text-xs sm:text-sm text-slate-900 dark:text-white">
              Downloads ONNX weights directly into your browser cache — zero backend cost, zero data sent to servers.
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <select
            value={selectedId}
            onChange={(e) => setSelectedId(e.target.value)}
            disabled={engineState === 'loading'}
            className="max-w-full min-w-0 px-3.5 py-2 rounded-full text-xs font-mono bg-white/80 dark:bg-slate-900/80 border border-slate-300 dark:border-slate-700 text-black dark:text-white focus:outline-none focus:border-sky-500"
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
            className={`px-4 py-2 rounded-full text-xs font-bold flex items-center gap-1.5 transition ${
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
            className="p-2 rounded-full text-slate-900 dark:text-white hover:text-sky-500 hover:bg-slate-200/60 dark:hover:bg-slate-800/70 transition"
            title="Inference parameters"
            aria-label="Inference parameters"
          >
            <Sliders className="w-4 h-4" />
          </button>
          <button
            type="button"
            onClick={exportTranscript}
            className="p-2 rounded-full text-slate-900 dark:text-white hover:text-sky-500 hover:bg-slate-200/60 dark:hover:bg-slate-800/70 transition"
            title="Export chat as Markdown"
            aria-label="Export chat as Markdown"
          >
            <FileDown className="w-4 h-4" />
          </button>
          <button
            type="button"
            onClick={() => setMessages(messages.slice(0, 1))}
            className="p-2 rounded-full text-slate-900 dark:text-white hover:text-rose-500 hover:bg-slate-200/60 dark:hover:bg-slate-800/70 transition"
            title="Clear chat"
            aria-label="Clear chat"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Progress / Error Banner */}
      {engineState === 'loading' && (
        <div className="pb-4 border-b border-sky-500/30">
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
        <div className="pb-3 border-b border-rose-500/30 text-xs font-mono text-rose-600 dark:text-rose-300">
          Runtime notice: {errorMsg} — Check browser WebGPU/WASM permissions or network access to Hugging Face Hub.
        </div>
      )}

      {/* Collapsible Inference Settings — Open Row */}
      {showSettings && (
        <div className="pb-5 border-b border-slate-300/80 dark:border-slate-800 grid grid-cols-1 md:grid-cols-3 gap-6 text-xs">
          <div className="md:col-span-1 space-y-2">
            <label className="font-mono font-semibold text-black dark:text-white block">
              Temperature: {temperature.toFixed(2)}
            </label>
            <input
              type="range"
              min="0.1"
              max="1.2"
              step="0.05"
              value={temperature}
              onChange={(e) => setTemperature(parseFloat(e.target.value))}
              className="w-full accent-sky-500"
            />
            <label className="font-mono font-semibold text-black dark:text-white block pt-1">
              Max New Tokens: {maxTokens}
            </label>
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
          <div className="md:col-span-2 space-y-1.5">
            <label className="font-mono font-semibold text-black dark:text-white block">System Prompt</label>
            <textarea
              rows={3}
              value={systemPrompt}
              onChange={(e) => setSystemPrompt(e.target.value)}
              className="w-full p-3 rounded-xl bg-white/80 dark:bg-slate-900/70 border border-slate-300 dark:border-slate-700 text-black dark:text-white font-mono text-xs focus:outline-none focus:border-sky-500"
            />
          </div>
        </div>
      )}

      {/* Open Borderless Conversation Stream (Claude / Antigravity Editorial Chat Style) */}
      <div className="min-h-[340px] max-h-[500px] overflow-y-auto space-y-7 py-2 pe-1">
        {messages.map((m) => (
          <div key={m.id} className={`flex items-start gap-3.5 ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
            {m.role === 'assistant' && <Sparkles className="w-4 h-4 text-sky-500 shrink-0 mt-1" />}
            <div
              className={`max-w-3xl text-sm sm:text-[15px] leading-relaxed ${
                m.role === 'user'
                  ? 'rounded-3xl px-5 py-3 bg-sky-500 text-slate-950 font-semibold'
                  : 'text-black dark:text-white'
              }`}
            >
              <div className="whitespace-pre-wrap break-words">{renderFormattedText(m.content)}</div>
              {m.meta && (
                <div className="mt-2.5 text-[11px] font-mono text-slate-800 dark:text-slate-100">{m.meta}</div>
              )}
            </div>
            {m.role === 'user' && <User className="w-4 h-4 text-indigo-500 shrink-0 mt-3" />}
          </div>
        ))}

        {generating && (
          <div className="flex items-center gap-2 text-xs font-mono text-sky-500 ps-7">
            <Loader2 className="w-3.5 h-3.5 animate-spin" /> Generating locally on your device...
          </div>
        )}
        <div ref={endRef} />
      </div>

      {/* Open Starter Prompts & Floating Pill Composer Bar */}
      <div className="pt-5 border-t border-slate-300/80 dark:border-slate-800 space-y-4">
        <div className="flex flex-wrap gap-x-6 gap-y-2">
          {STARTER_PROMPTS.map((sp) => (
            <button
              key={sp}
              type="button"
              onClick={() => handleSend(sp)}
              className="text-xs text-slate-900 dark:text-white hover:text-sky-600 dark:hover:text-sky-400 transition text-start inline-flex items-center gap-1.5"
            >
              <span className="text-sky-500 font-bold">→</span>
              <span>{sp}</span>
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
            className="flex-1 px-5 py-3 rounded-full bg-white/85 dark:bg-slate-900/80 border border-slate-300 dark:border-slate-700 text-sm text-black dark:text-white placeholder-slate-600 dark:placeholder-slate-200 focus:outline-none focus:border-sky-500"
          />
          <button
            type="submit"
            disabled={generating || !draft.trim()}
            className="px-5 py-3 rounded-full bg-sky-500 hover:bg-sky-400 disabled:opacity-50 text-slate-950 font-bold text-sm flex items-center gap-1.5 transition"
          >
            <Send className="w-4 h-4" />
            <span className="hidden sm:inline">Send</span>
          </button>
        </form>

        <div className="flex flex-wrap items-center justify-between gap-2 text-[11px] font-mono text-slate-900 dark:text-white">
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

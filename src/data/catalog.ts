import type { NovalisApp, NovalisModel, NovalisSkill, RoadmapPhase } from '../types/novalis';

export const ORG_META = {
  name: 'NOVALIS',
  handle: 'N-O-V-A-L-I-S',
  tagline: 'Building cross-platform apps, market intelligence, and mission-critical AI to solve complex real-world problems.',
  githubUrl: 'https://github.com/N-O-V-A-L-I-S',
  orgProfileRepoUrl: 'https://github.com/N-O-V-A-L-I-S/.github',
  founderName: 'Khalid Naami',
  founderGithub: 'https://github.com/khalid-naami',
  founderSite: 'https://khalidnaami.com',
  contactEmail: '', // Add dedicated organization email here once configured
  twitterUrl: 'https://twitter.com/khalidnaami0',
};

export const NOVALIS_PILLARS = [
  {
    id: 'pillar-apps',
    code: '01',
    title: 'Cross-Platform Apps',
    subtitle: 'Web · Windows · Android · Edge',
    description:
      'High-throughput native and web applications engineered on shared type-safe cores with zero-bloat performance across desktop and mobile.',
    stack: ['TypeScript', 'React', 'Flutter', 'Rust'],
    accent: 'cyan' as const,
    route: '/apps',
  },
  {
    id: 'pillar-intel',
    code: '02',
    title: 'Market Intelligence',
    subtitle: 'Quant Pipelines · Macro Signals · Risk',
    description:
      'Real-time quantitative analytics, options flow telemetry, volatility surfaces, and geopolitical macro feeds engineered to distill noise into signal.',
    stack: ['Python', 'FastAPI', 'PostgreSQL', 'WebSockets'],
    accent: 'emerald' as const,
    route: '/constellation',
  },
  {
    id: 'pillar-ai',
    code: '03',
    title: 'Mission-Critical AI',
    subtitle: 'Local-First Models · Verified Agents · Skills',
    description:
      'Specialized neural models, deterministic agent workflows, and reusable AI skills built for verifiable reliability — running locally or in production.',
    stack: ['PyTorch', 'ONNX / WebGPU', 'GGUF', 'Agent Skills'],
    accent: 'violet' as const,
    route: '/models',
  },
];

export const NOVALIS_APPS: NovalisApp[] = [
  {
    id: 'novalis-pulse-desktop',
    name: 'Novalis Pulse Desktop',
    tagline: 'Native Windows & cross-platform command cockpit for real-time market intelligence and local AI workflows.',
    description:
      'Built for speed and reliability on Windows 10/11. Combines live macro telemetry, multi-source watchlist alerts, and direct integration with local GGUF/ONNX AI models without cloud lock-in.',
    pillar: 'Market Intelligence',
    platforms: ['windows', 'cross-platform'],
    version: 'v0.9.0-rc1',
    status: 'early-access',
    releaseDate: 'Q1 2027 Target',
    license: 'Apache-2.0',
    repoUrl: 'https://github.com/N-O-V-A-L-I-S',
    features: [
      'Low-latency market & macro telemetry dashboard',
      'Built-in local LLM sidecar connector (Ollama & llama.cpp)',
      'Offline-first encrypted SQLite cache & zero telemetry',
      'Native Windows installer (.exe) and zero-install portable (.zip)',
    ],
    requirements: {
      windows: 'Windows 10/11 (64-bit) · 4 GB RAM minimum · 150 MB disk',
    },
    artifacts: [
      {
        label: 'Windows Setup Installer',
        platform: 'windows',
        format: '.EXE',
        arch: 'x64',
        size: '~48 MB',
        sha256: 'Published automatically on v1.0 GitHub Release',
        downloadUrl: 'https://github.com/N-O-V-A-L-I-S',
      },
      {
        label: 'Windows Portable Archive',
        platform: 'windows',
        format: '.ZIP',
        arch: 'x64 / ARM64',
        size: '~42 MB',
        sha256: 'Published automatically on v1.0 GitHub Release',
        downloadUrl: 'https://github.com/N-O-V-A-L-I-S',
      },
    ],
    accent: 'cyan',
  },
  {
    id: 'novalis-sentinel-android',
    name: 'Novalis Sentinel Mobile',
    tagline: 'Lightweight Android companion for real-time alerts, intelligence briefings, and on-device edge AI.',
    description:
      'A sleek Flutter-powered Android application delivering instant market signal notifications, encrypted personal notes, and offline-capable compact AI utilities.',
    pillar: 'Cross-Platform Apps',
    platforms: ['android', 'cross-platform'],
    version: 'v0.8.0-beta',
    status: 'beta',
    releaseDate: 'Q1 2027 Target',
    license: 'Apache-2.0',
    repoUrl: 'https://github.com/N-O-V-A-L-I-S',
    features: [
      'Signed universal & arm64-v8a Android APK builds',
      'Instant macro & risk threshold push alerts',
      'Adaptive OLED dark mode engineered for battery efficiency',
      'Biometric vault for local API keys and watchlists',
    ],
    requirements: {
      android: 'Android 10+ (API 29+) · arm64-v8a / armeabi-v7a · 60 MB free',
    },
    artifacts: [
      {
        label: 'Android ARM64 Release',
        platform: 'android',
        format: '.APK',
        arch: 'arm64-v8a',
        size: '~28 MB',
        sha256: 'Published automatically on v1.0 GitHub Release',
        downloadUrl: 'https://github.com/N-O-V-A-L-I-S',
      },
      {
        label: 'Android Universal APK',
        platform: 'android',
        format: '.APK',
        arch: 'universal',
        size: '~38 MB',
        sha256: 'Published automatically on v1.0 GitHub Release',
        downloadUrl: 'https://github.com/N-O-V-A-L-I-S',
      },
    ],
    accent: 'emerald',
  },
  {
    id: 'novalis-local-studio',
    name: 'Novalis AI Runner',
    tagline: 'One-click local model launcher & evaluation bench for Windows and Android devices.',
    description:
      'Download, verify SHA-256 checksums, benchmark tokens-per-second, and chat privately with NOVALIS custom GGUF & ONNX models — 100% offline on your own hardware.',
    pillar: 'Mission-Critical AI',
    platforms: ['windows', 'android', 'cross-platform'],
    version: 'v0.5.0-alpha',
    status: 'incubating',
    releaseDate: 'Q2 2027 Target',
    license: 'MIT',
    repoUrl: 'https://github.com/N-O-V-A-L-I-S',
    features: [
      'Automatic GPU/VRAM & NPU hardware profiling',
      'Built-in Hugging Face & GitHub Releases resumable downloader',
      'Deterministic prompt evaluation & latency benchmarking',
      'Shared OpenAI-compatible localhost API server',
    ],
    requirements: {
      windows: 'Windows 10/11 (64-bit) · 8 GB RAM · Vulkan / CUDA / DirectML optional',
      android: 'Android 12+ · Snapdragon / Dimensity 8 GB RAM recommended',
    },
    artifacts: [
      {
        label: 'Windows Desktop Runner',
        platform: 'windows',
        format: '.MSI',
        arch: 'x64',
        size: '~64 MB',
        sha256: 'Published automatically on release',
        downloadUrl: 'https://github.com/N-O-V-A-L-I-S',
      },
      {
        label: 'Android Edge Runner',
        platform: 'android',
        format: '.APK',
        arch: 'arm64-v8a',
        size: '~34 MB',
        sha256: 'Published automatically on release',
        downloadUrl: 'https://github.com/N-O-V-A-L-I-S',
      },
    ],
    accent: 'violet',
  },
];

export const NOVALIS_MODELS: NovalisModel[] = [
  {
    id: 'novalis-nano-135m',
    name: 'Novalis Nano-135M (Browser Ready)',
    family: 'SmolLM2 / ONNX-WebGPU',
    parameters: '135M',
    contextLength: '8K',
    tagline: 'Ultra-lightweight instant-download chat model that runs 100% inside your browser on your own PC.',
    description:
      'Designed for immediate local experimentation right inside the NOVALIS Browser Chat Studio. Downloads directly into your browser cache (~140 MB quantized ONNX) and executes via WebGPU or WebAssembly with zero cloud server cost.',
    license: 'Apache-2.0',
    status: 'live',
    browserRunnable: true,
    hfModelId: 'HuggingFaceTB/SmolLM2-135M-Instruct',
    hfBrowserModelId: 'HuggingFaceTB/SmolLM2-135M-Instruct',
    approxBrowserDownloadMb: 140,
    task: 'chat',
    benchmarks: [
      { metric: 'Browser Download', score: '~140 MB' },
      { metric: 'Runtime', score: 'WebGPU / WASM' },
      { metric: 'Privacy', score: '100% On-Device' },
    ],
    variants: [
      {
        id: 'nano-onnx-q4',
        format: 'ONNX-WebGPU',
        quantization: 'q4f16 / ONNX',
        sizeLabel: '140 MB',
        minRamGb: 2,
        recommendedVramGb: 1,
        downloadUrl: 'https://huggingface.co/HuggingFaceTB/SmolLM2-135M-Instruct/tree/main/onnx',
        sha256: 'Verified by Hugging Face LFS',
      },
      {
        id: 'nano-gguf-q8',
        format: 'GGUF',
        quantization: 'Q8_0',
        sizeLabel: '145 MB',
        minRamGb: 2,
        recommendedVramGb: 1,
        downloadUrl: 'https://huggingface.co/HuggingFaceTB/SmolLM2-135M-Instruct',
        sha256: 'Verified by Hugging Face LFS',
      },
    ],
    runCommands: {
      ollama: 'ollama run smollm2:135m',
      llamacpp: 'llama-cli -hf HuggingFaceTB/SmolLM2-135M-Instruct-GGUF -p "Explain NOVALIS architecture"',
      python: 'from transformers import pipeline\npipe = pipeline("text-generation", model="HuggingFaceTB/SmolLM2-135M-Instruct")',
    },
    accent: 'emerald',
  },
  {
    id: 'novalis-pulse-360m',
    name: 'Novalis Pulse-360M (Browser Ready)',
    family: 'SmolLM2 / ONNX-WebGPU',
    parameters: '360M',
    contextLength: '8K',
    tagline: 'Balanced low-latency local chat model delivering stronger reasoning directly in the browser.',
    description:
      'A sweet-spot compact model that balances rapid download size (~240 MB) with noticeably richer multi-turn dialogue and summarization — executing 100% locally on your CPU or WebGPU.',
    license: 'Apache-2.0',
    status: 'live',
    browserRunnable: true,
    hfModelId: 'HuggingFaceTB/SmolLM2-360M-Instruct',
    hfBrowserModelId: 'HuggingFaceTB/SmolLM2-360M-Instruct',
    approxBrowserDownloadMb: 240,
    task: 'chat',
    benchmarks: [
      { metric: 'Browser Download', score: '~240 MB' },
      { metric: 'Runtime', score: 'WebGPU / WASM' },
      { metric: 'Privacy', score: '100% On-Device' },
    ],
    variants: [
      {
        id: 'pulse360-onnx-q4',
        format: 'ONNX-WebGPU',
        quantization: 'q4f16 / ONNX',
        sizeLabel: '240 MB',
        minRamGb: 2,
        recommendedVramGb: 1,
        downloadUrl: 'https://huggingface.co/HuggingFaceTB/SmolLM2-360M-Instruct/tree/main/onnx',
        sha256: 'Verified by Hugging Face LFS',
      },
      {
        id: 'pulse360-gguf-q8',
        format: 'GGUF',
        quantization: 'Q8_0',
        sizeLabel: '386 MB',
        minRamGb: 2,
        recommendedVramGb: 1,
        downloadUrl: 'https://huggingface.co/HuggingFaceTB/SmolLM2-360M-Instruct',
        sha256: 'Verified by Hugging Face LFS',
      },
    ],
    runCommands: {
      ollama: 'ollama run smollm2:360m',
      llamacpp: 'llama-cli -hf HuggingFaceTB/SmolLM2-360M-Instruct-GGUF -cnv',
      python: 'from transformers import pipeline\npipe = pipeline("text-generation", model="HuggingFaceTB/SmolLM2-360M-Instruct")',
    },
    accent: 'cyan',
  },
  {
    id: 'novalis-edge-0.5b',
    name: 'Novalis Edge-0.5B Instruct (Browser Ready)',
    family: 'Qwen2.5 / ONNX-WebGPU',
    parameters: '0.5B',
    contextLength: '32K',
    tagline: 'Sharp instruction-following compact model runnable directly inside your browser via WebGPU/WASM.',
    description:
      'High-capability compact instruction model capable of structured reasoning, JSON formatting, and technical Q&A entirely on the visitor’s local PC. Cached locally after first load.',
    license: 'Apache-2.0',
    status: 'live',
    browserRunnable: true,
    hfModelId: 'onnx-community/Qwen2.5-0.5B-Instruct',
    hfBrowserModelId: 'onnx-community/Qwen2.5-0.5B-Instruct',
    approxBrowserDownloadMb: 380,
    task: 'reasoning',
    benchmarks: [
      { metric: 'Browser Download', score: '~380 MB' },
      { metric: 'Context Window', score: '32K Tokens' },
      { metric: 'Execution', score: '100% Local PC' },
    ],
    variants: [
      {
        id: 'edge-onnx-q4',
        format: 'ONNX-WebGPU',
        quantization: 'q4 / ONNX',
        sizeLabel: '380 MB',
        minRamGb: 4,
        recommendedVramGb: 2,
        downloadUrl: 'https://huggingface.co/onnx-community/Qwen2.5-0.5B-Instruct/tree/main/onnx',
        sha256: 'Verified by Hugging Face LFS',
      },
      {
        id: 'edge-gguf-q4km',
        format: 'GGUF',
        quantization: 'Q4_K_M',
        sizeLabel: '398 MB',
        minRamGb: 4,
        recommendedVramGb: 2,
        downloadUrl: 'https://huggingface.co/Qwen/Qwen2.5-0.5B-Instruct-GGUF',
        sha256: 'Verified by Hugging Face LFS',
      },
    ],
    runCommands: {
      ollama: 'ollama run qwen2.5:0.5b',
      llamacpp: 'llama-cli -hf Qwen/Qwen2.5-0.5B-Instruct-GGUF:Q4_K_M -cnv',
      python: 'from transformers import AutoModelForCausalLM, AutoTokenizer\nmodel_id = "Qwen/Qwen2.5-0.5B-Instruct"',
    },
    accent: 'cyan',
  },
  {
    id: 'novalis-coder-0.5b',
    name: 'Novalis Coder-0.5B (Browser Ready)',
    family: 'Qwen2.5-Coder / ONNX-WebGPU',
    parameters: '0.5B',
    contextLength: '32K',
    tagline: 'Dedicated local code-generation and debugging assistant runnable straight inside your browser.',
    description:
      'Specialized for TypeScript, Python, SQL, and shell scripting directly inside your browser tab. Downloads once into your local browser cache (~390 MB) and assists offline with zero API keys.',
    license: 'Apache-2.0',
    status: 'live',
    browserRunnable: true,
    hfModelId: 'onnx-community/Qwen2.5-Coder-0.5B-Instruct',
    hfBrowserModelId: 'onnx-community/Qwen2.5-Coder-0.5B-Instruct',
    approxBrowserDownloadMb: 390,
    task: 'code',
    benchmarks: [
      { metric: 'Browser Download', score: '~390 MB' },
      { metric: 'Specialization', score: 'TS · Python · SQL' },
      { metric: 'Execution', score: '100% Local PC' },
    ],
    variants: [
      {
        id: 'coder05-onnx-q4',
        format: 'ONNX-WebGPU',
        quantization: 'q4 / ONNX',
        sizeLabel: '390 MB',
        minRamGb: 4,
        recommendedVramGb: 2,
        downloadUrl: 'https://huggingface.co/onnx-community/Qwen2.5-Coder-0.5B-Instruct/tree/main/onnx',
        sha256: 'Verified by Hugging Face LFS',
      },
      {
        id: 'coder05-gguf-q4km',
        format: 'GGUF',
        quantization: 'Q4_K_M',
        sizeLabel: '398 MB',
        minRamGb: 4,
        recommendedVramGb: 2,
        downloadUrl: 'https://huggingface.co/Qwen/Qwen2.5-Coder-0.5B-Instruct-GGUF',
        sha256: 'Verified by Hugging Face LFS',
      },
    ],
    runCommands: {
      ollama: 'ollama run qwen2.5-coder:0.5b',
      llamacpp: 'llama-cli -hf Qwen/Qwen2.5-Coder-0.5B-Instruct-GGUF:Q4_K_M -cnv',
      python: 'from transformers import AutoModelForCausalLM\nmodel_id = "Qwen/Qwen2.5-Coder-0.5B-Instruct"',
    },
    accent: 'emerald',
  },
  {
    id: 'novalis-quant-7b',
    name: 'Novalis-Quant-7B',
    family: 'NOVALIS Financial Fine-Tune',
    parameters: '7B',
    contextLength: '32K',
    tagline: 'Domain-specialized model engineered for options microstructure, macro research, and quantitative analysis.',
    description:
      'Upcoming NOVALIS custom fine-tuned model trained on institutional finance literature, volatility surface mechanics, and structured macro-event synthesis. Packaged in GGUF & Safetensors for private desktop execution.',
    license: 'Apache-2.0',
    status: 'early-access',
    browserRunnable: false,
    task: 'market-quant',
    benchmarks: [
      { metric: 'Target Format', score: 'GGUF + Safetensors' },
      { metric: 'Domain Focus', score: 'Quant & Macro' },
      { metric: 'VRAM (Q4_K_M)', score: '~5.2 GB' },
    ],
    variants: [
      {
        id: 'quant7b-q4km',
        format: 'GGUF',
        quantization: 'Q4_K_M',
        sizeLabel: '4.4 GB',
        minRamGb: 8,
        recommendedVramGb: 6,
        downloadUrl: 'https://github.com/N-O-V-A-L-I-S',
        sha256: 'Published on Hugging Face Hub upon weight release',
      },
      {
        id: 'quant7b-q8',
        format: 'GGUF',
        quantization: 'Q8_0',
        sizeLabel: '7.6 GB',
        minRamGb: 12,
        recommendedVramGb: 10,
        downloadUrl: 'https://github.com/N-O-V-A-L-I-S',
        sha256: 'Published on Hugging Face Hub upon weight release',
      },
      {
        id: 'quant7b-fp16',
        format: 'Safetensors',
        quantization: 'BF16 / FP16',
        sizeLabel: '14.8 GB',
        minRamGb: 24,
        recommendedVramGb: 16,
        downloadUrl: 'https://github.com/N-O-V-A-L-I-S',
        sha256: 'Published on Hugging Face Hub upon weight release',
      },
    ],
    runCommands: {
      ollama: 'ollama run hf.co/N-O-V-A-L-I-S/novalis-quant-7b-gguf:Q4_K_M',
      llamacpp: 'llama-server -hf N-O-V-A-L-I-S/novalis-quant-7b-gguf:Q4_K_M --port 8080',
      python: 'from transformers import AutoModelForCausalLM\nmodel = AutoModelForCausalLM.from_pretrained("N-O-V-A-L-I-S/novalis-quant-7b")',
    },
    accent: 'violet',
  },
  {
    id: 'novalis-mission-code-3b',
    name: 'Novalis-Systems-3B',
    family: 'NOVALIS Code & Systems',
    parameters: '3B',
    contextLength: '64K',
    tagline: 'Fast local coding & architecture copilot tuned for TypeScript, Python, Flutter, and Rust systems.',
    description:
      'Compact, deterministic code-generation and audit model built to run offline on developer laptops with high throughput and low memory overhead.',
    license: 'Apache-2.0',
    status: 'incubating',
    browserRunnable: false,
    task: 'code',
    benchmarks: [
      { metric: 'Target Speed', score: '70+ tok/s (Q4)' },
      { metric: 'Context Window', score: '64K Tokens' },
      { metric: 'Footprint', score: '~2.1 GB' },
    ],
    variants: [
      {
        id: 'sys3b-q4km',
        format: 'GGUF',
        quantization: 'Q4_K_M',
        sizeLabel: '2.1 GB',
        minRamGb: 4,
        recommendedVramGb: 3,
        downloadUrl: 'https://github.com/N-O-V-A-L-I-S',
        sha256: 'Published on Hugging Face Hub upon weight release',
      },
      {
        id: 'sys3b-onnx',
        format: 'ONNX-WebGPU',
        quantization: 'INT4 / ONNX',
        sizeLabel: '1.9 GB',
        minRamGb: 6,
        recommendedVramGb: 4,
        downloadUrl: 'https://github.com/N-O-V-A-L-I-S',
        sha256: 'Published on Hugging Face Hub upon weight release',
      },
    ],
    runCommands: {
      ollama: 'ollama run hf.co/N-O-V-A-L-I-S/novalis-systems-3b-gguf:Q4_K_M',
      llamacpp: 'llama-cli -hf N-O-V-A-L-I-S/novalis-systems-3b-gguf:Q4_K_M',
      python: '# Coming soon on Hugging Face Hub: N-O-V-A-L-I-S/novalis-systems-3b',
    },
    accent: 'amber',
  },
  {
    id: 'novalis-apex-14b',
    name: 'Novalis-Apex-14B Reasoning',
    family: 'NOVALIS Flagship Mission-Critical',
    parameters: '14B',
    contextLength: '64K',
    tagline: 'Workstation-grade deep reasoning and deterministic multi-agent orchestration flagship model.',
    description:
      'Engineered for complex multi-step systems architecture, high-stakes quantitative synthesis, and strict JSON/tool-calling reliability on local workstation GPUs.',
    license: 'Apache-2.0',
    status: 'incubating',
    browserRunnable: false,
    task: 'reasoning',
    benchmarks: [
      { metric: 'Context Window', score: '64K Tokens' },
      { metric: 'Target Tier', score: 'Workstation GPU' },
      { metric: 'VRAM (Q4_K_M)', score: '~9.5 GB' },
    ],
    variants: [
      {
        id: 'apex14b-q4km',
        format: 'GGUF',
        quantization: 'Q4_K_M',
        sizeLabel: '8.9 GB',
        minRamGb: 16,
        recommendedVramGb: 12,
        downloadUrl: 'https://github.com/N-O-V-A-L-I-S',
        sha256: 'Published on Hugging Face Hub upon weight release',
      },
      {
        id: 'apex14b-q8',
        format: 'GGUF',
        quantization: 'Q8_0',
        sizeLabel: '15.4 GB',
        minRamGb: 24,
        recommendedVramGb: 18,
        downloadUrl: 'https://github.com/N-O-V-A-L-I-S',
        sha256: 'Published on Hugging Face Hub upon weight release',
      },
      {
        id: 'apex14b-bf16',
        format: 'Safetensors',
        quantization: 'BF16',
        sizeLabel: '29.2 GB',
        minRamGb: 32,
        recommendedVramGb: 32,
        downloadUrl: 'https://github.com/N-O-V-A-L-I-S',
        sha256: 'Published on Hugging Face Hub upon weight release',
      },
    ],
    runCommands: {
      ollama: 'ollama run hf.co/N-O-V-A-L-I-S/novalis-apex-14b-gguf:Q4_K_M',
      llamacpp: 'llama-server -hf N-O-V-A-L-I-S/novalis-apex-14b-gguf:Q4_K_M --port 8080',
      python: '# Coming soon on Hugging Face Hub: N-O-V-A-L-I-S/novalis-apex-14b',
    },
    accent: 'violet',
  },
];

export const NOVALIS_SKILLS: NovalisSkill[] = [
  {
    id: 'skill-quant-signal',
    slug: 'novalis-quant-signal-analyst',
    name: 'Quant Signal & Macro Analyst',
    category: 'Market Intelligence',
    version: '1.0.0',
    tagline: 'Structured financial telemetry, volatility regime classification, and macro catalyst synthesis.',
    description:
      'Equips AI coding and research agents with disciplined quantitative workflows: separating verified data from speculation, structuring options/macro regimes, and generating reproducible Python analytics.',
    compatibleAgents: ['Antigravity', 'Claude Code', 'Cursor', 'Gemini CLI'],
    pipeline: ['Ingest Market Data', 'Validate Schema', 'Compute Regime & Risk', 'Emit Cited Brief'],
    tags: ['quant', 'macro', 'python', 'telemetry'],
    skillMarkdown: `---
name: novalis-quant-signal-analyst
description: Structured quantitative finance and macro signal analysis workflow engineered by NOVALIS.
---

# NOVALIS Quant Signal & Macro Analyst

## Core Principles
1. **Signal Over Noise:** Separate raw verified numerical series from narrative commentary.
2. **Explicit Uncertainty:** Always report timestamps, data sources, sample windows, and fallback assumptions.
3. **Reproducible Math:** Emit runnable Python scripts for every metric (volatility, drawdowns, EMA, z-scores).

## Execution Workflow
1. Validate input tickers, timeframes, and missing-bar handling before calculation.
2. Compute regime indicators (trend slope, realized volatility percentile, correlation shifts).
3. Summarize findings in a 3-part brief: **Observed Regime**, **Key Inflection Levels**, and **Risk Invalidation**.
`,
  },
  {
    id: 'skill-cross-platform',
    slug: 'novalis-cross-platform-architect',
    name: 'Cross-Platform Systems Architect',
    category: 'Cross-Platform',
    version: '1.0.0',
    tagline: 'Blueprints unified Web, Windows, and Android apps with shared contracts and zero-bloat builds.',
    description:
      'Guides AI agents to design clean cross-platform codebases across React/TypeScript, Flutter, and Rust with strict type boundaries, offline resilience, and automated release pipelines.',
    compatibleAgents: ['Antigravity', 'Claude Code', 'Cursor', 'Gemini CLI'],
    pipeline: ['Define Shared Schema', 'Scaffold Target Platforms', 'Verify Offline State', 'Package Release'],
    tags: ['typescript', 'flutter', 'windows', 'android'],
    skillMarkdown: `---
name: novalis-cross-platform-architect
description: Blueprint and verify production cross-platform apps across Web, Windows, and Android.
---

# NOVALIS Cross-Platform Systems Architect

## Architecture Standards
- Keep domain logic and data contracts platform-agnostic.
- Design offline-first local persistence before adding remote sync.
- Enforce deterministic builds with SHA-256 checksum generation for every Windows (.exe/.msi) and Android (.apk) artifact.

## Verification Checklist
1. Type-check and lint pass with zero warnings.
2. Responsive UI verified at 375px mobile, 1024px tablet, and 1440px desktop widths.
3. Graceful fallback when network connectivity is unavailable.
`,
  },
  {
    id: 'skill-mission-ai-eval',
    slug: 'novalis-mission-ai-evaluator',
    name: 'Mission-Critical AI Evaluator',
    category: 'Mission-Critical AI',
    version: '1.0.0',
    tagline: 'Deterministic evaluation harness, hallucination guardrails, and latency benchmarking for production AI.',
    description:
      'Ensures every LLM prompt, RAG pipeline, or local ONNX/GGUF model passes automated accuracy, JSON-schema strictness, latency, and adversarial edge-case gates before shipping.',
    compatibleAgents: ['Antigravity', 'Claude Code', 'Cursor', 'Gemini CLI'],
    pipeline: ['Define Golden Set', 'Run Schema Assertions', 'Measure Latency & Drift', 'Gate Release'],
    tags: ['ai-eval', 'guardrails', 'onnx', 'gguf'],
    skillMarkdown: `---
name: novalis-mission-ai-evaluator
description: Build deterministic evaluation harnesses and reliability guardrails for production AI models.
---

# NOVALIS Mission-Critical AI Evaluator

## Reliability Mandate
Never deploy a prompt or model change based on subjective vibes alone.

## Required Evaluation Gates
1. **Schema Conformance:** 100% valid JSON/typed output under malformed and edge-case inputs.
2. **Latency Budget:** Track time-to-first-token (TTFT) and tokens/sec across target hardware tiers.
3. **Failure Mode Fallback:** Explicitly verify timeout, offline, and low-confidence abstention paths.
`,
  },
  {
    id: 'skill-local-llm-optimizer',
    slug: 'novalis-local-llm-optimizer',
    name: 'Local LLM & WebGPU Optimizer',
    category: 'Mission-Critical AI',
    version: '1.0.0',
    tagline: 'Quantization selection, GGUF/ONNX export, and browser WebGPU deployment engineering.',
    description:
      'Helps engineers convert PyTorch checkpoints into fast GGUF and ONNX-WebGPU artifacts with optimal quantization tradeoffs for consumer laptops and mobile devices.',
    compatibleAgents: ['Antigravity', 'Claude Code', 'Cursor'],
    pipeline: ['Profile Target Hardware', 'Export ONNX / GGUF', 'Quantize Q4/Q8', 'Verify Perplexity'],
    tags: ['webgpu', 'onnx', 'quantization', 'edge-ai'],
    skillMarkdown: `---
name: novalis-local-llm-optimizer
description: Optimize and quantize neural models for local GGUF, llama.cpp, and browser WebGPU execution.
---

# NOVALIS Local LLM & WebGPU Optimizer

## Optimization Flow
1. Choose quantization tier by target RAM/VRAM budget (\`Q4_K_M\` default for 8GB consumer devices, \`Q8_0\` for high-precision workstations).
2. Export clean ONNX graphs with \`q4f16\` weights for zero-server browser inference via WebGPU.
3. Measure perplexity delta and token throughput before publishing to Hugging Face Hub.
`,
  },
  {
    id: 'skill-security-hardener',
    slug: 'novalis-security-hardener',
    name: 'Zero-Trust Security Hardener',
    category: 'Security & DevOps',
    version: '1.0.0',
    tagline: 'Secret hygiene, supply-chain pinning, CSP headers, and static-site security auditing.',
    description:
      'Audits repositories, GitHub Actions workflows, and frontend bundles for leaked tokens, unpinned actions, XSS vectors, and insecure release pipelines.',
    compatibleAgents: ['Antigravity', 'Claude Code', 'Cursor', 'Gemini CLI'],
    pipeline: ['Scan Secrets', 'Audit CI Permissions', 'Verify Checksums', 'Enforce Least Privilege'],
    tags: ['security', 'github-actions', 'csp', 'audit'],
    skillMarkdown: `---
name: novalis-security-hardener
description: Audit codebases, GitHub Actions workflows, and release pipelines for security vulnerabilities.
---

# NOVALIS Zero-Trust Security Hardener

## Non-Negotiable Checks
1. **Least-Privilege Workflows:** Explicitly scope \`permissions:\` on every GitHub Actions job.
2. **Zero Embedded Secrets:** Never bundle private API keys into static client JS or public SVGs.
3. **Artifact Integrity:** Publish SHA-256 checksums alongside every downloadable binary and model checkpoint.
`,
  },
  {
    id: 'skill-release-automator',
    slug: 'novalis-github-release-automator',
    name: 'Zero-Cost Release Automator',
    category: 'Engineering',
    version: '1.0.0',
    tagline: 'Automates GitHub Releases, SHA-256 manifests, and live GitHub Pages catalog synchronization.',
    description:
      'Connects repository tags to automated cross-platform builds, checksum manifests, and scheduled static-site metadata refreshes with zero server infrastructure.',
    compatibleAgents: ['Antigravity', 'Claude Code', 'Gemini CLI'],
    pipeline: ['Tag SemVer', 'Build Artifacts', 'Generate SHA-256', 'Sync Pages Catalog'],
    tags: ['ci-cd', 'releases', 'github-pages', 'automation'],
    skillMarkdown: `---
name: novalis-github-release-automator
description: Automate semantic GitHub Releases, checksum generation, and static site catalog syncing.
---

# NOVALIS Zero-Cost Release Automator

## Distribution Pattern
- Host binaries (Windows .exe/.msi, Android .apk) on **GitHub Releases**.
- Host large AI weights (GGUF, ONNX, Safetensors) on **Hugging Face Hub**.
- Sync metadata into static JSON via scheduled GitHub Actions so GitHub Pages stays fast, lightweight, and $0 forever.
`,
  },
];

export const NOVALIS_ROADMAP: RoadmapPhase[] = [
  {
    phase: 'PHASE 01',
    title: 'Genesis Control Plane & Brand Architecture',
    window: 'Q4 2026',
    status: 'completed',
    summary: 'Established the NOVALIS GitHub organization, automated SVG telemetry engine, governance standards, and official web platform.',
    milestones: [
      'Launched N-O-V-A-L-I-S/.github organization profile & 6h CI telemetry',
      'Published org-wide Security, Contributing & Issue/PR governance defaults',
      'Designed official NOVALIS 4K Owl Crest brand identity',
      'Engineered zero-cost GitHub Pages platform with browser AI sandbox & skill bundler',
    ],
  },
  {
    phase: 'PHASE 02',
    title: 'AI Skills Hub & Cross-Platform Beta Releases',
    window: 'Q1 2027',
    status: 'active',
    summary: 'Shipping first signed Windows and Android builds via GitHub Releases alongside an expanding library of open AI agent skills.',
    milestones: [
      'Release Novalis Pulse Desktop (Windows x64) & Novalis Sentinel Mobile (Android APK)',
      'Expand open-source AI Skills registry with automated CLI installation',
      'Connect custom domain & live GitHub Releases download telemetry',
    ],
  },
  {
    phase: 'PHASE 03',
    title: 'Custom NOVALIS AI Models & Market Intelligence Engine',
    window: 'Q2 – Q3 2027',
    status: 'upcoming',
    summary: 'Publishing specialized fine-tuned GGUF & ONNX models for quantitative intelligence and high-reliability local software engineering.',
    milestones: [
      'Release Novalis-Quant-7B & Novalis-Systems-3B on Hugging Face Hub',
      'Open-source real-time market microstructure & macro telemetry pipelines',
      'Launch reproducible public benchmark leaderboards',
    ],
  },
  {
    phase: 'PHASE 04',
    title: 'Autonomous Mission-Critical Ecosystem',
    window: '2028+',
    status: 'upcoming',
    summary: 'Unifying cross-platform client software, live decision intelligence, and deterministic local AI agents into one interoperable open stack.',
    milestones: [
      'Multi-agent verified orchestration runtime with local-first privacy',
      'Enterprise & research partner SDKs across desktop, mobile, and edge',
      'Community-driven extensions and open benchmark governance',
    ],
  },
];

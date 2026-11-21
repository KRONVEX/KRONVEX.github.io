export type PlatformType = 'windows' | 'android' | 'cross-platform';
export type ReleaseStatus = 'live' | 'beta' | 'early-access' | 'incubating';

export interface AppDownloadArtifact {
  label: string;
  platform: 'windows' | 'android';
  format: string;
  arch: string;
  size: string;
  sha256: string;
  downloadUrl: string;
}

export interface KronvexApp {
  id: string;
  name: string;
  tagline: string;
  description: string;
  pillar: 'Cross-Platform Apps' | 'Market Intelligence' | 'Mission-Critical AI';
  platforms: PlatformType[];
  version: string;
  status: ReleaseStatus;
  releaseDate: string;
  license: string;
  repoUrl: string;
  features: string[];
  requirements: {
    windows?: string;
    android?: string;
  };
  artifacts: AppDownloadArtifact[];
  accent: 'cyan' | 'emerald' | 'violet' | 'amber';
}

export interface ModelVariant {
  id: string;
  format: 'GGUF' | 'ONNX-WebGPU' | 'Safetensors';
  quantization: string;
  sizeLabel: string;
  minRamGb: number;
  recommendedVramGb: number;
  downloadUrl: string;
  sha256: string;
}

export interface KronvexModel {
  id: string;
  name: string;
  family: string;
  parameters: string;
  contextLength: string;
  tagline: string;
  description: string;
  license: string;
  status: ReleaseStatus;
  browserRunnable: boolean;
  hfModelId?: string;
  hfBrowserModelId?: string;
  approxBrowserDownloadMb?: number;
  task: 'chat' | 'reasoning' | 'market-quant' | 'code';
  benchmarks: { metric: string; score: string }[];
  variants: ModelVariant[];
  runCommands: {
    ollama: string;
    llamacpp: string;
    python: string;
  };
  accent: 'cyan' | 'emerald' | 'violet' | 'amber';
}

export interface KronvexSkill {
  id: string;
  slug: string;
  name: string;
  category: 'Engineering' | 'Market Intelligence' | 'Mission-Critical AI' | 'Security & DevOps' | 'Cross-Platform';
  version: string;
  tagline: string;
  description: string;
  compatibleAgents: ('Antigravity' | 'Claude Code' | 'Cursor' | 'Gemini CLI')[];
  pipeline: string[];
  tags: string[];
  skillMarkdown: string;
}

export interface RoadmapPhase {
  phase: string;
  title: string;
  window: string;
  status: 'completed' | 'active' | 'upcoming';
  summary: string;
  milestones: string[];
}

export interface DetectedHardware {
  os: 'Windows' | 'Android' | 'macOS' | 'Linux' | 'iOS' | 'Unknown';
  cpuCores: number;
  ramGb: number | null;
  webgpuSupported: boolean;
  webgpuAdapter: string | null;
  wasmSupported: boolean;
}

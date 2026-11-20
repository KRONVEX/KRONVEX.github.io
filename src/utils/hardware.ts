import type { DetectedHardware, ModelVariant } from '../types/novalis';

export function detectUserOS(): DetectedHardware['os'] {
  if (typeof navigator === 'undefined') return 'Unknown';
  const ua = navigator.userAgent || '';
  if (/Android/i.test(ua)) return 'Android';
  if (/iPhone|iPad|iPod/i.test(ua)) return 'iOS';
  if (/Windows|Win64|WOW64/i.test(ua)) return 'Windows';
  if (/Macintosh|Mac OS X/i.test(ua)) return 'macOS';
  if (/Linux/i.test(ua)) return 'Linux';
  return 'Unknown';
}

export async function detectHardwareProfile(): Promise<DetectedHardware> {
  const os = detectUserOS();
  const cpuCores = typeof navigator !== 'undefined' && navigator.hardwareConcurrency ? navigator.hardwareConcurrency : 4;
  const navAny = typeof navigator !== 'undefined' ? (navigator as unknown as Record<string, unknown>) : {};
  const ramGb = typeof navAny.deviceMemory === 'number' ? navAny.deviceMemory : null;
  const wasmSupported = typeof WebAssembly !== 'undefined';

  let webgpuSupported = false;
  let webgpuAdapter: string | null = null;

  try {
    const gpu = navAny.gpu as { requestAdapter?: () => Promise<{ info?: { description?: string; vendor?: string } } | null> } | undefined;
    if (gpu && typeof gpu.requestAdapter === 'function') {
      const adapter = await gpu.requestAdapter();
      if (adapter) {
        webgpuSupported = true;
        const desc = adapter.info?.description || adapter.info?.vendor;
        webgpuAdapter = desc ? desc.toUpperCase() : 'WebGPU Hardware Adapter Ready';
      }
    }
  } catch {
    webgpuSupported = false;
  }

  return {
    os,
    cpuCores,
    ramGb,
    webgpuSupported,
    webgpuAdapter,
    wasmSupported,
  };
}

export function evaluateHardwareFit(
  hw: DetectedHardware,
  variant: ModelVariant
): { label: string; tone: 'emerald' | 'cyan' | 'amber'; detail: string } {
  const estRam = hw.ramGb ?? 8;

  if (variant.format === 'ONNX-WebGPU') {
    if (hw.webgpuSupported) {
      return {
        label: 'WebGPU Optimal',
        tone: 'emerald',
        detail: `Accelerated directly on your local GPU (${hw.cpuCores} CPU threads detected).`,
      };
    }
    return {
      label: 'WASM CPU Ready',
      tone: 'cyan',
      detail: `Runs locally on your ${hw.cpuCores}-thread CPU via WebAssembly with zero server cost.`,
    };
  }

  if (estRam >= variant.minRamGb) {
    return {
      label: 'Fits Your Device',
      tone: 'emerald',
      detail: `Estimated ${estRam} GB+ RAM meets the ${variant.minRamGb} GB requirement (${variant.quantization}).`,
    };
  }

  return {
    label: `Requires ${variant.minRamGb} GB RAM`,
    tone: 'amber',
    detail: `Browser reports ~${estRam} GB RAM cap; consider a smaller quantization or desktop GPU.`,
  };
}

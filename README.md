# KRONVEX Official Web Platform (`KRONVEX.github.io`)

100% static, zero-server-cost deep-tech platform built with **Vite + React 19 + TypeScript + Tailwind CSS**, designed for **GitHub Pages** and custom domain (`CNAME`) deployment.

## Key Capabilities

- **Mission Control Home (`/`)**: OS-auto-detected download CTA, live org telemetry, and three-pillar architecture.
- **Android & Windows Apps Storefront (`/apps`)**: Direct GitHub Releases downloads (`.apk`, `.exe`, `.msi`, `.zip`) with SHA-256 verification and automatic OS highlighting.
- **AI Models Hub & Local Browser Chat Studio (`/models`)**:
  - Auto Hardware Fit Detector (CPU threads, RAM estimate, WebGPU availability).
  - Direct GGUF / ONNX / Safetensors downloads + copyable `ollama`, `llama.cpp`, and `Python` commands.
  - **Local In-Browser AI Chat**: Dynamically loads quantized ONNX models directly onto the visitor's PC via WebGPU/WASM (`@huggingface/transformers`) with **$0 server cost**.
- **AI Skills Marketplace & 1-Click Bundler (`/skills`)**: Preview `SKILL.md` modules and bundle selected skills into a structured `.zip` directly in the browser.
- **Ecosystem Constellation (`/constellation`)**: Interactive 60fps Canvas neural/orbital graph of the 7-node KRONVEX ecosystem.
- **KRONVEX OS Command Palette & CLI (`Ctrl+K`)**: Instant search + interactive `kronvex>` terminal.
- **Vision, Roadmap & Contact (`/vision`, `/contact`)**: Manifesto, multi-phase roadmap, and zero-tracking inquiry composer.

## Local Development

```bash
npm install
npm run dev
```

## Production Build & GitHub Sync

```bash
npm run sync   # Pulls live repos & GitHub Releases from KRONVEX
npm run build  # Type-checks, builds dist/, and emits dist/.nojekyll + 404.html
```

## Deploying to GitHub Pages (`https://kronvex.github.io`)

1. Create a public repository named **`KRONVEX.github.io`** inside the `KRONVEX` organization.
2. Push this `website/` directory as the root of that repository on branch `main`.
3. In **Settings → Pages → Source**, select **GitHub Actions**.
4. To attach a custom domain later, rename `public/CNAME.example` to `public/CNAME` containing your domain (e.g., `kronvex.ai`) and configure your DNS A/CNAME records.

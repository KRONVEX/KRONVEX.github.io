---
name: kronvex-cli
description: Official KRONVEX Terminal CLI v2.0.0 (33 capabilities) — live Code-Mode MCP, local Ollama AI chat, local compute benchmark, secret leak scanner, live SEO/Security URL auditor, SHA-256 verifier, codebase tree/LOC analyzer, BibTeX papers, SKILL.md installer, and terminal Arcade games (Chess, EN/FR/AR Quiz, Orbital Defender).
---

# KRONVEX Official CLI v2.0.0 (`kronvex` / `kvx`)

Zero-dependency Node.js (`>=18`) agent-native terminal platform with **33 capabilities**, branded Cyber-Owl Hex-Core TrueColor REPL, deterministic `--json` and `--output-format stream-json` protocols, and built-in live MCP client (`https://mcp.kronvex.org/mcp`).

## Installation
- **Windows (PowerShell):** `irm https://kronvex.org/cli/install.ps1 | iex`
- **macOS / Linux:** `curl -fsSL https://kronvex.org/cli/install.sh | sh`
- **Self-Update:** `kronvex update`

## 33 Capabilities Overview
- **Platform & MCP:** `doctor`, `search "<q>"`, `apps [list|info]`, `models [list|info|recommend]`, `skills [list|inspect|install]`, `research [list|search|bibtex]`, `top21 [github|hf|weekly]`, `mcp [discover|tools|call|config]`, `services`, `work`, `open <page>`
- **Local AI & Engineering:** `chat "<prompt>"` (local Ollama), `playbook [term]`, `bench` (SHA-256 + CPU + Tier S/A/B/C)
- **Security & Auditing:** `scan [dir]` (secret leak CI gate), `audit <url>` (Security Headers + SEO/GEO/AEO score), `hash <file> --verify <hex>`, `tree [dir]` (topology + LOC)
- **Terminal Arcade:** `chess [--move e2e4]`, `quiz [--lang en|fr|ar]`, `defender`
- **System & Brand:** `crest`, `theme [kronvex|medallion|ruby|sentinel]`, `completion [powershell|bash|zsh]`, `cache [status|clear]`, `skill-md`, `update`

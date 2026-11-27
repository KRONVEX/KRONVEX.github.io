---
name: kronvex-cli
description: Official KRONVEX Terminal CLI (kronvex / kvx) for querying apps, local WebGPU AI models, SKILL.md agent workflows, Top 21 research papers + BibTeX, live GitHub/Hugging Face radar, and remote Code-Mode MCP (mcp.kronvex.org/mcp).
---

# KRONVEX Official CLI (`kronvex` / `kvx`)

Zero-dependency Node.js (`>=18`) terminal CLI engineered with the dual **Stateful REPL + Subcommand** architecture, deterministic `--json` and `--output-format stream-json` agent protocols, and built-in live MCP inspection against `https://mcp.kronvex.org/mcp`.

## Installation
- **Windows (PowerShell):** `irm https://kronvex.org/cli/install.ps1 | iex`
- **macOS / Linux:** `curl -fsSL https://kronvex.org/cli/install.sh | sh`
- **Direct Run:** `node kronvex.mjs --help`

## Agent-First Usage (`--json` & `stream-json`)
| Command | Purpose |
| :--- | :--- |
| `kronvex doctor --json` | Check live health/latency of `kronvex.org`, `mcp.kronvex.org/mcp`, and host RAM/CPU |
| `kronvex search "<q>" --json` | Live fuzzy search via `https://mcp.kronvex.org/mcp` |
| `kronvex apps list --json` | List signed Windows & Android apps |
| `kronvex models recommend --json` | Match local WebGPU/GGUF AI models to host RAM/CPU |
| `kronvex skills install <id> --dir ./.skills` | Install a KRONVEX `SKILL.md` workflow locally |
| `kronvex research bibtex <rank\|arxivId>` | Export verified frontier arXiv BibTeX citations |
| `kronvex top21 [github\|hf\|weekly] --json` | Live 6h synced GitHub & Hugging Face Top 21 radar |
| `kronvex mcp discover --json` | Probe 2026-07-28 MCP discovery manifest & tools |
| `kronvex mcp config <client>` | Generate ready-to-paste MCP config for 8 coding agents |

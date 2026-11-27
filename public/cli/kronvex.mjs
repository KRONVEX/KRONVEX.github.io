#!/usr/bin/env node
/**
 * KRONVEX Official CLI (kronvex / kvx) — v2.0.0
 * Flagship 33-Capability Agent-Native & Developer Terminal Suite
 *
 * Zero Dependencies · Pure Node.js >= 18 · Cross-Platform (Windows / macOS / Linux)
 * - Cyber-Owl Hex-Core TrueColor Banner + 100% KRONVEX Owl Brand Palette
 * - Live MCP Client (https://mcp.kronvex.org/mcp) + 10-Min Offline Cache
 * - 3 Playable Terminal Games (Alpha-Beta Chess, EN/FR/AR Tech Quiz, Real-Time Orbital Defender)
 * - Local AI (Ollama Streaming Chat, Playbook/Glossary, Local Compute Benchmark)
 * - Security & Engineering Auditors (Secret Scanner, Live SEO/Security URL Audit, SHA-256 Verifier, Repo Tree/LOC)
 * - Native Shell Completions (PowerShell / Bash / Zsh), Instant Launcher & Self-Updater
 *
 * Docs & Install: https://kronvex.org/cli
 */

import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import readline from 'node:readline';
import crypto from 'node:crypto';
import { spawn } from 'node:child_process';
import { performance } from 'node:perf_hooks';

export const CLI_NAME = 'kronvex';
export const CLI_VERSION = '2.0.1';
export const SITE_ORIGIN = 'https://kronvex.org';
export const MCP_ENDPOINT = 'https://mcp.kronvex.org/mcp';

const KRONVEX_HOME = path.join(os.homedir(), '.kronvex');
const CACHE_DIR = path.join(KRONVEX_HOME, 'cache');
const HISTORY_FILE = path.join(KRONVEX_HOME, 'history.txt');
const CONFIG_FILE = path.join(KRONVEX_HOME, 'config.json');
const ARCADE_FILE = path.join(KRONVEX_HOME, 'arcade.json');
const CACHE_TTL_MS = 10 * 60 * 1000;

// ── 100% Authentic KRONVEX Owl Brand Palette ────────────────────────────────
const USE_COLOR = Boolean(process.stdout.isTTY) && !process.env.NO_COLOR && process.env.TERM !== 'dumb';

const THEMES = {
  kronvex: {
    name: 'kronvex',
    label: 'KRONVEX Owl Signature (Cyan -> Neon Green -> Solar Gold -> Ruby Core)',
    stops: [
      [0, 212, 255],
      [34, 229, 58],
      [255, 224, 36],
      [255, 46, 76],
    ],
    accent: [34, 229, 58],
    secondary: [0, 212, 255],
    gold: [255, 214, 31],
    ruby: [255, 46, 76],
    border: [24, 138, 255],
    warnBorder: [255, 172, 18],
  },
  medallion: {
    name: 'medallion',
    label: 'Azure Medallion (Electric Cyan -> Royal Azure -> Solar Gold)',
    stops: [
      [0, 212, 255],
      [24, 138, 255],
      [255, 224, 36],
    ],
    accent: [0, 212, 255],
    secondary: [255, 224, 36],
    gold: [255, 224, 36],
    ruby: [255, 46, 76],
    border: [24, 138, 255],
    warnBorder: [0, 212, 255],
  },
  ruby: {
    name: 'ruby',
    label: 'Ruby Core (Solar Gold -> Warm Bronze -> Ruby Crimson)',
    stops: [
      [255, 224, 36],
      [204, 136, 76],
      [255, 46, 76],
    ],
    accent: [255, 46, 76],
    secondary: [255, 224, 36],
    gold: [255, 172, 18],
    ruby: [255, 46, 76],
    border: [178, 118, 68],
    warnBorder: [255, 46, 76],
  },
  sentinel: {
    name: 'sentinel',
    label: 'Sentinel Eyes (Neon Owl Green -> Electric Cyan -> Solar Gold)',
    stops: [
      [34, 229, 58],
      [0, 212, 255],
      [255, 224, 36],
    ],
    accent: [34, 229, 58],
    secondary: [0, 212, 255],
    gold: [255, 224, 36],
    ruby: [255, 46, 76],
    border: [34, 160, 90],
    warnBorder: [34, 229, 58],
  },
};

function ensureDir(dir) {
  try {
    fs.mkdirSync(dir, { recursive: true });
  } catch {
    // Non-fatal
  }
}

function loadSavedTheme() {
  try {
    if (fs.existsSync(CONFIG_FILE)) {
      const cfg = JSON.parse(fs.readFileSync(CONFIG_FILE, 'utf-8'));
      if (cfg.theme && THEMES[cfg.theme]) return cfg.theme;
    }
  } catch {
    // Ignore
  }
  return 'kronvex';
}

function saveTheme(themeName) {
  try {
    ensureDir(path.dirname(CONFIG_FILE));
    fs.writeFileSync(CONFIG_FILE, JSON.stringify({ theme: themeName }, null, 2), 'utf-8');
  } catch {
    // Ignore
  }
}

let ACTIVE_THEME = loadSavedTheme();

const fg = (r, g, b) => (USE_COLOR ? `\x1b[38;2;${r};${g};${b}m` : '');
const bg = (r, g, b) => (USE_COLOR ? `\x1b[48;2;${r};${g};${b}m` : '');
const C = {
  reset: USE_COLOR ? '\x1b[0m' : '',
  bold: USE_COLOR ? '\x1b[1m' : '',
  dim: USE_COLOR ? '\x1b[2m' : '',
  cyan: fg(0, 212, 255),
  azure: fg(24, 138, 255),
  green: fg(34, 229, 58),
  gold: fg(255, 224, 36),
  amber: fg(255, 172, 18),
  ruby: fg(255, 46, 76),
  bronze: fg(204, 142, 86),
  white: fg(248, 250, 252),
  slate: fg(165, 180, 200),
  gray: fg(108, 122, 145),
};

const paint = (color, text) => `${color}${text}${C.reset}`;

function interpolateStops(stops, t) {
  const clamped = Math.max(0, Math.min(1, t));
  const scaled = clamped * (stops.length - 1);
  const idx = Math.min(Math.floor(scaled), stops.length - 2);
  const localT = scaled - idx;
  const a = stops[idx];
  const b = stops[idx + 1];
  return [
    Math.round(a[0] + (b[0] - a[0]) * localT),
    Math.round(a[1] + (b[1] - a[1]) * localT),
    Math.round(a[2] + (b[2] - a[2]) * localT),
  ];
}

// ── Fused Geometric Cyber-Owl Hex-Core Emblem + 3D "KRONVEX" Wordmark ──────
function renderCyberOwlHexMini(forceColor = false) {
  const on = USE_COLOR || forceColor;
  const col = (r, g, b, s) => (on ? `\x1b[38;2;${r};${g};${b}m${s}\x1b[0m` : s);
  const cyan = (s) => col(0, 212, 255, s);
  const azure = (s) => col(24, 138, 255, s);
  const green = (s) => col(34, 229, 58, s);
  const gold = (s) => col(255, 224, 36, s);
  const ruby = (s) => col(255, 46, 76, s);
  const rubyHi = (s) => col(255, 132, 152, s);

  return [
    ` ${gold('◥◣')}${cyan('◢████████◣')}${gold('◢◤')} `,
    ` ${cyan('██▀')}        ${cyan('▀██')} `,
    `${cyan('██')}  ${green('◈█')}    ${green('█◈')}  ${cyan('██')}`,
    `${cyan('██')}     ${gold('▼▼')}     ${cyan('██')}`,
    `${azure('██')}    ${ruby('◢')}${rubyHi('◆◆')}${ruby('◣')}    ${azure('██')}`,
    ` ${azure('◥██▄')}      ${azure('▄██◤')} `,
    `   ${azure('◥████████◤')}   `,
  ];
}

export function renderKronvexCrest(forceColor = false) {
  const on = USE_COLOR || forceColor;
  const col = (r, g, b, s) => (on ? `\x1b[38;2;${r};${g};${b}m${s}\x1b[0m` : s);
  const cyan = (s) => col(0, 212, 255, s);
  const azure = (s) => col(24, 138, 255, s);
  const green = (s) => col(34, 229, 58, s);
  const gold = (s) => col(255, 224, 36, s);
  const amber = (s) => col(255, 172, 18, s);
  const ruby = (s) => col(255, 46, 76, s);
  const rubyHi = (s) => col(255, 140, 160, s);
  const dim = (s) => col(70, 92, 128, s);

  const lines = [
    `   ${gold('◥██◣')}  ${cyan('◢██████████◣')}  ${gold('◢██◤')}   `,
    `    ${gold('◥█◣')}${cyan('◢██▀▀')}      ${cyan('▀▀██◣')}${gold('◢█◤')}    `,
    `     ${cyan('◢██▀')}  ${green('◢█◣')}  ${green('◢█◣')}  ${cyan('▀██◣')}     `,
    `    ${cyan('███')}   ${green('██◈██')}${dim('──')}${green('██◈██')}   ${cyan('███')}    `,
    `    ${cyan('███')}    ${green('◥█◤')}  ${gold('▼▼')}  ${green('◥█◤')}    ${cyan('███')}    `,
    `    ${azure('███')}       ${gold('◥██◤')}       ${azure('███')}    `,
    `    ${azure('███')}     ${ruby('·')}  ${ruby('◢██◣')}  ${ruby('·')}     ${azure('███')}    `,
    `    ${azure('███')}    ${ruby('●')}  ${ruby('██')}${rubyHi('◆◆')}${ruby('██')}  ${ruby('●')}    ${azure('███')}    `,
    `     ${azure('◥██▄')}   ${ruby('·')}  ${ruby('◥██◤')}  ${ruby('·')}   ${azure('▄██◤')}     `,
    `    ${amber('◢█◤')}${azure('◥██▄▄')}  ${ruby('●')}   ${azure('▄▄██◤')}${amber('◥█◣')}    `,
    `   ${amber('◢██◤')}  ${azure('◥██████████◤')}  ${amber('◥██◣')}   `,
  ];
  return lines.map((l) => `  ${l}`).join('\n');
}

const GLYPHS = {
  K: ['##...##', '##..##.', '#####..', '##..##.', '##...##', '##...##'],
  R: ['######.', '##...##', '######.', '##..##.', '##...##', '##...##'],
  O: ['.#####.', '##...##', '##...##', '##...##', '##...##', '.#####.'],
  N: ['##....##', '###...##', '####..##', '##.##.##', '##..####', '##...###'],
  V: ['##....##', '##....##', '##....##', '.##..##.', '..####..', '...##...'],
  E: ['#######', '##.....', '#####..', '##.....', '##.....', '#######'],
  X: ['##...##', '.##.##.', '..###..', '..###..', '.##.##.', '##...##'],
};

function renderWordmarkLines(themeName = ACTIVE_THEME, forceColor = false) {
  const theme = THEMES[themeName] || THEMES.kronvex;
  const colorEnabled = USE_COLOR || forceColor;
  const fgRgb = (r, g, b) => (colorEnabled ? `\x1b[38;2;${r};${g};${b}m` : '');
  const rst = colorEnabled ? '\x1b[0m' : '';

  const chars = ['K', 'R', 'O', 'N', 'V', 'E', 'X'];
  const rows = 6;
  const grid = Array.from({ length: rows }, () => []);

  for (let ci = 0; ci < chars.length; ci++) {
    const glyph = GLYPHS[chars[ci]];
    for (let r = 0; r < rows; r++) {
      for (const ch of glyph[r]) grid[r].push(ch === '#');
      if (ci < chars.length - 1) grid[r].push(false);
    }
  }

  const totalCols = grid[0].length;
  const lines = [];
  for (let r = 0; r <= rows; r++) {
    let line = '';
    for (let c = 0; c <= totalCols; c++) {
      const isSolid = r < rows && c < totalCols && grid[r][c];
      const isShadow =
        !isSolid &&
        ((r > 0 && c < totalCols && grid[r - 1][c]) ||
          (r < rows && c > 0 && grid[r][c - 1]) ||
          (r > 0 && c > 0 && grid[r - 1][c - 1]));

      if (isSolid) {
        const [rr, gg, bb] = interpolateStops(theme.stops, c / Math.max(1, totalCols));
        line += `${fgRgb(rr, gg, bb)}█`;
      } else if (isShadow) {
        const [rr, gg, bb] = interpolateStops(theme.stops, c / Math.max(1, totalCols));
        line += `${fgRgb(Math.round(rr * 0.4), Math.round(gg * 0.4), Math.round(bb * 0.4))}░`;
      } else {
        line += ' ';
      }
    }
    lines.push(line + rst);
  }
  return lines;
}

export function renderKronvexHeroHeader(themeName = ACTIVE_THEME, forceColor = false) {
  const owlLines = renderCyberOwlHexMini(forceColor);
  const wordLines = renderWordmarkLines(themeName, forceColor);
  const out = [];
  for (let i = 0; i < Math.max(owlLines.length, wordLines.length); i++) {
    const left = owlLines[i] || ' '.repeat(16);
    const right = wordLines[i] || '';
    out.push(`  ${left}   ${right}`);
  }
  return out.join('\n');
}

// ── Unified ReplSkin ────────────────────────────────────────────────────────
function termWidth() {
  return Math.min(92, Math.max(66, process.stdout.columns || 84));
}

function shortCwd() {
  const cwd = process.cwd();
  const home = os.homedir();
  return cwd.startsWith(home) ? `~${cwd.slice(home.length).replace(/\\/g, '/')}` : cwd.replace(/\\/g, '/');
}

export const ReplSkin = {
  banner() {
    const theme = THEMES[ACTIVE_THEME] || THEMES.kronvex;
    const w = Math.min(78, termWidth() - 2);
    const borderRgb = fg(...theme.warnBorder);
    const accentRgb = fg(...theme.accent);
    const secRgb = fg(...theme.secondary);
    const goldRgb = fg(...theme.gold);
    const ramGb = (os.totalmem() / 1024 ** 3).toFixed(0);
    const cores = os.cpus().length;

    const noticeText = `33 Capabilities · Live MCP (mcp.kronvex.org) · Arcade · Security · 0 Deps`;
    const padNotice = Math.max(0, w - 4 - noticeText.length);

    return [
      '',
      renderKronvexHeroHeader(ACTIVE_THEME),
      '',
      `  ${paint(goldRgb, '◈')} ${paint(C.bold + C.white, 'KRONVEX')} ${paint(C.gray, '·')} ${paint(C.slate, 'Cross-Platform Apps · Market Intelligence · Mission-Critical AI')}`,
      '',
      `${paint(C.slate, '  Tips for getting started:')}`,
      `  ${paint(C.gray, '1.')} Engineering: ${paint(accentRgb, 'doctor')}, ${paint(accentRgb, 'scan')}, ${paint(accentRgb, 'audit https://kronvex.org')}, ${paint(accentRgb, 'bench')}, ${paint(accentRgb, 'tree')}`,
      `  ${paint(C.gray, '2.')} AI & Arcade: ${paint(secRgb, 'chat')}, ${paint(secRgb, 'search "webgpu"')}, ${paint(secRgb, 'chess')}, ${paint(secRgb, 'quiz --lang ar')}, ${paint(secRgb, 'defender')}`,
      `  ${paint(C.gray, '3.')} Agents & UI: ${paint(goldRgb, '/help')} for all 33 tools · ${paint(goldRgb, '/json')} for agents · ${paint(goldRgb, '/crest')} · ${paint(goldRgb, '/theme')}`,
      '',
      `  ${paint(borderRgb, `╭${'─'.repeat(w - 2)}╮`)}`,
      `  ${paint(borderRgb, '│')} ${paint(C.ruby, '●')} ${paint(C.white, noticeText)}${' '.repeat(padNotice)}${paint(borderRgb, '│')}`,
      `  ${paint(borderRgb, `╰${'─'.repeat(w - 2)}╯`)}`,
      '',
      `  ${paint(C.gray, `Workspace: ${shortCwd()}`)}   ${paint(C.gray, '│')}   ${paint(secRgb, `v${CLI_VERSION}`)}   ${paint(C.gray, '│')}   ${paint(C.bronze, `${ramGb}GB RAM · ${cores} cores`)}   ${paint(C.gray, '│')}   ${paint(accentRgb, `theme:${ACTIVE_THEME}`)}`,
      '',
    ].join('\n');
  },

  toolCard(toolLabel, detail, meta = '') {
    const theme = THEMES[ACTIVE_THEME] || THEMES.kronvex;
    const w = Math.min(78, termWidth() - 2);
    const borderRgb = fg(...theme.border);
    const accentRgb = fg(...theme.accent);
    const content = `◈ ${toolLabel}  ${detail}${meta ? `  (${meta})` : ''}`;
    const trimmed = content.length > w - 4 ? `${content.slice(0, w - 5)}…` : content;
    const pad = Math.max(0, w - 4 - trimmed.length);
    return [
      `  ${paint(borderRgb, `╭${'─'.repeat(w - 2)}╮`)}`,
      `  ${paint(borderRgb, '│')} ${paint(accentRgb, '◈')} ${paint(C.bold + C.white, toolLabel)}  ${paint(C.slate, detail)}${meta ? `  ${paint(C.gold, `(${meta})`)}` : ''}${' '.repeat(pad)} ${paint(borderRgb, '│')}`,
      `  ${paint(borderRgb, `╰${'─'.repeat(w - 2)}╯`)}`,
    ].join('\n');
  },

  statusFooter(jsonMode = false) {
    const theme = THEMES[ACTIVE_THEME] || THEMES.kronvex;
    const secRgb = fg(...theme.secondary);
    const goldRgb = fg(...theme.gold);
    const left = `${paint(secRgb, shortCwd())} ${paint(C.gray, `(kronvex v${CLI_VERSION})`)}`;
    const mid = jsonMode ? paint(C.gold, 'mode: JSON') : paint(C.green, 'mcp.kronvex.org/mcp (read-only)');
    const right = paint(goldRgb, `theme:${ACTIVE_THEME}`);
    return `${paint(C.gray, '  ' + '─'.repeat(Math.min(76, termWidth() - 4)))}\n  ${left}   ${paint(C.gray, '·')}   ${mid}   ${paint(C.gray, '·')}   ${right}`;
  },

  success: (msg) => `  ${paint(C.green, '✓')} ${msg}`,
  error: (msg) => `  ${paint(C.ruby, '✗')} ${msg}`,
  warn: (msg) => `  ${paint(C.gold, '⚠')} ${msg}`,
  info: (msg) => `  ${paint(C.cyan, '◈')} ${msg}`,
  kv: (k, v) => `    ${paint(C.gray, k.padEnd(24))} ${paint(C.white, String(v))}`,

  table(headers, rows, maxColWidth = 44) {
    if (!rows.length) return paint(C.gray, '    (no results)');
    const cleanCell = (v) => {
      const s = String(v ?? '').replace(/\s+/g, ' ').trim();
      return s.length > maxColWidth ? `${s.slice(0, maxColWidth - 1)}…` : s;
    };
    const normRows = rows.map((r) => headers.map((_, i) => cleanCell(r[i])));
    const widths = headers.map((h, i) => Math.max(h.length, ...normRows.map((r) => r[i].length)));

    const top = `  ┌─${widths.map((w) => '─'.repeat(w)).join('─┬─')}─┐`;
    const mid = `  ├─${widths.map((w) => '─'.repeat(w)).join('─┼─')}─┤`;
    const bot = `  └─${widths.map((w) => '─'.repeat(w)).join('─┴─')}─┘`;
    const head = `  │ ${headers.map((h, i) => paint(C.bold + C.cyan, h.padEnd(widths[i]))).join(' │ ')} │`;
    const body = normRows.map((r) => `  │ ${r.map((c, i) => c.padEnd(widths[i])).join(' │ ')} │`);
    return [paint(C.gray, top), head, paint(C.gray, mid), ...body, paint(C.gray, bot)].join('\n');
  },
};

function startSpinner(opts, label) {
  if (opts.format !== 'text' || !USE_COLOR) return { stop() {} };
  const frames = ['⠋', '⠙', '⠹', '⠸', '⠼', '⠴', '⠦', '⠧', '⠇', '⠏'];
  let i = 0;
  const t0 = performance.now();
  const id = setInterval(() => {
    const secs = ((performance.now() - t0) / 1000).toFixed(1);
    process.stderr.write(`\r  ${paint(C.gold, frames[i++ % frames.length])} ${paint(C.slate, label)} ${paint(C.gray, `(${secs}s)`)}   `);
  }, 80);
  return {
    stop() {
      clearInterval(id);
      process.stderr.write('\r' + ' '.repeat(78) + '\r');
    },
  };
}

// ── Output Emitter ──────────────────────────────────────────────────────────
function emitStreamEvent(type, payload) {
  process.stdout.write(JSON.stringify({ ts: new Date().toISOString(), type, ...payload }) + '\n');
}

function outputResult(opts, data, humanRenderer) {
  if (opts.format === 'json') {
    process.stdout.write(JSON.stringify(data, null, 2) + '\n');
    return;
  }
  if (opts.format === 'stream-json') {
    emitStreamEvent('result', { data });
    return;
  }
  const rendered = typeof humanRenderer === 'function' ? humanRenderer(data) : String(data);
  if (rendered !== '') process.stdout.write(rendered + '\n');
}

// ── Edge Data & Live MCP Client ─────────────────────────────────────────────
async function fetchJsonWithCache(name, { noCache = false } = {}) {
  const url = `${SITE_ORIGIN}/api/${name}.json`;
  const cacheFile = path.join(CACHE_DIR, `${name}.json`);

  if (!noCache && fs.existsSync(cacheFile)) {
    try {
      const stat = fs.statSync(cacheFile);
      if (Date.now() - stat.mtimeMs < CACHE_TTL_MS) {
        return JSON.parse(fs.readFileSync(cacheFile, 'utf-8'));
      }
    } catch {
      // Refetch
    }
  }

  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), 10_000);
  try {
    const res = await fetch(url, {
      headers: { Accept: 'application/json', 'User-Agent': `kronvex-cli/${CLI_VERSION}` },
      signal: controller.signal,
    });
    if (!res.ok) throw new Error(`HTTP ${res.status} from ${url}`);
    const data = await res.json();
    try {
      ensureDir(CACHE_DIR);
      fs.writeFileSync(cacheFile, JSON.stringify(data), 'utf-8');
    } catch {
      // Ignore
    }
    return data;
  } catch (err) {
    if (fs.existsSync(cacheFile)) {
      return JSON.parse(fs.readFileSync(cacheFile, 'utf-8'));
    }
    throw new Error(`Unable to fetch ${url}: ${err instanceof Error ? err.message : String(err)}`);
  } finally {
    clearTimeout(timer);
  }
}

async function callRemoteMcp(method, params = {}) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), 10_000);
  const t0 = performance.now();
  try {
    const res = await fetch(MCP_ENDPOINT, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json',
        'User-Agent': `kronvex-cli/${CLI_VERSION}`,
      },
      body: JSON.stringify({ jsonrpc: '2.0', id: Date.now(), method, params }),
      signal: controller.signal,
    });
    const latencyMs = Math.round(performance.now() - t0);
    if (!res.ok) throw new Error(`MCP endpoint HTTP ${res.status}`);
    const json = await res.json();
    if (json.error) throw new Error(`MCP RPC Error ${json.error.code}: ${json.error.message}`);
    return { latencyMs, result: json.result };
  } finally {
    clearTimeout(timer);
  }
}

function toBibtex(paper) {
  const slug = String(paper.title || 'paper')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '')
    .slice(0, 14);
  const key = `kronvex_${paper.year}_${slug}`;
  return [
    `@article{${key},`,
    `  title     = {${paper.title}},`,
    `  author    = {${paper.authors || paper.lab}},`,
    `  year      = {${paper.year}},`,
    `  journal   = {arXiv preprint arXiv:${paper.arxivId}},`,
    `  url       = {${paper.arxivUrl}}`,
    `}`,
  ].join('\n');
}

function buildMcpClientConfig(client = 'antigravity', transport = 'http') {
  const c = String(client).toLowerCase();
  if (c === 'codex') {
    return transport === 'stdio'
      ? `[mcp_servers.kronvex]\ncommand = "node"\nargs = ["kronvex-mcp.mjs"]`
      : `[mcp_servers.kronvex]\nurl = "${MCP_ENDPOINT}"`;
  }
  if (c === 'vscode') {
    return JSON.stringify(
      {
        servers: {
          kronvex:
            transport === 'stdio'
              ? { type: 'stdio', command: 'node', args: ['kronvex-mcp.mjs'] }
              : { type: 'http', url: MCP_ENDPOINT },
        },
      },
      null,
      2
    );
  }
  if (c === 'claude-code' && transport === 'http') {
    return `claude mcp add --transport http kronvex ${MCP_ENDPOINT}`;
  }
  return JSON.stringify(
    {
      mcpServers: {
        kronvex:
          transport === 'stdio'
            ? { command: 'node', args: ['kronvex-mcp.mjs'] }
            : { type: 'http', url: MCP_ENDPOINT },
      },
    },
    null,
    2
  );
}

// ── Playbook & 16-Term Glossary Data ────────────────────────────────────────
const PLAYBOOK_LAWS = [
  { code: 'LAW 01', title: 'Local-First Execution', desc: 'Prefer client/edge computation (WebGPU, ONNX, WASM, static JSON) over costly lock-in cloud APIs.' },
  { code: 'LAW 02', title: 'Zero-Bloat Performance', desc: 'Ship lazy-loaded code-split bundles targeting 100/100 Lighthouse and 0.000 CLS across every route.' },
  { code: 'LAW 03', title: 'Verifiable Integrity', desc: 'Every downloadable binary and CLI release publishes reproducible SHA-256 cryptographic hashes.' },
  { code: 'LAW 04', title: 'Zero-Tracking Privacy', desc: 'No third-party ad pixels, surveillance cookies, or silent behavioral telemetry.' },
  { code: 'LAW 05', title: 'Agent-Native Contracts', desc: 'Expose deterministic JSON-LD, llms.txt, Code-Mode MCP, and --json CLI interfaces alongside human UI.' },
  { code: 'LAW 06', title: 'Defense-in-Depth Edge Security', desc: 'Enforce Full (Strict) TLS, HSTS Preload, calibrated CSP, UUID untrusted-data boundaries, and 0-vuln deps.' },
];

const GLOSSARY_TERMS = [
  { term: 'MCP', category: 'Agents', def: 'Model Context Protocol — open JSON-RPC 2.0 standard connecting AI agents to external tools, data, and prompts.' },
  { term: 'Code Mode', category: 'MCP', def: 'Collapsing 50-400 bloated MCP tool schemas into 2 tools (search + execute) to cut prompt token overhead by ~98%.' },
  { term: 'RAG', category: 'AI Core', def: 'Retrieval-Augmented Generation — grounding LLM responses in verified private documents and vector/FTS indexes.' },
  { term: 'WebGPU', category: 'Local AI', def: 'Modern browser GPU compute API enabling hardware-accelerated ONNX/ML neural inference 100% locally.' },
  { term: 'ONNX', category: 'Local AI', def: 'Open Neural Network Exchange — portable runtime format for executing quantized AI models on CPU/GPU/browser.' },
  { term: 'GGUF', category: 'Local AI', def: 'Binary quantized model format designed for fast local CPU/GPU LLM inference via llama.cpp and Ollama.' },
  { term: 'AEO', category: 'Search', def: 'Answer Engine Optimization — structuring TL;DR facts, Q&A schema, and clear prose for direct AI answers.' },
  { term: 'GEO', category: 'Search', def: 'Generative Engine Optimization — maximizing verifiable citations across ChatGPT, Claude, Perplexity & AI Overviews.' },
  { term: 'SKILL.md', category: 'Agents', def: 'Portable Markdown capability specification that equips coding agents with deterministic domain playbooks.' },
  { term: 'HSTS Preload', category: 'Security', def: 'HTTP Strict Transport Security directive locking browsers to HTTPS permanently against downgrade attacks.' },
  { term: 'CSP', category: 'Security', def: 'Content-Security-Policy header restricting script/connect/frame origins to block XSS and data exfiltration.' },
  { term: 'CLS', category: 'Perf', def: 'Cumulative Layout Shift — Core Web Vital measuring visual stability (target: 0.000).' },
  { term: 'LCP', category: 'Perf', def: 'Largest Contentful Paint — Core Web Vital measuring primary content load speed (target: <1.2s).' },
  { term: 'Quantization', category: 'Local AI', def: 'Compressing FP16 model weights to INT8/INT4/Q4_K_M to slash VRAM requirements with minimal accuracy loss.' },
  { term: 'FilteredStdio', category: 'MCP', def: 'Stdio transport guard isolating JSON-RPC frames on stdout from stray logs to prevent framing corruption.' },
  { term: 'NDJSON', category: 'CLI', def: 'Newline-Delimited JSON (stream-json) enabling real-time structured event streaming in agent pipelines.' },
];

// ── Trilingual Tech & AI Quiz Bank (EN / FR / AR) ───────────────────────────
const QUIZ_BANK = [
  {
    id: 1,
    topic: 'MCP & Code Mode',
    en: { q: 'How does NexusMCP Code Mode reduce agent token usage by ~98%?', opts: ['Collapses tools into search + execute', 'Compresses PNG images', 'Disables HTTPS', 'Uses XML instead of JSON'], ans: 0, exp: 'Two compact tools (~650 tokens) replace 50-400 individual schemas.' },
    fr: { q: 'Comment NexusMCP Code Mode réduit-il ~98% des tokens?', opts: ['Fusionne en search + execute', 'Compresse les PNG', 'Désactive HTTPS', 'Utilise XML'], ans: 0, exp: 'Deux outils compacts (~650 tokens) remplacent des centaines de schémas.' },
    ar: { q: 'كيف يقلّص وضع Code Mode استهلاك التوكنات بنسبة ~98%؟', opts: ['يدمج الأدوات في search + execute', 'يضغط الصور فقط', 'يعطّل HTTPS', 'يستخدم XML بدل JSON'], ans: 0, exp: 'أداتان فقط (~650 توكن) تغنيان عن تحميل عشرات المخططات في كل طلب.' },
  },
  {
    id: 2,
    topic: 'Local AI / WebGPU',
    en: { q: 'Which quantization format is native to llama.cpp and Ollama?', opts: ['GGUF', 'MP4', 'BMP', 'YAML'], ans: 0, exp: 'GGUF stores quantized weights + metadata in a single fast memory-mapped file.' },
    fr: { q: 'Quel format quantifié est natif pour llama.cpp et Ollama?', opts: ['GGUF', 'MP4', 'BMP', 'YAML'], ans: 0, exp: 'GGUF stocke les poids quantifiés et métadonnées dans un fichier mappé.' },
    ar: { q: 'ما هي صيغة النماذج المكَمَّمة الأصلية لمحرك llama.cpp وOllama؟', opts: ['GGUF', 'MP4', 'BMP', 'YAML'], ans: 0, exp: 'صيغة GGUF تحفظ أوزان النموذج والبيانات الوصفية لسرعة التشغيل المحلي.' },
  },
  {
    id: 3,
    topic: 'Web Security',
    en: { q: 'Which HTTP header prevents clickjacking by forbidding iframe embedding?', opts: ['X-Frame-Options: DENY', 'Accept-Encoding', 'ETag', 'Cache-Control'], ans: 0, exp: 'X-Frame-Options: DENY (and CSP frame-ancestors none) blocks clickjacking.' },
    fr: { q: 'Quel en-tête HTTP bloque le clickjacking via iframe?', opts: ['X-Frame-Options: DENY', 'Accept-Encoding', 'ETag', 'Cache-Control'], ans: 0, exp: 'X-Frame-Options: DENY empêche toute intégration iframe malveillante.' },
    ar: { q: 'أي ترويسة HTTP تمنع هجوم Clickjacking عبر منع تضمين الموقع في iframe؟', opts: ['X-Frame-Options: DENY', 'Accept-Encoding', 'ETag', 'Cache-Control'], ans: 0, exp: 'ترويسة X-Frame-Options: DENY مع CSP frame-ancestors تحمي من الاختطاف البصري.' },
  },
  {
    id: 4,
    topic: 'Python & Async',
    en: { q: 'In Python asyncio, what runs multiple coroutines concurrently and collects results?', opts: ['asyncio.gather()', 'time.sleep()', 'os.fork()', 'list.sort()'], ans: 0, exp: 'asyncio.gather() schedules awaitables concurrently on the event loop.' },
    fr: { q: 'Dans Python asyncio, quelle fonction exécute plusieurs coroutines en parallèle?', opts: ['asyncio.gather()', 'time.sleep()', 'os.fork()', 'list.sort()'], ans: 0, exp: 'asyncio.gather() planifie plusieurs coroutines simultanément.' },
    ar: { q: 'في Python asyncio، ما الدالة التي تشغّل عدة coroutines بالتوازي وتجمع نتائجها؟', opts: ['asyncio.gather()', 'time.sleep()', 'os.fork()', 'list.sort()'], ans: 0, exp: 'تُشغّل asyncio.gather() المهام غير المتزامنة بالتوازي على حلقة الأحداث.' },
  },
  {
    id: 5,
    topic: 'Core Web Vitals',
    en: { q: 'What causes a high CLS (Cumulative Layout Shift) on lazy-loaded routes?', opts: ['Footer jumping before chunk loads', 'Using WebP images', 'Enabling Brotli', 'Adding alt text'], ans: 0, exp: 'Reserving min-h-screen on fallback prevents the footer from shifting.' },
    fr: { q: 'Qu’est-ce qui provoque un CLS élevé sur une route lazy-loaded?', opts: ['Saut du footer avant chargement', 'Images WebP', 'Compression Brotli', 'Attributs alt'], ans: 0, exp: 'Un min-h-screen sur le fallback empêche le saut de mise en page.' },
    ar: { q: 'ما السبب الأشهر لارتفاع CLS (قفزة التخطيط) في الصفحات ذات التحميل الكسول؟', opts: ['قفز الـ Footer قبل تحميل الصفحة', 'استخدام صور WebP', 'تفعيل ضغط Brotli', 'إضافة نص alt'], ans: 0, exp: 'حجز ارتفاع min-h-screen في شاشة التحميل يثبّت الـ Footer ويصفّر الـ CLS.' },
  },
  {
    id: 6,
    topic: 'AI Research / DeepMind',
    en: { q: 'What breakthrough did Google DeepMind AlphaEvolve achieve in 2025?', opts: ['Discovered faster matrix multiplication algorithms', 'Built a new Wi-Fi router', 'Replaced TCP/IP', 'Created PNG compression'], ans: 0, exp: 'AlphaEvolve discovered faster matrix multiplication algorithms improving on Strassen (1969).' },
    fr: { q: 'Quelle percée Google DeepMind AlphaEvolve a-t-il réalisée en 2025?', opts: ['Algorithmes de multiplication matricielle plus rapides', 'Routeur Wi-Fi', 'Remplacé TCP/IP', 'Compression PNG'], ans: 0, exp: 'AlphaEvolve a découvert des algorithmes matriciels surpassant Strassen (1969).' },
    ar: { q: 'ما الإنجاز العلمي الذي حققه نظام AlphaEvolve من Google DeepMind عام 2025؟', opts: ['اكتشاف خوارزميات أسرع لضرب المصفوفات', 'تصميم راوتر Wi-Fi', 'استبدال بروتوكول TCP/IP', 'ضغط صور PNG'], ans: 0, exp: 'اكتشف AlphaEvolve خوارزميات ضرب مصفوفات تتفوق على خوارزمية Strassen منذ 1969.' },
  },
  {
    id: 7,
    topic: 'Cryptography & Supply Chain',
    en: { q: 'Why does KRONVEX publish SHA-256 hashes for every CLI and binary release?', opts: ['Verify bit-for-bit integrity & detect tampering', 'Encrypt user passwords', 'Compress file size', 'Speed up DNS'], ans: 0, exp: 'SHA-256 guarantees the downloaded file matches the exact verified release.' },
    fr: { q: 'Pourquoi KRONVEX publie-t-il des empreintes SHA-256 pour chaque binaire?', opts: ['Vérifier l’intégrité exacte contre toute altération', 'Chiffrer les mots de passe', 'Compresser le fichier', 'Accélérer le DNS'], ans: 0, exp: 'SHA-256 prouve que le fichier téléchargé n’a subi aucune altération.' },
    ar: { q: 'لماذا تنشر KRONVEX بصمة SHA-256 لكل ملف وتطبيق قابل للتحميل؟', opts: ['للتحقق من سلامة الملف وكشف أي تلاعب', 'لتشفير كلمات المرور', 'لتقليص حجم الملف', 'لتسريع الـ DNS'], ans: 0, exp: 'تثبت بصمة SHA-256 تطابق الملف بتّاً ببت مع الإصدار الرسمي الأصلي.' },
  },
  {
    id: 8,
    topic: 'TypeScript / Node.js',
    en: { q: 'In a stdio MCP server, where MUST diagnostic logs go instead of stdout?', opts: ['process.stderr', 'process.stdout', 'window.alert', 'document.cookie'], ans: 0, exp: 'Writing stray text to stdout corrupts newline-delimited JSON-RPC framing.' },
    fr: { q: 'Dans un serveur MCP stdio, où doivent aller les logs de diagnostic?', opts: ['process.stderr', 'process.stdout', 'window.alert', 'document.cookie'], ans: 0, exp: 'Tout texte parasite sur stdout corrompt le flux JSON-RPC.' },
    ar: { q: 'في خادم MCP يعمل عبر stdio، أين يجب توجيه سجلات التشخيص بدلاً من stdout؟', opts: ['process.stderr', 'process.stdout', 'window.alert', 'document.cookie'], ans: 0, exp: 'أي طباعة غير JSON على stdout تُفسد إطارات بروتوكول JSON-RPC 2.0.' },
  },
];

// ── Terminal Alpha-Beta Chess Engine (Zero Dependencies) ────────────────────
const CHESS_INITIAL = [
  'rnbqkbnr',
  'pppppppp',
  '........',
  '........',
  '........',
  '........',
  'PPPPPPPP',
  'RNBQKBNR',
];
const PIECE_VAL = { p: 100, n: 320, b: 330, r: 500, q: 900, k: 20000 };
// Use U+FE0E text variation selector on pawns/pieces so Windows Terminal renders TrueColor glyphs (never purple emoji)
const PIECE_UNICODE = {
  K: '♔\uFE0E', Q: '♕\uFE0E', R: '♖\uFE0E', B: '♗\uFE0E', N: '♘\uFE0E', P: '♙\uFE0E',
  k: '♚\uFE0E', q: '♛\uFE0E', r: '♜\uFE0E', b: '♝\uFE0E', n: '♞\uFE0E', p: '♟\uFE0E',
};

const isWhitePiece = (p) => p !== '.' && p === p.toUpperCase();
const isBlackPiece = (p) => p !== '.' && p === p.toLowerCase();

function cloneBoard(b) {
  return b.map((row) => row.slice());
}

function boardFromStrings(rows) {
  return rows.map((r) => r.split(''));
}

function boardToFen(board, turn) {
  const rows = board.map((row) => {
    let s = '';
    let emp = 0;
    for (const c of row) {
      if (c === '.') emp++;
      else {
        if (emp) { s += emp; emp = 0; }
        s += c;
      }
    }
    if (emp) s += emp;
    return s;
  });
  return `${rows.join('/')} ${turn}`;
}

function sqToCoord(sq) {
  if (!/^[a-h][1-8]$/.test(sq)) return null;
  return { r: 8 - Number(sq[1]), c: sq.charCodeAt(0) - 97 };
}

function coordToSq(r, c) {
  return String.fromCharCode(97 + c) + String(8 - r);
}

function generatePseudoMoves(board, side) {
  const moves = [];
  const own = side === 'w' ? isWhitePiece : isBlackPiece;
  const opp = side === 'w' ? isBlackPiece : isWhitePiece;
  const inBounds = (r, c) => r >= 0 && r < 8 && c >= 0 && c < 8;

  for (let r = 0; r < 8; r++) {
    for (let c = 0; c < 8; c++) {
      const p = board[r][c];
      if (!own(p)) continue;
      const type = p.toLowerCase();

      if (type === 'p') {
        const dir = side === 'w' ? -1 : 1;
        const startRow = side === 'w' ? 6 : 1;
        if (inBounds(r + dir, c) && board[r + dir][c] === '.') {
          moves.push({ fr: r, fc: c, tr: r + dir, tc: c });
          if (r === startRow && board[r + 2 * dir][c] === '.') {
            moves.push({ fr: r, fc: c, tr: r + 2 * dir, tc: c });
          }
        }
        for (const dc of [-1, 1]) {
          if (inBounds(r + dir, c + dc) && opp(board[r + dir][c + dc])) {
            moves.push({ fr: r, fc: c, tr: r + dir, tc: c + dc });
          }
        }
      } else if (type === 'n') {
        for (const [dr, dc] of [[-2, -1], [-2, 1], [-1, -2], [-1, 2], [1, -2], [1, 2], [2, -1], [2, 1]]) {
          const nr = r + dr; const nc = c + dc;
          if (inBounds(nr, nc) && !own(board[nr][nc])) moves.push({ fr: r, fc: c, tr: nr, tc: nc });
        }
      } else if (type === 'k') {
        for (let dr = -1; dr <= 1; dr++) {
          for (let dc = -1; dc <= 1; dc++) {
            if (!dr && !dc) continue;
            const nr = r + dr; const nc = c + dc;
            if (inBounds(nr, nc) && !own(board[nr][nc])) moves.push({ fr: r, fc: c, tr: nr, tc: nc });
          }
        }
      } else {
        const dirs = [];
        if (type === 'b' || type === 'q') dirs.push([-1, -1], [-1, 1], [1, -1], [1, 1]);
        if (type === 'r' || type === 'q') dirs.push([-1, 0], [1, 0], [0, -1], [0, 1]);
        for (const [dr, dc] of dirs) {
          let nr = r + dr; let nc = c + dc;
          while (inBounds(nr, nc)) {
            if (own(board[nr][nc])) break;
            moves.push({ fr: r, fc: c, tr: nr, tc: nc });
            if (opp(board[nr][nc])) break;
            nr += dr; nc += dc;
          }
        }
      }
    }
  }
  return moves;
}

function applyMove(board, m) {
  const next = cloneBoard(board);
  let piece = next[m.fr][m.fc];
  if (piece === 'P' && m.tr === 0) piece = 'Q';
  if (piece === 'p' && m.tr === 7) piece = 'q';
  next[m.tr][m.tc] = piece;
  next[m.fr][m.fc] = '.';
  return next;
}

function isKingInCheck(board, side) {
  const kingChar = side === 'w' ? 'K' : 'k';
  let kr = -1; let kc = -1;
  for (let r = 0; r < 8; r++) {
    for (let c = 0; c < 8; c++) {
      if (board[r][c] === kingChar) { kr = r; kc = c; }
    }
  }
  if (kr === -1) return true;
  const oppMoves = generatePseudoMoves(board, side === 'w' ? 'b' : 'w');
  return oppMoves.some((m) => m.tr === kr && m.tc === kc);
}

function generateLegalMoves(board, side) {
  return generatePseudoMoves(board, side).filter((m) => !isKingInCheck(applyMove(board, m), side));
}

function evaluateBoard(board) {
  let score = 0;
  for (let r = 0; r < 8; r++) {
    for (let c = 0; c < 8; c++) {
      const p = board[r][c];
      if (p === '.') continue;
      const val = PIECE_VAL[p.toLowerCase()] || 0;
      const centerBonus = (3.5 - Math.abs(3.5 - r)) * 4 + (3.5 - Math.abs(3.5 - c)) * 4;
      score += isWhitePiece(p) ? val + centerBonus : -(val + centerBonus);
    }
  }
  return score;
}

function alphaBeta(board, depth, alpha, beta, maximizing) {
  const side = maximizing ? 'w' : 'b';
  const moves = generateLegalMoves(board, side);
  if (depth === 0 || moves.length === 0) {
    if (moves.length === 0) {
      return isKingInCheck(board, side) ? (maximizing ? -19000 - depth : 19000 + depth) : 0;
    }
    return evaluateBoard(board);
  }
  if (maximizing) {
    let best = -Infinity;
    for (const m of moves) {
      const val = alphaBeta(applyMove(board, m), depth - 1, alpha, beta, false);
      if (val > best) best = val;
      if (best > alpha) alpha = best;
      if (beta <= alpha) break;
    }
    return best;
  }
  let best = Infinity;
  for (const m of moves) {
    const val = alphaBeta(applyMove(board, m), depth - 1, alpha, beta, true);
    if (val < best) best = val;
    if (best < beta) beta = best;
    if (beta <= alpha) break;
  }
  return best;
}

function pickAiMove(board, depth = 2) {
  const moves = generateLegalMoves(board, 'b');
  if (!moves.length) return null;
  let bestMove = moves[0];
  let bestVal = Infinity;
  for (const m of moves) {
    const val = alphaBeta(applyMove(board, m), Math.max(1, Math.min(3, depth)) - 1, -Infinity, Infinity, true);
    if (val < bestVal) {
      bestVal = val;
      bestMove = m;
    }
  }
  return { move: bestMove, uci: `${coordToSq(bestMove.fr, bestMove.fc)}${coordToSq(bestMove.tr, bestMove.tc)}`, evalCp: Math.round(bestVal) };
}

function centerPad(visibleWidth) {
  const cols = process.stdout.columns || 100;
  return ' '.repeat(Math.max(2, Math.floor((cols - visibleWidth) / 2)));
}

function renderChessBoard(board, lastMove = null, hud = null, uiState = null) {
  // Large tournament-size board: 7 cols x 2 rows per square -> 62 total cols (horizontally & vertically centered!)
  const sqW = 7;
  const totalW = 8 * sqW + 6;
  const pad = centerPad(totalW);
  const files = ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h'].map((f) => `   ${f}   `).join('');
  const topBorder = `${pad}  ${paint(C.azure, `╔${'═'.repeat(8 * sqW)}╗`)}`;
  const botBorder = `${pad}  ${paint(C.azure, `╚${'═'.repeat(8 * sqW)}╝`)}`;

  const cursor = uiState?.cursor ?? null;
  const selected = uiState?.selected ?? null;
  const legalTargets = uiState?.legalTargets ?? new Set();

  const lines = [];
  if (hud) {
    lines.push(`${pad}  ${paint(C.cyan, '◈ KRONVEX NEURAL CHESS')}   ${paint(C.gray, '│')}   ${paint(C.gold, hud)}`);
    lines.push('');
  }
  lines.push(`${pad}   ${paint(C.gold, files)}`);
  lines.push(topBorder);

  for (let r = 0; r < 8; r++) {
    const rankNum = String(8 - r);
    let topSubRow = `${pad}  ${paint(C.azure, '║')}`;
    let midSubRow = `${pad}${paint(C.gold, rankNum)} ${paint(C.azure, '║')}`;

    for (let c = 0; c < 8; c++) {
      const p = board[r][c];
      const darkSq = (r + c) % 2 === 1;
      const isCursor = cursor && cursor.r === r && cursor.c === c;
      const isSelected = selected && selected.r === r && selected.c === c;
      const isTarget = legalTargets.has(`${r},${c}`);
      const isLast = lastMove && ((lastMove.fr === r && lastMove.fc === c) || (lastMove.tr === r && lastMove.tc === c));

      let sqBg = darkSq ? bg(16, 25, 44) : bg(48, 66, 98);
      if (isLast) sqBg = bg(32, 74, 88);
      if (isTarget) sqBg = bg(24, 98, 52);
      if (isSelected) sqBg = bg(138, 102, 16);
      if (isCursor) sqBg = bg(196, 152, 20);

      const glyph = p === '.' ? (isTarget ? '●' : ' ') : PIECE_UNICODE[p];
      let pFg = '';
      if (p === '.' && isTarget) pFg = fg(34, 229, 58);
      else if (p !== '.') pFg = isCursor ? fg(10, 16, 28) : isWhitePiece(p) ? fg(0, 224, 255) : fg(255, 68, 96);

      if (USE_COLOR) {
        topSubRow += `${sqBg}${isCursor ? fg(10, 16, 28) + ' ┌───┐ ' : ' '.repeat(sqW)}${C.reset}`;
        midSubRow += `${sqBg}${C.bold}${pFg}${isCursor ? ' │ ' + glyph + ' │ ' : '   ' + glyph + '   '}${C.reset}`;
      } else {
        topSubRow += ' '.repeat(sqW);
        midSubRow += `   ${glyph}   `;
      }
    }
    topSubRow += paint(C.azure, '║');
    midSubRow += `${paint(C.azure, '║')} ${paint(C.gold, rankNum)}`;
    lines.push(topSubRow, midSubRow);
  }

  lines.push(botBorder);
  lines.push(`${pad}   ${paint(C.gold, files)}`);
  return lines.join('\n');
}

// ── Secret Scanner Patterns (Zero-Dep Gitleaks-Inspired Engine) ─────────────
const SECRET_PATTERNS = [
  { id: 'aws-access-key', severity: 'HIGH', re: /\bAKIA[0-9A-Z]{16}\b/g },
  { id: 'github-pat', severity: 'CRITICAL', re: /\b(ghp_[A-Za-z0-9]{36}|github_pat_[A-Za-z0-9_]{22,})\b/g },
  { id: 'openai-key', severity: 'CRITICAL', re: /\bsk-(proj-)?[A-Za-z0-9_-]{24,}\b/g },
  { id: 'anthropic-key', severity: 'CRITICAL', re: /\bsk-ant-[A-Za-z0-9_-]{20,}\b/g },
  { id: 'google-api-key', severity: 'HIGH', re: /\bAIza[0-9A-Za-z_-]{35}\b/g },
  { id: 'stripe-live-key', severity: 'CRITICAL', re: /\b(sk_live_|rk_live_)[0-9a-zA-Z]{24,}\b/g },
  { id: 'slack-token', severity: 'HIGH', re: /\bxox[baprs]-[0-9a-zA-Z-]{10,}\b/g },
  { id: 'private-key-pem', severity: 'CRITICAL', re: /-----BEGIN (RSA |EC |OPENSSH |DSA )?PRIVATE KEY-----/g },
];

const IGNORE_DIRS = new Set(['.git', 'node_modules', 'dist', 'build', '.next', '.vite', 'coverage', '__pycache__', '.venv']);
const BINARY_EXTS = new Set(['.png', '.jpg', '.jpeg', '.webp', '.gif', '.ico', '.pdf', '.zip', '.gz', '.exe', '.dll', '.wasm', '.onnx', '.gguf', '.woff2', '.ttf', '.mp4', '.mp3']);

function redactMatch(s) {
  if (s.length <= 10) return '****';
  return `${s.slice(0, 6)}****${s.slice(-4)}`;
}

// ── Argument Parser ─────────────────────────────────────────────────────────
export function parseArgs(argv) {
  const positionals = [];
  const flags = {};
  const valueFlags = new Set([
    'output-format', 'category', 'limit', 'dir', 'transport', 'mode', 'client', 'theme',
    'lang', 'count', 'depth', 'move', 'model', 'host', 'algo', 'verify',
  ]);
  for (let i = 0; i < argv.length; i++) {
    const tok = argv[i];
    if (tok === '--') {
      positionals.push(...argv.slice(i + 1));
      break;
    }
    if (tok.startsWith('--')) {
      const eq = tok.indexOf('=');
      if (eq !== -1) {
        flags[tok.slice(2, eq)] = tok.slice(eq + 1);
      } else {
        const key = tok.slice(2);
        const next = argv[i + 1];
        if (next !== undefined && !next.startsWith('-') && valueFlags.has(key)) {
          flags[key] = next;
          i++;
        } else {
          flags[key] = true;
        }
      }
    } else if (tok.startsWith('-') && tok.length === 2) {
      const shortMap = { h: 'help', v: 'version', j: 'json', n: 'limit', c: 'category', d: 'dir', l: 'lang', m: 'model' };
      const mapped = shortMap[tok[1]] || tok[1];
      const next = argv[i + 1];
      if (next !== undefined && !next.startsWith('-') && valueFlags.has(mapped)) {
        flags[mapped] = next;
        i++;
      } else {
        flags[mapped] = true;
      }
    } else {
      positionals.push(tok);
    }
  }

  let format = 'text';
  if (flags.json === true) format = 'json';
  else if (typeof flags['output-format'] === 'string') {
    const f = flags['output-format'].toLowerCase();
    if (f === 'json' || f === 'stream-json' || f === 'text') format = f;
  }

  if (typeof flags.theme === 'string' && THEMES[flags.theme]) {
    ACTIVE_THEME = flags.theme;
  }

  return { positionals, flags, format, noCache: Boolean(flags['no-cache'] || flags.refresh) };
}

function splitReplLine(line) {
  const out = [];
  let cur = '';
  let quote = null;
  for (let i = 0; i < line.length; i++) {
    const ch = line[i];
    if (quote) {
      if (ch === quote) quote = null;
      else cur += ch;
    } else if (ch === '"' || ch === "'") {
      quote = ch;
    } else if (/\s/.test(ch)) {
      if (cur) { out.push(cur); cur = ''; }
    } else {
      cur += ch;
    }
  }
  if (cur) out.push(cur);
  return out;
}

function buildAgentSkillMarkdown() {
  return `---
name: kronvex-cli
description: Official KRONVEX Terminal CLI v${CLI_VERSION} (33 capabilities) — live Code-Mode MCP, local AI chat/bench, secret scanner, live SEO/Security URL auditor, SHA-256 verifier, repo topology, BibTeX papers, SKILL.md installer, and terminal Arcade games.
---

# KRONVEX Official CLI v${CLI_VERSION} (\`kronvex\` / \`kvx\`)

Pass \`--json\` or \`--output-format stream-json\` on any command for deterministic AI-agent output.

## Key Commands (33 Total Capabilities)
- **Platform & MCP:** \`doctor\`, \`search "<q>"\`, \`apps\`, \`models [recommend]\`, \`skills [install]\`, \`research [bibtex]\`, \`top21\`, \`services\`, \`work\`, \`mcp [discover|tools|call|config]\`, \`open <page>\`
- **Local AI & Knowledge:** \`chat "<prompt>"\` (local Ollama), \`playbook [term]\`, \`bench\` (Local-AI Tier S/A/B/C)
- **Security & Code Audits:** \`scan [dir]\` (secret leak CI gate), \`audit <url>\` (Security + SEO/GEO/AEO score), \`hash <file> --verify <hex>\`, \`tree [dir]\` (topology + LOC)
- **Terminal Arcade:** \`chess [--move e2e4]\`, \`quiz [--lang en|fr|ar]\`, \`defender\`
- **System & Brand:** \`crest\`, \`theme [kronvex|medallion|ruby|sentinel]\`, \`completion [powershell|bash|zsh]\`, \`cache\`, \`skill-md\`, \`update\`
`;
}

function renderMainHelp() {
  return [
    '',
    renderKronvexHeroHeader(ACTIVE_THEME),
    '',
    `  ${paint(C.bold + C.white, 'KRONVEX Official CLI')} ${paint(C.cyan, `v${CLI_VERSION}`)} — 33-Capability Agent-Native & Developer Terminal`,
    '',
    `  ${paint(C.bold + C.gold, 'PLATFORM & MCP')}`,
    `    ${paint(C.green, 'doctor')}                          Live health, latency & host hardware diagnostics`,
    `    ${paint(C.green, 'search <query>')}                  Live fuzzy search via https://mcp.kronvex.org/mcp`,
    `    ${paint(C.green, 'apps / models / skills')}          Browse apps, recommend local AI models & install SKILL.md`,
    `    ${paint(C.green, 'research / top21')}                Top 21 frontier papers (+ BibTeX) & GitHub/HF radar`,
    `    ${paint(C.green, 'mcp [discover|tools|call|config]')}Inspect & configure KRONVEX Code-Mode MCP Server`,
    `    ${paint(C.green, 'services / work / open [page]')}   Explore services, case studies & launch pages`,
    '',
    `  ${paint(C.bold + C.gold, 'LOCAL AI & ENGINEERING AUDITS')}`,
    `    ${paint(C.cyan, 'chat [prompt]')}                   Stream local AI chat via Ollama (127.0.0.1:11434)`,
    `    ${paint(C.cyan, 'playbook [term]')}                 KRONVEX 6 engineering laws & 16-term AI/SEO glossary`,
    `    ${paint(C.cyan, 'bench')}                           Benchmark CPU, SHA-256 MB/s & Local-AI Readiness Tier`,
    `    ${paint(C.cyan, 'scan [dir]')}                      Scan repository for leaked API keys & secrets (CI gate)`,
    `    ${paint(C.cyan, 'audit <url>')}                     Live Website Security Headers + SEO/GEO/AEO audit (/100)`,
    `    ${paint(C.cyan, 'hash <file> [--verify <hex>]')}    Compute & verify SHA-256 / SHA-512 file integrity`,
    `    ${paint(C.cyan, 'tree [dir] [--depth 3]')}          Codebase topology tree & language LOC breakdown`,
    '',
    `  ${paint(C.bold + C.gold, 'KRONVEX TERMINAL ARCADE')}`,
    `    ${paint(C.ruby, 'chess [--move e2e4]')}             Play Alpha-Beta Neural Chess on TrueColor ANSI board`,
    `    ${paint(C.ruby, 'quiz [--lang en|fr|ar]')}          Trilingual Python / JS / AI / Security Quiz Arena`,
    `    ${paint(C.ruby, 'defender')}                        Play real-time ANSI Orbital Defender in your shell`,
    '',
    `  ${paint(C.bold + C.gold, 'SYSTEM, BRAND & AGENT TOOLS')}`,
    `    ${paint(C.amber, 'crest / theme [name]')}            Cyber-Owl Hex-Core emblem & 4 Owl brand themes`,
    `    ${paint(C.amber, 'completion [powershell|bash|zsh]')}Generate native shell Tab-completion script`,
    `    ${paint(C.amber, 'skill-md / cache / update')}       Print agent SKILL.md, manage cache, or self-update`,
    '',
    `  ${paint(C.bold + C.gold, 'GLOBAL FLAGS')}`,
    '    --json  ·  --output-format <text|json|stream-json>  ·  --theme <name>  ·  --no-cache',
    '',
  ].join('\n');
}

// ── Original Core Command Handlers ──────────────────────────────────────────
async function cmdDoctor(opts) {
  if (opts.format === 'stream-json') emitStreamEvent('step', { message: 'Probing kronvex.org and mcp.kronvex.org/mcp' });
  const spin = startSpinner(opts, 'Probing kronvex.org & mcp.kronvex.org/mcp...');
  const host = {
    os: `${os.platform()} ${os.release()} (${os.arch()})`,
    node: process.version,
    cpuCores: os.cpus().length,
    ramGb: Number((os.totalmem() / 1024 ** 3).toFixed(1)),
    cacheDir: CACHE_DIR,
  };
  let mcpHealth = { reachable: false, latencyMs: null, protocolVersion: null, tools: [] };
  let apiHealth = { reachable: false, latencyMs: null, syncedAt: null, counts: null };

  const [mcpRes, apiRes] = await Promise.allSettled([
    callRemoteMcp('server/discover', {}),
    (async () => {
      const t0 = performance.now();
      const catalog = await fetchJsonWithCache('catalog', { noCache: true });
      return { latencyMs: Math.round(performance.now() - t0), catalog };
    })(),
  ]);
  spin.stop();

  if (mcpRes.status === 'fulfilled') {
    mcpHealth = {
      reachable: true,
      latencyMs: mcpRes.value.latencyMs,
      protocolVersion: mcpRes.value.result?.protocolVersion ?? '2026-07-28',
      tools: mcpRes.value.result?.capabilities?.tools ?? [],
    };
  } else mcpHealth.error = mcpRes.reason instanceof Error ? mcpRes.reason.message : String(mcpRes.reason);

  if (apiRes.status === 'fulfilled') {
    const { latencyMs, catalog } = apiRes.value;
    apiHealth = {
      reachable: true,
      latencyMs,
      syncedAt: catalog.syncedAt ?? catalog.generatedAt,
      counts: {
        apps: catalog.apps?.length ?? 0,
        models: catalog.models?.length ?? 0,
        skills: catalog.skills?.length ?? 0,
        caseStudies: catalog.caseStudies?.length ?? 0,
      },
    };
  } else apiHealth.error = apiRes.reason instanceof Error ? apiRes.reason.message : String(apiRes.reason);

  const report = {
    cli: { name: CLI_NAME, version: CLI_VERSION, theme: ACTIVE_THEME, capabilities: 33 },
    status: mcpHealth.reachable && apiHealth.reachable ? 'operational' : 'degraded',
    host,
    endpoints: { mcp: mcpHealth, catalogApi: apiHealth },
  };
  outputResult(opts, report, () =>
    [
      '',
      ReplSkin.toolCard('Diagnostics', 'Probed kronvex.org & mcp.kronvex.org/mcp', report.status.toUpperCase()),
      '',
      ReplSkin.kv('Platform API', apiHealth.reachable ? paint(C.green, `ONLINE (${apiHealth.latencyMs}ms · synced ${String(apiHealth.syncedAt).slice(0, 10)})`) : paint(C.ruby, `OFFLINE (${apiHealth.error})`)),
      ReplSkin.kv('Remote MCP Gateway', mcpHealth.reachable ? paint(C.green, `ONLINE (${mcpHealth.latencyMs}ms · MCP ${mcpHealth.protocolVersion})`) : paint(C.ruby, `OFFLINE (${mcpHealth.error})`)),
      ReplSkin.kv('MCP Code-Mode Tools', mcpHealth.tools.join(', ') || '-'),
      ReplSkin.kv('Host OS / Runtime', `${host.os} · Node ${host.node}`),
      ReplSkin.kv('Host Hardware', `${host.cpuCores} CPU cores · ${host.ramGb} GB RAM`),
      ReplSkin.kv('Local Cache Dir', host.cacheDir),
      '',
    ].join('\n')
  );
  return report.status === 'operational' ? 0 : 1;
}

async function cmdSearch(args, opts) {
  const query = args.join(' ').trim();
  if (!query) {
    process.stderr.write(ReplSkin.error('Usage: kronvex search <query> [--category apps|models|skills|research|services|work] [--limit 10]\n'));
    return 2;
  }
  const category = typeof opts.flags.category === 'string' ? opts.flags.category : 'all';
  const limit = Number(opts.flags.limit) || 10;
  if (opts.format === 'stream-json') emitStreamEvent('step', { message: `Querying ${MCP_ENDPOINT} for "${query}"` });
  const spin = startSpinner(opts, `MCP kronvex_search("${query}")...`);

  let payload;
  let source = 'remote-mcp';
  try {
    const rpc = await callRemoteMcp('tools/call', { name: 'kronvex_search', arguments: { query, category, limit } });
    payload = rpc.result?.structuredContent ?? { query, totalMatches: 0, results: [] };
    payload.latencyMs = rpc.latencyMs;
  } catch {
    source = 'edge-cache-fallback';
    const [catalog, research] = await Promise.all([fetchJsonWithCache('catalog', opts), fetchJsonWithCache('research', opts)]);
    const q = query.toLowerCase();
    const results = [];
    for (const a of catalog.apps || []) if (`${a.name} ${a.tagline}`.toLowerCase().includes(q)) results.push({ type: 'app', id: a.id, title: a.name, summary: a.tagline, url: `${SITE_ORIGIN}/apps` });
    for (const m of catalog.models || []) if (`${m.name} ${m.tagline || ''} ${m.description || ''}`.toLowerCase().includes(q)) results.push({ type: 'model', id: m.id, title: m.name, summary: m.tagline || m.description, url: `${SITE_ORIGIN}/models` });
    for (const s of catalog.skills || []) if (`${s.name} ${s.description}`.toLowerCase().includes(q)) results.push({ type: 'skill', id: s.id, title: s.name, summary: s.description, url: `${SITE_ORIGIN}/skills` });
    for (const p of research.papers || []) if (`${p.title} ${p.lab} ${p.category}`.toLowerCase().includes(q)) results.push({ type: 'paper', id: p.arxivId, title: p.title, summary: `${p.lab} (${p.year})`, url: p.arxivUrl });
    payload = { query, category, totalMatches: results.length, results: results.slice(0, limit) };
  } finally {
    spin.stop();
  }
  payload.source = source;
  outputResult(opts, payload, () =>
    [
      '',
      ReplSkin.toolCard('MCP Search', `Query: "${query}" · ${payload.totalMatches} match(es)`, payload.latencyMs ? `${payload.latencyMs}ms` : source),
      '',
      ReplSkin.table(['TYPE', 'TITLE', 'SUMMARY', 'URL'], (payload.results || []).map((r) => [r.type, r.title, r.summary, r.url]), 38),
      '',
    ].join('\n')
  );
  return 0;
}

async function cmdApps(args, opts) {
  const sub = (args[0] || 'list').toLowerCase();
  const catalog = await fetchJsonWithCache('catalog', opts);
  const apps = catalog.apps || [];
  if (sub === 'info' && args[1]) {
    const needle = args[1].toLowerCase();
    const app = apps.find((a) => a.id.toLowerCase() === needle || a.name.toLowerCase().includes(needle));
    if (!app) { process.stderr.write(ReplSkin.error(`App not found: ${args[1]}\n`)); return 1; }
    outputResult(opts, app, () =>
      [
        '',
        ReplSkin.toolCard('App Inspect', `${app.name} ${app.version}`, app.status),
        '',
        ReplSkin.kv('ID', app.id),
        ReplSkin.kv('Pillar', app.pillar),
        ReplSkin.kv('Platforms', (app.platforms || []).join(', ')),
        ReplSkin.kv('License', app.license),
        ReplSkin.kv('Tagline', app.tagline),
        '',
        ReplSkin.table(['FORMAT', 'PLATFORM', 'ARCH', 'SIZE', 'LABEL'], (app.artifacts || []).map((art) => [art.format, art.platform, art.arch, art.size, art.label])),
        '',
      ].join('\n')
    );
    return 0;
  }
  outputResult(opts, { count: apps.length, apps }, () =>
    [
      '',
      ReplSkin.toolCard('Apps Catalog', 'Signed Windows & Android Releases', `${apps.length} apps`),
      '',
      ReplSkin.table(['ID', 'NAME', 'VERSION', 'PLATFORMS', 'STATUS'], apps.map((a) => [a.id, a.name, a.version, (a.platforms || []).join(', '), a.status])),
      '',
    ].join('\n')
  );
  return 0;
}

async function cmdModels(args, opts) {
  const sub = (args[0] || 'list').toLowerCase();
  const catalog = await fetchJsonWithCache('catalog', opts);
  const models = catalog.models || [];
  if (sub === 'recommend') {
    const ramGb = Number((os.totalmem() / 1024 ** 3).toFixed(1));
    const cores = os.cpus().length;
    const scored = models.map((m) => {
      const minRam = Number(m.minRamGb ?? m.ramRequiredGb ?? 4);
      const fit = ramGb >= minRam * 1.5 ? 'OPTIMAL' : ramGb >= minRam ? 'SUPPORTED' : 'HEAVY';
      return { id: m.id, name: m.name, params: m.params, quantization: m.quantization || m.format, minRamGb: minRam, fit };
    });
    const out = { hostRamGb: ramGb, hostCpuCores: cores, recommendations: scored };
    outputResult(opts, out, () =>
      [
        '',
        ReplSkin.toolCard('Hardware Fit', `Matched ${models.length} local AI models`, `${ramGb} GB RAM · ${cores} threads`),
        '',
        ReplSkin.table(['MODEL', 'PARAMS', 'FORMAT', 'MIN RAM', 'FIT'], scored.map((m) => [m.name, m.params || '-', m.quantization || '-', `${m.minRamGb} GB`, m.fit])),
        '',
      ].join('\n')
    );
    return 0;
  }
  if (sub === 'info' && args[1]) {
    const needle = args[1].toLowerCase();
    const model = models.find((m) => m.id.toLowerCase() === needle || m.name.toLowerCase().includes(needle));
    if (!model) { process.stderr.write(ReplSkin.error(`Model not found: ${args[1]}\n`)); return 1; }
    outputResult(opts, model, () =>
      [
        '',
        ReplSkin.toolCard('Model Inspect', model.name, model.params || 'ONNX/GGUF'),
        '',
        ReplSkin.kv('ID', model.id),
        ReplSkin.kv('Parameters', model.params || '-'),
        ReplSkin.kv('Quantization', model.quantization || '-'),
        ReplSkin.kv('Tagline', model.tagline || model.description || '-'),
        '',
      ].join('\n')
    );
    return 0;
  }
  outputResult(opts, { count: models.length, models }, () =>
    [
      '',
      ReplSkin.toolCard('AI Models', 'Local-First WebGPU / ONNX / GGUF Models', `${models.length} verified`),
      '',
      ReplSkin.table(['ID', 'NAME', 'PARAMS', 'FAMILY / FORMAT'], models.map((m) => [m.id, m.name, m.params || '-', m.family || m.quantization || 'ONNX/GGUF'])),
      '',
    ].join('\n')
  );
  return 0;
}

async function cmdSkills(args, opts) {
  const sub = (args[0] || 'list').toLowerCase();
  const catalog = await fetchJsonWithCache('catalog', opts);
  const skills = catalog.skills || [];
  if (sub === 'inspect' && args[1]) {
    const needle = args[1].toLowerCase();
    const skill = skills.find((s) => s.id.toLowerCase() === needle || s.name.toLowerCase().includes(needle));
    if (!skill) { process.stderr.write(ReplSkin.error(`Skill not found: ${args[1]}\n`)); return 1; }
    outputResult(opts, skill, () =>
      [
        '',
        ReplSkin.toolCard('Skill Inspect', `${skill.name} v${skill.version || '1.0'}`, skill.category),
        '',
        ReplSkin.kv('ID', skill.id),
        ReplSkin.kv('Agents', (skill.compatibleAgents || []).join(', ')),
        ReplSkin.kv('Tags', (skill.tags || []).join(', ')),
        '',
        paint(C.slate, skill.contentPreview || skill.description),
        '',
      ].join('\n')
    );
    return 0;
  }
  if (sub === 'install' && args[1]) {
    const needle = args[1].toLowerCase();
    const skill = skills.find((s) => s.id.toLowerCase() === needle || s.name.toLowerCase().includes(needle));
    if (!skill) { process.stderr.write(ReplSkin.error(`Skill not found: ${args[1]}\n`)); return 1; }
    const baseDir = path.resolve(typeof opts.flags.dir === 'string' ? opts.flags.dir : path.join(process.cwd(), '.kronvex-skills'));
    const safeId = skill.id.replace(/[^a-zA-Z0-9_-]/g, '');
    const targetDir = path.join(baseDir, safeId);
    fs.mkdirSync(targetDir, { recursive: true });
    const targetFile = path.join(targetDir, 'SKILL.md');
    const body = skill.contentPreview
      ? `${skill.contentPreview}\n\n<!-- Full interactive skill bundle: ${SITE_ORIGIN}/skills -->\n`
      : `---\nname: ${safeId}\ndescription: ${skill.description}\n---\n\n# ${skill.name}\n\n${skill.description}\n`;
    fs.writeFileSync(targetFile, body, 'utf-8');
    const out = { installed: true, id: skill.id, path: targetFile, bytes: Buffer.byteLength(body, 'utf-8') };
    outputResult(opts, out, () => `\n${ReplSkin.success(`Installed ${paint(C.bold + C.white, skill.id)} -> ${paint(C.cyan, targetFile)} (${out.bytes} bytes)`)}\n`);
    return 0;
  }
  outputResult(opts, { count: skills.length, skills }, () =>
    [
      '',
      ReplSkin.toolCard('Agent Skills', 'Portable SKILL.md Workflows', `${skills.length} curated`),
      '',
      ReplSkin.table(['ID', 'NAME', 'CATEGORY', 'TAGS'], skills.map((s) => [s.id, s.name, s.category, (s.tags || []).slice(0, 3).join(', ')])),
      '',
    ].join('\n')
  );
  return 0;
}

async function cmdResearch(args, opts) {
  const sub = (args[0] || 'list').toLowerCase();
  const data = await fetchJsonWithCache('research', opts);
  const papers = data.papers || [];
  if (sub === 'bibtex' && args[1]) {
    const needle = args[1].toLowerCase();
    const paper = papers.find((p) => String(p.rank) === needle || String(p.arxivId).toLowerCase() === needle || p.title.toLowerCase().includes(needle));
    if (!paper) { process.stderr.write(ReplSkin.error(`Paper not found: ${args[1]}\n`)); return 1; }
    const bib = toBibtex(paper);
    outputResult(opts, { rank: paper.rank, arxivId: paper.arxivId, title: paper.title, bibtex: bib }, () => bib);
    return 0;
  }
  let filtered = papers;
  if (sub === 'search' && args[1]) {
    const q = args.slice(1).join(' ').toLowerCase();
    filtered = papers.filter((p) => `${p.title} ${p.lab} ${p.category} ${p.breakthrough}`.toLowerCase().includes(q));
  }
  const limit = Number(opts.flags.limit) || 21;
  filtered = filtered.slice(0, limit);
  outputResult(opts, { count: filtered.length, papers: filtered }, () =>
    [
      '',
      ReplSkin.toolCard('Research Radar', 'Top 21 Frontier AI & Computing Papers', `${filtered.length} papers`),
      '',
      ReplSkin.table(['#', 'LAB', 'YEAR', 'ARXIV', 'TITLE'], filtered.map((p) => [p.rank, p.lab, p.year, p.arxivId, p.title]), 42),
      '',
    ].join('\n')
  );
  return 0;
}

async function cmdTop21(args, opts) {
  const board = (args[0] || 'github').toLowerCase();
  const data = await fetchJsonWithCache('top21', opts);
  const limit = Number(opts.flags.limit) || 10;
  let list = [];
  let title = 'Top 21 GitHub All-Time Most Starred';
  if (board === 'hf' || board === 'huggingface') { list = data.huggingfaceAllTime || data.huggingfaceTrending || []; title = 'Top 21 Hugging Face AI Models'; }
  else if (board === 'weekly') { list = data.githubWeekly || data.weeklyBreakouts || []; title = 'Top 21 Weekly GitHub Breakouts'; }
  else list = data.githubAllTime || data.allTimeStarred || [];
  const sliced = list.slice(0, limit);
  outputResult(opts, { board, syncedAt: data.syncedAt, count: sliced.length, items: sliced }, () =>
    [
      '',
      ReplSkin.toolCard('Top 21 Radar', title, `synced ${String(data.syncedAt || '').slice(0, 10)}`),
      '',
      ReplSkin.table(['#', 'NAME / REPO', 'METRIC', 'LANGUAGE / TAG'], sliced.map((it, idx) => [idx + 1, it.fullName || it.name || it.id || '-', it.stars ?? it.downloads ?? it.likes ?? '-', it.language || it.pipelineTag || it.category || '-'])),
      '',
    ].join('\n')
  );
  return 0;
}

async function cmdMcp(args, opts) {
  const sub = (args[0] || 'discover').toLowerCase();
  if (sub === 'config') {
    const client = args[1] || opts.flags.client || 'antigravity';
    const transport = opts.flags.transport === 'stdio' ? 'stdio' : 'http';
    const snippet = buildMcpClientConfig(client, transport);
    outputResult(opts, { client, transport, endpoint: MCP_ENDPOINT, config: snippet }, () =>
      ['', ReplSkin.toolCard('MCP Config', `Generated ${transport.toUpperCase()} setup for ${client}`, MCP_ENDPOINT), '', snippet, ''].join('\n')
    );
    return 0;
  }
  const spin = startSpinner(opts, `Calling ${MCP_ENDPOINT} (${sub})...`);
  try {
    if (sub === 'tools') {
      const rpc = await callRemoteMcp('tools/list', {});
      spin.stop();
      const tools = rpc.result?.tools || [];
      outputResult(opts, { latencyMs: rpc.latencyMs, count: tools.length, tools }, () =>
        ['', ReplSkin.toolCard('MCP Tools', `${MCP_ENDPOINT} · Code Mode`, `${rpc.latencyMs}ms · ${tools.length} tools`), '', ReplSkin.table(['TOOL', 'READ-ONLY', 'DESCRIPTION'], tools.map((t) => [t.name, String(Boolean(t.annotations?.readOnlyHint)), t.description]), 52), ''].join('\n')
      );
      return 0;
    }
    if (sub === 'call' && args[1]) {
      const toolName = args[1];
      let toolArgs = {};
      if (args[2]) {
        try { toolArgs = JSON.parse(args.slice(2).join(' ')); } catch {
          spin.stop();
          process.stderr.write(ReplSkin.error('Tool arguments must be valid JSON.\n'));
          return 2;
        }
      }
      const rpc = await callRemoteMcp('tools/call', { name: toolName, arguments: toolArgs });
      spin.stop();
      outputResult(opts, { latencyMs: rpc.latencyMs, result: rpc.result }, () => JSON.stringify(rpc.result?.structuredContent ?? rpc.result, null, 2));
      return 0;
    }
    const rpc = await callRemoteMcp('server/discover', {});
    spin.stop();
    outputResult(opts, { endpoint: MCP_ENDPOINT, latencyMs: rpc.latencyMs, discovery: rpc.result }, () =>
      [
        '',
        ReplSkin.toolCard('MCP Discover', MCP_ENDPOINT, `${rpc.latencyMs}ms · ${rpc.result?.protocolVersion}`),
        '',
        ReplSkin.kv('Server', `${rpc.result?.serverInfo?.name} v${rpc.result?.serverInfo?.version}`),
        ReplSkin.kv('Read-Only', String(rpc.result?.readOnly)),
        ReplSkin.kv('Tools', (rpc.result?.capabilities?.tools || []).join(', ')),
        ReplSkin.kv('Resources', (rpc.result?.capabilities?.resources || []).join(', ')),
        '',
      ].join('\n')
    );
    return 0;
  } finally {
    spin.stop();
  }
}

async function cmdServicesOrWork(kind, opts) {
  const catalog = await fetchJsonWithCache('catalog', opts);
  if (kind === 'services') {
    const items = catalog.services || [];
    outputResult(opts, { count: items.length, services: items }, () =>
      ['', ReplSkin.toolCard('Services', 'Custom Software & AI-Native Engineering', `${items.length} offerings`), '', ReplSkin.table(['ID', 'SERVICE', 'CORE STACK'], items.map((s) => [s.id, s.name, (s.stack || []).join(', ')])), ''].join('\n')
    );
    return 0;
  }
  const items = catalog.caseStudies || [];
  outputResult(opts, { count: items.length, caseStudies: items }, () =>
    ['', ReplSkin.toolCard('Case Studies', 'Verified Production Systems (kronvex.org/work)', `${items.length} systems`), '', ReplSkin.table(['ID', 'CATEGORY', 'SYSTEM', 'URL'], items.map((c) => [c.id, c.category, c.title, c.url])), ''].join('\n')
  );
  return 0;
}

// ═══════════════════════════════════════════════════════════════════════════
// 12 NEW COMMANDS (v2.0.0 — 21 -> 33 Capabilities!)
// ═══════════════════════════════════════════════════════════════════════════

// 1. `kronvex chess` — Playable TrueColor Terminal Alpha-Beta Chess
async function cmdChess(args, opts) {
  const depth = Number(opts.flags.depth) || 2;
  let board = boardFromStrings(CHESS_INITIAL);

  // Single-shot / agent mode (`--move e2e4` or `--json`)
  if (typeof opts.flags.move === 'string' || opts.format !== 'text' || !process.stdin.isTTY) {
    const uci = String(opts.flags.move || args[0] || '').toLowerCase();
    let playerMove = null;
    let aiReply = null;
    if (uci) {
      const from = sqToCoord(uci.slice(0, 2));
      const to = sqToCoord(uci.slice(2, 4));
      const legal = generateLegalMoves(board, 'w');
      const found = from && to && legal.find((m) => m.fr === from.r && m.fc === from.c && m.tr === to.r && m.tc === to.c);
      if (!found) {
        process.stderr.write(ReplSkin.error(`Illegal move "${uci}". Example legal opening: e2e4, d2d4, g1f3\n`));
        return 2;
      }
      board = applyMove(board, found);
      playerMove = uci;
      aiReply = pickAiMove(board, depth);
      if (aiReply) board = applyMove(board, aiReply.move);
    }
    const nextLegal = generateLegalMoves(board, 'w').map((m) => `${coordToSq(m.fr, m.fc)}${coordToSq(m.tr, m.tc)}`);
    const out = {
      game: 'kronvex-neural-chess',
      playerMove,
      aiMove: aiReply?.uci ?? null,
      evalCp: aiReply?.evalCp ?? evaluateBoard(board),
      fen: boardToFen(board, 'w'),
      legalMovesCount: nextLegal.length,
      sampleLegalMoves: nextLegal.slice(0, 12),
    };
    outputResult(opts, out, () =>
      [
        '',
        ReplSkin.toolCard('Neural Chess', playerMove ? `You: ${playerMove} · AI: ${aiReply?.uci ?? 'none'}` : 'Ready (pass --move e2e4 or run interactively)', `depth ${depth}`),
        renderChessBoard(board, aiReply?.move ?? null),
      ].join('\n')
    );
    return 0;
  }

  // Interactive Full-Screen In-Place Chess (Alternate Buffer · Arrow Keys + Space/Enter · Zero Scrolling!)
  const history = [];
  let lastMove = null;
  let moveNum = 1;
  let gameOver = false;
  const cursor = { r: 6, c: 4 }; // Start on e2 White pawn
  let selected = null;
  let statusMsg = 'Use Arrows/WASD to move cursor · Enter/Space to pick & place · U undo · Q quit';

  const getLegalFor = (r, c) =>
    generateLegalMoves(board, 'w').filter((m) => m.fr === r && m.fc === c);

  const redraw = () => {
    const rows = process.stdout.rows || 30;
    const topPad = '\n'.repeat(Math.max(1, Math.floor((rows - 24) / 2)));
    const pad = centerPad(62);
    const legalTargets = new Set(
      selected ? getLegalFor(selected.r, selected.c).map((m) => `${m.tr},${m.tc}`) : []
    );
    const evalScore = (evaluateBoard(board) / 100).toFixed(2);
    const sqName = coordToSq(cursor.r, cursor.c);
    const frame =
      `\x1b[H\x1b[J${topPad}` +
      renderChessBoard(
        board,
        lastMove,
        `Move #${moveNum} · Eval ${Number(evalScore) >= 0 ? '+' : ''}${evalScore} · Cursor ${sqName.toUpperCase()}`,
        { cursor, selected, legalTargets }
      ) +
      `\n\n${pad}  ${paint(gameOver ? C.gold : C.slate, statusMsg)}\n` +
      `${pad}  ${paint(C.gray, '[Arrows/WASD] Move   [Enter/Space] Select/Drop   [Esc] Cancel   [U] Undo   [Q] Quit')}\n`;
    process.stdout.write(frame);
  };

  return new Promise((resolve) => {
    readline.emitKeypressEvents(process.stdin);
    process.stdin.setRawMode(true);
    process.stdin.resume();
    process.stdout.write('\x1b[?1049h\x1b[?25l');

    const cleanup = () => {
      process.stdin.removeListener('keypress', onKey);
      process.stdin.setRawMode(false);
      process.stdout.write('\x1b[?25h\x1b[?1049l');
      process.stdout.write(`\n${ReplSkin.toolCard('KRONVEX Neural Chess', statusMsg, `Moves: ${moveNum}`)}\n\n`);
      resolve(0);
    };

    const onKey = (_, key) => {
      if (!key) return;
      if (key.name === 'q' || (key.ctrl && key.name === 'c')) return cleanup();
      if (gameOver) return;

      if (key.name === 'up' || key.name === 'w') cursor.r = (cursor.r + 7) % 8;
      else if (key.name === 'down' || key.name === 's') cursor.r = (cursor.r + 1) % 8;
      else if (key.name === 'left' || key.name === 'a') cursor.c = (cursor.c + 7) % 8;
      else if (key.name === 'right' || key.name === 'd') cursor.c = (cursor.c + 1) % 8;
      else if (key.name === 'escape') {
        selected = null;
        statusMsg = 'Selection cleared. Pick any Cyan (White) piece with Enter/Space.';
      } else if (key.name === 'u' && history.length) {
        board = history.pop();
        lastMove = null;
        selected = null;
        moveNum = Math.max(1, moveNum - 1);
        statusMsg = 'Undid last move.';
      } else if (key.name === 'return' || key.name === 'space') {
        if (!selected) {
          const piece = board[cursor.r][cursor.c];
          if (!isWhitePiece(piece)) {
            statusMsg = 'Select one of your Cyan (White) pieces first.';
          } else {
            const movesFromSq = getLegalFor(cursor.r, cursor.c);
            if (!movesFromSq.length) {
              statusMsg = `No legal moves for ${coordToSq(cursor.r, cursor.c)}.`;
            } else {
              selected = { r: cursor.r, c: cursor.c };
              statusMsg = `Selected ${coordToSq(selected.r, selected.c).toUpperCase()} — move to any GREEN square and press Enter/Space.`;
            }
          }
        } else if (selected.r === cursor.r && selected.c === cursor.c) {
          selected = null;
          statusMsg = 'Deselected piece.';
        } else {
          const legalFrom = getLegalFor(selected.r, selected.c);
          const chosen = legalFrom.find((m) => m.tr === cursor.r && m.tc === cursor.c);
          if (!chosen) {
            if (isWhitePiece(board[cursor.r][cursor.c]) && getLegalFor(cursor.r, cursor.c).length) {
              selected = { r: cursor.r, c: cursor.c };
              statusMsg = `Switched selection to ${coordToSq(selected.r, selected.c).toUpperCase()}.`;
            } else {
              statusMsg = 'Not a legal destination (choose a GREEN highlighted square or press Esc).';
            }
          } else {
            const playerUci = `${coordToSq(chosen.fr, chosen.fc)}${coordToSq(chosen.tr, chosen.tc)}`;
            history.push(cloneBoard(board));
            board = applyMove(board, chosen);
            selected = null;
            const ai = pickAiMove(board, depth);
            if (!ai) {
              lastMove = chosen;
              gameOver = true;
              statusMsg = isKingInCheck(board, 'b')
                ? 'CHECKMATE! You defeated KRONVEX AI! Press Q to exit.'
                : 'STALEMATE! Draw. Press Q to exit.';
            } else {
              board = applyMove(board, ai.move);
              lastMove = ai.move;
              moveNum++;
              const nextLegal = generateLegalMoves(board, 'w');
              if (!nextLegal.length) {
                gameOver = true;
                statusMsg = isKingInCheck(board, 'w')
                  ? `CHECKMATE! KRONVEX AI played ${ai.uci} and won. Press Q to exit.`
                  : 'STALEMATE! Draw. Press Q to exit.';
              } else {
                statusMsg = `You played ${playerUci}  ·  AI replied ${ai.uci}${isKingInCheck(board, 'w') ? '  ⚠ CHECK!' : ''}`;
              }
            }
          }
        }
      }
      redraw();
    };

    process.stdin.on('keypress', onKey);
    redraw();
  });
}

// 2. `kronvex quiz` — Trilingual EN/FR/AR Tech & AI Mastery Arena
async function cmdQuiz(args, opts) {
  const langRaw = String(opts.flags.lang || args[0] || 'en').toLowerCase();
  const lang = ['en', 'fr', 'ar'].includes(langRaw) ? langRaw : 'en';
  const count = Math.max(1, Math.min(QUIZ_BANK.length, Number(opts.flags.count) || 5));
  const selected = QUIZ_BANK.slice(0, count).map((item) => ({ id: item.id, topic: item.topic, ...item[lang] }));

  if (opts.format !== 'text' || !process.stdin.isTTY) {
    outputResult(opts, { lang, count: selected.length, questions: selected }, () =>
      ['', ReplSkin.toolCard('Tech & AI Quiz', `Language: ${lang.toUpperCase()}`, `${selected.length} questions`), '', ReplSkin.table(['#', 'TOPIC', 'QUESTION'], selected.map((q) => [q.id, q.topic, q.q]), 52), ''].join('\n')
    );
    return 0;
  }

  process.stdout.write(`\n${ReplSkin.toolCard('KRONVEX Tech & AI Quiz Arena', `Language: ${lang.toUpperCase()} · Answer 1-4 (q to quit)`, `${count} questions`)}\n\n`);
  const rl = readline.createInterface({ input: process.stdin, output: process.stdout });
  const ask = (q) => new Promise((res) => rl.question(q, res));
  let score = 0;
  let streak = 0;
  try {
    for (let i = 0; i < selected.length; i++) {
      const q = selected[i];
      process.stdout.write(`  ${paint(C.gold, `[${i + 1}/${selected.length}]`)} ${paint(C.cyan, q.topic)}\n  ${paint(C.bold + C.white, q.q)}\n`);
      q.opts.forEach((opt, idx) => process.stdout.write(`    ${paint(C.green, `${idx + 1}.`)} ${opt}\n`));
      const ans = (await ask(`  ${paint(C.cyan, 'Answer (1-4) ❯')} `)).trim().toLowerCase();
      if (ans === 'q' || ans === 'quit') break;
      const picked = Number(ans) - 1;
      if (picked === q.ans) {
        score++;
        streak++;
        process.stdout.write(`${ReplSkin.success(`Correct! (Streak: ${streak}) — ${q.exp}`)}\n\n`);
      } else {
        streak = 0;
        process.stdout.write(`${ReplSkin.error(`Correct answer: ${q.ans + 1}) ${q.opts[q.ans]} — ${q.exp}`)}\n\n`);
      }
    }
    const pct = Math.round((score / selected.length) * 100);
    const tier = pct >= 90 ? 'S' : pct >= 70 ? 'A' : pct >= 50 ? 'B' : 'C';
    process.stdout.write(`${ReplSkin.toolCard('Quiz Complete', `Score: ${score}/${selected.length} (${pct}%)`, `Rank ${tier}`)}\n\n`);
  } finally {
    rl.close();
  }
  return 0;
}

// 3. `kronvex defender` — Real-Time ANSI Terminal Orbital Defender
function loadArcadeHighScore() {
  try {
    if (fs.existsSync(ARCADE_FILE)) return JSON.parse(fs.readFileSync(ARCADE_FILE, 'utf-8')).defenderHighScore || 0;
  } catch { /* ignore */ }
  return 0;
}

function saveArcadeHighScore(score) {
  try {
    ensureDir(KRONVEX_HOME);
    const prev = loadArcadeHighScore();
    if (score > prev) fs.writeFileSync(ARCADE_FILE, JSON.stringify({ defenderHighScore: score }, null, 2), 'utf-8');
  } catch { /* ignore */ }
}

async function cmdDefender(opts) {
  const highScore = loadArcadeHighScore();
  if (opts.format !== 'text' || !process.stdin.isTTY || typeof process.stdin.setRawMode !== 'function') {
    outputResult(opts, { game: 'kronvex-orbital-defender', interactiveOnly: true, highScore, controls: 'A/D or Left/Right to steer, Space to fire, Q to quit' }, () =>
      ['', ReplSkin.toolCard('Orbital Defender', 'Run interactively in a TTY terminal to play', `Best: ${highScore}`), ReplSkin.kv('Controls', 'A/D or Arrows to move · Space to shoot · Q to quit'), ''].join('\n')
    );
    return 0;
  }

  const cols = process.stdout.columns || 100;
  const rows = process.stdout.rows || 30;
  const W = Math.min(76, Math.max(54, Math.floor(cols * 0.7)));
  const H = Math.min(22, Math.max(16, rows - 8));
  const pad = centerPad(W + 2);
  const topPad = '\n'.repeat(Math.max(1, Math.floor((rows - H - 5) / 2)));

  let shipX = Math.floor(W / 2);
  let score = 0;
  let lives = 3;
  let wave = 1;
  let tick = 0;
  let bullets = [];
  let enemies = [];
  const stars = Array.from({ length: 24 }, (_, idx) => ({
    x: (idx * 17 + 5) % (W - 2) + 1,
    y: (idx * 7 + 2) % (H - 3),
  }));

  const spawnWave = () => {
    enemies = [];
    const count = Math.min(12, 5 + wave);
    const spacing = Math.max(5, Math.floor((W - 8) / Math.min(6, count)));
    for (let i = 0; i < count; i++) {
      enemies.push({
        x: 4 + (i % 6) * spacing,
        y: 1 + Math.floor(i / 6) * 2,
        dir: i % 2 === 0 ? 1 : -1,
      });
    }
  };
  spawnWave();

  return new Promise((resolve) => {
    readline.emitKeypressEvents(process.stdin);
    process.stdin.setRawMode(true);
    process.stdin.resume();
    process.stdout.write('\x1b[?1049h\x1b[?25l\x1b[2J');

    const cleanup = () => {
      clearInterval(loop);
      process.stdin.removeListener('keypress', onKey);
      process.stdin.setRawMode(false);
      process.stdout.write('\x1b[?25h\x1b[?1049l');
      saveArcadeHighScore(score);
      process.stdout.write(`\n${ReplSkin.toolCard('Orbital Defender — Game Over', `Final Score: ${score} · Wave ${wave}`, `Best: ${Math.max(highScore, score)}`)}\n\n`);
      resolve(0);
    };

    const onKey = (_, key) => {
      if (!key) return;
      if (key.name === 'q' || (key.ctrl && key.name === 'c')) return cleanup();
      if (key.name === 'left' || key.name === 'a') shipX = Math.max(2, shipX - 3);
      if (key.name === 'right' || key.name === 'd') shipX = Math.min(W - 3, shipX + 3);
      if (key.name === 'space') bullets.push({ x: shipX, y: H - 2 });
    };
    process.stdin.on('keypress', onKey);

    const loop = setInterval(() => {
      tick++;
      bullets = bullets.map((b) => ({ x: b.x, y: b.y - 1 })).filter((b) => b.y >= 0);

      if (tick % Math.max(3, 8 - wave) === 0) {
        for (const e of enemies) {
          e.x += e.dir * 2;
          if (e.x <= 2 || e.x >= W - 3) { e.dir *= -1; e.y++; }
        }
      }

      for (let bi = bullets.length - 1; bi >= 0; bi--) {
        const hitIdx = enemies.findIndex((e) => Math.abs(e.x - bullets[bi].x) <= 2 && e.y === bullets[bi].y);
        if (hitIdx !== -1) {
          enemies.splice(hitIdx, 1);
          bullets.splice(bi, 1);
          score += 100 * wave;
        }
      }

      for (let ei = enemies.length - 1; ei >= 0; ei--) {
        if (enemies[ei].y >= H - 1) {
          enemies.splice(ei, 1);
          lives--;
        }
      }

      if (lives <= 0) return cleanup();
      if (enemies.length === 0) { wave++; spawnWave(); }

      const grid = Array.from({ length: H }, () => Array(W).fill(' '));
      for (const s of stars) grid[s.y][s.x] = '.';
      for (const e of enemies) {
        if (e.y >= 0 && e.y < H) {
          if (e.x > 0) grid[e.y][e.x - 1] = '<';
          grid[e.y][e.x] = 'E';
          if (e.x + 1 < W) grid[e.y][e.x + 1] = '>';
        }
      }
      for (const b of bullets) if (b.y >= 0 && b.y < H) grid[b.y][b.x] = '|';
      if (shipX > 0) grid[H - 1][shipX - 1] = '/';
      grid[H - 1][shipX] = '^';
      if (shipX + 1 < W) grid[H - 1][shipX + 1] = '\\';

      let frame = `\x1b[H${topPad}${pad}${paint(C.cyan, '◈ KRONVEX ORBITAL DEFENDER')}   ${paint(C.gold, `SCORE:${score}`)}   ${paint(C.green, `WAVE:${wave}`)}   ${paint(C.ruby, `LIVES:${'♥'.repeat(lives)}`)}   ${paint(C.gray, '[A/D · Space · Q]')}\n`;
      frame += `${pad}${paint(C.azure, `╔${'═'.repeat(W)}╗`)}\n`;
      for (let y = 0; y < H; y++) {
        let row = '';
        for (let x = 0; x < W; x++) {
          const ch = grid[y][x];
          if (ch === '^') row += paint(C.cyan, '▲');
          else if (ch === '/') row += paint(C.azure, '◢');
          else if (ch === '\\') row += paint(C.azure, '◣');
          else if (ch === 'E') row += paint(C.ruby, '◈');
          else if (ch === '<') row += paint(C.gold, '◄');
          else if (ch === '>') row += paint(C.gold, '►');
          else if (ch === '|') row += paint(C.green, '┃');
          else if (ch === '.') row += paint(C.gray, '·');
          else row += ' ';
        }
        frame += `${pad}${paint(C.azure, '║')}${row}${paint(C.azure, '║')}\n`;
      }
      frame += `${pad}${paint(C.azure, `╚${'═'.repeat(W)}╝`)}\n`;
      process.stdout.write(frame);
    }, 60);
  });
}

// 4. `kronvex chat` — Local AI Streaming Chat via Ollama
async function cmdChat(args, opts) {
  const host = String(opts.flags.host || process.env.OLLAMA_HOST || 'http://127.0.0.1:11434').replace(/\/$/, '');
  const prompt = args.join(' ').trim();
  let model = typeof opts.flags.model === 'string' ? opts.flags.model : '';

  const spin = startSpinner(opts, `Connecting to local Ollama (${host})...`);
  let availableModels = [];
  try {
    const tagsRes = await fetch(`${host}/api/tags`, { signal: AbortSignal.timeout(4000) });
    if (!tagsRes.ok) throw new Error(`HTTP ${tagsRes.status}`);
    const tagsJson = await tagsRes.json();
    availableModels = (tagsJson.models || []).map((m) => m.name);
    if (!model && availableModels.length) model = availableModels[0];
  } catch {
    spin.stop();
    const out = { reachable: false, host, hint: 'Start local Ollama (`ollama serve` then `ollama pull qwen2.5-coder:3b`) or use https://kronvex.org/models?tab=chat' };
    outputResult(opts, out, () =>
      [
        '',
        ReplSkin.toolCard('Local AI Chat (Ollama)', `No local server detected at ${host}`, 'OFFLINE'),
        ReplSkin.kv('Quick Start', 'Install Ollama -> run `ollama pull qwen2.5-coder:3b` -> `kronvex chat "Hello"`'),
        ReplSkin.kv('Zero-Install WebGPU', 'https://kronvex.org/models?tab=chat (runs 100% in browser)'),
        '',
      ].join('\n')
    );
    return 1;
  }
  spin.stop();

  if (!model) {
    process.stderr.write(ReplSkin.warn('Ollama is running, but no models are installed. Run `ollama pull qwen2.5-coder:3b`.\n'));
    return 1;
  }

  const sendPrompt = async (userText) => {
    const res = await fetch(`${host}/api/chat`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ model, stream: false, messages: [{ role: 'user', content: userText }] }),
    });
    if (!res.ok) throw new Error(`Ollama chat HTTP ${res.status}`);
    const data = await res.json();
    return data.message?.content ?? '';
  };

  if (prompt) {
    const s2 = startSpinner(opts, `Thinking locally on ${model}...`);
    const reply = await sendPrompt(prompt);
    s2.stop();
    outputResult(opts, { host, model, prompt, response: reply }, () =>
      ['', ReplSkin.toolCard('Local AI Chat', `Model: ${model}`, '100% Private Local'), '', `  ${reply.replace(/\n/g, '\n  ')}`, ''].join('\n')
    );
    return 0;
  }

  outputResult(opts, { host, activeModel: model, installedModels: availableModels }, () =>
    [
      '',
      ReplSkin.toolCard('Local AI Chat Ready', `Ollama at ${host} · Active: ${model}`, `${availableModels.length} model(s)`),
      ReplSkin.kv('Installed Models', availableModels.join(', ')),
      ReplSkin.kv('Example', `kronvex chat "Explain zero-downtime migrations" --model ${model}`),
      '',
    ].join('\n')
  );
  return 0;
}

// 5. `kronvex playbook` / `glossary`
async function cmdPlaybook(args, opts) {
  const q = args.join(' ').trim().toLowerCase();
  const terms = q
    ? GLOSSARY_TERMS.filter((g) => `${g.term} ${g.category} ${g.def}`.toLowerCase().includes(q))
    : GLOSSARY_TERMS;
  const out = { laws: q ? [] : PLAYBOOK_LAWS, glossaryCount: terms.length, glossary: terms };
  outputResult(opts, out, () => {
    const parts = ['', ReplSkin.toolCard('Engineering Playbook & Glossary', q ? `Filter: "${q}"` : '6 Laws · 16 Technical Terms', 'kronvex.org/playbook'), ''];
    if (!q) {
      parts.push(ReplSkin.table(['CODE', 'PRINCIPLE', 'STANDARD'], PLAYBOOK_LAWS.map((l) => [l.code, l.title, l.desc]), 54), '');
    }
    parts.push(ReplSkin.table(['TERM', 'DOMAIN', 'DEFINITION'], terms.map((t) => [t.term, t.category, t.def]), 56), '');
    return parts.join('\n');
  });
  return 0;
}

// 6. `kronvex bench` — Local Machine AI & Compute Benchmark
async function cmdBench(opts) {
  const spin = startSpinner(opts, 'Running local SHA-256, CPU & JSON benchmarks...');
  // 1. SHA-256 throughput over 16 MB
  const buf = Buffer.alloc(16 * 1024 * 1024, 0x4b);
  const tHash0 = performance.now();
  for (let i = 0; i < 4; i++) crypto.createHash('sha256').update(buf).digest('hex');
  const hashMs = Math.max(1, performance.now() - tHash0);
  const sha256MbPerSec = Math.round((64 / hashMs) * 1000);

  // 2. Prime sieve CPU compute
  const tCpu0 = performance.now();
  const limit = 250_000;
  const sieve = new Uint8Array(limit + 1);
  let primes = 0;
  for (let i = 2; i <= limit; i++) {
    if (!sieve[i]) {
      primes++;
      for (let j = i * i; j <= limit; j += i) sieve[j] = 1;
    }
  }
  const cpuMs = Number((performance.now() - tCpu0).toFixed(1));

  // 3. JSON parse/stringify throughput
  const sample = { org: 'KRONVEX', nodes: Array.from({ length: 120 }, (_, i) => ({ id: i, score: i * 1.5 })) };
  const tJson0 = performance.now();
  for (let i = 0; i < 500; i++) JSON.parse(JSON.stringify(sample));
  const jsonOpsPerSec = Math.round((500 / Math.max(1, performance.now() - tJson0)) * 1000);
  spin.stop();

  const ramGb = Number((os.totalmem() / 1024 ** 3).toFixed(1));
  const cores = os.cpus().length;
  const tier = ramGb >= 32 && cores >= 12 ? 'S (Workstation AI)' : ramGb >= 16 && cores >= 8 ? 'A (Pro Local AI)' : ramGb >= 8 ? 'B (Compact Models)' : 'C (Nano WebGPU)';
  const maxQuantModel = ramGb >= 32 ? '14B - 32B Q4_K_M' : ramGb >= 16 ? '7B - 14B Q4_K_M' : ramGb >= 8 ? '3B - 7B Q4_K_M' : '0.5B - 1.5B ONNX/GGUF';

  const report = {
    tier,
    recommendedMaxModel: maxQuantModel,
    host: { os: `${os.platform()} (${os.arch()})`, cpuCores: cores, ramGb, node: process.version },
    metrics: { sha256MbPerSec, primeSieveMs: cpuMs, primesFound: primes, jsonOpsPerSec },
  };

  outputResult(opts, report, () =>
    [
      '',
      ReplSkin.toolCard('Local Compute Benchmark', `Readiness Tier: ${tier}`, maxQuantModel),
      '',
      ReplSkin.kv('SHA-256 Throughput', paint(C.green, `${sha256MbPerSec} MB/s`)),
      ReplSkin.kv('CPU Sieve (250k)', paint(C.cyan, `${cpuMs} ms (${primes} primes)`)),
      ReplSkin.kv('JSON Pipeline Speed', paint(C.gold, `${jsonOpsPerSec.toLocaleString()} ops/sec`)),
      ReplSkin.kv('Host Hardware', `${cores} threads · ${ramGb} GB RAM · Node ${process.version}`),
      ReplSkin.kv('Recommended Local LLM', paint(C.bold + C.white, maxQuantModel)),
      '',
    ].join('\n')
  );
  return 0;
}

// 7. `kronvex scan` — Zero-Dep Secret & Credential Leak Scanner
async function cmdScan(args, opts) {
  const rootDir = path.resolve(args[0] || process.cwd());
  if (!fs.existsSync(rootDir)) {
    process.stderr.write(ReplSkin.error(`Directory not found: ${rootDir}\n`));
    return 2;
  }

  const findings = [];
  let filesScanned = 0;

  function walk(dir) {
    let entries;
    try { entries = fs.readdirSync(dir, { withFileTypes: true }); } catch { return; }
    for (const ent of entries) {
      if (IGNORE_DIRS.has(ent.name)) continue;
      const full = path.join(dir, ent.name);
      if (ent.isDirectory()) {
        walk(full);
      } else if (ent.isFile()) {
        const ext = path.extname(ent.name).toLowerCase();
        if (BINARY_EXTS.has(ext)) continue;
        let stat;
        try { stat = fs.statSync(full); } catch { continue; }
        if (stat.size > 1024 * 1024) continue;
        filesScanned++;
        let text;
        try { text = fs.readFileSync(full, 'utf-8'); } catch { continue; }
        const lines = text.split(/\r?\n/);
        for (let li = 0; li < lines.length; li++) {
          const line = lines[li];
          for (const pat of SECRET_PATTERNS) {
            pat.re.lastIndex = 0;
            const m = pat.re.exec(line);
            if (m) {
              findings.push({
                rule: pat.id,
                severity: pat.severity,
                file: path.relative(rootDir, full).replace(/\\/g, '/'),
                line: li + 1,
                redacted: redactMatch(m[0]),
              });
            }
          }
        }
      }
    }
  }
  walk(rootDir);

  const report = { root: rootDir, filesScanned, findingsCount: findings.length, clean: findings.length === 0, findings };
  outputResult(opts, report, () =>
    [
      '',
      ReplSkin.toolCard('Secret Leak Scanner', `Scanned ${filesScanned} files in ${path.basename(rootDir)}`, findings.length ? `${findings.length} ALERT(S)` : 'CLEAN · 0 LEAKS'),
      '',
      findings.length
        ? ReplSkin.table(['SEV', 'RULE', 'FILE:LINE', 'REDACTED'], findings.map((f) => [f.severity, f.rule, `${f.file}:${f.line}`, f.redacted]))
        : ReplSkin.success('Zero leaked API keys, tokens, or private keys detected.'),
      '',
    ].join('\n')
  );
  return findings.length === 0 ? 0 : 1;
}

// 8. `kronvex audit <url>` — Live Security Headers + SEO/GEO/AEO Inspector
async function cmdAudit(args, opts) {
  let rawUrl = args[0] || SITE_ORIGIN;
  if (!/^https?:\/\//i.test(rawUrl)) rawUrl = `https://${rawUrl}`;
  let parsed;
  try { parsed = new URL(rawUrl); } catch {
    process.stderr.write(ReplSkin.error(`Invalid URL: ${rawUrl}\n`));
    return 2;
  }

  const spin = startSpinner(opts, `Auditing Security + SEO/GEO/AEO on ${parsed.href}...`);
  const t0 = performance.now();
  const [pageRes, robotsRes, llmsRes] = await Promise.allSettled([
    fetch(parsed.href, { headers: { 'User-Agent': `kronvex-cli-auditor/${CLI_VERSION}` }, signal: AbortSignal.timeout(10_000) }),
    fetch(`${parsed.origin}/robots.txt`, { signal: AbortSignal.timeout(5000) }),
    fetch(`${parsed.origin}/llms.txt`, { signal: AbortSignal.timeout(5000) }),
  ]);
  const latencyMs = Math.round(performance.now() - t0);
  spin.stop();

  if (pageRes.status !== 'fulfilled') {
    throw new Error(`Failed to fetch ${parsed.href}: ${pageRes.reason?.message || pageRes.reason}`);
  }
  const res = pageRes.value;
  const html = await res.text();
  const h = res.headers;

  const secChecks = [
    { name: 'HTTPS', pass: parsed.protocol === 'https:', weight: 20 },
    { name: 'Strict-Transport-Security (HSTS)', pass: Boolean(h.get('strict-transport-security')), weight: 20 },
    { name: 'Content-Security-Policy (CSP)', pass: Boolean(h.get('content-security-policy')), weight: 20 },
    { name: 'X-Frame-Options', pass: Boolean(h.get('x-frame-options')), weight: 15 },
    { name: 'X-Content-Type-Options', pass: /nosniff/i.test(h.get('x-content-type-options') || ''), weight: 10 },
    { name: 'Referrer-Policy', pass: Boolean(h.get('referrer-policy')), weight: 10 },
    { name: 'Permissions-Policy', pass: Boolean(h.get('permissions-policy')), weight: 5 },
  ];
  const securityScore = secChecks.reduce((a, c) => a + (c.pass ? c.weight : 0), 0);

  const titleMatch = html.match(/<title[^>]*>([^<]+)<\/title>/i);
  const descMatch = html.match(/<meta[^>]+name=["']description["'][^>]+content=["']([^"']+)["']/i);
  const canonicalMatch = html.match(/<link[^>]+rel=["']canonical["'][^>]+href=["']([^"']+)["']/i);
  const jsonLdCount = (html.match(/application\/ld\+json/gi) || []).length;
  const hasH1 = /<h1[\s>]/i.test(html);
  const hasRobots = robotsRes.status === 'fulfilled' && robotsRes.value.ok;
  const hasLlms = llmsRes.status === 'fulfilled' && llmsRes.value.ok;

  const seoChecks = [
    { name: 'Title Tag', pass: Boolean(titleMatch), weight: 20 },
    { name: 'Meta Description', pass: Boolean(descMatch), weight: 15 },
    { name: 'Canonical URL', pass: Boolean(canonicalMatch), weight: 15 },
    { name: 'Primary H1 Heading', pass: hasH1, weight: 10 },
    { name: 'JSON-LD Structured Data', pass: jsonLdCount > 0, weight: 15 },
    { name: 'robots.txt Reachable', pass: hasRobots, weight: 10 },
    { name: 'llms.txt (GEO/AI Discovery)', pass: hasLlms, weight: 15 },
  ];
  const seoGeoScore = seoChecks.reduce((a, c) => a + (c.pass ? c.weight : 0), 0);
  const overall = Math.round((securityScore + seoGeoScore) / 2);
  const grade = overall >= 95 ? 'A+' : overall >= 88 ? 'A' : overall >= 75 ? 'B' : overall >= 60 ? 'C' : 'D';

  const report = {
    url: parsed.href,
    httpStatus: res.status,
    latencyMs,
    overallScore: overall,
    grade,
    securityScore,
    seoGeoScore,
    title: titleMatch?.[1]?.trim() ?? null,
    jsonLdBlocks: jsonLdCount,
    checks: [...secChecks, ...seoChecks],
  };

  outputResult(opts, report, () =>
    [
      '',
      ReplSkin.toolCard('Live Security & SEO/GEO Audit', parsed.href, `Grade ${grade} · ${overall}/100 · ${latencyMs}ms`),
      '',
      ReplSkin.kv('Security Headers Score', paint(securityScore >= 90 ? C.green : C.gold, `${securityScore} / 100`)),
      ReplSkin.kv('SEO & GEO/AI Score', paint(seoGeoScore >= 90 ? C.green : C.gold, `${seoGeoScore} / 100`)),
      ReplSkin.kv('JSON-LD Schema Blocks', String(jsonLdCount)),
      '',
      ReplSkin.table(['CHECK', 'STATUS', 'WEIGHT'], report.checks.map((c) => [c.name, c.pass ? 'PASS' : 'MISSING', `${c.weight} pts`])),
      '',
    ].join('\n')
  );
  return 0;
}

// 9. `kronvex hash <file>` — Streaming SHA-256 / SHA-512 Verifier
async function cmdHash(args, opts) {
  const filePath = args[0];
  if (!filePath) {
    process.stderr.write(ReplSkin.error('Usage: kronvex hash <file> [--algo sha256|sha512] [--verify <expectedHex>]\n'));
    return 2;
  }
  const abs = path.resolve(filePath);
  if (!fs.existsSync(abs) || !fs.statSync(abs).isFile()) {
    process.stderr.write(ReplSkin.error(`File not found: ${abs}\n`));
    return 1;
  }
  const algo = String(opts.flags.algo || 'sha256').toLowerCase() === 'sha512' ? 'sha512' : 'sha256';
  const digest = await new Promise((resolve, reject) => {
    const h = crypto.createHash(algo);
    const stream = fs.createReadStream(abs);
    stream.on('data', (chunk) => h.update(chunk));
    stream.on('end', () => resolve(h.digest('hex')));
    stream.on('error', reject);
  });

  const stat = fs.statSync(abs);
  let verified = null;
  if (typeof opts.flags.verify === 'string') {
    const expected = opts.flags.verify.trim().toLowerCase();
    const aBuf = Buffer.from(digest, 'utf-8');
    const bBuf = Buffer.from(expected, 'utf-8');
    verified = aBuf.length === bBuf.length && crypto.timingSafeEqual(aBuf, bBuf);
  }

  const out = { file: abs, bytes: stat.size, algorithm: algo, hash: digest, verified };
  outputResult(opts, out, () =>
    [
      '',
      ReplSkin.toolCard('Cryptographic Integrity', path.basename(abs), `${algo.toUpperCase()} · ${stat.size.toLocaleString()} bytes`),
      '',
      ReplSkin.kv(algo.toUpperCase(), digest),
      verified !== null ? ReplSkin.kv('Verification', verified ? paint(C.green, 'MATCH (AUTHENTIC)') : paint(C.ruby, 'MISMATCH (TAMPERED)')) : '',
      '',
    ].filter(Boolean).join('\n')
  );
  return verified === false ? 1 : 0;
}

// 10. `kronvex tree [dir]` — Codebase Topology & Language LOC Breakdown
async function cmdTree(args, opts) {
  const rootDir = path.resolve(args[0] || process.cwd());
  const maxDepth = Math.max(1, Math.min(6, Number(opts.flags.depth) || 2));
  if (!fs.existsSync(rootDir)) {
    process.stderr.write(ReplSkin.error(`Directory not found: ${rootDir}\n`));
    return 2;
  }

  const treeLines = [`  ${paint(C.cyan, path.basename(rootDir))}/`];
  const langStats = {};
  let totalFiles = 0;
  let totalDirs = 0;
  let totalLines = 0;

  function inspect(dir, prefix, depth) {
    let entries;
    try {
      entries = fs.readdirSync(dir, { withFileTypes: true })
        .filter((e) => !IGNORE_DIRS.has(e.name))
        .sort((a, b) => Number(b.isDirectory()) - Number(a.isDirectory()) || a.name.localeCompare(b.name));
    } catch { return; }

    entries.forEach((ent, idx) => {
      const isLast = idx === entries.length - 1;
      const full = path.join(dir, ent.name);
      const branch = isLast ? '└── ' : '├── ';
      const nextPrefix = prefix + (isLast ? '    ' : '│   ');

      if (ent.isDirectory()) {
        totalDirs++;
        if (depth <= maxDepth && treeLines.length < 60) {
          treeLines.push(`  ${paint(C.gray, prefix + branch)}${paint(C.cyan, ent.name + '/')}`);
        }
        inspect(full, nextPrefix, depth + 1);
      } else if (ent.isFile()) {
        totalFiles++;
        const ext = (path.extname(ent.name).slice(1) || 'other').toLowerCase();
        if (!langStats[ext]) langStats[ext] = { files: 0, lines: 0 };
        langStats[ext].files++;
        if (!BINARY_EXTS.has(`.${ext}`)) {
          try {
            const st = fs.statSync(full);
            if (st.size <= 512 * 1024) {
              const lc = fs.readFileSync(full, 'utf-8').split(/\r?\n/).length;
              langStats[ext].lines += lc;
              totalLines += lc;
            }
          } catch { /* ignore */ }
        }
        if (depth <= maxDepth && treeLines.length < 60) {
          treeLines.push(`  ${paint(C.gray, prefix + branch)}${paint(C.white, ent.name)}`);
        }
      }
    });
  }

  inspect(rootDir, '', 1);
  const topLangs = Object.entries(langStats)
    .sort((a, b) => b[1].lines - a[1].lines || b[1].files - a[1].files)
    .slice(0, 10)
    .map(([ext, st]) => ({ ext: `.${ext}`, files: st.files, lines: st.lines }));

  const out = { root: rootDir, totalDirs, totalFiles, totalLines, languages: topLangs };
  outputResult(opts, out, () =>
    [
      '',
      ReplSkin.toolCard('Codebase Topology', path.basename(rootDir), `${totalFiles} files · ${totalLines.toLocaleString()} LOC`),
      '',
      ...treeLines,
      '',
      ReplSkin.table(['EXT', 'FILES', 'LINES OF CODE'], topLangs.map((l) => [l.ext, l.files, l.lines.toLocaleString()])),
      '',
    ].join('\n')
  );
  return 0;
}

// 11. `kronvex open [page]` — Instant Platform Browser Launcher
const OPEN_ROUTES = {
  home: `${SITE_ORIGIN}/`,
  apps: `${SITE_ORIGIN}/apps`,
  models: `${SITE_ORIGIN}/models`,
  chat: `${SITE_ORIGIN}/models?tab=chat`,
  skills: `${SITE_ORIGIN}/skills`,
  mcp: `${SITE_ORIGIN}/mcp`,
  cli: `${SITE_ORIGIN}/cli`,
  work: `${SITE_ORIGIN}/work`,
  services: `${SITE_ORIGIN}/services`,
  playbook: `${SITE_ORIGIN}/playbook`,
  research: `${SITE_ORIGIN}/research`,
  top21: `${SITE_ORIGIN}/top-21`,
  arcade: `${SITE_ORIGIN}/arcade`,
  constellation: `${SITE_ORIGIN}/constellation`,
  enterprise: `${SITE_ORIGIN}/enterprise`,
  vision: `${SITE_ORIGIN}/vision`,
  contact: `${SITE_ORIGIN}/contact`,
  github: 'https://github.com/KRONVEX',
};

async function cmdOpen(args, opts) {
  const key = (args[0] || 'home').toLowerCase();
  const url = OPEN_ROUTES[key];
  if (!url) {
    process.stderr.write(ReplSkin.error(`Unknown target "${key}". Available: ${Object.keys(OPEN_ROUTES).join(', ')}\n`));
    return 2;
  }
  if (opts.format !== 'text') {
    outputResult(opts, { target: key, url, launched: false }, () => url);
    return 0;
  }
  const cmd = process.platform === 'win32' ? 'cmd' : process.platform === 'darwin' ? 'open' : 'xdg-open';
  const cmdArgs = process.platform === 'win32' ? ['/c', 'start', '', url] : [url];
  try {
    const child = spawn(cmd, cmdArgs, { detached: true, stdio: 'ignore' });
    child.unref();
    process.stdout.write(`\n${ReplSkin.success(`Opened ${paint(C.cyan, url)}`)}\n\n`);
  } catch {
    process.stdout.write(`\n${ReplSkin.info(`Visit: ${paint(C.cyan, url)}`)}\n\n`);
  }
  return 0;
}

// 12. `kronvex completion [powershell|bash|zsh]` — Native OS Tab-Completion
const ALL_TOP_COMMANDS = [
  'doctor', 'search', 'apps', 'models', 'skills', 'research', 'top21', 'mcp', 'services', 'work',
  'chat', 'playbook', 'glossary', 'bench', 'scan', 'audit', 'hash', 'tree', 'chess', 'quiz',
  'defender', 'open', 'completion', 'crest', 'theme', 'skill-md', 'cache', 'update', 'help',
];

async function cmdCompletion(args, opts) {
  const shell = (args[0] || (process.platform === 'win32' ? 'powershell' : 'bash')).toLowerCase();
  let script = '';
  if (shell === 'powershell' || shell === 'pwsh') {
    const list = ALL_TOP_COMMANDS.map((c) => `'${c}'`).join(', ');
    script = `Register-ArgumentCompleter -Native -CommandName @('kronvex','kvx') -ScriptBlock {\n  param($wordToComplete)\n  @(${list}) | Where-Object { $_ -like "$wordToComplete*" } | ForEach-Object { [System.Management.Automation.CompletionResult]::new($_, $_, 'ParameterValue', $_) }\n}`;
  } else if (shell === 'zsh') {
    script = `#compdef kronvex kvx\n_kronvex() { compadd ${ALL_TOP_COMMANDS.join(' ')}; }\ncompdef _kronvex kronvex kvx`;
  } else {
    script = `_kronvex_completions() { COMPREPLY=( $(compgen -W "${ALL_TOP_COMMANDS.join(' ')}" -- "\${COMP_WORDS[COMP_CWORD]}") ); }\ncomplete -F _kronvex_completions kronvex kvx`;
  }
  outputResult(opts, { shell, commands: ALL_TOP_COMMANDS.length, script }, () => script);
  return 0;
}

// ── Theme, Update & Cache Commands ──────────────────────────────────────────
async function cmdTheme(args, opts) {
  const req = args[0]?.toLowerCase();
  if (req) {
    if (!THEMES[req]) { process.stderr.write(ReplSkin.error(`Unknown theme "${req}". Available: ${Object.keys(THEMES).join(', ')}\n`)); return 2; }
    ACTIVE_THEME = req;
    saveTheme(req);
    outputResult(opts, { activeTheme: ACTIVE_THEME, label: THEMES[req].label }, () =>
      `\n${renderKronvexHeroHeader(ACTIVE_THEME)}\n\n${ReplSkin.success(`Theme switched to ${paint(C.bold + C.white, req)} — ${THEMES[req].label}`)}\n`
    );
    return 0;
  }
  const list = Object.values(THEMES).map((t) => ({ name: t.name, label: t.label, active: t.name === ACTIVE_THEME }));
  outputResult(opts, { activeTheme: ACTIVE_THEME, themes: list }, () =>
    ['', ReplSkin.toolCard('KRONVEX Owl Themes', `Active: ${ACTIVE_THEME}`, `${list.length} brand palettes`), '', ReplSkin.table(['THEME', 'STATUS', 'PALETTE'], list.map((t) => [t.name, t.active ? 'ACTIVE' : '-', t.label])), ''].join('\n')
  );
  return 0;
}

async function cmdUpdate(opts) {
  const target = path.join(KRONVEX_HOME, 'bin', 'kronvex.mjs');
  const spin = startSpinner(opts, `Fetching latest kronvex.mjs from ${SITE_ORIGIN}/cli/kronvex.mjs...`);
  try {
    const res = await fetch(`${SITE_ORIGIN}/cli/kronvex.mjs`, { headers: { 'User-Agent': `kronvex-cli/${CLI_VERSION}` } });
    if (!res.ok) throw new Error(`HTTP ${res.status} downloading kronvex.mjs`);
    const text = await res.text();
    const sha256 = crypto.createHash('sha256').update(text, 'utf-8').digest('hex');
    ensureDir(path.dirname(target));
    fs.writeFileSync(target, text, 'utf-8');
    spin.stop();
    const out = { updated: true, path: target, bytes: Buffer.byteLength(text, 'utf-8'), sha256 };
    outputResult(opts, out, () => ['', ReplSkin.success(`Updated KRONVEX CLI -> ${paint(C.cyan, target)} (${out.bytes} bytes)`), ReplSkin.kv('SHA-256', sha256), ''].join('\n'));
    return 0;
  } finally {
    spin.stop();
  }
}

async function cmdCache(args, opts) {
  const sub = (args[0] || 'status').toLowerCase();
  if (sub === 'clear') {
    let removed = 0;
    if (fs.existsSync(CACHE_DIR)) {
      for (const f of fs.readdirSync(CACHE_DIR)) { fs.unlinkSync(path.join(CACHE_DIR, f)); removed++; }
    }
    outputResult(opts, { cleared: true, removed }, () => `\n${ReplSkin.success(`Cleared ${removed} cached snapshot(s) from ${CACHE_DIR}`)}\n`);
    return 0;
  }
  const files = fs.existsSync(CACHE_DIR)
    ? fs.readdirSync(CACHE_DIR).map((f) => {
        const st = fs.statSync(path.join(CACHE_DIR, f));
        return { file: f, bytes: st.size, ageSeconds: Math.round((Date.now() - st.mtimeMs) / 1000) };
      })
    : [];
  outputResult(opts, { cacheDir: CACHE_DIR, ttlSeconds: CACHE_TTL_MS / 1000, files }, () =>
    ['', ReplSkin.toolCard('Local Cache', CACHE_DIR, `${files.length} snapshot(s)`), '', ReplSkin.table(['FILE', 'BYTES', 'AGE (S)'], files.map((f) => [f.file, f.bytes, f.ageSeconds])), ''].join('\n')
  );
  return 0;
}

// ── Main Dispatcher ─────────────────────────────────────────────────────────
export async function dispatch(argv) {
  const opts = parseArgs(argv);
  const [rawCmd, ...rest] = opts.positionals;
  const cmd = rawCmd ? rawCmd.replace(/^\//, '').toLowerCase() : '';

  if (opts.flags.version) {
    outputResult(opts, { name: CLI_NAME, version: CLI_VERSION, capabilities: 33, theme: ACTIVE_THEME, node: process.version }, () => `${CLI_NAME} v${CLI_VERSION}`);
    return 0;
  }
  if (opts.flags.help || cmd === 'help') {
    process.stdout.write(renderMainHelp());
    return 0;
  }
  if (!cmd) {
    if (!process.stdin.isTTY) { process.stdout.write(renderMainHelp()); return 0; }
    return runRepl();
  }

  try {
    switch (cmd) {
      case 'doctor': case 'status': return await cmdDoctor(opts);
      case 'search': return await cmdSearch(rest, opts);
      case 'apps': return await cmdApps(rest, opts);
      case 'models': return await cmdModels(rest, opts);
      case 'skills': return await cmdSkills(rest, opts);
      case 'research': case 'papers': return await cmdResearch(rest, opts);
      case 'top21': return await cmdTop21(rest, opts);
      case 'mcp': return await cmdMcp(rest, opts);
      case 'services': return await cmdServicesOrWork('services', opts);
      case 'work': case 'cases': return await cmdServicesOrWork('work', opts);
      case 'chess': return await cmdChess(rest, opts);
      case 'quiz': return await cmdQuiz(rest, opts);
      case 'defender': case 'arcade': return await cmdDefender(opts);
      case 'play': {
        const g = (rest[0] || 'chess').toLowerCase();
        if (g === 'quiz') return await cmdQuiz(rest.slice(1), opts);
        if (g === 'defender') return await cmdDefender(opts);
        return await cmdChess(rest.slice(1), opts);
      }
      case 'chat': return await cmdChat(rest, opts);
      case 'playbook': case 'glossary': return await cmdPlaybook(rest, opts);
      case 'bench': return await cmdBench(opts);
      case 'scan': return await cmdScan(rest, opts);
      case 'audit': return await cmdAudit(rest, opts);
      case 'hash': return await cmdHash(rest, opts);
      case 'tree': return await cmdTree(rest, opts);
      case 'open': return await cmdOpen(rest, opts);
      case 'completion': return await cmdCompletion(rest, opts);
      case 'crest': case 'logo': {
        outputResult(opts, { emblem: 'KRONVEX Cyber-Owl Hex-Core', theme: ACTIVE_THEME, version: CLI_VERSION }, () =>
          `\n${renderKronvexCrest()}\n\n${renderKronvexHeroHeader(ACTIVE_THEME)}\n\n  ${paint(C.gold, '◈')} ${paint(C.slate, 'KRONVEX — Cross-Platform Apps · Market Intelligence · Mission-Critical AI')}\n`
        );
        return 0;
      }
      case 'theme': return await cmdTheme(rest, opts);
      case 'update': return await cmdUpdate(opts);
      case 'skill-md': case 'skill': {
        const md = buildAgentSkillMarkdown();
        outputResult(opts, { name: 'kronvex-cli', version: CLI_VERSION, markdown: md }, () => md);
        return 0;
      }
      case 'cache': return await cmdCache(rest, opts);
      default:
        process.stderr.write(ReplSkin.error(`Unknown command: "${rawCmd}". Run \`kronvex --help\` for all 33 capabilities.\n`));
        return 2;
    }
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    if (opts.format === 'json') process.stdout.write(JSON.stringify({ ok: false, error: message }, null, 2) + '\n');
    else if (opts.format === 'stream-json') emitStreamEvent('error', { error: message });
    else process.stderr.write(ReplSkin.error(message) + '\n');
    return 1;
  }
}

// ── Stateful Interactive REPL ───────────────────────────────────────────────
const REPL_COMMANDS = [...ALL_TOP_COMMANDS, '/crest', '/theme', '/json', '/help', '/clear', '/exit'];

async function runRepl() {
  process.stdout.write(ReplSkin.banner());
  let jsonMode = false;
  let history = [];
  if (fs.existsSync(HISTORY_FILE)) {
    try { history = fs.readFileSync(HISTORY_FILE, 'utf-8').split('\n').filter(Boolean).slice(-120).reverse(); } catch { /* ignore */ }
  }

  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
    history,
    historySize: 120,
    completer: (line) => {
      const hits = REPL_COMMANDS.filter((c) => c.startsWith(line.trim()));
      return [hits.length ? hits : REPL_COMMANDS, line];
    },
  });

  const printPromptBar = () => {
    const theme = THEMES[ACTIVE_THEME] || THEMES.kronvex;
    const accentRgb = fg(...theme.accent);
    process.stdout.write(`${ReplSkin.statusFooter(jsonMode)}\n`);
    rl.setPrompt(`  ${paint(accentRgb, '❯')}${jsonMode ? paint(C.gold, ' [json]') : ''} `);
    rl.prompt();
  };

  printPromptBar();

  return new Promise((resolve) => {
    rl.on('line', async (rawLine) => {
      const line = rawLine.trim();
      if (!line) { rl.prompt(); return; }
      if (line === 'exit' || line === 'quit' || line === '/exit') { rl.close(); return; }
      if (line === 'clear' || line === '/clear') {
        process.stdout.write('\x1b[2J\x1b[0f');
        process.stdout.write(ReplSkin.banner());
        printPromptBar();
        return;
      }
      if (line === '/json') {
        jsonMode = !jsonMode;
        process.stdout.write(`\n${ReplSkin.info(`JSON agent mode ${jsonMode ? paint(C.green, 'ENABLED') : paint(C.slate, 'DISABLED')}`)}\n\n`);
        printPromptBar();
        return;
      }
      try { ensureDir(path.dirname(HISTORY_FILE)); fs.appendFileSync(HISTORY_FILE, line + '\n', 'utf-8'); } catch { /* ignore */ }

      const tokens = splitReplLine(line);
      if (jsonMode && !tokens.includes('--json')) tokens.push('--json');
      const baseCmd = (tokens[0] || '').replace(/^\//, '').toLowerCase();
      const needsExclusiveStdin = ['chess', 'defender', 'arcade', 'quiz', 'play'].includes(baseCmd) && !tokens.includes('--json');
      if (needsExclusiveStdin) rl.pause();
      await dispatch(tokens);
      if (needsExclusiveStdin) rl.resume();
      printPromptBar();
    });

    rl.on('close', () => {
      process.stdout.write(`\n${ReplSkin.info('Session closed. Keep engineering with KRONVEX.')}\n`);
      resolve(0);
    });
  });
}

const invokedDirectly =
  process.argv[1] &&
  (path.resolve(process.argv[1]) === path.resolve(new URL(import.meta.url).pathname.replace(/^\/([A-Za-z]:)/, '$1')) ||
    process.argv[1].endsWith('kronvex.mjs') ||
    process.argv[1].endsWith('kronvex') ||
    process.argv[1].endsWith('kvx'));

if (invokedDirectly) {
  const code = await dispatch(process.argv.slice(2));
  process.exit(code);
}

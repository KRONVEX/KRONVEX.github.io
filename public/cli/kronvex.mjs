#!/usr/bin/env node
/**
 * KRONVEX Official CLI (kronvex / kvx) — v1.2.0
 * Flagship Agent-Native & Human-First Terminal Interface
 * Features:
 *   - Authentic TrueColor Half-Block KRONVEX Owl Medallion Logo side-by-side with 3D "KRONVEX" Wordmark
 *   - 100% KRONVEX Owl Brand Palette (Medallion Cyan · Owl Neon Green · Crest Gold · Ruby Core)
 *   - High-Res 30x28 Pixel-Faithful KRONVEX Owl Medallion (/crest) & 4 Brand Themes (/theme)
 *   - Boxed Tool-Execution Cards, Animated Braille Spinner & Persistent Status Bar
 *   - Dual Interaction Model: Stateful Branded REPL + One-Shot Subcommand CLI
 *   - Agent-First Protocols: --json & --output-format stream-json (NDJSON)
 *   - Live MCP Client (https://mcp.kronvex.org/mcp) + 10-Min Offline Cache + Self-Updater
 *
 * Pure Node.js >= 18 · Zero Dependencies · Cross-Platform (Windows / macOS / Linux)
 * Docs & Install: https://kronvex.org/cli
 */

import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import readline from 'node:readline';
import crypto from 'node:crypto';
import { performance } from 'node:perf_hooks';

export const CLI_NAME = 'kronvex';
export const CLI_VERSION = '1.2.0';
export const SITE_ORIGIN = 'https://kronvex.org';
export const MCP_ENDPOINT = 'https://mcp.kronvex.org/mcp';

const CACHE_DIR = path.join(os.homedir(), '.kronvex', 'cache');
const HISTORY_FILE = path.join(os.homedir(), '.kronvex', 'history.txt');
const CONFIG_FILE = path.join(os.homedir(), '.kronvex', 'config.json');
const CACHE_TTL_MS = 10 * 60 * 1000;

// ── Authentic KRONVEX Owl Logo Palette (Sampled Directly from kronvex_avatar_github.png)
const USE_COLOR = Boolean(process.stdout.isTTY) && !process.env.NO_COLOR && process.env.TERM !== 'dumb';

const OWL_PALETTE = {
  C: [0, 212, 255],    // Electric Medallion Cyan
  B: [24, 138, 255],   // Royal Medallion Azure
  G: [34, 229, 58],    // Owl Neon Eye & Inner Crescent Green
  Y: [255, 224, 36],   // Solar Gold Upper Crests & Beak
  A: [255, 172, 18],   // Warm Gold Lower Crests & Arc
  R: [255, 46, 76],    // Chest Ruby Core & Lower Arc
  P: [255, 132, 152],  // Ruby Core Center Glow
  T: [178, 118, 68],   // Owl Warm Bronze Plumage
  D: [122, 78, 42],    // Owl Deep Bronze Shadow
  M: [236, 196, 154],  // Owl Cream Eye Disc
  N: [12, 24, 52],     // Deep Medallion Obsidian Navy
};

// 100% Authentic KRONVEX Owl-Inspired Themes (Zero third-party palettes)
const THEMES = {
  kronvex: {
    name: 'kronvex',
    label: 'KRONVEX Owl Signature (Cyan -> Neon Green -> Solar Gold -> Ruby Core)',
    stops: [
      [0, 212, 255],    // Medallion Electric Cyan
      [34, 229, 58],    // Owl Neon Eye Green
      [255, 224, 36],   // Crest Solar Gold
      [255, 46, 76],    // Chest Ruby Core
    ],
    accent: [34, 229, 58],      // Neon Owl Green
    secondary: [0, 212, 255],   // Medallion Cyan
    gold: [255, 214, 31],       // Crest Gold
    ruby: [255, 46, 76],        // Ruby Core
    border: [24, 138, 255],     // Medallion Azure
    warnBorder: [255, 172, 18], // Warm Crest Gold
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

function loadSavedTheme() {
  try {
    if (fs.existsSync(CONFIG_FILE)) {
      const cfg = JSON.parse(fs.readFileSync(CONFIG_FILE, 'utf-8'));
      if (cfg.theme && THEMES[cfg.theme]) return cfg.theme;
    }
  } catch {
    // Ignore config read errors
  }
  return 'kronvex';
}

function saveTheme(themeName) {
  try {
    ensureDir(path.dirname(CONFIG_FILE));
    fs.writeFileSync(CONFIG_FILE, JSON.stringify({ theme: themeName }, null, 2), 'utf-8');
  } catch {
    // Ignore config write errors
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

// ── Authentic KRONVEX Owl Logo Pixel Maps (Half-Block ▀ TrueColor Renderer) ──
// 16 cols x 14 rows = 7 terminal lines (exact match to 7-line 3D KRONVEX wordmark!)
const OWL_MINI_16x14 = [
  '.YY..CCCCCC..YY.',
  'YYY.CCNNNNCC.YYY',
  '.Y.CCGNNNNGCC.Y.',
  '..CCGTNTTNTGCC..',
  '.CCGNTTTTTTNGCC.',
  '.BCGMGGTTGGMGCB.',
  '.BCGMMTYYTMMGCB.',
  '.BCAGTTTTTTGACB.',
  '.BARTTTRRTTTRAB.',
  '.BBRTRRPPRRTRBB.',
  'A.BBRTRRRRTRBB.A',
  'AAA.BBTTTTBB.AAA',
  '.AA..BBBBBB..AA.',
  '......BBBB......',
];

// High-resolution 30x28 pixel-faithful KRONVEX Owl Medallion for `kronvex crest`
const OWL_CREST_30x28 = [
  '..............................',
  '.....YY.................YY....',
  '....YYYY...............YYYY...',
  '...YYYYY....CCCCCCCC....YYYYY.',
  '..YYYY...CCCCCCCCCCCCCC...YYYY',
  '.YYYYT..CCCCBNNNNNNBCCCC..TYYY',
  '.YY..Y.CCBNNGGNNNNGGNNBCC.Y..Y',
  '......CCNGGGNNNNNNNNGGGNCC....',
  '.....BCNGGNNNNNNNNNNNNGGNCB...',
  '....CCNGGNDDNNNNNNNNDDNGGNCC..',
  '....CNNGNNTTTTNNNNTTTTNNGNNC..',
  '...BBNGGNNTTMMTTTTMMTTNNGGNBB.',
  '...CNNGGNNTMGGTTTTGGMTNNGGNNC.',
  '...BNBGGNNTMGGTTYYGGMTNNGGBNB.',
  '...CNBGGNNTMMTTYYYYMMTNNGGBNC.',
  '...BNAGGNNTTTTTYYYYTTTNNGGANB.',
  '...BNAGGDTTTTTTTYYTTTTTDGGANB.',
  '...CNAAADTTTTTTRRRRTTTTDAAANC.',
  '...BBARADTTTTRTTTTTTRTTDARABB.',
  '....BARRDTTTRTTPPPPTTRTTDRRAB.',
  '..A..BBRRTTTTRPPPPPPTRTTTRRBB.',
  '.AAA..BBRTTTRTTPPPPTTRTTTRBB.A',
  'AAAA..BBNTTTTTTRRRRTTTTTNBB.AA',
  '.AAAA..BBNNNTTTTTTTTNNNBB.AAA.',
  '..AAA...BBBBBBNNNNBBBBBB..AA..',
  '...AA.....BBBBBBBBBBBB....A...',
  '.............BBBBBB...........',
  '..............................',
];

function renderPixelGridHalfBlock(grid, forceColor = false) {
  const colorEnabled = USE_COLOR || forceColor;
  const rows = [];
  for (let y = 0; y < grid.length; y += 2) {
    const topRow = grid[y];
    const botRow = grid[y + 1] || '.'.repeat(topRow.length);
    let line = '';
    for (let x = 0; x < topRow.length; x++) {
      const tc = topRow[x];
      const bc = botRow[x];
      const topRgb = OWL_PALETTE[tc] || null;
      const botRgb = OWL_PALETTE[bc] || null;

      if (!colorEnabled) {
        if (topRgb && botRgb) line += tc === 'G' || bc === 'G' ? '◈' : tc === 'P' || tc === 'R' ? '●' : '█';
        else if (topRgb) line += '▀';
        else if (botRgb) line += '▄';
        else line += ' ';
        continue;
      }

      if (topRgb && botRgb) {
        line += `\x1b[38;2;${topRgb[0]};${topRgb[1]};${topRgb[2]}m\x1b[48;2;${botRgb[0]};${botRgb[1]};${botRgb[2]}m▀\x1b[0m`;
      } else if (topRgb && !botRgb) {
        line += `\x1b[38;2;${topRgb[0]};${topRgb[1]};${topRgb[2]}m▀\x1b[0m`;
      } else if (!topRgb && botRgb) {
        line += `\x1b[38;2;${botRgb[0]};${botRgb[1]};${botRgb[2]}m▄\x1b[0m`;
      } else {
        line += ' ';
      }
    }
    rows.push(line);
  }
  return rows;
}

// ── 3D Pixel-Block "KRONVEX" Wordmark (Zero Gemini Chevron — Pure KRONVEX!) ─
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
      if (ci < chars.length - 1) grid[r].push(false); // Tight 1-col kerning -> 58 cols total
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

/** Side-by-side: Authentic TrueColor KRONVEX Owl Logo (16x7) + 3D "KRONVEX" Wordmark (58x7) = 79 cols! */
export function renderKronvexHeroHeader(themeName = ACTIVE_THEME, forceColor = false) {
  const owlLines = renderPixelGridHalfBlock(OWL_MINI_16x14, forceColor);
  const wordLines = renderWordmarkLines(themeName, forceColor);
  const out = [];
  for (let i = 0; i < Math.max(owlLines.length, wordLines.length); i++) {
    const left = owlLines[i] || ' '.repeat(16);
    const right = wordLines[i] || '';
    out.push(`  ${left}   ${right}`);
  }
  return out.join('\n');
}

export function renderKronvexCrest(forceColor = false) {
  return renderPixelGridHalfBlock(OWL_CREST_30x28, forceColor)
    .map((l) => `    ${l}`)
    .join('\n');
}

// ── Unified ReplSkin (100% KRONVEX Owl Palette) ─────────────────────────────
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

    const noticeText = `Connected to kronvex.org & mcp.kronvex.org/mcp · Read-Only Code Mode · 0 Deps`;
    const padNotice = Math.max(0, w - 4 - noticeText.length);

    return [
      '',
      renderKronvexHeroHeader(ACTIVE_THEME),
      '',
      `  ${paint(goldRgb, '◈')} ${paint(C.bold + C.white, 'KRONVEX')} ${paint(C.gray, '·')} ${paint(C.slate, 'Cross-Platform Apps · Market Intelligence · Mission-Critical AI')}`,
      '',
      `${paint(C.slate, '  Tips for getting started:')}`,
      `  ${paint(C.gray, '1.')} Run ${paint(accentRgb, 'doctor')}, ${paint(accentRgb, 'search "webgpu"')}, or ${paint(accentRgb, 'models recommend')} to inspect KRONVEX live.`,
      `  ${paint(C.gray, '2.')} Pass ${paint(secRgb, '--json')} or toggle ${paint(secRgb, '/json')} for deterministic AI-agent output.`,
      `  ${paint(C.gray, '3.')} Type ${paint(goldRgb, '/help')} for all commands · ${paint(goldRgb, '/crest')} for full Owl emblem · ${paint(goldRgb, '/theme')} for palettes.`,
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
  kv: (k, v) => `    ${paint(C.gray, k.padEnd(22))} ${paint(C.white, String(v))}`,

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

// ── Output Emitter (text | json | stream-json) ──────────────────────────────
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

function ensureDir(dir) {
  try {
    fs.mkdirSync(dir, { recursive: true });
  } catch {
    // Non-fatal
  }
}

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
      // Ignore cache write errors
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

function buildAgentSkillMarkdown() {
  return `---
name: kronvex-cli
description: Official KRONVEX Terminal CLI (kronvex / kvx v${CLI_VERSION}) for querying apps, local WebGPU AI models, SKILL.md agent bundles, Top 21 research papers + BibTeX, live GitHub/Hugging Face radar, and remote Code-Mode MCP (mcp.kronvex.org/mcp).
---

# KRONVEX Official CLI (\`kronvex\` / \`kvx\`)

Always pass \`--json\` (or \`--output-format json\`) when invoking from an AI agent for deterministic structured output, or \`--output-format stream-json\` for NDJSON event streaming.

## Core Commands
- \`kronvex doctor --json\` — Verify live latency & health of \`kronvex.org\`, \`mcp.kronvex.org/mcp\`, and local machine RAM/CPU.
- \`kronvex search "<query>" [--category apps|models|skills|research|services|work] --json\` — Live Code-Mode search via \`https://mcp.kronvex.org/mcp\`.
- \`kronvex apps list --json\` / \`kronvex apps info <id> --json\` — Inspect signed Windows & Android apps.
- \`kronvex models list --json\` / \`kronvex models recommend --json\` — Match local WebGPU/GGUF models against host RAM/CPU.
- \`kronvex skills list --json\` / \`kronvex skills install <id> --dir ./.skills\` — Download & install KRONVEX \`SKILL.md\` bundles locally.
- \`kronvex research list --json\` / \`kronvex research bibtex <rank|arxivId>\` — Export verified frontier arXiv BibTeX citations.
- \`kronvex top21 [github|hf|weekly] --json\` — Inspect live 6-hour synced GitHub & Hugging Face Top 21 leaderboards.
- \`kronvex mcp discover --json\` / \`kronvex mcp tools --json\` / \`kronvex mcp config <antigravity|claude|cursor|vscode|windsurf|cline|codex>\` — Inspect and configure the KRONVEX MCP Server.
- \`kronvex update\` — Self-update the installed \`kronvex\` binary from \`https://kronvex.org/cli/kronvex.mjs\`.
`;
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

// ── Argument Parser ─────────────────────────────────────────────────────────
export function parseArgs(argv) {
  const positionals = [];
  const flags = {};
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
        if (
          next !== undefined &&
          !next.startsWith('-') &&
          ['output-format', 'category', 'limit', 'dir', 'transport', 'mode', 'client', 'theme'].includes(key)
        ) {
          flags[key] = next;
          i++;
        } else {
          flags[key] = true;
        }
      }
    } else if (tok.startsWith('-') && tok.length === 2) {
      const shortMap = { h: 'help', v: 'version', j: 'json', n: 'limit', c: 'category', d: 'dir' };
      const mapped = shortMap[tok[1]] || tok[1];
      const next = argv[i + 1];
      if (next !== undefined && !next.startsWith('-') && ['limit', 'category', 'dir'].includes(mapped)) {
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

  return {
    positionals,
    flags,
    format,
    noCache: Boolean(flags['no-cache'] || flags.refresh),
  };
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
      if (cur) {
        out.push(cur);
        cur = '';
      }
    } else {
      cur += ch;
    }
  }
  if (cur) out.push(cur);
  return out;
}

function renderMainHelp() {
  return [
    '',
    renderKronvexHeroHeader(ACTIVE_THEME),
    '',
    `  ${paint(C.bold + C.white, 'KRONVEX Official CLI')} ${paint(C.cyan, `v${CLI_VERSION}`)} — Agent-Native Terminal for ${paint(C.green, 'kronvex.org')}`,
    '',
    `  ${paint(C.bold + C.gold, 'USAGE')}`,
    '    kronvex                         Launch branded interactive REPL',
    '    kronvex <command> [sub] [flags] Run a deterministic one-shot command',
    '',
    `  ${paint(C.bold + C.gold, 'COMMANDS')}`,
    `    ${paint(C.green, 'doctor')}                          Live health, latency & local hardware diagnostics`,
    `    ${paint(C.green, 'search <query>')}                  Live fuzzy search via https://mcp.kronvex.org/mcp`,
    `    ${paint(C.green, 'apps [list|info <id>]')}           Inspect signed Windows (.EXE) & Android (.APK) apps`,
    `    ${paint(C.green, 'models [list|info|recommend]')}    Inspect local WebGPU/GGUF AI models & fit host RAM`,
    `    ${paint(C.green, 'skills [list|inspect|install]')}   Browse & install KRONVEX SKILL.md agent workflows`,
    `    ${paint(C.green, 'research [list|search|bibtex]')}   Search Top 21 frontier papers & export BibTeX`,
    `    ${paint(C.green, 'top21 [github|hf|weekly]')}        Live 6h synced GitHub & Hugging Face Top 21 radar`,
    `    ${paint(C.green, 'mcp [discover|tools|call|config]')}Inspect & configure KRONVEX Code-Mode MCP Server`,
    `    ${paint(C.green, 'services / work')}                 List engineering services & verified case studies`,
    `    ${paint(C.green, 'crest / theme [name]')}            Render full 30x28 KRONVEX Owl emblem or switch theme`,
    `    ${paint(C.green, 'skill-md / cache / update')}       Print agent SKILL.md, manage cache, or self-update`,
    '',
    `  ${paint(C.bold + C.gold, 'GLOBAL FLAGS')}`,
    '    --json                                      Deterministic JSON output for AI agents',
    '    --output-format <text|json|stream-json>     Output protocol (NDJSON streaming supported)',
    '    --theme <kronvex|medallion|ruby|sentinel>   Switch KRONVEX Owl brand color theme',
    '    --no-cache                                  Bypass local 10-minute cache',
    '    -h, --help  ·  -v, --version                Show help or print version',
    '',
  ].join('\n');
}

// ── Command Handlers ────────────────────────────────────────────────────────
async function cmdDoctor(opts) {
  if (opts.format === 'stream-json') emitStreamEvent('step', { message: 'Probing kronvex.org and mcp.kronvex.org/mcp' });
  const spin = startSpinner(opts, 'Probing kronvex.org & mcp.kronvex.org/mcp...');

  const totalMemGb = Number((os.totalmem() / 1024 ** 3).toFixed(1));
  const cpuCores = os.cpus().length;
  const host = {
    os: `${os.platform()} ${os.release()} (${os.arch()})`,
    node: process.version,
    cpuCores,
    ramGb: totalMemGb,
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
  } else {
    mcpHealth.error = mcpRes.reason instanceof Error ? mcpRes.reason.message : String(mcpRes.reason);
  }

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
  } else {
    apiHealth.error = apiRes.reason instanceof Error ? apiRes.reason.message : String(apiRes.reason);
  }

  const report = {
    cli: { name: CLI_NAME, version: CLI_VERSION, theme: ACTIVE_THEME },
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
    const rpc = await callRemoteMcp('tools/call', {
      name: 'kronvex_search',
      arguments: { query, category, limit },
    });
    payload = rpc.result?.structuredContent ?? { query, totalMatches: 0, results: [] };
    payload.latencyMs = rpc.latencyMs;
  } catch {
    source = 'edge-cache-fallback';
    const [catalog, research] = await Promise.all([
      fetchJsonWithCache('catalog', opts),
      fetchJsonWithCache('research', opts),
    ]);
    const q = query.toLowerCase();
    const results = [];
    for (const a of catalog.apps || []) {
      if (`${a.name} ${a.tagline}`.toLowerCase().includes(q)) results.push({ type: 'app', id: a.id, title: a.name, summary: a.tagline, url: `${SITE_ORIGIN}/apps` });
    }
    for (const m of catalog.models || []) {
      if (`${m.name} ${m.tagline || ''} ${m.description || ''}`.toLowerCase().includes(q)) results.push({ type: 'model', id: m.id, title: m.name, summary: m.tagline || m.description, url: `${SITE_ORIGIN}/models` });
    }
    for (const s of catalog.skills || []) {
      if (`${s.name} ${s.description}`.toLowerCase().includes(q)) results.push({ type: 'skill', id: s.id, title: s.name, summary: s.description, url: `${SITE_ORIGIN}/skills` });
    }
    for (const p of research.papers || []) {
      if (`${p.title} ${p.lab} ${p.category}`.toLowerCase().includes(q)) results.push({ type: 'paper', id: p.arxivId, title: p.title, summary: `${p.lab} (${p.year})`, url: p.arxivUrl });
    }
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
      ReplSkin.table(
        ['TYPE', 'TITLE', 'SUMMARY', 'URL'],
        (payload.results || []).map((r) => [r.type, r.title, r.summary, r.url]),
        38
      ),
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
    if (!app) {
      process.stderr.write(ReplSkin.error(`App not found: ${args[1]}\n`));
      return 1;
    }
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
        ReplSkin.table(
          ['FORMAT', 'PLATFORM', 'ARCH', 'SIZE', 'LABEL'],
          (app.artifacts || []).map((art) => [art.format, art.platform, art.arch, art.size, art.label])
        ),
        '',
      ].join('\n')
    );
    return 0;
  }

  outputResult(opts, { count: apps.length, apps }, () =>
    [
      '',
      ReplSkin.toolCard('Apps Catalog', `Signed Windows & Android Releases`, `${apps.length} apps`),
      '',
      ReplSkin.table(
        ['ID', 'NAME', 'VERSION', 'PLATFORMS', 'STATUS'],
        apps.map((a) => [a.id, a.name, a.version, (a.platforms || []).join(', '), a.status])
      ),
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
        ReplSkin.toolCard('Hardware Fit', `Matched ${models.length} local AI models to host hardware`, `${ramGb} GB RAM · ${cores} threads`),
        '',
        ReplSkin.table(
          ['MODEL', 'PARAMS', 'FORMAT', 'MIN RAM', 'FIT'],
          scored.map((m) => [m.name, m.params || '-', m.quantization || '-', `${m.minRamGb} GB`, m.fit])
        ),
        '',
      ].join('\n')
    );
    return 0;
  }

  if (sub === 'info' && args[1]) {
    const needle = args[1].toLowerCase();
    const model = models.find((m) => m.id.toLowerCase() === needle || m.name.toLowerCase().includes(needle));
    if (!model) {
      process.stderr.write(ReplSkin.error(`Model not found: ${args[1]}\n`));
      return 1;
    }
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
      ReplSkin.table(
        ['ID', 'NAME', 'PARAMS', 'FAMILY / FORMAT'],
        models.map((m) => [m.id, m.name, m.params || '-', m.family || m.quantization || 'ONNX/GGUF'])
      ),
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
    if (!skill) {
      process.stderr.write(ReplSkin.error(`Skill not found: ${args[1]}\n`));
      return 1;
    }
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
    if (!skill) {
      process.stderr.write(ReplSkin.error(`Skill not found: ${args[1]}\n`));
      return 1;
    }
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
      ReplSkin.table(
        ['ID', 'NAME', 'CATEGORY', 'TAGS'],
        skills.map((s) => [s.id, s.name, s.category, (s.tags || []).slice(0, 3).join(', ')])
      ),
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
    const paper = papers.find(
      (p) => String(p.rank) === needle || String(p.arxivId).toLowerCase() === needle || p.title.toLowerCase().includes(needle)
    );
    if (!paper) {
      process.stderr.write(ReplSkin.error(`Paper not found: ${args[1]}\n`));
      return 1;
    }
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
      ReplSkin.table(
        ['#', 'LAB', 'YEAR', 'ARXIV', 'TITLE'],
        filtered.map((p) => [p.rank, p.lab, p.year, p.arxivId, p.title]),
        42
      ),
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
  if (board === 'hf' || board === 'huggingface') {
    list = data.huggingfaceAllTime || data.huggingfaceTrending || [];
    title = 'Top 21 Hugging Face AI Models';
  } else if (board === 'weekly') {
    list = data.githubWeekly || data.weeklyBreakouts || [];
    title = 'Top 21 Weekly GitHub Breakouts';
  } else {
    list = data.githubAllTime || data.allTimeStarred || [];
  }

  const sliced = list.slice(0, limit);
  outputResult(opts, { board, syncedAt: data.syncedAt, count: sliced.length, items: sliced }, () =>
    [
      '',
      ReplSkin.toolCard('Top 21 Radar', title, `synced ${String(data.syncedAt || '').slice(0, 10)}`),
      '',
      ReplSkin.table(
        ['#', 'NAME / REPO', 'METRIC', 'LANGUAGE / TAG'],
        sliced.map((it, idx) => [
          idx + 1,
          it.fullName || it.name || it.id || '-',
          it.stars ?? it.downloads ?? it.likes ?? '-',
          it.language || it.pipelineTag || it.category || '-',
        ])
      ),
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
      [
        '',
        ReplSkin.toolCard('MCP Config', `Generated ${transport.toUpperCase()} setup for ${client}`, MCP_ENDPOINT),
        '',
        snippet,
        '',
      ].join('\n')
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
        [
          '',
          ReplSkin.toolCard('MCP Tools', `${MCP_ENDPOINT} · Code Mode`, `${rpc.latencyMs}ms · ${tools.length} tools`),
          '',
          ReplSkin.table(
            ['TOOL', 'READ-ONLY', 'DESCRIPTION'],
            tools.map((t) => [t.name, String(Boolean(t.annotations?.readOnlyHint)), t.description]),
            52
          ),
          '',
        ].join('\n')
      );
      return 0;
    }

    if (sub === 'call' && args[1]) {
      const toolName = args[1];
      let toolArgs = {};
      if (args[2]) {
        try {
          toolArgs = JSON.parse(args.slice(2).join(' '));
        } catch {
          spin.stop();
          process.stderr.write(ReplSkin.error('Tool arguments must be valid JSON, e.g. kronvex mcp call kronvex_search \'{"query":"webgpu"}\'\n'));
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
      [
        '',
        ReplSkin.toolCard('Services', 'Custom Software & AI-Native Engineering', `${items.length} offerings`),
        '',
        ReplSkin.table(
          ['ID', 'SERVICE', 'CORE STACK'],
          items.map((s) => [s.id, s.name, (s.stack || []).join(', ')])
        ),
        '',
      ].join('\n')
    );
    return 0;
  }
  const items = catalog.caseStudies || [];
  outputResult(opts, { count: items.length, caseStudies: items }, () =>
    [
      '',
      ReplSkin.toolCard('Case Studies', 'Verified Production Systems (kronvex.org/work)', `${items.length} systems`),
      '',
      ReplSkin.table(
        ['ID', 'CATEGORY', 'SYSTEM', 'URL'],
        items.map((c) => [c.id, c.category, c.title, c.url])
      ),
      '',
    ].join('\n')
  );
  return 0;
}

async function cmdTheme(args, opts) {
  const req = args[0]?.toLowerCase();
  if (req) {
    if (!THEMES[req]) {
      process.stderr.write(ReplSkin.error(`Unknown theme "${req}". Available: ${Object.keys(THEMES).join(', ')}\n`));
      return 2;
    }
    ACTIVE_THEME = req;
    saveTheme(req);
    outputResult(opts, { activeTheme: ACTIVE_THEME, label: THEMES[req].label }, () =>
      `\n${renderKronvexHeroHeader(ACTIVE_THEME)}\n\n${ReplSkin.success(`Theme switched to ${paint(C.bold + C.white, req)} — ${THEMES[req].label}`)}\n`
    );
    return 0;
  }
  const list = Object.values(THEMES).map((t) => ({ name: t.name, label: t.label, active: t.name === ACTIVE_THEME }));
  outputResult(opts, { activeTheme: ACTIVE_THEME, themes: list }, () =>
    [
      '',
      ReplSkin.toolCard('KRONVEX Owl Themes', `Active: ${ACTIVE_THEME}`, `${list.length} brand palettes`),
      '',
      ReplSkin.table(
        ['THEME', 'STATUS', 'PALETTE'],
        list.map((t) => [t.name, t.active ? 'ACTIVE' : '-', t.label])
      ),
      '',
    ].join('\n')
  );
  return 0;
}

async function cmdUpdate(opts) {
  const target = path.join(os.homedir(), '.kronvex', 'bin', 'kronvex.mjs');
  const spin = startSpinner(opts, `Fetching latest kronvex.mjs from ${SITE_ORIGIN}/cli/kronvex.mjs...`);
  try {
    const res = await fetch(`${SITE_ORIGIN}/cli/kronvex.mjs`, {
      headers: { 'User-Agent': `kronvex-cli/${CLI_VERSION}` },
    });
    if (!res.ok) throw new Error(`HTTP ${res.status} downloading kronvex.mjs`);
    const text = await res.text();
    const sha256 = crypto.createHash('sha256').update(text, 'utf-8').digest('hex');
    ensureDir(path.dirname(target));
    fs.writeFileSync(target, text, 'utf-8');
    spin.stop();
    const out = { updated: true, path: target, bytes: Buffer.byteLength(text, 'utf-8'), sha256 };
    outputResult(opts, out, () =>
      [
        '',
        ReplSkin.success(`Updated KRONVEX CLI -> ${paint(C.cyan, target)} (${out.bytes} bytes)`),
        ReplSkin.kv('SHA-256', sha256),
        '',
      ].join('\n')
    );
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
      for (const f of fs.readdirSync(CACHE_DIR)) {
        fs.unlinkSync(path.join(CACHE_DIR, f));
        removed++;
      }
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
    [
      '',
      ReplSkin.toolCard('Local Cache', CACHE_DIR, `${files.length} snapshot(s)`),
      '',
      ReplSkin.table(
        ['FILE', 'BYTES', 'AGE (S)'],
        files.map((f) => [f.file, f.bytes, f.ageSeconds])
      ),
      '',
    ].join('\n')
  );
  return 0;
}

// ── Main Dispatcher ─────────────────────────────────────────────────────────
export async function dispatch(argv) {
  const opts = parseArgs(argv);
  const [rawCmd, ...rest] = opts.positionals;
  const cmd = rawCmd ? rawCmd.replace(/^\//, '').toLowerCase() : '';

  if (opts.flags.version) {
    outputResult(opts, { name: CLI_NAME, version: CLI_VERSION, theme: ACTIVE_THEME, node: process.version }, () => `${CLI_NAME} v${CLI_VERSION}`);
    return 0;
  }

  if (opts.flags.help || cmd === 'help') {
    process.stdout.write(renderMainHelp());
    return 0;
  }

  if (!cmd) {
    if (!process.stdin.isTTY) {
      process.stdout.write(renderMainHelp());
      return 0;
    }
    return runRepl();
  }

  try {
    switch (cmd) {
      case 'doctor':
      case 'status':
        return await cmdDoctor(opts);
      case 'search':
        return await cmdSearch(rest, opts);
      case 'apps':
        return await cmdApps(rest, opts);
      case 'models':
        return await cmdModels(rest, opts);
      case 'skills':
        return await cmdSkills(rest, opts);
      case 'research':
      case 'papers':
        return await cmdResearch(rest, opts);
      case 'top21':
        return await cmdTop21(rest, opts);
      case 'mcp':
        return await cmdMcp(rest, opts);
      case 'services':
        return await cmdServicesOrWork('services', opts);
      case 'work':
      case 'cases':
        return await cmdServicesOrWork('work', opts);
      case 'crest':
      case 'logo': {
        outputResult(
          opts,
          { emblem: 'KRONVEX Authentic Owl Medallion', theme: ACTIVE_THEME, version: CLI_VERSION },
          () => `\n${renderKronvexCrest()}\n\n${renderKronvexHeroHeader(ACTIVE_THEME)}\n\n  ${paint(C.gold, '◈')} ${paint(C.slate, 'KRONVEX — Cross-Platform Apps · Market Intelligence · Mission-Critical AI')}\n`
        );
        return 0;
      }
      case 'theme':
        return await cmdTheme(rest, opts);
      case 'update':
        return await cmdUpdate(opts);
      case 'skill-md':
      case 'skill': {
        const md = buildAgentSkillMarkdown();
        outputResult(opts, { name: 'kronvex-cli', version: CLI_VERSION, markdown: md }, () => md);
        return 0;
      }
      case 'cache':
        return await cmdCache(rest, opts);
      default:
        process.stderr.write(ReplSkin.error(`Unknown command: "${rawCmd}". Run \`kronvex --help\` for available commands.\n`));
        return 2;
    }
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    if (opts.format === 'json') {
      process.stdout.write(JSON.stringify({ ok: false, error: message }, null, 2) + '\n');
    } else if (opts.format === 'stream-json') {
      emitStreamEvent('error', { error: message });
    } else {
      process.stderr.write(ReplSkin.error(message) + '\n');
    }
    return 1;
  }
}

// ── Stateful Interactive REPL ───────────────────────────────────────────────
const REPL_COMMANDS = [
  'doctor',
  'search',
  'apps',
  'models',
  'skills',
  'research',
  'top21',
  'mcp',
  'services',
  'work',
  '/crest',
  '/theme',
  '/json',
  '/help',
  '/clear',
  '/exit',
  'update',
  'cache',
];

async function runRepl() {
  process.stdout.write(ReplSkin.banner());
  let jsonMode = false;

  let history = [];
  if (fs.existsSync(HISTORY_FILE)) {
    try {
      history = fs.readFileSync(HISTORY_FILE, 'utf-8').split('\n').filter(Boolean).slice(-100).reverse();
    } catch {
      // Ignore
    }
  }

  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
    history,
    historySize: 100,
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
      if (!line) {
        rl.prompt();
        return;
      }

      if (line === 'exit' || line === 'quit' || line === '/exit') {
        rl.close();
        return;
      }
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

      try {
        ensureDir(path.dirname(HISTORY_FILE));
        fs.appendFileSync(HISTORY_FILE, line + '\n', 'utf-8');
      } catch {
        // Non-fatal
      }

      const tokens = splitReplLine(line);
      if (jsonMode && !tokens.includes('--json')) tokens.push('--json');
      await dispatch(tokens);

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
void bg;

import test from 'node:test';
import assert from 'node:assert/strict';
import { spawnSync } from 'node:child_process';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const CLI_PATH = path.resolve(__dirname, '../public/cli/kronvex.mjs');

function runCli(args, extraEnv = {}) {
  return spawnSync(process.execPath, [CLI_PATH, ...args], {
    encoding: 'utf-8',
    env: { ...process.env, NO_COLOR: '1', ...extraEnv },
    timeout: 15_000,
  });
}

test('CLI prints version with --version and --json', () => {
  const r = runCli(['--version', '--json']);
  assert.equal(r.status, 0);
  const parsed = JSON.parse(r.stdout);
  assert.equal(parsed.name, 'kronvex');
  assert.equal(parsed.version, '1.1.0');
});

test('CLI renders 3D block wordmark, geometric crest & theme switcher cleanly', () => {
  const crestText = runCli(['crest']);
  assert.equal(crestText.status, 0);
  assert.match(crestText.stdout, /█/);
  assert.match(crestText.stdout, /░/);

  const crestJson = runCli(['crest', '--json']);
  assert.equal(crestJson.status, 0);
  const obj = JSON.parse(crestJson.stdout);
  assert.equal(obj.version, '1.1.0');

  const themes = runCli(['theme', '--json']);
  assert.equal(themes.status, 0);
  assert.ok(JSON.parse(themes.stdout).themes.length >= 4);
});

test('CLI prints self-describing --help with zero exit code', () => {
  const r = runCli(['--help']);
  assert.equal(r.status, 0);
  assert.match(r.stdout, /KRONVEX Official CLI/);
  assert.match(r.stdout, /--output-format/);
  assert.match(r.stdout, /mcp \[discover\|tools\|call\|config\]/);
});

test('CLI prints canonical agent SKILL.md via skill-md --json', () => {
  const r = runCli(['skill-md', '--json']);
  assert.equal(r.status, 0);
  const parsed = JSON.parse(r.stdout);
  assert.equal(parsed.name, 'kronvex-cli');
  assert.match(parsed.markdown, /name: kronvex-cli/);
  assert.match(parsed.markdown, /mcp\.kronvex\.org\/mcp/);
});

test('CLI generates MCP client configs for antigravity, vscode, and codex', () => {
  const agy = runCli(['mcp', 'config', 'antigravity', '--json']);
  assert.equal(agy.status, 0);
  const agyObj = JSON.parse(agy.stdout);
  assert.equal(agyObj.endpoint, 'https://mcp.kronvex.org/mcp');
  assert.match(agyObj.config, /mcpServers/);

  const vsc = runCli(['mcp', 'config', 'vscode', '--json']);
  assert.equal(vsc.status, 0);
  assert.match(JSON.parse(vsc.stdout).config, /"servers"/);

  const codex = runCli(['mcp', 'config', 'codex', '--json']);
  assert.equal(codex.status, 0);
  assert.match(JSON.parse(codex.stdout).config, /\[mcp_servers\.kronvex\]/);
});

test('CLI handles unknown command gracefully with exit code 2', () => {
  const r = runCli(['nonexistent-command']);
  assert.equal(r.status, 2);
  assert.match(r.stderr, /Unknown command/);
});

test('CLI cache status and offline seeded catalog commands work with --json and stream-json', () => {
  const tmpHome = fs.mkdtempSync(path.join(os.tmpdir(), 'kronvex-cli-test-'));
  const cacheDir = path.join(tmpHome, '.kronvex', 'cache');
  fs.mkdirSync(cacheDir, { recursive: true });

  // Seed cache from generated website/public/api/*.json
  const apiDir = path.resolve(__dirname, '../public/api');
  for (const f of ['catalog.json', 'research.json', 'top21.json']) {
    fs.copyFileSync(path.join(apiDir, f), path.join(cacheDir, f));
  }
  const env = { HOME: tmpHome, USERPROFILE: tmpHome };

  const appsRes = runCli(['apps', 'list', '--json'], env);
  assert.equal(appsRes.status, 0);
  assert.ok(JSON.parse(appsRes.stdout).count >= 1);

  const recRes = runCli(['models', 'recommend', '--json'], env);
  assert.equal(recRes.status, 0);
  const rec = JSON.parse(recRes.stdout);
  assert.ok(rec.hostRamGb > 0);
  assert.ok(rec.recommendations.length >= 1);

  const bibRes = runCli(['research', 'bibtex', '1'], env);
  assert.equal(bibRes.status, 0);
  assert.match(bibRes.stdout, /@article\{kronvex_/);

  const streamRes = runCli(['work', '--output-format', 'stream-json'], env);
  assert.equal(streamRes.status, 0);
  const streamLine = JSON.parse(streamRes.stdout.trim().split('\n')[0]);
  assert.equal(streamLine.type, 'result');
  assert.ok(streamLine.data.count >= 5);

  const skillsList = JSON.parse(runCli(['skills', 'list', '--json'], env).stdout);
  assert.ok(skillsList.count >= 1);
  const firstSkillId = skillsList.skills[0].id;
  const installDir = path.join(tmpHome, 'my-skills');
  const instRes = runCli(['skills', 'install', firstSkillId, '--dir', installDir, '--json'], env);
  assert.equal(instRes.status, 0);
  const inst = JSON.parse(instRes.stdout);
  assert.equal(inst.installed, true);
  assert.ok(fs.existsSync(inst.path));

  fs.rmSync(tmpHome, { recursive: true, force: true });
});

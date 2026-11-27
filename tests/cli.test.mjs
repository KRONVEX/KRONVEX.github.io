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

test('CLI prints v2.0.0 version and 33 capability count with --version --json', () => {
  const r = runCli(['--version', '--json']);
  assert.equal(r.status, 0);
  const parsed = JSON.parse(r.stdout);
  assert.equal(parsed.name, 'kronvex');
  assert.equal(parsed.version, '2.0.1');
  assert.equal(parsed.capabilities, 33);
});

test('CLI renders Cyber-Owl Hex-Core + 3D block wordmark, crest & Owl brand themes', () => {
  const crestText = runCli(['crest']);
  assert.equal(crestText.status, 0);
  assert.match(crestText.stdout, /█/);
  assert.match(crestText.stdout, /░/);
  assert.match(crestText.stdout, /◈/);
  assert.match(crestText.stdout, /◆◆/);

  const themes = runCli(['theme', '--json']);
  assert.equal(themes.status, 0);
  const tData = JSON.parse(themes.stdout);
  assert.equal(tData.activeTheme, 'kronvex');
  assert.ok(tData.themes.some((t) => t.name === 'medallion'));
});

test('CLI prints self-describing --help and canonical agent SKILL.md', () => {
  const h = runCli(['--help']);
  assert.equal(h.status, 0);
  assert.match(h.stdout, /KRONVEX Official CLI/);
  assert.match(h.stdout, /chess/);
  assert.match(h.stdout, /audit/);
  assert.match(h.stdout, /scan/);

  const sk = runCli(['skill-md', '--json']);
  assert.equal(sk.status, 0);
  assert.match(JSON.parse(sk.stdout).markdown, /33 Total Capabilities/);
});

test('CLI generates MCP client configs for antigravity, vscode, and codex', () => {
  for (const [client, expected] of [
    ['antigravity', /mcpServers/],
    ['vscode', /"servers"/],
    ['codex', /\[mcp_servers\.kronvex\]/],
  ]) {
    const r = runCli(['mcp', 'config', client, '--json']);
    assert.equal(r.status, 0);
    assert.match(JSON.parse(r.stdout).config, expected);
  }
});

test('CLI Terminal Arcade: chess AI counter-move, trilingual AR quiz & defender status', () => {
  const chess = runCli(['chess', '--move', 'e2e4', '--depth', '2', '--json']);
  assert.equal(chess.status, 0);
  const cData = JSON.parse(chess.stdout);
  assert.equal(cData.playerMove, 'e2e4');
  assert.match(cData.aiMove, /^[a-h][1-8][a-h][1-8]$/);
  assert.ok(cData.legalMovesCount > 10);

  const quiz = runCli(['quiz', '--lang', 'ar', '--count', '3', '--json']);
  assert.equal(quiz.status, 0);
  const qData = JSON.parse(quiz.stdout);
  assert.equal(qData.lang, 'ar');
  assert.equal(qData.questions.length, 3);

  const def = runCli(['defender', '--json']);
  assert.equal(def.status, 0);
  assert.equal(JSON.parse(def.stdout).game, 'kronvex-orbital-defender');
});

test('CLI Local AI & Auditing: playbook, bench, scan (clean + secret detect), hash --verify, tree, open & completion', () => {
  const pb = runCli(['playbook', 'mcp', '--json']);
  assert.equal(pb.status, 0);
  assert.ok(JSON.parse(pb.stdout).glossaryCount >= 1);

  const bench = runCli(['bench', '--json']);
  assert.equal(bench.status, 0);
  const bData = JSON.parse(bench.stdout);
  assert.ok(bData.metrics.sha256MbPerSec > 0);
  assert.ok(bData.metrics.primesFound === 22044);

  // Secret scanner + hash + tree inside isolated temp dir
  const tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), 'kronvex-audit-test-'));
  const cleanFile = path.join(tmpDir, 'hello.ts');
  fs.writeFileSync(cleanFile, 'export const ok = true;\n', 'utf-8');

  const scanClean = runCli(['scan', tmpDir, '--json']);
  assert.equal(scanClean.status, 0);
  assert.equal(JSON.parse(scanClean.stdout).clean, true);

  // Hash & verify timing-safe match + mismatch
  const hashRes = runCli(['hash', cleanFile, '--json']);
  assert.equal(hashRes.status, 0);
  const digest = JSON.parse(hashRes.stdout).hash;
  assert.equal(digest.length, 64);

  const verifyOk = runCli(['hash', cleanFile, '--verify', digest, '--json']);
  assert.equal(verifyOk.status, 0);
  assert.equal(JSON.parse(verifyOk.stdout).verified, true);

  const verifyBad = runCli(['hash', cleanFile, '--verify', '0'.repeat(64), '--json']);
  assert.equal(verifyBad.status, 1);
  assert.equal(JSON.parse(verifyBad.stdout).verified, false);

  // Seed a synthetic fake AWS key pattern and verify scanner catches + redacts it
  fs.writeFileSync(path.join(tmpDir, 'leak.env'), 'AWS_KEY=AKIAIOSFODNN7EXAMPLE\n', 'utf-8');
  const scanLeak = runCli(['scan', tmpDir, '--json']);
  assert.equal(scanLeak.status, 1);
  const leakData = JSON.parse(scanLeak.stdout);
  assert.equal(leakData.findingsCount, 1);
  assert.equal(leakData.findings[0].rule, 'aws-access-key');
  assert.match(leakData.findings[0].redacted, /\*\*\*\*/);

  // Tree + LOC breakdown
  const treeRes = runCli(['tree', tmpDir, '--json']);
  assert.equal(treeRes.status, 0);
  assert.equal(JSON.parse(treeRes.stdout).totalFiles, 2);

  // Open & Shell Completions
  const openRes = runCli(['open', 'mcp', '--json']);
  assert.equal(openRes.status, 0);
  assert.equal(JSON.parse(openRes.stdout).url, 'https://kronvex.org/mcp');

  for (const sh of ['powershell', 'bash', 'zsh']) {
    const comp = runCli(['completion', sh, '--json']);
    assert.equal(comp.status, 0);
    assert.ok(JSON.parse(comp.stdout).commands >= 25);
  }

  fs.rmSync(tmpDir, { recursive: true, force: true });
});

test('CLI offline seeded catalog commands work with --json and stream-json', () => {
  const tmpHome = fs.mkdtempSync(path.join(os.tmpdir(), 'kronvex-cli-test-'));
  const cacheDir = path.join(tmpHome, '.kronvex', 'cache');
  fs.mkdirSync(cacheDir, { recursive: true });

  const apiDir = path.resolve(__dirname, '../public/api');
  for (const f of ['catalog.json', 'research.json', 'top21.json']) {
    fs.copyFileSync(path.join(apiDir, f), path.join(cacheDir, f));
  }
  const env = { HOME: tmpHome, USERPROFILE: tmpHome };

  assert.ok(JSON.parse(runCli(['apps', 'list', '--json'], env).stdout).count >= 1);
  assert.ok(JSON.parse(runCli(['models', 'recommend', '--json'], env).stdout).recommendations.length >= 1);
  assert.match(runCli(['research', 'bibtex', '1'], env).stdout, /@article\{kronvex_/);

  const streamRes = runCli(['work', '--output-format', 'stream-json'], env);
  assert.equal(streamRes.status, 0);
  assert.ok(JSON.parse(streamRes.stdout.trim().split('\n')[0]).data.count >= 6);

  const firstSkillId = JSON.parse(runCli(['skills', 'list', '--json'], env).stdout).skills[0].id;
  const installDir = path.join(tmpHome, 'my-skills');
  const inst = JSON.parse(runCli(['skills', 'install', firstSkillId, '--dir', installDir, '--json'], env).stdout);
  assert.equal(inst.installed, true);
  assert.ok(fs.existsSync(inst.path));

  fs.rmSync(tmpHome, { recursive: true, force: true });
});

test('CLI handles unknown command gracefully with exit code 2', () => {
  const r = runCli(['nonexistent-command']);
  assert.equal(r.status, 2);
  assert.match(r.stderr, /Unknown command/);
});

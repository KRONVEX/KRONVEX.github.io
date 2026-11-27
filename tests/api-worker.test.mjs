import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { handleEdgeRequest } from '../cloudflare-mcp-worker/worker.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const publicDir = path.resolve(__dirname, '../public');

// Deterministic local fixture loader backed by the exact generated public/*.json artifacts
async function mockFetchJson(relPath) {
  const clean = relPath.replace(/^\/+/, '');
  const full = path.join(publicDir, clean);
  if (!fs.existsSync(full)) throw new Error(`Fixture missing: ${full}`);
  return JSON.parse(fs.readFileSync(full, 'utf-8'));
}

async function callApi(urlPath, { method = 'GET', body = null, headers = {} } = {}) {
  const req = new Request(`https://api.kronvex.org${urlPath}`, {
    method,
    headers: { ...(body ? { 'Content-Type': 'application/json' } : {}), ...headers },
    body: body ? (typeof body === 'string' ? body : JSON.stringify(body)) : undefined,
  });
  const res = await handleEdgeRequest(req, mockFetchJson);
  const text = await res.text();
  return { status: res.status, headers: res.headers, json: text ? JSON.parse(text) : null };
}

test('OpenAPI 3.1.0, Postman v2.1 Collection & api-anything spec are valid generated contracts', () => {
  const openapi = JSON.parse(fs.readFileSync(path.join(publicDir, 'openapi.json'), 'utf-8'));
  assert.equal(openapi.openapi, '3.1.0');
  assert.ok(Object.keys(openapi.paths).length >= 16);
  assert.ok(openapi.paths['/v1/health']);
  assert.ok(openapi.paths['/v1/batch']);

  const postman = JSON.parse(fs.readFileSync(path.join(publicDir, 'api/kronvex.postman_collection.json'), 'utf-8'));
  assert.ok(postman.item.length >= 12);

  const apiAnything = JSON.parse(fs.readFileSync(path.join(publicDir, 'api/kronvex.api-anything.json'), 'utf-8'));
  assert.equal(apiAnything.name, 'kronvex');
  assert.ok(apiAnything.operations.length >= 4);
});

test('GET /v1/health & GET /openapi.json return Tier-1 envelope and valid spec', async () => {
  const health = await callApi('/v1/health');
  assert.equal(health.status, 200);
  assert.equal(health.json.ok, true);
  assert.equal(health.json.class, 'ok');
  assert.equal(health.json.tier, 1);
  assert.equal(health.headers.get('access-control-allow-origin'), '*');

  const spec = await callApi('/openapi.json');
  assert.equal(spec.status, 200);
  assert.equal(spec.json.openapi, '3.1.0');
});

test('GET /v1/search validates required q, supports category & field projection', async () => {
  const bad = await callApi('/v1/search');
  assert.equal(bad.status, 400);
  assert.equal(bad.json.ok, false);
  assert.equal(bad.json.class, 'input');

  const ok = await callApi('/v1/search?q=webgpu&limit=3&fields=type,id,title');
  assert.equal(ok.status, 200);
  assert.equal(ok.json.ok, true);
  assert.ok(ok.json.data.totalMatches >= 1);
  assert.deepEqual(Object.keys(ok.json.data.results[0]).sort(), ['id', 'title', 'type']);
});

test('GET /v1/apps, /v1/models/recommend, /v1/skills, /v1/research/:id/bibtex, /v1/top21, /v1/playbook', async () => {
  const apps = await callApi('/v1/apps');
  assert.equal(apps.status, 200);
  assert.ok(apps.json.data.count >= 1);
  const firstAppId = apps.json.data.apps[0].id;
  const oneApp = await callApi(`/v1/apps/${firstAppId}`);
  assert.equal(oneApp.status, 200);
  assert.equal(oneApp.json.data.id, firstAppId);

  const rec = await callApi('/v1/models/recommend?ramGb=16');
  assert.equal(rec.status, 200);
  assert.equal(rec.json.data.ramGb, 16);
  assert.ok(rec.json.data.count >= 1);

  const bib = await callApi('/v1/research/1/bibtex');
  assert.equal(bib.status, 200);
  assert.match(bib.json.data.bibtex, /@article\{kronvex_/);

  const top21 = await callApi('/v1/top21?board=github&limit=5');
  assert.equal(top21.status, 200);
  assert.equal(top21.json.data.board, 'github');

  const pb = await callApi('/v1/playbook?q=mcp');
  assert.equal(pb.status, 200);
  assert.ok(pb.json.data.glossaryCount >= 1);
});

test('POST /v1/batch executes multi-read calls and enforces safety bounds', async () => {
  const res = await callApi('/v1/batch', {
    method: 'POST',
    body: {
      calls: [
        { id: 'h', path: '/v1/health' },
        { id: 'r1', path: '/v1/research/1/bibtex' },
        { id: 'rec', path: '/v1/models/recommend?ramGb=32' },
      ],
    },
  });
  assert.equal(res.status, 200);
  assert.equal(res.json.ok, true);
  assert.equal(res.json.data.count, 3);
  assert.equal(res.json.data.results[0].status, 200);
  assert.equal(res.json.data.results[1].status, 200);

  // Disallow write methods on read-only REST routes (405) & unknown routes (404)
  const methodErr = await callApi('/v1/apps', { method: 'POST', body: {} });
  assert.equal(methodErr.status, 405);
  const notFound = await callApi('/v1/apps/does-not-exist');
  assert.equal(notFound.status, 404);
});

test('Unified Worker maintains 100% backward compatibility on POST /mcp & retires /sse (410)', async () => {
  const sse = await callApi('/sse');
  assert.equal(sse.status, 410);

  const discover = await callApi('/mcp', {
    method: 'POST',
    body: { jsonrpc: '2.0', id: 1, method: 'server/discover', params: {} },
  });
  assert.equal(discover.status, 200);
  assert.equal(discover.json.result.protocolVersion, '2026-07-28');
  assert.equal(discover.json.result.readOnly, true);

  const search = await callApi('/mcp', {
    method: 'POST',
    body: { jsonrpc: '2.0', id: 2, method: 'tools/call', params: { name: 'kronvex_search', arguments: { query: 'webgpu', limit: 2 } } },
  });
  assert.equal(search.status, 200);
  assert.ok(search.json.result.structuredContent.totalMatches >= 1);
});

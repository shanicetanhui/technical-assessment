// node --test tests/api.tests.mjs

import assert from 'assert';
import { test } from 'node:test';
import http from 'http';
import fs from 'fs';
import path from 'path';

const BASE_URL = 'http://localhost:4000';

function request(method, route, options = {}) {
  return new Promise((resolve, reject) => {
    const req = http.request(BASE_URL + route, { method, ...options }, (res) => {
      let data = '';
      res.on('data', (chunk) => data += chunk);
      res.on('end', () => {
        try {
          resolve({ statusCode: res.statusCode, body: JSON.parse(data) });
        } catch {
          resolve({ statusCode: res.statusCode, body: data });
        }
      });
    });
    req.on('error', reject);
    if (options.body) req.write(options.body);
    req.end();
  });
}

test('GET /data before upload should return empty array', async () => {
  const res = await request('GET', '/data?page=1');
  assert.strictEqual(res.statusCode, 200);
  assert.deepStrictEqual(res.body.data, []);
});

test('POST /upload with valid CSV', async () => {
  const boundary = '----testboundary';
  const csvContent = fs.readFileSync(path.join('./tests/sample.csv'));
  const payload = [
    `--${boundary}`,
    `Content-Disposition: form-data; name="file"; filename="sample.csv"`,
    `Content-Type: text/csv`,
    ``,
    csvContent,
    `--${boundary}--`
  ].join('\r\n');

  const res = await request('POST', '/upload', {
    headers: {
      'Content-Type': `multipart/form-data; boundary=${boundary}`,
      'Content-Length': Buffer.byteLength(payload)
    },
    body: payload
  });

  assert.strictEqual(res.statusCode, 200);
  assert.ok(res.body.count > 0);
});

test('GET /data returns first page of data', async () => {
  const res = await request('GET', '/data?page=1');
  assert.strictEqual(res.statusCode, 200);
  assert.ok(Array.isArray(res.body.data));
  assert.ok(res.body.data.length > 0);
});

test('GET /search returns filtered results', async () => {
  const res = await request('GET', '/search?q=Alice');
  assert.strictEqual(res.statusCode, 200);
  assert.ok(Array.isArray(res.body));
  assert.ok(res.body.every(r => r.name.toLowerCase().includes('alice')));
});

test('GET /data with invalid page param', async () => {
  const res = await request('GET', '/data?page=invalid');
  assert.strictEqual(res.statusCode, 200);
  assert.ok(Array.isArray(res.body.data));
});

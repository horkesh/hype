import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const dir = import.meta.dirname ?? path.dirname(fileURLToPath(import.meta.url));
const clientPath = path.resolve(dir, '..', 'utils', 'ai', 'edgeFunctionClient.ts');

test('edgeFunctionClient source file exists', () => {
  assert.ok(fs.existsSync(clientPath));
});

test('edgeFunctionClient exports invokeEdgeFunction', () => {
  const src = fs.readFileSync(clientPath, 'utf8');
  assert.ok(src.includes('export async function invokeEdgeFunction'));
});

test('edgeFunctionClient exports streamEdgeFunction', () => {
  const src = fs.readFileSync(clientPath, 'utf8');
  assert.ok(src.includes('export async function streamEdgeFunction'));
});

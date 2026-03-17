import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const dir = import.meta.dirname ?? path.dirname(fileURLToPath(import.meta.url));
const aiDir = path.resolve(dir, '..', 'utils', 'ai');
const fnDir = path.resolve(dir, '..', 'supabase', 'functions');

test('cityPulse client helper exists', () => {
  assert.ok(fs.existsSync(path.join(aiDir, 'cityPulse.ts')));
});

test('smartSearch client helper exists', () => {
  assert.ok(fs.existsSync(path.join(aiDir, 'smartSearch.ts')));
});

test('surpriseMe client helper exists', () => {
  assert.ok(fs.existsSync(path.join(aiDir, 'surpriseMe.ts')));
});

test('planGenerator client helper exists', () => {
  assert.ok(fs.existsSync(path.join(aiDir, 'planGenerator.ts')));
});

test('generate-pulse edge function exists', () => {
  assert.ok(fs.existsSync(path.join(fnDir, 'generate-pulse', 'index.ts')));
});

test('smart-search edge function exists', () => {
  assert.ok(fs.existsSync(path.join(fnDir, 'smart-search', 'index.ts')));
});

test('surprise-me edge function exists', () => {
  assert.ok(fs.existsSync(path.join(fnDir, 'surprise-me', 'index.ts')));
});

test('generate-plan edge function exists', () => {
  assert.ok(fs.existsSync(path.join(fnDir, 'generate-plan', 'index.ts')));
});

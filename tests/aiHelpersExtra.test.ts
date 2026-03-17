import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const dir = import.meta.dirname ?? path.dirname(fileURLToPath(import.meta.url));
const aiDir = path.resolve(dir, '..', 'utils', 'ai');
const fnDir = path.resolve(dir, '..', 'supabase', 'functions');
const scriptsDir = path.resolve(dir, '..', 'backend', 'src', 'scripts');

// --- Edge function file checks ---

test('translate-scene edge function exists', () => {
  assert.ok(fs.existsSync(path.join(fnDir, 'translate-scene', 'index.ts')));
});

test('enrich-descriptions edge function exists', () => {
  assert.ok(fs.existsSync(path.join(fnDir, 'enrich-descriptions', 'index.ts')));
});

test('parse-instagram edge function exists', () => {
  assert.ok(fs.existsSync(path.join(fnDir, 'parse-instagram', 'index.ts')));
});

test('analyze-venue-photo edge function exists', () => {
  assert.ok(fs.existsSync(path.join(fnDir, 'analyze-venue-photo', 'index.ts')));
});

// --- Client helper file checks ---

test('translate client helper exists', () => {
  assert.ok(fs.existsSync(path.join(aiDir, 'translate.ts')));
});

// --- Backend script file checks ---

test('scrapeGooglePhotos script exists', () => {
  assert.ok(fs.existsSync(path.join(scriptsDir, 'scrapeGooglePhotos.ts')));
});

test('enrichDescriptions script exists', () => {
  assert.ok(fs.existsSync(path.join(scriptsDir, 'enrichDescriptions.ts')));
});

test('seedInstagram script exists', () => {
  assert.ok(fs.existsSync(path.join(scriptsDir, 'seedInstagram.ts')));
});

// --- Content sanity checks ---

test('translate-scene uses gemini-2.5-flash', () => {
  const content = fs.readFileSync(path.join(fnDir, 'translate-scene', 'index.ts'), 'utf-8');
  assert.ok(content.includes('gemini-2.5-flash'));
});

test('enrich-descriptions uses claude-haiku-4-5-20251001', () => {
  const content = fs.readFileSync(path.join(fnDir, 'enrich-descriptions', 'index.ts'), 'utf-8');
  assert.ok(content.includes('claude-haiku-4-5-20251001'));
});

test('parse-instagram uses claude-haiku-4-5-20251001', () => {
  const content = fs.readFileSync(path.join(fnDir, 'parse-instagram', 'index.ts'), 'utf-8');
  assert.ok(content.includes('claude-haiku-4-5-20251001'));
});

test('analyze-venue-photo uses gemini-2.5-flash', () => {
  const content = fs.readFileSync(path.join(fnDir, 'analyze-venue-photo', 'index.ts'), 'utf-8');
  assert.ok(content.includes('gemini-2.5-flash'));
});

test('translate client exports translateScene function', () => {
  const content = fs.readFileSync(path.join(aiDir, 'translate.ts'), 'utf-8');
  assert.ok(content.includes('export async function translateScene'));
});

test('translate client exports TranslationResult interface', () => {
  const content = fs.readFileSync(path.join(aiDir, 'translate.ts'), 'utf-8');
  assert.ok(content.includes('export interface TranslationResult'));
});

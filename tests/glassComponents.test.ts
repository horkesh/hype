import test from 'node:test';
import assert from 'node:assert/strict';
import { VARIANT_COLORS } from '../components/glass/badgeVariants';

const ALL_VARIANTS = ['default', 'success', 'warning', 'danger', 'accent', 'muted'] as const;

test('VARIANT_COLORS has all 6 variants', () => {
  assert.strictEqual(
    Object.keys(VARIANT_COLORS).length,
    6,
    'should have exactly 6 variants',
  );
  for (const variant of ALL_VARIANTS) {
    assert.ok(VARIANT_COLORS[variant], `variant '${variant}' should exist`);
  }
});

test('each VARIANT_COLORS entry has bg and text properties', () => {
  for (const variant of ALL_VARIANTS) {
    const entry = VARIANT_COLORS[variant];
    assert.ok(typeof entry.bg === 'string' && entry.bg.length > 0, `variant '${variant}' should have a bg string`);
    assert.ok(typeof entry.text === 'string' && entry.text.length > 0, `variant '${variant}' should have a text string`);
  }
});

test('GlassContainer module file exists (structural check)', async () => {
  const fs = await import('node:fs/promises');
  const path = await import('node:path');
  const dir = path.resolve(import.meta.dirname ?? __dirname, '../components/glass');
  const files = await fs.readdir(dir);
  assert.ok(files.includes('GlassContainer.tsx'), 'GlassContainer.tsx should exist in components/glass/');
  assert.ok(files.includes('GlassBadge.tsx'), 'GlassBadge.tsx should exist in components/glass/');
});

test('GlassContainer.tsx exports a named GlassContainer function (source check)', async () => {
  const fs = await import('node:fs/promises');
  const path = await import('node:path');
  const filePath = path.resolve(import.meta.dirname ?? __dirname, '../components/glass/GlassContainer.tsx');
  const source = await fs.readFile(filePath, 'utf-8');
  assert.ok(source.includes('export function GlassContainer'), 'should export GlassContainer function');
});

test('GlassBadge.tsx exports a named GlassBadge function (source check)', async () => {
  const fs = await import('node:fs/promises');
  const path = await import('node:path');
  const filePath = path.resolve(import.meta.dirname ?? __dirname, '../components/glass/GlassBadge.tsx');
  const source = await fs.readFile(filePath, 'utf-8');
  assert.ok(source.includes('export function GlassBadge'), 'should export GlassBadge function');
});

import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const dir = import.meta.dirname ?? path.dirname(fileURLToPath(import.meta.url));
const cardsDir = path.resolve(dir, '..', 'components', 'cards');
const aiDir = path.resolve(dir, '..', 'utils', 'ai');

// --- File existence ---

test('EventCardFront source file exists', () => {
  assert.ok(fs.existsSync(path.join(cardsDir, 'EventCardFront.tsx')));
});

test('EventCardBack source file exists', () => {
  assert.ok(fs.existsSync(path.join(cardsDir, 'EventCardBack.tsx')));
});

test('SeriesCard source file exists', () => {
  assert.ok(fs.existsSync(path.join(cardsDir, 'SeriesCard.tsx')));
});

test('planPersistence source file exists', () => {
  assert.ok(fs.existsSync(path.join(aiDir, 'planPersistence.ts')));
});

// --- Export function name checks ---

test('EventCardFront exports EventCardFront function', () => {
  const src = fs.readFileSync(path.join(cardsDir, 'EventCardFront.tsx'), 'utf8');
  assert.ok(src.includes('export function EventCardFront'));
});

test('EventCardBack exports EventCardBack function', () => {
  const src = fs.readFileSync(path.join(cardsDir, 'EventCardBack.tsx'), 'utf8');
  assert.ok(src.includes('export function EventCardBack'));
});

test('SeriesCard exports SeriesCard function', () => {
  const src = fs.readFileSync(path.join(cardsDir, 'SeriesCard.tsx'), 'utf8');
  assert.ok(src.includes('export function SeriesCard'));
});

test('planPersistence exports savePlan function', () => {
  const src = fs.readFileSync(path.join(aiDir, 'planPersistence.ts'), 'utf8');
  assert.ok(src.includes('export async function savePlan'));
});

test('planPersistence exports loadLatestPlan function', () => {
  const src = fs.readFileSync(path.join(aiDir, 'planPersistence.ts'), 'utf8');
  assert.ok(src.includes('export async function loadLatestPlan'));
});

// --- Content checks ---

test('EventCardFront uses GlassBadge', () => {
  const src = fs.readFileSync(path.join(cardsDir, 'EventCardFront.tsx'), 'utf8');
  assert.ok(src.includes('GlassBadge'));
});

test('EventCardFront handles urgency variants', () => {
  const src = fs.readFileSync(path.join(cardsDir, 'EventCardFront.tsx'), 'utf8');
  assert.ok(src.includes('tonight'));
  assert.ok(src.includes('tomorrow'));
  assert.ok(src.includes('free'));
});

test('EventCardBack has ticket button', () => {
  const src = fs.readFileSync(path.join(cardsDir, 'EventCardBack.tsx'), 'utf8');
  assert.ok(src.includes('onTicket'));
  assert.ok(src.includes('Get Tickets'));
});

test('SeriesCard uses GlassBadge for countdown', () => {
  const src = fs.readFileSync(path.join(cardsDir, 'SeriesCard.tsx'), 'utf8');
  assert.ok(src.includes('GlassBadge'));
  assert.ok(src.includes('getCountdown'));
});

test('SeriesCard has accent variant on countdown badge', () => {
  const src = fs.readFileSync(path.join(cardsDir, 'SeriesCard.tsx'), 'utf8');
  assert.ok(src.includes("variant=\"accent\""));
});

test('planPersistence imports EveningPlan type', () => {
  const src = fs.readFileSync(path.join(aiDir, 'planPersistence.ts'), 'utf8');
  assert.ok(src.includes('EveningPlan'));
});

test('planPersistence uses ai_plans table', () => {
  const src = fs.readFileSync(path.join(aiDir, 'planPersistence.ts'), 'utf8');
  assert.ok(src.includes("'ai_plans'"));
});

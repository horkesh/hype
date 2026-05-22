import test from 'node:test';
import assert from 'node:assert/strict';
import { getCategoryLabel } from '../utils/categoryLabels';

test('getCategoryLabel returns Bosnian labels for known categories', () => {
  assert.equal(getCategoryLabel('restaurant', 'bs'), 'Restoran');
  assert.equal(getCategoryLabel('cafe', 'bs'), 'Kafić');
  assert.equal(getCategoryLabel('concert_hall', 'bs'), 'Koncertna dvorana');
  assert.equal(getCategoryLabel('cultural_center', 'bs'), 'Kulturni centar');
  assert.equal(getCategoryLabel('museum', 'bs'), 'Muzej');
  assert.equal(getCategoryLabel('gallery', 'bs'), 'Galerija');
  assert.equal(getCategoryLabel('theatre', 'bs'), 'Pozorište');
  assert.equal(getCategoryLabel('bakery', 'bs'), 'Pekara');
  assert.equal(getCategoryLabel('outdoor', 'bs'), 'Na otvorenom');
  assert.equal(getCategoryLabel('landmark', 'bs'), 'Znamenitost');
});

test('getCategoryLabel returns English labels for known categories', () => {
  assert.equal(getCategoryLabel('restaurant', 'en'), 'Restaurant');
  assert.equal(getCategoryLabel('cafe', 'en'), 'Cafe');
  assert.equal(getCategoryLabel('concert_hall', 'en'), 'Concert Hall');
  assert.equal(getCategoryLabel('cultural_center', 'en'), 'Cultural Center');
  assert.equal(getCategoryLabel('museum', 'en'), 'Museum');
  assert.equal(getCategoryLabel('gallery', 'en'), 'Gallery');
});

test('getCategoryLabel defaults to Bosnian when no language specified', () => {
  assert.equal(getCategoryLabel('bar'), 'Bar');
  assert.equal(getCategoryLabel('cinema'), 'Kino');
});

test('getCategoryLabel falls back gracefully for unknown categories', () => {
  assert.equal(getCategoryLabel('food_truck', 'bs'), 'Food Truck');
  assert.equal(getCategoryLabel('wine_bar', 'en'), 'Wine Bar');
  assert.equal(getCategoryLabel('unknown', 'bs'), 'Unknown');
});

test('getCategoryLabel is case-insensitive', () => {
  assert.equal(getCategoryLabel('RESTAURANT', 'bs'), 'Restoran');
  assert.equal(getCategoryLabel('Concert_Hall', 'en'), 'Concert Hall');
});

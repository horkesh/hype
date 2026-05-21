import assert from 'node:assert/strict';
import test from 'node:test';

import {
  extractSourceLocation,
  getCallerInfoFromStack,
  shouldMuteMessage,
  stringifyLogArgs,
} from '@/utils/errorLoggerUtils';

test('shouldMuteMessage matches known noisy warnings only', () => {
  assert.equal(
    shouldMuteMessage('Warning: each child in a list should have a unique "key" prop'),
    true
  );
  assert.equal(shouldMuteMessage('Something actually useful happened'), false);
});

test('stringifyLogArgs preserves strings and safely formats values', () => {
  const message = stringifyLogArgs(['hello', { ok: true }, undefined, null]);

  assert.equal(message, 'hello {"ok":true} undefined null');
});

test('extractSourceLocation prefers app and component paths from stack traces', () => {
  const stack = [
    'Error',
    '    at HomeScreen (http://localhost:8081/components/home/HomeScreen.tsx:42:7)',
    '    at app/(tabs)/(home)/index.tsx:10:2',
  ].join('\n');

  assert.equal(extractSourceLocation(stack), 'components/home/HomeScreen.tsx:42:7');
});

test('getCallerInfoFromStack skips errorLogger internals and node_modules noise', () => {
  const stack = [
    'Error',
    '    at getCallerInfo (utils/errorLogger.ts:220:12)',
    '    at stringifyArgs (utils/errorLogger.ts:260:4)',
    '    at console.error (utils/errorLogger.ts:320:2)',
    '    at useExploreController (C:/repo/hooks/useExploreController.ts:88:14)',
    '    at Object.<anonymous> (C:/repo/node_modules/react/index.js:1:1)',
  ].join('\n');

  assert.equal(getCallerInfoFromStack(stack), 'useExploreController.ts:88');
});

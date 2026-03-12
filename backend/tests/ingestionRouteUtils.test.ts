import test from 'node:test';
import assert from 'node:assert/strict';
import {
  buildIngestionRunErrorResult,
  parseIngestionLimitParam,
} from '../src/routes/ingestionRouteUtils.js';

test('parseIngestionLimitParam falls back when query value is invalid', () => {
  assert.equal(parseIngestionLimitParam(undefined), 25);
  assert.equal(parseIngestionLimitParam('foo'), 25);
  assert.equal(parseIngestionLimitParam('0'), 1);
  assert.equal(parseIngestionLimitParam('101'), 100);
  assert.equal(parseIngestionLimitParam('12'), 12);
});

test('buildIngestionRunErrorResult preserves the scrape log id when available', () => {
  assert.deepEqual(
    buildIngestionRunErrorResult('source-1', 'log-1', 'boom'),
    {
      status: 'error',
      message: 'boom',
      sourceId: 'source-1',
      logId: 'log-1',
    },
  );
});

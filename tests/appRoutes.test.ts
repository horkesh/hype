import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';

const repoRoot = process.cwd();

test('app router tree does not include integration helper files', () => {
  const integrationRoutePath = path.join(repoRoot, 'app', 'integrations');
  assert.equal(fs.existsSync(integrationRoutePath), false);
});

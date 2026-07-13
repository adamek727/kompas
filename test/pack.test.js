import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readdir, readFile } from 'node:fs/promises';
import { validatePack } from '../js/scoring.js';

const dir = new URL('../data/', import.meta.url);
const files = (await readdir(dir)).filter(f => f.endsWith('.json'));

test('at least one data pack exists', () => {
  assert.ok(files.length >= 1, 'no data packs found');
});

for (const file of files) {
  test(`pack ${file} is valid with >=20 questions and >=8 personas`, async () => {
    const pack = JSON.parse(await readFile(new URL(file, dir)));
    assert.deepEqual(validatePack(pack), [], `${file}: ${validatePack(pack).join('; ')}`);
    assert.ok(pack.questions.length >= 20, `${file}: expected >=20 questions, got ${pack.questions.length}`);
    assert.ok(pack.personas.length >= 8, `${file}: expected >=8 personas, got ${pack.personas.length}`);
  });
}

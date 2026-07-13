import { test } from 'node:test';
import assert from 'node:assert/strict';
import { encodeAnswers, decodeAnswers, parseHash, shareHash } from '../js/share.js';

const pack = { scale: { points: 5 }, questions: [{ id: 'q1' }, { id: 'q2' }, { id: 'q3' }] };

test('encodeAnswers writes a digit per question, 0 for unanswered', () => {
  assert.equal(encodeAnswers(pack, { q1: 5, q3: 2 }), '502');
});

test('encode/decode round-trips answered values', () => {
  const answers = { q1: 5, q2: 3, q3: 1 };
  const digits = encodeAnswers(pack, answers);
  assert.deepEqual(decodeAnswers(pack, digits), answers);
});

test('decodeAnswers skips 0 and out-of-range digits', () => {
  assert.deepEqual(decodeAnswers(pack, '509'), { q1: 5 });
});

test('parseHash accepts "<id>-<digits>" and rejects junk', () => {
  assert.deepEqual(parseHash('#cz-531'), { id: 'cz', digits: '531' });
  assert.deepEqual(parseHash('#US-12345'), { id: 'us', digits: '12345' });
  assert.equal(parseHash('#nope'), null);
  assert.equal(parseHash(''), null);
});

test('shareHash builds the fragment', () => {
  assert.equal(shareHash('cz', '531'), '#cz-531');
});

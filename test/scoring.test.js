import { test } from 'node:test';
import assert from 'node:assert/strict';
import { normalizeAnswer, scoreAxes } from '../js/scoring.js';

test('normalizeAnswer maps 1..5 to -1..1', () => {
  assert.equal(normalizeAnswer(1), -1);
  assert.equal(normalizeAnswer(3), 0);
  assert.equal(normalizeAnswer(5), 1);
});

test('scoreAxes accumulates weighted, normalized by |weight|', () => {
  const questions = [
    { id: 'q1', weights: { economic: 1 } },
    { id: 'q2', weights: { economic: -1, social: 1 } },
  ];
  const scores = scoreAxes({ q1: 5, q2: 5 }, questions, ['economic', 'social']);
  assert.equal(scores.economic, 0);
  assert.equal(scores.social, 1);
});

test('scoreAxes returns 0 for axis with no weight', () => {
  const scores = scoreAxes({ q1: 5 }, [{ id: 'q1', weights: { economic: 1 } }], ['economic', 'social']);
  assert.equal(scores.social, 0);
});

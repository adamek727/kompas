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

import { distance, matchPersonas } from '../js/scoring.js';

test('distance is Euclidean over named axes', () => {
  const d = distance({ economic: 0, social: 0 }, { economic: 3, social: 4 }, ['economic', 'social']);
  assert.equal(d, 5);
});

test('matchPersonas returns nearest as top and second as runnerUp', () => {
  const personas = [
    { id: 'far', coords: { economic: 1, social: 1 } },
    { id: 'near', coords: { economic: 0.1, social: 0 } },
    { id: 'mid', coords: { economic: 0.5, social: 0.5 } },
  ];
  const m = matchPersonas({ economic: 0, social: 0 }, personas, ['economic', 'social']);
  assert.equal(m.top.id, 'near');
  assert.equal(m.runnerUp.id, 'mid');
});

import { triangleWeights, trianglePoint, horseshoeAngle } from '../js/scoring.js';

test('triangleWeights sum to 1 and favor the nearest pole', () => {
  const poles = [
    { coords: { economic: 1, social: 0 } },
    { coords: { economic: -1, social: 0 } },
    { coords: { economic: 0, social: 1 } },
  ];
  const w = triangleWeights({ economic: 0.9, social: 0 }, poles, ['economic', 'social']);
  const total = w.reduce((a, b) => a + b, 0);
  assert.ok(Math.abs(total - 1) < 1e-9);
  assert.ok(w[0] > w[1] && w[0] > w[2]);
});

test('trianglePoint is the weighted average of vertices', () => {
  const verts = [{ x: 0, y: 0 }, { x: 10, y: 0 }, { x: 0, y: 10 }];
  const p = trianglePoint([0.5, 0.5, 0], verts);
  assert.deepEqual(p, { x: 5, y: 0 });
});

test('horseshoeAngle is monotonic: left tip > top > right tip', () => {
  assert.equal(horseshoeAngle({ economic: -1 }, { axis: 'economic' }), 250);
  assert.equal(horseshoeAngle({ economic: 0 }, { axis: 'economic' }), 90);
  assert.equal(horseshoeAngle({ economic: 1 }, { axis: 'economic' }), -70);
});

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

import { validatePack } from '../js/scoring.js';

const goodPack = {
  meta: { id: 't', name: 'T', lang: 'en', flag: '🏳️' },
  axes: { economic: { min: 'L', max: 'R' }, social: { min: 'F', max: 'O' }, system: { min: 'S', max: 'A' } },
  scale: { points: 5, labels: ['a', 'b', 'c', 'd', 'e'] },
  questions: [{ id: 'q1', text: 'x', weights: { economic: 1 } }],
  personas: [{ id: 'p1', name: 'P', blurb: 'b', coords: { economic: 0, social: 0, system: 0 } }],
  views: {
    compass: { x: 'economic', y: 'social' },
    triangle: { poles: [{ label: 'A', coords: {} }, { label: 'B', coords: {} }, { label: 'C', coords: {} }] },
    horseshoe: { axis: 'economic', radical: 'system' },
  },
};

test('validatePack accepts a well-formed pack', () => {
  assert.deepEqual(validatePack(goodPack), []);
});

test('validatePack flags unknown axis in a question weight', () => {
  const bad = structuredClone(goodPack);
  bad.questions[0].weights = { nonsense: 1 };
  assert.ok(validatePack(bad).some(e => e.includes('nonsense')));
});

test('validatePack flags a persona missing an axis coord', () => {
  const bad = structuredClone(goodPack);
  bad.personas[0].coords = { economic: 0 };
  assert.ok(validatePack(bad).some(e => e.includes('social')));
});

import { axisNamesFromPack } from '../js/scoring.js';

test('axisNamesFromPack returns declared axis names', () => {
  assert.deepEqual(axisNamesFromPack({ axes: { economic: {}, social: {} } }), ['economic', 'social']);
});

test('axisNamesFromPack returns [] when pack has no axes', () => {
  assert.deepEqual(axisNamesFromPack({}), []);
});

test('scoreAxes respects a non-5-point scale', () => {
  const q = [{ id: 'q1', weights: { economic: 1 } }];
  assert.equal(scoreAxes({ q1: 7 }, q, ['economic'], 7).economic, 1);
  assert.equal(scoreAxes({ q1: 4 }, q, ['economic'], 7).economic, 0);
});

test('horseshoeAngle: radical magnitude pushes a moderate lean toward its tip', () => {
  const cfg = { axis: 'economic', radical: 'system' };
  const calm = horseshoeAngle({ economic: 0.5, system: 0 }, cfg);
  const radicalized = horseshoeAngle({ economic: 0.5, system: 1 }, cfg);
  assert.ok(radicalized < calm);
});

test('validatePack accepts a question whose id is 0', () => {
  const p = structuredClone(goodPack);
  p.questions[0].id = 0;
  assert.deepEqual(validatePack(p), []);
});

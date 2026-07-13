import { test } from 'node:test';
import assert from 'node:assert/strict';
import { axisContributions } from '../js/scoring.js';

const questions = [
  { id: 'q1', text: 'A', weights: { economic: 1 } },
  { id: 'q2', text: 'B', weights: { economic: -0.5, social: 1 } },
  { id: 'q3', text: 'C', weights: { social: 0.2 } },
];

test('axisContributions groups per axis, sorted by absolute impact', () => {
  const c = axisContributions({ q1: 5, q2: 1, q3: 5 }, questions, ['economic', 'social']);
  // economic: q1 = +1*1 = 1 ; q2 = -1*-0.5 = 0.5
  assert.equal(c.economic[0].question.id, 'q1');
  assert.equal(c.economic[0].contribution, 1);
  assert.equal(c.economic[1].question.id, 'q2');
  // social: q2 = -1*1 = -1 (bigger) ; q3 = +1*0.2 = 0.2
  assert.equal(c.social[0].question.id, 'q2');
  assert.equal(c.social[1].question.id, 'q3');
});

test('axisContributions skips unanswered questions', () => {
  const c = axisContributions({ q1: 5 }, questions, ['economic', 'social']);
  assert.equal(c.economic.length, 1);
  assert.equal(c.social.length, 0);
});

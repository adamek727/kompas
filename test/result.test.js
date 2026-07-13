import { test } from 'node:test';
import assert from 'node:assert/strict';
import { resultHTML } from '../js/result.js';

const pack = {
  axes: { economic: { min: 'L', max: 'R' }, social: { min: 'F', max: 'O' }, system: { min: 'S', max: 'A' } },
  ui: { result: 'Result', match: 'Closest', alsoClose: 'Also', restart: 'Again',
        views: { compass: 'C', triangle: 'T', horseshoe: 'H' } },
  personas: [
    { id: 'a', name: 'Alpha', blurb: 'ba', coords: { economic: 0, social: 0, system: 0 } },
    { id: 'b', name: 'Beta', blurb: 'bb', coords: { economic: 1, social: 1, system: 1 } },
  ],
  views: {
    compass: { x: 'economic', y: 'social' },
    triangle: { poles: [
      { label: 'A', coords: { economic: 1, social: 0, system: 0 } },
      { label: 'B', coords: { economic: -1, social: 0, system: 0 } },
      { label: 'C', coords: { economic: 0, social: 1, system: 0 } } ] },
    horseshoe: { axis: 'economic', radical: 'system' },
  },
};

test('resultHTML shows matched persona and three view buttons', () => {
  const html = resultHTML({ economic: 0, social: 0, system: 0 }, pack, 'compass');
  assert.ok(html.includes('Alpha'));
  assert.ok(html.includes('data-view="compass"'));
  assert.ok(html.includes('data-view="triangle"'));
  assert.ok(html.includes('data-view="horseshoe"'));
  assert.ok(html.includes('<svg'));
});

test('resultHTML renders the requested active view', () => {
  const html = resultHTML({ economic: 0, social: 0, system: 0 }, pack, 'horseshoe');
  assert.ok(html.includes('class="viz horseshoe'));
});

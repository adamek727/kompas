import { test } from 'node:test';
import assert from 'node:assert/strict';
import { compassSVG } from '../js/views/compass.js';

const pack = {
  axes: { economic: { min: 'L', max: 'R' }, social: { min: 'F', max: 'O' } },
  views: { compass: { x: 'economic', y: 'social' } },
};

test('compassSVG centers the marker for a zero score', () => {
  const svg = compassSVG({ economic: 0, social: 0 }, pack, 320);
  assert.ok(svg.includes('<svg'));
  assert.ok(svg.includes('cx="160.0"'));
  assert.ok(svg.includes('cy="160.0"'));
});

test('compassSVG puts marker at right edge for economic=+1', () => {
  const svg = compassSVG({ economic: 1, social: 0 }, pack, 320);
  assert.ok(svg.includes('cx="320.0"'));
});

import { triangleSVG } from '../js/views/triangle.js';

const triPack = {
  axes: { economic: {}, social: {} },
  views: { triangle: { poles: [
    { label: 'A', coords: { economic: 1, social: 0 } },
    { label: 'B', coords: { economic: -1, social: 0 } },
    { label: 'C', coords: { economic: 0, social: 1 } },
  ] } },
};

test('triangleSVG renders svg, a polygon, three labels and a marker', () => {
  const svg = triangleSVG({ economic: 0, social: 0 }, triPack, 300);
  assert.ok(svg.includes('<polygon'));
  assert.ok(svg.includes('>A<') && svg.includes('>B<') && svg.includes('>C<'));
  assert.ok(svg.includes('class="marker"'));
});

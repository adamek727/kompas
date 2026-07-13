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

import { horseshoeSVG } from '../js/views/horseshoe.js';

const hsPack = {
  axes: { economic: { min: 'L', max: 'R' }, system: {} },
  views: { horseshoe: { axis: 'economic', radical: 'system' } },
};

test('horseshoeSVG renders an arc path and a marker', () => {
  const svg = horseshoeSVG({ economic: 0, system: 0 }, hsPack, 320);
  assert.ok(svg.includes('<path'));
  assert.ok(svg.includes('class="marker"'));
});

test('horseshoeSVG marker for center sits above marker for an extreme', () => {
  const center = horseshoeSVG({ economic: 0, system: 0 }, hsPack, 320);
  const left = horseshoeSVG({ economic: -1, system: 0 }, hsPack, 320);
  const cy = n => Number(n.match(/class="marker"[^>]*cy="([0-9.]+)"/)[1]);
  assert.ok(cy(center) < cy(left));
});

test('compassSVG renders the axis labels from the pack', () => {
  const svg = compassSVG({ economic: 0, social: 0 }, pack, 320);
  assert.ok(svg.includes('>L<') && svg.includes('>R<'));
  assert.ok(svg.includes('>F<') && svg.includes('>O<'));
});

test('compassSVG puts marker at left edge for economic=-1', () => {
  const svg = compassSVG({ economic: -1, social: 0 }, pack, 320);
  assert.ok(svg.includes('cx="0.0"'));
});

test('triangleSVG pulls the marker to a pole when scores match it', () => {
  const svg = triangleSVG({ economic: 1, social: 0 }, triPack, 300);
  assert.ok(svg.includes('cx="40.0"') && svg.includes('cy="260.0"'));
});

test('horseshoeSVG renders the axis min and max labels', () => {
  const svg = horseshoeSVG({ economic: 0, system: 0 }, hsPack, 320);
  assert.ok(svg.includes('>L<') && svg.includes('>R<'));
});

import { test } from 'node:test';
import assert from 'node:assert/strict';
import { matchPercent, rankParties, rankPoliticians, isCentrist } from '../js/scoring.js';

test('matchPercent is 100 at zero distance and decreases with distance', () => {
  assert.equal(matchPercent(0, 3), 100);
  assert.ok(matchPercent(0.5, 3) > matchPercent(3, 3));
  assert.equal(matchPercent(999, 3), 0);
});

test('rankParties sorts by distance and attaches a 0..100 pct', () => {
  const personas = [
    { id: 'far', coords: { e: 1, s: 1 } },
    { id: 'near', coords: { e: 0.1, s: 0 } },
  ];
  const r = rankParties({ e: 0, s: 0 }, personas, ['e', 's']);
  assert.equal(r[0].persona.id, 'near');
  assert.ok(r[0].pct >= r[1].pct);
  assert.ok(r[0].pct >= 0 && r[0].pct <= 100);
});

test('rankPoliticians flattens across parties and returns nearest with its party', () => {
  const personas = [
    { id: 'A', coords: { e: 1, s: 0 }, politicians: [{ name: 'a1', coords: { e: 0.9, s: 0 } }] },
    { id: 'B', coords: { e: 0, s: 0 }, politicians: [{ name: 'b1', coords: { e: 0.05, s: 0 } }, { name: 'b2', coords: { e: -0.9, s: 0 } }] },
  ];
  const top = rankPoliticians({ e: 0, s: 0 }, personas, ['e', 's'], 2);
  assert.equal(top[0].politician.name, 'b1');
  assert.equal(top[0].party.id, 'B');
  assert.equal(top.length, 2);
});

test('isCentrist true when all axes near zero, false otherwise', () => {
  assert.equal(isCentrist({ e: 0.05, s: -0.1 }, ['e', 's'], 0.2), true);
  assert.equal(isCentrist({ e: 0.5, s: 0 }, ['e', 's'], 0.2), false);
});

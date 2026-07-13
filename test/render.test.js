import { test } from 'node:test';
import assert from 'node:assert/strict';
import { homeHTML, quizHTML, bubblesHTML } from '../js/render.js';

const domains = [
  { id: 'cz', flag: '🇨🇿', name: 'Česko', enabled: true },
  { id: 'eu', flag: '🇪🇺', name: 'EU', enabled: false },
];

test('homeHTML lists a button per domain and disables the disabled one', () => {
  const html = homeHTML(domains, { title: 'T', tagline: 'g', pickDomain: 'pick', comingSoon: 'soon' });
  assert.ok(html.includes('data-domain="cz"'));
  assert.ok(html.includes('data-domain="eu"'));
  assert.ok(html.includes('disabled'));
  assert.ok(html.includes('soon'));
});

test('bubblesHTML marks current and answered', () => {
  const html = bubblesHTML(3, 1, { q0: 5 });
  assert.ok(html.includes('data-idx="0"') && html.includes('answered'));
  assert.ok(html.includes('data-idx="1"') && html.includes('current'));
});

test('quizHTML renders question text and one button per scale label', () => {
  const pack = {
    scale: { labels: ['no', 'meh', 'yes'] },
    questions: [{ id: 'q0', text: 'Hello?' }],
    ui: { back: 'Back' },
  };
  const html = quizHTML(pack, 0, {});
  assert.ok(html.includes('Hello?'));
  assert.ok((html.match(/class="answer"/g) || []).length === 3);
});

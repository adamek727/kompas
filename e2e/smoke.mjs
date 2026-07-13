import { chromium } from 'playwright';

const BASE = process.env.BASE || 'http://localhost:8000';
const browser = await chromium.launch();
const page = await browser.newPage();
const errors = [];
page.on('console', m => { if (m.type() === 'error') errors.push(m.text()); });
page.on('pageerror', e => errors.push(String(e)));

const failures = [];
const check = (name, cond) => { if (cond) console.log('ok  -', name); else { failures.push(name); console.log('FAIL-', name); } };

await page.goto(BASE + '/', { waitUntil: 'load' });
await page.waitForSelector('.flag');
check('home shows 5 domain flags', (await page.$$('.flag')).length === 5);

await page.click('.flag[data-domain="cz"]');
await page.waitForSelector('.quiz');
const total = Number((await page.textContent('.qcount')).split('/')[1].trim());
check('quiz has at least 20 questions', total >= 20);

for (let i = 0; i < total + 3; i++) {
  if (await page.$('.result')) break;
  await page.keyboard.press(String((i % 5) + 1));
  await page.waitForTimeout(5);
}
await page.waitForSelector('.result');

check('result shows a persona', !!(await page.textContent('.persona h3')));
check('result shows a party ranking', (await page.$$('.rank-row')).length >= 5);
check('result plots party avatars on the compass', (await page.$$('.compass .party-hit')).length >= 5);
check('result switches to the triangle view', await (async () => {
  await page.click('.tab[data-view="triangle"]');
  return !!(await page.$('.viz.triangle'));
})());
check('URL hash encodes the result', /^#cz-\d+$/.test(await page.evaluate(() => location.hash)));
check('no console errors', errors.length === 0);

await browser.close();
if (failures.length) {
  console.error('\nsmoke FAILED: ' + failures.join(', '));
  process.exit(1);
}
console.log('\nsmoke: all checks passed');

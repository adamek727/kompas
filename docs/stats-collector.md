# Collecting finished sessions (optional)

GitHub Pages is static — it can't store data itself. The app can POST a compact,
anonymous record of each **finished** quiz to a collector you host. It is **off
by default** (`STATS_ENDPOINT = ''` in `js/app.js`).

## What gets sent

Only when a quiz is completed (all 20 questions answered), once per session:

```json
{ "v": 1, "domain": "cz", "answers": "51423...", "scores": { "economic": 0.2, "social": -0.1, "system": 0.4 }, "ts": 1789000000000 }
```

No name, no email, no IP (the collector below does not log IP), no cookies. The
`answers` string is the same permalink code already visible in the share URL.
The request is `fire-and-forget` (`mode: 'no-cors'`, `keepalive`) so it never
blocks or breaks the app.

## Enable it

1. Deploy one of the collectors below and copy its URL.
2. In `js/app.js` set `const STATS_ENDPOINT = 'https://your-endpoint/...';`.
3. In `index.html`, add that origin to the CSP `connect-src`, e.g.
   `connect-src 'self' https://script.google.com https://*.googleusercontent.com;`
   (or your Worker origin).

## Option A — Google Apps Script → Google Sheet (no account beyond Google)

Create a Sheet, then **Extensions → Apps Script**, paste, and **Deploy → New
deployment → Web app** (Execute as: me, Access: anyone). Use the `/exec` URL.

```javascript
function doPost(e) {
  const d = JSON.parse(e.postData.contents);
  const sh = SpreadsheetApp.getActiveSpreadsheet().getSheetByName('sessions')
    || SpreadsheetApp.getActiveSpreadsheet().insertSheet('sessions');
  sh.appendRow([new Date(d.ts), d.domain, d.answers,
    d.scores.economic, d.scores.social, d.scores.system]);
  return ContentService.createTextOutput('ok');
}
```

## Option B — Cloudflare Worker + KV (scales, free tier)

```javascript
export default {
  async fetch(req, env) {
    if (req.method !== 'POST') return new Response('ok');
    const d = await req.json();
    const key = `${d.ts}-${crypto.randomUUID()}`;
    await env.SESSIONS.put(key, JSON.stringify(d));   // SESSIONS = a KV namespace
    return new Response('ok', { headers: { 'Access-Control-Allow-Origin': '*' } });
  },
};
```

## Later: statistics

Once records accumulate, aggregate offline (a script over the Sheet/KV) into
distributions per domain — average position, party-match frequencies, question
response spread — and optionally publish a static `stats.json` the app could
read. Keep it aggregate-only; never expose individual rows.

**Privacy note to publish** if you enable this: "Completed quizzes are recorded
anonymously (your answers + computed position only, no personal data, no
cookies) to build aggregate statistics."

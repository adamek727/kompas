# Security notes — a basic defense wall

The app is a **static** site (HTML/CSS/JS + JSON), no server, no database, no
user accounts, no secrets. That already removes most of the classic attack
surface (no SQL injection, no auth to bypass, no server to exploit). What
remains is client-side hardening and availability.

## In place (in the repo)

- **Content-Security-Policy** (`index.html` meta): `script-src 'self'` — no
  inline scripts, no third-party JS, so injected `<script>`/`onerror=` payloads
  won't execute. `img-src` limited to self + `upload.wikimedia.org`;
  `connect-src 'self'`; `object-src 'none'`; `base-uri 'self'`.
- **No inline event handlers.** Image fallback is wired via a delegated JS
  listener, so the strict `script-src` holds.
- **Referrer-Policy** `strict-origin-when-cross-origin`.
- **Frame-buster** — breaks out of cross-origin iframes (basic clickjacking
  defense; `frame-ancestors` can't be set via a `<meta>` on Pages).
- **First-party data only.** The only third parties are Google Fonts (CSS/fonts)
  and Wikimedia (images); both are pinned in the CSP.
- **No cookies, no localStorage of personal data**, no tracking.

## Availability / DDoS

- GitHub Pages already serves through a **CDN (Fastly)** with substantial
  built-in absorption for a small static site — there is no origin to overwhelm.
- For a stronger, still-free wall (recommended before wide sharing), put a
  **custom domain behind Cloudflare** (free plan): automatic DDoS mitigation, a
  basic WAF, and **rate limiting**. Point the domain's DNS at Cloudflare, add
  the Pages CNAME, enable "Under Attack Mode" only if actually targeted.
- If you enable the stats endpoint (`docs/stats-collector.md`), rate-limit it at
  the collector (Cloudflare Worker rate limit, or an Apps Script quota) so it
  can't be spammed to inflate stats.

## Not needed here

No login, so no brute-force/credential concerns. No file uploads. No
server-side rendering. Keep it that way — the simplest system is the most
defensible.

## Reporting

Found something? Open a private issue or email the maintainer. There is no
sensitive data at risk, but responsible disclosure is appreciated.

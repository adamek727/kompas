import { relax, partyBodies, partyHits, partyRadius } from './parties.js';

export function compassSVG(scores, pack, size = 320, opts = {}) {
  const cfg = pack.views.compass;
  const toXY = (c) => ({
    x: (((c[cfg.x] ?? 0) + 1) / 2) * size,
    y: (1 - (((c[cfg.y] ?? 0) + 1) / 2)) * size,
  });
  const m = toXY(scores);
  const ax = pack.axes[cfg.x], ay = pack.axes[cfg.y];
  const parties = opts.parties || [];
  const pts = parties.map(p => ({ ...toXY(p.coords), r: partyRadius(p.matched) }));
  relax(pts, size);
  const bodies = partyBodies(pts, parties);
  const hits = partyHits(pts, parties);

  return `<svg viewBox="0 0 ${size} ${size}" class="viz compass" role="img">
  <defs>
    <clipPath id="cframe"><rect x="1" y="1" width="${size - 2}" height="${size - 2}" rx="18"/></clipPath>
    <radialGradient id="qtl" cx="0" cy="0" r="1.1"><stop offset="0" stop-color="#e5484d" stop-opacity=".20"/><stop offset="1" stop-color="#e5484d" stop-opacity="0"/></radialGradient>
    <radialGradient id="qbl" cx="0" cy="1" r="1.1"><stop offset="0" stop-color="#16a34a" stop-opacity=".20"/><stop offset="1" stop-color="#16a34a" stop-opacity="0"/></radialGradient>
    <radialGradient id="qtr" cx="1" cy="0" r="1.1"><stop offset="0" stop-color="#2563eb" stop-opacity=".20"/><stop offset="1" stop-color="#2563eb" stop-opacity="0"/></radialGradient>
    <radialGradient id="qbr" cx="1" cy="1" r="1.1"><stop offset="0" stop-color="#e1a200" stop-opacity=".22"/><stop offset="1" stop-color="#e1a200" stop-opacity="0"/></radialGradient>
  </defs>
  <g clip-path="url(#cframe)">
    <rect x="0" y="0" width="${size}" height="${size}" fill="url(#qtl)"/>
    <rect x="0" y="0" width="${size}" height="${size}" fill="url(#qbl)"/>
    <rect x="0" y="0" width="${size}" height="${size}" fill="url(#qtr)"/>
    <rect x="0" y="0" width="${size}" height="${size}" fill="url(#qbr)"/>
  </g>
  <rect x="1" y="1" width="${size - 2}" height="${size - 2}" rx="18" class="frame"/>
  <line x1="${size / 2}" y1="0" x2="${size / 2}" y2="${size}" class="axis"/>
  <line x1="0" y1="${size / 2}" x2="${size}" y2="${size / 2}" class="axis"/>
  ${bodies}
  <circle cx="${m.x.toFixed(1)}" cy="${m.y.toFixed(1)}" r="11" class="you-pulse"/>
  <circle class="marker" cx="${m.x.toFixed(1)}" cy="${m.y.toFixed(1)}" r="11"/>
  <text x="10" y="${size / 2 - 8}" class="axlabel">${ax.min}</text>
  <text x="${size - 10}" y="${size / 2 - 8}" text-anchor="end" class="axlabel">${ax.max}</text>
  <text x="${size / 2 + 8}" y="16" class="axlabel">${ay.max}</text>
  <text x="${size / 2 + 8}" y="${size - 10}" class="axlabel">${ay.min}</text>
  ${hits}
</svg>`;
}

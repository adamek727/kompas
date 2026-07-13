export function compassSVG(scores, pack, size = 320, opts = {}) {
  const cfg = pack.views.compass;
  const toXY = (c) => ({
    x: (((c[cfg.x] ?? 0) + 1) / 2) * size,
    y: (1 - (((c[cfg.y] ?? 0) + 1) / 2)) * size,
  });
  const m = toXY(scores);
  const ax = pack.axes[cfg.x], ay = pack.axes[cfg.y];
  const parties = opts.parties || [];
  const avatars = parties.map((p, i) => {
    const c = toXY(p.coords);
    const r = p.matched ? 17 : 13;
    if (p.photo) {
      return `<clipPath id="pc${i}"><circle cx="${c.x.toFixed(1)}" cy="${c.y.toFixed(1)}" r="${r}"/></clipPath>
  <image href="${p.photo}" x="${(c.x - r).toFixed(1)}" y="${(c.y - r).toFixed(1)}" width="${2 * r}" height="${2 * r}" preserveAspectRatio="xMidYMid slice" clip-path="url(#pc${i})"/>
  <circle cx="${c.x.toFixed(1)}" cy="${c.y.toFixed(1)}" r="${r}" class="party-ring${p.matched ? ' matched' : ''}" style="fill:none;stroke:${p.matched ? p.color : '#ffffff'}"><title>${p.name}</title></circle>`;
    }
    return `<circle cx="${c.x.toFixed(1)}" cy="${c.y.toFixed(1)}" r="${r}" class="party-dot" style="fill:${p.color}"><title>${p.name}</title></circle>
  <text x="${c.x.toFixed(1)}" y="${(c.y + 3.5).toFixed(1)}" text-anchor="middle" class="party-mono">${p.initials}</text>`;
  }).join('\n  ');
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
  ${avatars}
  <circle cx="${m.x.toFixed(1)}" cy="${m.y.toFixed(1)}" r="10" class="marker you"/>
  <text x="10" y="${size / 2 - 8}" class="axlabel">${ax.min}</text>
  <text x="${size - 10}" y="${size / 2 - 8}" text-anchor="end" class="axlabel">${ax.max}</text>
  <text x="${size / 2 + 8}" y="16" class="axlabel">${ay.max}</text>
  <text x="${size / 2 + 8}" y="${size - 10}" class="axlabel">${ay.min}</text>
</svg>`;
}

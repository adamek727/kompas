export function compassSVG(scores, pack, size = 320, opts = {}) {
  const cfg = pack.views.compass;
  const toXY = (c) => ({
    x: (((c[cfg.x] ?? 0) + 1) / 2) * size,
    y: (1 - (((c[cfg.y] ?? 0) + 1) / 2)) * size,
  });
  const m = toXY(scores);
  const ax = pack.axes[cfg.x], ay = pack.axes[cfg.y];
  const parties = opts.parties || [];

  const edge = 18;
  const clamp = (p) => { p.x = Math.max(edge, Math.min(size - edge, p.x)); p.y = Math.max(edge, Math.min(size - edge, p.y)); };
  const pts = parties.map(p => ({ ...toXY(p.coords), r: p.matched ? 17 : 13 }));
  for (let iter = 0; iter < 40; iter++) {
    for (let i = 0; i < pts.length; i++) {
      for (let j = i + 1; j < pts.length; j++) {
        const dx = pts[j].x - pts[i].x, dy = pts[j].y - pts[i].y;
        const d = Math.hypot(dx, dy) || 0.01;
        const min = pts[i].r + pts[j].r + 6;
        if (d < min) {
          const push = (min - d) / 2, ux = dx / d, uy = dy / d;
          pts[i].x -= ux * push; pts[i].y -= uy * push;
          pts[j].x += ux * push; pts[j].y += uy * push;
        }
      }
    }
    pts.forEach(clamp);
  }

  const bodies = parties.map((p, i) => {
    const c = pts[i], r = c.r;
    return p.photo
      ? `<clipPath id="pc${i}"><circle cx="${c.x.toFixed(1)}" cy="${c.y.toFixed(1)}" r="${r}"/></clipPath>
  <image href="${p.photo}" x="${(c.x - r).toFixed(1)}" y="${(c.y - r).toFixed(1)}" width="${2 * r}" height="${2 * r}" preserveAspectRatio="xMidYMid slice" clip-path="url(#pc${i})"/>
  <circle cx="${c.x.toFixed(1)}" cy="${c.y.toFixed(1)}" r="${r}" class="party-ring${p.matched ? ' matched' : ''}" style="fill:none;stroke:${p.matched ? p.color : '#ffffff'}"/>`
      : `<circle cx="${c.x.toFixed(1)}" cy="${c.y.toFixed(1)}" r="${r}" class="party-dot" style="fill:${p.color}"/>
  <text x="${c.x.toFixed(1)}" y="${(c.y + 3.5).toFixed(1)}" text-anchor="middle" class="party-mono">${p.initials}</text>`;
  }).join('\n  ');

  const hits = parties.map((p, i) => {
    const c = pts[i];
    return `<circle cx="${c.x.toFixed(1)}" cy="${c.y.toFixed(1)}" r="${c.r + 3}" fill="transparent" class="party-hit" data-party="${p.id}" style="cursor:pointer"><title>${p.name}</title></circle>`;
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
  ${bodies}
  <circle cx="${m.x.toFixed(1)}" cy="${m.y.toFixed(1)}" r="10" class="you-pulse"/>
  <circle cx="${m.x.toFixed(1)}" cy="${m.y.toFixed(1)}" r="10" class="marker you"/>
  <text x="10" y="${size / 2 - 8}" class="axlabel">${ax.min}</text>
  <text x="${size - 10}" y="${size / 2 - 8}" text-anchor="end" class="axlabel">${ax.max}</text>
  <text x="${size / 2 + 8}" y="16" class="axlabel">${ay.max}</text>
  <text x="${size / 2 + 8}" y="${size - 10}" class="axlabel">${ay.min}</text>
  ${hits}
</svg>`;
}

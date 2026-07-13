export function partyRadius(matched) {
  return matched ? 20 : 16;
}

export function relax(pts, size, iterations = 45) {
  const edge = 20;
  const clamp = (p) => { p.x = Math.max(edge, Math.min(size - edge, p.x)); p.y = Math.max(edge, Math.min(size - edge, p.y)); };
  for (let it = 0; it < iterations; it++) {
    for (let i = 0; i < pts.length; i++) {
      for (let j = i + 1; j < pts.length; j++) {
        const dx = pts[j].x - pts[i].x, dy = pts[j].y - pts[i].y;
        const d = Math.hypot(dx, dy) || 0.01;
        const min = pts[i].r + pts[j].r + 5;
        if (d < min) {
          const push = (min - d) / 2, ux = dx / d, uy = dy / d;
          pts[i].x -= ux * push; pts[i].y -= uy * push;
          pts[j].x += ux * push; pts[j].y += uy * push;
        }
      }
    }
    pts.forEach(clamp);
  }
  return pts;
}

export function partyBodies(pts, parties) {
  return parties.map((p, i) => {
    const c = pts[i], r = c.r;
    return p.photo
      ? `<clipPath id="pc${i}"><circle cx="${c.x.toFixed(1)}" cy="${c.y.toFixed(1)}" r="${r}"/></clipPath>
  <image href="${p.photo}" x="${(c.x - r).toFixed(1)}" y="${(c.y - r).toFixed(1)}" width="${2 * r}" height="${2 * r}" preserveAspectRatio="xMidYMid slice" clip-path="url(#pc${i})"/>
  <circle cx="${c.x.toFixed(1)}" cy="${c.y.toFixed(1)}" r="${r}" class="party-ring${p.matched ? ' matched' : ''}" style="fill:none;stroke:${p.matched ? p.color : '#ffffff'}"/>`
      : `<circle cx="${c.x.toFixed(1)}" cy="${c.y.toFixed(1)}" r="${r}" class="party-dot" style="fill:${p.color}"/>
  <text x="${c.x.toFixed(1)}" y="${(c.y + 4).toFixed(1)}" text-anchor="middle" class="party-mono">${p.initials}</text>`;
  }).join('\n  ');
}

export function partyHits(pts, parties) {
  return parties.map((p, i) => {
    const c = pts[i];
    return `<circle cx="${c.x.toFixed(1)}" cy="${c.y.toFixed(1)}" r="${c.r + 3}" fill="transparent" class="party-hit" data-party="${p.id}" style="cursor:pointer"><title>${p.name}</title></circle>`;
  }).join('\n  ');
}

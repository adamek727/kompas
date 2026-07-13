export function compassSVG(scores, pack, size = 320) {
  const cfg = pack.views.compass;
  const x = scores[cfg.x] ?? 0, y = scores[cfg.y] ?? 0;
  const px = ((x + 1) / 2) * size;
  const py = (1 - (y + 1) / 2) * size;
  const ax = pack.axes[cfg.x], ay = pack.axes[cfg.y];
  return `<svg viewBox="0 0 ${size} ${size}" class="viz compass" role="img">
  <rect x="0" y="0" width="${size}" height="${size}" class="grid-bg"/>
  <line x1="${size / 2}" y1="0" x2="${size / 2}" y2="${size}" class="axis"/>
  <line x1="0" y1="${size / 2}" x2="${size}" y2="${size / 2}" class="axis"/>
  <circle cx="${px.toFixed(1)}" cy="${py.toFixed(1)}" r="8" class="marker"/>
  <text x="6" y="${size / 2 - 6}" class="axlabel">${ax.min}</text>
  <text x="${size - 6}" y="${size / 2 - 6}" text-anchor="end" class="axlabel">${ax.max}</text>
  <text x="${size / 2 + 6}" y="14" class="axlabel">${ay.max}</text>
  <text x="${size / 2 + 6}" y="${size - 8}" class="axlabel">${ay.min}</text>
</svg>`;
}

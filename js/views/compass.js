export function compassSVG(scores, pack, size = 320) {
  const cfg = pack.views.compass;
  const x = scores[cfg.x] ?? 0, y = scores[cfg.y] ?? 0;
  const px = ((x + 1) / 2) * size;
  const py = (1 - (y + 1) / 2) * size;
  const ax = pack.axes[cfg.x], ay = pack.axes[cfg.y];
  return `<svg viewBox="0 0 ${size} ${size}" class="viz compass" role="img">
  <defs><clipPath id="cframe"><rect x="1" y="1" width="${size - 2}" height="${size - 2}" rx="18"/></clipPath></defs>
  <g clip-path="url(#cframe)">
    <rect x="0" y="0" width="${size / 2}" height="${size}" class="q-left"/>
    <rect x="${size / 2}" y="0" width="${size / 2}" height="${size}" class="q-right"/>
  </g>
  <rect x="1" y="1" width="${size - 2}" height="${size - 2}" rx="18" class="frame"/>
  <line x1="${size / 2}" y1="0" x2="${size / 2}" y2="${size}" class="axis"/>
  <line x1="0" y1="${size / 2}" x2="${size}" y2="${size / 2}" class="axis"/>
  <circle cx="${px.toFixed(1)}" cy="${py.toFixed(1)}" r="9" class="marker"/>
  <text x="10" y="${size / 2 - 8}" class="axlabel">${ax.min}</text>
  <text x="${size - 10}" y="${size / 2 - 8}" text-anchor="end" class="axlabel">${ax.max}</text>
  <text x="${size / 2 + 8}" y="16" class="axlabel">${ay.max}</text>
  <text x="${size / 2 + 8}" y="${size - 10}" class="axlabel">${ay.min}</text>
</svg>`;
}

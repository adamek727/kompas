import { horseshoeAngle } from '../scoring.js';

const START = 220, END = -40;

function polar(cx, cy, r, deg) {
  const rad = (deg * Math.PI) / 180;
  return { x: cx + r * Math.cos(rad), y: cy - r * Math.sin(rad) };
}

export function horseshoeSVG(scores, pack, size = 320) {
  const cfg = pack.views.horseshoe;
  const cx = size / 2, cy = size / 2 + 24, r = size / 2 - 34;
  const a = polar(cx, cy, r, START);
  const b = polar(cx, cy, r, END);
  const arc = `M ${a.x.toFixed(1)} ${a.y.toFixed(1)} A ${r} ${r} 0 1 1 ${b.x.toFixed(1)} ${b.y.toFixed(1)}`;
  const angle = horseshoeAngle(scores, cfg);
  const m = polar(cx, cy, r, angle);
  const ax = pack.axes[cfg.axis];
  return `<svg viewBox="0 0 ${size} ${size}" class="viz horseshoe" role="img">
  <defs><linearGradient id="hsgrad" x1="0" y1="0" x2="1" y2="0">
    <stop offset="0" stop-color="#e5484d"/>
    <stop offset="0.5" stop-color="#b9c0cf"/>
    <stop offset="1" stop-color="#2563eb"/>
  </linearGradient></defs>
  <path d="${arc}" class="arc" fill="none" style="stroke:url(#hsgrad)"/>
  <text x="${a.x.toFixed(1)}" y="${(a.y + 20).toFixed(1)}" text-anchor="middle" class="axlabel">${ax.min}</text>
  <text x="${b.x.toFixed(1)}" y="${(b.y + 20).toFixed(1)}" text-anchor="middle" class="axlabel">${ax.max}</text>
  <circle class="marker" cx="${m.x.toFixed(1)}" cy="${m.y.toFixed(1)}" r="9"/>
</svg>`;
}

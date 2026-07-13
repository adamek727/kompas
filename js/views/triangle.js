import { triangleWeights, trianglePoint } from '../scoring.js';

export function triangleSVG(scores, pack, size = 300) {
  const poles = pack.views.triangle.poles;
  const axisNames = Object.keys(pack.axes);
  const pad = 40;
  const verts = [
    { x: pad, y: size - pad },
    { x: size - pad, y: size - pad },
    { x: size / 2, y: pad },
  ];
  const w = triangleWeights(scores, poles, axisNames);
  const p = trianglePoint(w, verts);
  const poly = verts.map(v => `${v.x},${v.y}`).join(' ');
  const labels = verts.map((v, i) =>
    `<text x="${v.x}" y="${v.y + (i === 2 ? -14 : 18)}" text-anchor="middle" class="axlabel">${poles[i].label}</text>`
  ).join('\n  ');
  return `<svg viewBox="0 0 ${size} ${size}" class="viz triangle" role="img">
  <polygon points="${poly}" class="tri"/>
  ${labels}
  <circle cx="${p.x.toFixed(1)}" cy="${p.y.toFixed(1)}" r="8" class="marker"/>
</svg>`;
}

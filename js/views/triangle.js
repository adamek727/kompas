import { triangleWeights, trianglePoint } from '../scoring.js';
import { relax, partyBodies, partyHits, partyRadius } from './parties.js';

export function triangleSVG(scores, pack, size = 300, opts = {}) {
  const poles = pack.views.triangle.poles;
  const axisNames = Object.keys(pack.axes);
  const pad = 40;
  const verts = [
    { x: pad, y: size - pad },
    { x: size - pad, y: size - pad },
    { x: size / 2, y: pad },
  ];
  const p = trianglePoint(triangleWeights(scores, poles, axisNames), verts);
  const poly = verts.map(v => `${v.x},${v.y}`).join(' ');
  const grads = verts.map((v, i) =>
    `<radialGradient id="tg${i}" gradientUnits="userSpaceOnUse" cx="${v.x}" cy="${v.y}" r="${(size * 0.72).toFixed(0)}"><stop offset="0" stop-color="${poles[i].color || '#1f5cff'}" stop-opacity=".24"/><stop offset="1" stop-color="${poles[i].color || '#1f5cff'}" stop-opacity="0"/></radialGradient>`
  ).join('\n    ');
  const tints = verts.map((v, i) => `<rect x="0" y="0" width="${size}" height="${size}" fill="url(#tg${i})"/>`).join('\n    ');
  const dots = verts.map((v, i) =>
    `<circle cx="${v.x}" cy="${v.y}" r="7" class="pole" style="fill:${poles[i].color || '#1f5cff'}"/>`
  ).join('\n  ');
  const labels = verts.map((v, i) =>
    `<text x="${v.x}" y="${v.y + (i === 2 ? -16 : 22)}" text-anchor="middle" class="axlabel polelabel" style="fill:${poles[i].color || '#5c6579'}">${poles[i].label}</text>`
  ).join('\n  ');

  const parties = opts.parties || [];
  const pts = parties.map(pp => {
    const q = trianglePoint(triangleWeights(pp.coords, poles, axisNames), verts);
    return { x: q.x, y: q.y, r: partyRadius(pp.matched) };
  });
  relax(pts, size);
  const bodies = partyBodies(pts, parties);
  const hits = partyHits(pts, parties);

  return `<svg viewBox="0 0 ${size} ${size}" class="viz triangle" role="img">
  <defs>
    <clipPath id="triclip"><polygon points="${poly}"/></clipPath>
    ${grads}
  </defs>
  <polygon points="${poly}" class="tri"/>
  <g clip-path="url(#triclip)">
    ${tints}
  </g>
  ${dots}
  ${labels}
  ${bodies}
  <circle cx="${p.x.toFixed(1)}" cy="${p.y.toFixed(1)}" r="11" class="you-pulse"/>
  <circle class="marker" cx="${p.x.toFixed(1)}" cy="${p.y.toFixed(1)}" r="11"/>
  ${hits}
</svg>`;
}

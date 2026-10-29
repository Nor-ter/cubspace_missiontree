import type { PlacedNode } from '../layout'

// Mission = 위성 본체: 금박(MLI) 박스 + 양쪽 태양전지 날개 + 접시 안테나
function SatelliteBody({ p }: { p: PlacedNode }) {
  const L = p.x - p.w / 2
  const T = p.y - p.h / 2
  const R = L + p.w
  return (
    <g>
      <line x1={p.x} y1={T} x2={p.x} y2={T - 16} className="strut" />
      <path d={`M${p.x - 16},${T - 24} Q${p.x},${T - 6} ${p.x + 16},${T - 24}`} className="dish" />
      <line x1={L - 6} y1={p.y} x2={L} y2={p.y} className="strut" />
      <line x1={R} y1={p.y} x2={R + 6} y2={p.y} className="strut" />
      <rect x={L - 46} y={p.y - 18} width={40} height={36} fill="url(#cells)" className="wing" />
      <rect x={R + 6} y={p.y - 18} width={40} height={36} fill="url(#cells)" className="wing" />
      <rect x={L} y={T} width={p.w} height={p.h} rx={3} fill="url(#foil)" />
      <rect x={L} y={T} width={p.w} height={p.h} rx={3} fill="url(#crinkle)" />
      <text x={L + 16} y={p.y - 9} className="lbl foil-label">
        {p.label}
      </text>
      <text x={L + 16} y={p.y + 16} className="ttl foil-title">
        {p.node.title}
      </text>
    </g>
  )
}

export default SatelliteBody

import type { SpineSegment } from '../layout'
import { SPINE_X } from '../layout'

const RAIL_GAP = 10

// 줄기 = 세로 트러스. 위성 본체부터 마지막 Phase까지 한 줄로 그리고, Phase 모듈이 그 위를 덮는다.
// (구간별로 끊어 그리면 펼치기·접기 중 모듈이 미끄러지는 동안 트러스 사이가 벌어져 보인다)
function Truss({ segments }: { segments: SpineSegment[] }) {
  if (!segments.length) return null
  const left = SPINE_X - RAIL_GAP
  const right = SPINE_X + RAIL_GAP
  const y1 = segments[0].y1
  const y2 = segments[segments.length - 1].y2
  const points: string[] = []
  for (let y = y1, k = 0; y <= y2; y += 14, k++) points.push(`${k % 2 ? right : left},${y}`)
  const rail = { y1, y2, strokeWidth: 2, className: 'rail' }
  return (
    <g>
      <polyline points={points.join(' ')} className="lattice" />
      <line x1={left} x2={left} {...rail} />
      <line x1={right} x2={right} {...rail} />
    </g>
  )
}

export default Truss

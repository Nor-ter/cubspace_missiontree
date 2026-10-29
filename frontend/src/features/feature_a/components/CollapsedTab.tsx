import type { PlacedNode } from '../layout'

// 접힌 노드 오른쪽에 붙는 "+n" 탭 (접혀 있는 자식 수)
function CollapsedTab({ p }: { p: PlacedNode }) {
  if (p.hiddenCount === 0) return null
  const x = p.x + p.w / 2
  return (
    <g>
      <title>{`${p.hiddenCount} hidden · click the card to expand`}</title>
      <rect x={x + 2} y={p.y - 11} width={30} height={22} rx={2} className="tab" />
      <text x={x + 17} y={p.y + 4} textAnchor="middle" className="lbl tab-text">
        +{p.hiddenCount}
      </text>
    </g>
  )
}

export default CollapsedTab

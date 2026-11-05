import type { KeyboardEvent } from 'react'

export type ResourceKind = 'manual' | 'notebook'

interface Props {
  kind: ResourceKind
  x: number // 버튼 왼쪽
  y: number // 버튼 세로 가운데
  label: string
  active: boolean
  onClick: () => void
}

// 버튼 안 아이콘 (범례에서도 같은 모양을 쓴다). cx, y = 아이콘 가운데
export function ResourceGlyph({ kind, cx, y }: { kind: ResourceKind; cx: number; y: number }) {
  return kind === 'manual' ? (
    <>
      <path d={`M${cx - 5},${y - 7} h7 l4,4 v10 h-11 z M${cx + 2},${y - 7} v4 h4`} className="res-icon" />
      <path d={`M${cx - 3},${y + 1} h7 M${cx - 3},${y + 4} h7`} className="res-icon" />
    </>
  ) : (
    // 플라스크(실험) 아이콘
    <>
      <path d={`M${cx - 3},${y - 7} h6 M${cx - 2},${y - 7} v5 l-5,8 q-1,2 1,2 h12 q2,0 1,-2 l-5,-8 v-5`} className="res-icon" />
      <path d={`M${cx - 5},${y + 4} h10`} className="res-icon" />
    </>
  )
}

// 패널 오른쪽 끝의 작은 버튼: 매뉴얼 / 실습 노트북
function PanelButton({ kind, x, y, label, active, onClick }: Props) {
  const cx = x + 11
  return (
    <g
      role="button"
      tabIndex={0}
      aria-label={label}
      className={active ? 'res-btn open' : 'res-btn'}
      onClick={onClick}
      onKeyDown={(e: KeyboardEvent) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault()
          onClick()
        }
      }}
    >
      <title>{label}</title>
      <rect x={x} y={y - 12} width={22} height={24} rx={2} className="res-bg" />
      <ResourceGlyph kind={kind} cx={cx} y={y} />
    </g>
  )
}

export default PanelButton

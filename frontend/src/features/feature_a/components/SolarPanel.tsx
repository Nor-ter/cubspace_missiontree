import { CELL_COLS } from '../layout'
import type { PlacedNode } from '../layout'
import type { CSSProperties } from 'react'
import type { MissionNode } from '../types'
import { teamColor } from '../teams'
import { toggleProps } from '../interaction'
import CollapsedTab from './CollapsedTab'
import PanelButton from './PanelButton'
import type { ResourceKind } from './PanelButton'

interface Props {
  p: PlacedNode
  onOpenPath: boolean // 패널에 열린 자료로 가는 경로 위에 있는가
  isOpen: boolean // 패널에 지금 이 카드의 자료가 열려 있는가
  team?: string // 팀 강조 중이고 이 카드가 고른 팀 소속이면 그 팀 코드
  dimmed: boolean // 팀 강조 중인데 고른 팀 소속이 아니다
  activeKind?: ResourceKind // 사이드 패널에 지금 이 패널의 자료가 열려 있으면 그 종류
  onToggle: (id: string) => void
  onOpenResource: (node: MissionNode, kind: ResourceKind) => void
}

// 팀 색: 카드 안의 보라색 토큰(--node*)을 팀 색으로 바꿔 끼운다
const teamStyle = (team: string) => {
  const c = teamColor(team)
  return { '--node': c, '--node-line': c, '--node-text': c } as CSSProperties
}

const CELL_W = 10

// Subsystem / Task / Subtask = 태양전지판. 왼쪽 칸 수가 단계를 나타낸다 (6칸 / 4칸 / 2칸).
function SolarPanel({ p, onOpenPath, isOpen, team, dimmed, activeKind, onToggle, onOpenResource }: Props) {
  const L = p.x - p.w / 2
  const T = p.y - p.h / 2
  const cellH = (p.h - 14) / 2
  const cols = CELL_COLS[p.node.level] ?? 3
  const textX = L + 7 + cols * (CELL_W + 2) + 10
  const buttons: { kind: ResourceKind; label: string }[] = []
  if (p.node.notebook) buttons.push({ kind: 'notebook', label: `Open lab notebook: ${p.node.title}` })
  if (p.node.manual) buttons.push({ kind: 'manual', label: `Open technical manual: ${p.node.title}` })
  const frameClass = `frame panel${onOpenPath ? ' on-open' : ''}`
  return (
    <g
      data-node-id={p.node.id}
      className={team ? 'team-on' : dimmed ? 'team-dim' : undefined}
      style={team ? teamStyle(team) : undefined}
    >
      <g {...toggleProps(p, onToggle)}>
        {/* 카드에는 짧은 이름만: PM 원문은 마우스를 올리면 보인다 */}
        {p.node.detail && <title>{p.node.detail}</title>}
        <rect
          x={L}
          y={T}
          width={p.w}
          height={p.h}
          rx={2}
          className={frameClass}
        />
        {Array.from({ length: cols * 2 }, (_, i) => (
          <rect
            key={i}
            x={L + 7 + (i % cols) * (CELL_W + 2)}
            y={T + 7 + Math.floor(i / cols) * (cellH + 2)}
            width={CELL_W}
            height={cellH}
            className="cell lit"
          />
        ))}
        <line x1={textX - 4} y1={T + 6} x2={textX - 4} y2={T + p.h - 6} className="divider" />
        <text
          x={textX + 2}
          y={p.y - 7}
          className="lbl small node-label"
        >
          {p.label}
        </text>
        <text x={textX + 2} y={p.y + 14} className="ttl">
          {p.node.title}
        </text>
        {/* 패널에 이 카드의 자료가 열려 있으면 카드 오른쪽 위에 배지 */}
        {isOpen && (
          <g className="open-badge">
            <rect x={L + p.w - 60} y={T - 19} width={60} height={16} rx={8} />
            <text x={L + p.w - 30} y={T - 7.5} textAnchor="middle">
              Viewing
            </text>
          </g>
        )}
        <CollapsedTab p={p} />
      </g>
      {buttons.map((b, i) => (
        <PanelButton
          key={b.kind}
          kind={b.kind}
          x={L + p.w - 28 - i * 26}
          y={p.y}
          label={b.label}
          active={activeKind === b.kind}
          onClick={() => onOpenResource(p.node, b.kind)}
        />
      ))}
    </g>
  )
}

export default SolarPanel

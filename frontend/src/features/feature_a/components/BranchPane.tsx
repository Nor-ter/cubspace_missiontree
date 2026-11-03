import type { MissionNode } from '../types'
import PhaseColumn from './PhaseColumn'
import './sheet.css'

interface Props {
  orient: 'across' | 'down'
  phase: MissionNode
  team?: string
  activeCard?: string
  onPhase: (code: string) => void
  onWorkshop: (phase: string, card: string) => void
}

// 전체 도면에서 Workshop을 열었을 때 남는 그 Phase의 가지.
// 왼쪽에 도면과 같은 높이로 놓는다. 가로 도면에서는 열이 통째로 옮겨 오고,
// 세로 도면에서는 줄의 팀 가지들이 하나씩 왼쪽 열로 접혀 온다 (data-from: 어느 도면에서 왔는가)
function BranchPane({ orient, phase, team, activeCard, onPhase, onWorkshop }: Props) {
  return (
    <nav className="branch-pane" aria-label={`Phase ${phase.code} workshops`} data-team={team} data-from={orient}>
      <PhaseColumn
        as="div"
        phase={phase}
        team={team}
        activeCard={activeCard}
        onPhase={onPhase}
        onWorkshop={onWorkshop}
      />
    </nav>
  )
}

export default BranchPane

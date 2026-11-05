import type { MissionNode } from '../types'
import type { Tab } from '../hooks/useRoute'
import PhaseColumn from './PhaseColumn'
import { Kids, TeamNode } from './StepView'
import { StationArt } from './Drawing'
import './sheet.css'

interface Props {
  orient: 'across' | 'down'
  view: 'step' | 'sheet' // 어느 보기에서 열었는가: 왼쪽 가지는 그 보기의 모양을 따른다
  phase: MissionNode
  team?: string
  activeCard?: string
  expanded: Set<string> // 펼쳐 보기에서 펼쳐 둔 것 (그대로 이어진다)
  onToggle: (id: string) => void
  onPhase: (code: string) => void
  onWorkshop: (phase: string, card: string, tab?: Tab, notebook?: string) => void
}

// 패널을 연 동안 왼쪽에 남는 그 Phase의 가지. 출발한 보기의 모양을 그대로 따라야 같은 조각이 자리만 옮긴다:
//   전체 보기에서 왔으면 도면의 열(PhaseColumn), 펼쳐 보기에서 왔으면 같은 둥근 카드(팀 · Task Card).
// 가로 도면에서는 열이 통째로 옮겨 오고, 세로 도면에서는 팀 가지들이 하나씩 왼쪽 열로 접혀 온다 (data-from)
function BranchPane({ orient, view, phase, team, activeCard, expanded, onToggle, onPhase, onWorkshop }: Props) {
  const code = phase.code ?? ''
  return (
    <nav className="branch-pane" aria-label={`Phase ${code} task cards`} data-team={team} data-from={orient} data-view={view}>
      {view === 'step' ? (
        // 펼쳐 보기의 Phase 한 열: 원 + 이름, 그 아래 팀 카드와 펼쳐 둔 Task Card 카드
        <div className="steps step-branch" data-orient="across" data-team={team}>
          <div className="phase-col step-phase" data-phase={code} data-open>
            <div className="phase-cell">
              <button type="button" className="phase-head" data-part="head" onClick={() => onPhase(code)}>
                <span className="station" data-station={code} aria-hidden="true">
                  <StationArt />
                  {code}
                </span>
                <span className="phase-text">
                  <span className="phase-title">
                    <span className="visually-hidden">Phase {code}: </span>
                    {phase.title}
                  </span>
                </span>
              </button>
            </div>
            <Kids open>
              {(phase.children ?? []).map((t) => (
                <TeamNode
                  key={t.id}
                  phase={code}
                  node={t}
                  team={team}
                  expanded={expanded}
                  active={activeCard}
                  onToggle={onToggle}
                  onCard={onWorkshop}
                />
              ))}
            </Kids>
          </div>
        </div>
      ) : (
        <PhaseColumn as="div" phase={phase} team={team} activeCard={activeCard} onPhase={onPhase} onWorkshop={onWorkshop} />
      )}
    </nav>
  )
}

export default BranchPane

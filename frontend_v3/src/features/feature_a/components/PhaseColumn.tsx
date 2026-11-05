import type { CSSProperties } from 'react'
import type { MissionNode } from '../types'
import { teamColor, teamNumber } from '../teams'
import { cardId, cardTitle, hasWorkshop } from '../tree'
import type { Tab } from '../hooks/useRoute'
import { Balloon, Slots, StationArt } from './Drawing'

interface Props {
  phase: MissionNode
  team?: string
  activeCard?: string // 옆 패널에 열린 Task Card (먹 반전)
  hidden?: boolean // 자리는 지키고 보이지 않게 (그 가지가 실제로 옮겨 가는 동안 도면 사본에서)
  as?: 'li' | 'div'
  onPhase: (code: string) => void
  onWorkshop: (phase: string, card: string, tab?: Tab) => void
}

// Phase 가지 하나: 원 + 이름, 팀 가지, Task Card 잎.
// 전체 도면의 열과 옆 패널을 연 동안의 왼쪽 가지가 같은 모양이어야 이어지는 전환이 된다
function PhaseColumn({ phase, team, activeCard, hidden, as: Tag = 'li', onPhase, onWorkshop }: Props) {
  const code = phase.code ?? ''
  const teams = phase.children ?? []
  const workshops = teams.reduce((n, t) => n + (t.children?.length ?? 0), 0)
  const dim = !!team && !teams.some((t) => t.code === team)
  return (
    <Tag
      className="phase-col"
      data-dim={dim || undefined}
      data-phase={code}
      style={hidden ? { visibility: 'hidden' } : undefined}
    >
      {/* data-part: 도면 ↔ 왼쪽 가지 사이에서 함께 움직이는 조각 (hooks/useBranchMotion.ts) */}
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
          {/* 이 Phase의 Task Card 수: 마우스를 올렸을 때만 보인다 */}
          <span className="phase-count">
            {workshops} task card{workshops === 1 ? '' : 's'}
          </span>
        </span>
      </button>

      <ul className="branch">
        {teams.map((t) => (
          <li
            key={t.id}
            className="team"
            data-part={`team-${teamNumber(t.code ?? '')}`}
            data-match={team === t.code || undefined}
            style={{ '--c': teamColor(t.code ?? ''), '--n': teamNumber(t.code ?? '') } as CSSProperties}
          >
            <div className="team-head" title={t.title}>
              <Balloon code={t.code ?? ''} />
              <span className="team-code">{t.code}</span>
            </div>
            <ul className="leaves">
              {(t.children ?? []).map((ws) => {
                const id = cardId(ws)
                // 줄(이름)을 누르면 Manual부터, 자료 칸을 누르면 그 자료를 바로 연다
                return (
                  <li key={ws.id} className="leaf-row" aria-current={activeCard === id || undefined}>
                    <button
                      type="button"
                      className="leaf"
                      title={cardTitle(ws)}
                      aria-label={`${t.code} ${ws.code} ${ws.title}`}
                      onClick={() => onWorkshop(code, id)}
                    >
                      <span className="leaf-code">{ws.code}</span>
                      <span className="leaf-name">{ws.title}</span>
                    </button>
                    <Slots
                      manual={!!t.manual}
                      notebook={hasWorkshop(ws)}
                      label={`${t.code} ${ws.code}`}
                      onOpen={(tab) => onWorkshop(code, id, tab)}
                    />
                  </li>
                )
              })}
            </ul>
          </li>
        ))}
      </ul>
    </Tag>
  )
}

export default PhaseColumn

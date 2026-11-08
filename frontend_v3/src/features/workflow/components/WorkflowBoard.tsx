import type { CSSProperties } from 'react'
import type { MissionNode } from '../../feature_a/types'
import { TEAMS, teamColor, teamOn } from '../../feature_a/teams'
import { cardId, cardTitle, hasWorkshop } from '../../feature_a/tree'
import { routeHash } from '../../feature_a/hooks/useRoute'
import type { Tab } from '../../feature_a/hooks/useRoute'
import { useTrunkEnd } from '../../feature_a/hooks/useTrunkEnd'
import { Balloon, Slots, StationArt } from '../../feature_a/components/Drawing'
import Legend from '../../feature_a/components/Legend'
import '../../feature_a/components/sheet.css'
import '../../feature_a/components/steps.css'
import './workflowBoard.css'

interface Props {
  phases: MissionNode[]
  team: string
}

// Workshop(Task Card)은 미션 트리의 패널로 연다 (via=sheet: 왼쪽에 그 Phase의 가지가 남는다). 뒤로 가기로 Workflow에 돌아온다
const href = (phase: string, card: string, tab: Tab) => routeHash({ phase, card, tab, via: 'sheet' })

// 한 팀의 일: 펼쳐 보기(Across)와 같은 줄기 · 카드 · 가지로, 모든 Phase를 늘 펼친 채 그 팀 것만 보인다.
//   Phase → Manual(1) → Workshop(N, = Task Card) → Task
// Manual 하나에 Workshop이 하나 이상 매달린다. Manual이 아직 없으면 빈 칸(점선)으로 자리만 지킨다
function WorkflowBoard({ phases, team }: Props) {
  const trunk = useTrunkEnd('across')
  const name = TEAMS.find((t) => t.code === team)?.name
  const mine = phases.map((p) => ({ phase: p, sub: p.children?.find((s) => s.code === team) }))
  const total = mine.reduce((n, m) => n + (m.sub?.children?.length ?? 0), 0)
  const go = (phase: string, card: string, tab: Tab) => window.location.assign(href(phase, card, tab))

  return (
    <section
      className="steps workflow"
      data-view="step"
      data-orient="across"
      data-team={team}
      aria-labelledby="workflow-title"
      style={{ '--c': teamColor(team), '--on': teamOn(team) } as CSSProperties}
    >
      <div className="steps-tools">
        <h1 id="workflow-title" className="wf-title">
          <Balloon code={team} />
          <span className="wf-code">{team}</span>
          <span className="wf-name">{name}</span>
        </h1>
        <span className="wf-meta">
          {total} workshop{total === 1 ? '' : 's'} · {mine.filter((m) => m.sub).length} of {phases.length} phases
        </span>
        <Legend inline />
      </div>

      <div className="steps-scroll">
        <ol ref={trunk} className="steps-trunk">
          {mine.map(({ phase, sub }) => {
            const code = phase.code ?? ''
            const workshops = sub?.children ?? []
            const first = workshops[0] && cardId(workshops[0])
            return (
              <li key={phase.id} className="phase-col step-phase" data-phase={code} data-open={sub ? true : undefined} data-dim={sub ? undefined : true}>
                <div className="phase-cell">
                  <div className="phase-head">
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
                  </div>
                  <span className="phase-sub">
                    <span className="step-noun">
                      {sub ? `${workshops.length} workshop${workshops.length === 1 ? '' : 's'}` : `No ${team} work`}
                    </span>
                  </span>
                </div>

                {sub && (
                  <ul className="kids">
                    <li className="step-node team-node manual-node" data-match data-open>
                      <div className="step-cell">
                        {sub.manual && first ? (
                          <a className="step-row team-row" href={href(code, first, 'manual')} title={sub.manual.title}>
                            <Balloon code={team} />
                            <span className="team-code">MANUAL</span>
                            <span className="team-name">{sub.manual.title}</span>
                          </a>
                        ) : (
                          <div className="step-row team-row" data-missing>
                            <Balloon code={team} />
                            <span className="team-code">MANUAL</span>
                            <span className="team-name">Not written yet</span>
                          </div>
                        )}
                      </div>

                      <ul className="kids">
                        {workshops.map((ws) => {
                          const id = cardId(ws)
                          const tasks = ws.children ?? []
                          return (
                            <li key={ws.id} className="step-node card-node" data-open>
                              <div className="step-cell">
                                <div className="step-row card-row" title={cardTitle(ws)}>
                                  <a className="card-hit" href={href(code, id, 'workshop')} aria-label={`${team} ${ws.code} ${ws.title}: open workshop`}>
                                    <span className="step-code">{ws.code}</span>
                                    <span className="step-name">{ws.title}</span>
                                  </a>
                                  <Slots manual={!!sub.manual} notebook={hasWorkshop(ws)} label={`${team} ${ws.code}`} onOpen={(tab) => go(code, id, tab)} />
                                </div>
                              </div>

                              <ol className="kids">
                                {tasks.map((t, k) => (
                                  <li key={t.id} className="step-node task-node">
                                    <div className="step-cell">
                                      <a className="step-row task-row" href={href(code, id, 'tasks')} title={t.detail}>
                                        <span className="step-code">{`${ws.code}.${k + 1}`}</span>
                                        <span className="step-name">{t.title}</span>
                                      </a>
                                    </div>
                                  </li>
                                ))}
                              </ol>
                            </li>
                          )
                        })}
                      </ul>
                    </li>
                  </ul>
                )}
              </li>
            )
          })}
        </ol>
      </div>
    </section>
  )
}

export default WorkflowBoard

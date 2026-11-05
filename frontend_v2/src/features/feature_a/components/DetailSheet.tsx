import { useEffect, useState } from 'react'
import type { CSSProperties } from 'react'
import type { MissionNode } from '../types'
import { teamColor } from '../teams'
import { cardId, cardTitle, slotLabel } from '../tree'
import { PHASE_REVIEWS, REVIEW_SOURCE } from '../reviews'
import { Balloon, Icon, Slots, StationArt } from './Drawing'
import Legend from './Legend'
import './detailSheet.css'

interface Props {
  phase: MissionNode
  prev?: MissionNode
  next?: MissionNode
  team?: string
  onPhase: (code?: string) => void
  onWorkshop: (card: string) => void
}

// Phase 상세도: 전체 도면의 Phase 하나를 크게 그린 장.
//   맨 위: 이 Phase를 끝내려면 (NASA 검토 회의 + PM의 Phase gate 카드 단계)
//   본문: 팀별 Workshop. 줄 끝의 ▸로 그 자리에서 Task를 펼쳐 이 Phase의 일 전체를 한 장에서 본다
function DetailSheet({ phase, prev, next, team, onPhase, onWorkshop }: Props) {
  const code = phase.code ?? ''
  const teams = phase.children ?? []
  const workshops = teams.reduce((n, t) => n + (t.children?.length ?? 0), 0)
  const reviews = PHASE_REVIEWS[code] ?? []
  // PM 카드 중 이 Phase를 닫는 카드 (SYS의 "Phase gate"): 그 단계가 곧 Phase를 끝내는 순서다
  const gate = teams.flatMap((t) => t.children ?? []).find((ws) => ws.title === 'Phase gate')
  const allCards = teams.flatMap((t) => (t.children ?? []).map(cardId))

  // Task를 펼친 Workshop들 (Phase를 바꾸면 페이지가 이 화면을 새로 만들어 비워진다)
  const [open, setOpen] = useState<Set<string>>(() => new Set())
  const toggle = (id: string) =>
    setOpen((s) => {
      const n = new Set(s)
      if (n.has(id)) n.delete(id)
      else n.add(id)
      return n
    })

  // 팀을 고른 채 상세도에 들어오면(또는 상세도에서 팀을 고르면) 그 팀 묶음을 화면 맨 위에 맞춘다.
  // 페이지가 Phase를 바꿀 때 맨 위로 되돌리는 것(useRoute)보다 뒤에 실행되도록 한 프레임 미룬다.
  const hasTeam = !!team && teams.some((t) => t.code === team)
  useEffect(() => {
    if (!hasTeam) return
    const frame = requestAnimationFrame(() =>
      document.querySelector('.group[data-match]')?.scrollIntoView({ block: 'start' }),
    )
    return () => cancelAnimationFrame(frame)
  }, [code, team, hasTeam])

  return (
    <section className="detail" aria-labelledby="detail-title" data-team={team}>
      <header className="detail-head">
        <span className="station detail-station" data-station={code} aria-hidden="true">
          <StationArt />
          {code}
        </span>
        <div className="detail-heading">
          <h1 id="detail-title">
            <span className="visually-hidden">Phase {code}: </span>
            {phase.title}
          </h1>
          <p className="detail-meta">
            Phase {code} · {workshops} workshop{workshops === 1 ? '' : 's'} · {teams.length} team
            {teams.length === 1 ? '' : 's'}
          </p>
        </div>
        <nav className="detail-nav" aria-label="Phases">
          <button type="button" className="btn" onClick={() => onPhase(undefined)}>
            <Icon name="up" />
            Whole mission
          </button>
          <button
            type="button"
            className="btn"
            disabled={!prev}
            aria-label={prev ? `Previous phase: ${prev.code} ${prev.title}` : 'No previous phase'}
            onClick={() => prev && onPhase(prev.code)}
          >
            <Icon name="left" />
            {prev?.code ?? 'Start'}
          </button>
          <button
            type="button"
            className="btn"
            disabled={!next}
            aria-label={next ? `Next phase: ${next.code} ${next.title}` : 'No next phase'}
            onClick={() => next && onPhase(next.code)}
          >
            {next?.code ?? 'End'}
            <Icon name="right" />
          </button>
        </nav>
      </header>

      {/* 이 Phase를 끝내려면: 검토 회의와 Phase gate 카드의 단계 */}
      <section className="gate-box" aria-labelledby="gate-title">
        <h2 id="gate-title" className="gate-heading">
          <span className="gate-mark" aria-hidden="true" />
          To close Phase {code}
        </h2>
        <p className="gate-reviews">
          {reviews.map((r, i) => (
            <span key={r.code}>
              {i > 0 && ' · '}
              <abbr title={r.name}>{r.code}</abbr> {r.name}
            </span>
          ))}
          <span className="gate-source">Review names: {REVIEW_SOURCE}</span>
        </p>
        {gate && (
          <ol className="gate-steps">
            {(gate.children ?? []).map((s, i) => (
              <li key={s.id}>
                <span className="gate-num">{i + 1}</span>
                <span className="gate-step">
                  <span className="gate-step-name">{s.title}</span>
                  {/* PM 원문이 단계 이름으로 시작하면("Space-grade check: …") 그 부분은 빼고 쓴다 */}
                  <span className="gate-step-full">
                    {s.detail?.toLowerCase().startsWith(`${s.title.toLowerCase()}:`)
                      ? s.detail.slice(s.title.length + 1).trim()
                      : s.detail}
                  </span>
                </span>
              </li>
            ))}
          </ol>
        )}
      </section>

      <div className="detail-tools">
        <span className="detail-tools-label">Tasks</span>
        <button type="button" className="btn" onClick={() => setOpen(new Set(allCards))}>
          Expand all
        </button>
        <button type="button" className="btn" onClick={() => setOpen(new Set())}>
          Collapse all
        </button>
      </div>

      <div className="detail-body">
        {teams.map((t) => (
          <section
            key={t.id}
            className="group"
            data-match={team === t.code || undefined}
            style={{ '--c': teamColor(t.code ?? '') } as CSSProperties}
            aria-label={t.title}
          >
            <h2 className="group-head">
              <Balloon code={t.code ?? ''} size="md" />
              <span className="group-name">{t.title}</span>
              <span className="group-code">{t.code}</span>
            </h2>
            <ol className="ws-list">
              {(t.children ?? []).map((ws) => {
                const id = cardId(ws)
                const notebook = [ws, ...(ws.children ?? [])].some((n) => n.notebook)
                const tasks = ws.children?.length ?? 0
                const expanded = open.has(id)
                return (
                  <li key={ws.id} className="ws-item">
                    <button
                      type="button"
                      className="ws-row"
                      aria-label={`${ws.code} ${cardTitle(ws)}, ${tasks} tasks, ${slotLabel(!!t.manual, notebook)}`}
                      onClick={() => onWorkshop(id)}
                    >
                      <span className="ws-code">{ws.code}</span>
                      <span className="ws-text">
                        <span className="ws-name">{ws.title}</span>
                        {cardTitle(ws).toLowerCase() !== ws.title.toLowerCase() && (
                          <span className="ws-full">{cardTitle(ws)}</span>
                        )}
                      </span>
                      <span className="ws-side">
                        <Slots manual={!!t.manual} notebook={notebook} />
                        <span className="ws-tasks">{tasks} tasks</span>
                      </span>
                    </button>
                    <button
                      type="button"
                      className="ws-expand"
                      aria-expanded={expanded}
                      aria-controls={`tasks-${id}`}
                      aria-label={`${expanded ? 'Hide' : 'Show'} tasks of ${ws.code} ${ws.title}`}
                      onClick={() => toggle(id)}
                    >
                      <Icon name="right" />
                    </button>
                    {expanded && (
                      <ol className="ws-task-list" id={`tasks-${id}`}>
                        {(ws.children ?? []).map((task, k) => (
                          <li key={task.id}>
                            <span className="ws-task-code">
                              {ws.code}.{k + 1}
                            </span>
                            <span className="ws-task-text">
                              <span className="ws-task-name">{task.title}</span>
                              {task.detail && task.detail.toLowerCase() !== task.title.toLowerCase() && (
                                <span className="ws-task-full">{task.detail}</span>
                              )}
                            </span>
                            {task.notebook && <span className="ws-task-nb">Notebook</span>}
                          </li>
                        ))}
                      </ol>
                    )}
                  </li>
                )
              })}
            </ol>
          </section>
        ))}
      </div>

      <footer className="detail-foot">
        <Legend />
      </footer>
    </section>
  )
}

export default DetailSheet

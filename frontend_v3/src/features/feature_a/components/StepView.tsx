import { useLayoutEffect, useRef, useState, type CSSProperties, type ReactNode } from 'react'
import type { MissionNode } from '../types'
import type { Tab } from '../hooks/useRoute'
import { TEAMS, teamColor, teamNumber, teamOn } from '../teams'
import { cardId, cardTitle, hasWorkshop } from '../tree'
import { Balloon, Slots, StationArt } from './Drawing'
import Legend from './Legend'
import { useTrunkEnd } from '../hooks/useTrunkEnd'
import './steps.css'

type Orient = 'across' | 'down'

interface Props {
  orient: Orient
  tree: MissionNode
  team?: string
  expanded: Set<string>
  hidePhase?: string // 이 Phase의 가지는 자리만 지키고 숨긴다 (도면 사본에서)
  onToggle: (id: string) => void
  onExpandAll: () => void
  onCollapseAll: () => void
  depth?: number // 지금 펼친 상태가 몇 단계까지인지 (0 = Phase만 … 3 = Task까지). 섞여 있으면 undefined
  onDepth: (depth: number) => void
  onCard: (phase: string, card: string, tab?: Tab, notebook?: string) => void
}

// 펼침 단추: 접혀 있을 때만 "+개수". 펼친 뒤에는 가지가 보이니 따로 표시하지 않는다 (줄을 다시 누르면 접힌다)
function Toggle({ open, count, noun, of, onClick }: { open: boolean; count: number; noun: string; of: string; onClick: () => void }) {
  if (open) return null
  return (
    <button
      type="button"
      className="step-toggle"
      aria-expanded={false}
      aria-label={`Show ${count} ${noun} of ${of}`}
      title={`Show ${noun}`}
      onClick={onClick}
    >
      {`+${count}`}
    </button>
  )
}

const EASE_OPEN = 'cubic-bezier(0.16, 1, 0.3, 1)'
const EASE_CLOSE = 'cubic-bezier(0.4, 0, 0.6, 1)'

// 펼친 단계(가지): 높이가 늘고 줄며 열리고 접힌다. 접는 동안에는 남겨 두었다가 다 접히면 뺀다.
// 처음부터 펼친 채로 생기면(Expand all 안쪽, 보기 전환) 움직이지 않는다: 바깥 가지 하나만 움직인다.
export function Kids({ open, as: Tag = 'ul', children }: { open: boolean; as?: 'ul' | 'ol'; children: ReactNode }) {
  const ref = useRef<HTMLUListElement & HTMLOListElement>(null)
  const anim = useRef<Animation | null>(null)
  const was = useRef(open)
  const [shown, setShown] = useState(open)
  if (open && !shown) setShown(true)

  useLayoutEffect(() => {
    if (was.current === open) return
    was.current = open
    const el = ref.current
    if (!el) return
    // 막 생긴 가지는 0에서, 움직이는 중에 다시 누르면 지금 높이에서 이어서 간다.
    // 위 여백(연결선이 지나는 틈)도 같이 0까지 줄인다: 남겨 두면 접힌 끝에 한 줄 틈이 남는다.
    const fresh = open && !anim.current
    const now = { height: `${fresh ? 0 : el.getBoundingClientRect().height}px`, paddingTop: fresh ? '0px' : getComputedStyle(el).paddingTop }
    anim.current?.cancel()
    const full = { height: `${el.getBoundingClientRect().height}px`, paddingTop: getComputedStyle(el).paddingTop }
    const end = open ? full : { height: '0px', paddingTop: '0px' }
    const still = matchMedia('(prefers-reduced-motion: reduce)').matches
    const frames = still
      ? [{ opacity: open ? 0 : 1 }, { opacity: open ? 1 : 0 }]
      : [
          { ...now, opacity: open ? 0 : 1, overflow: 'clip' },
          { ...end, opacity: open ? 1 : 0, overflow: 'clip' },
        ]
    const a = el.animate(frames, {
      duration: still ? 120 : open ? Math.min(420, 260 + el.scrollHeight / 12) : 220,
      easing: open ? EASE_OPEN : EASE_CLOSE,
      // 접힌 끝 모양을 지우기 전까지 붙들어 둔다: 안 그러면 사라지기 직전 한 프레임 동안 다 펼친 가지가 번쩍 보인다
      fill: open ? 'none' : 'forwards',
    })
    anim.current = a
    a.onfinish = () => {
      anim.current = null
      if (!open) setShown(false)
    }
  }, [open])

  if (!shown) return null
  return (
    <Tag ref={ref} className="kids" inert={!open}>
      {children}
    </Tag>
  )
}

// 모두 접혀 있으면 Phase 줄기를 화면 가운데에 둔다 (v1처럼): Across는 위아래, Down은 좌우 가운데.
// 하나라도 펼치면 위(Across) · 왼쪽(Down)으로 미끄러져 간다. 방향 · 보기를 바꾼 직후와 창 크기를 바꿀 때는 바로 그 자리에.
function useCenter(orient: Orient, anyOpen: boolean) {
  const ref = useRef<HTMLDivElement>(null)
  const placed = useRef<Orient | null>(null)

  useLayoutEffect(() => {
    const el = ref.current
    const box = el?.parentElement
    if (!el || !box) return
    const place = (instant: boolean) => {
      let x = 0
      let y = 0
      if (!anyOpen) {
        // 접히는 중인 가지가 아직 남아 있을 수 있어, 접힌 줄기의 크기는 Phase 칸으로 잰다
        const cells = [...el.querySelectorAll<HTMLElement>('.phase-cell')]
        const trunk = el.firstElementChild as HTMLElement
        const tail = parseFloat(getComputedStyle(trunk.lastElementChild!).paddingBottom) || 0
        const h =
          orient === 'across'
            ? Math.max(0, ...cells.map((c) => c.offsetHeight))
            : cells.reduce((sum, c) => sum + c.offsetHeight, 0) + (parseFloat(getComputedStyle(trunk).rowGap) || 0) * (cells.length - 1) + tail
        // 종이의 최소 높이(화면 높이)를 기준으로: 접히는 중인 가지가 늘려 놓은 높이는 세지 않는다
        const paper = getComputedStyle(box)
        const room = Math.min(box.clientHeight, parseFloat(paper.minHeight) - 2) - parseFloat(paper.paddingBottom) - el.offsetTop
        y = Math.max(0, (room - h) / 2)
        if (orient === 'down') x = Math.max(0, (el.clientWidth - (cells[0]?.offsetWidth ?? 0)) / 2)
      }
      if (instant) el.style.transition = 'none'
      el.style.translate = `${Math.round(x)}px ${Math.round(y)}px`
      if (instant) {
        void el.offsetWidth
        el.style.transition = ''
      }
    }
    place(placed.current !== orient)
    placed.current = orient
    const onResize = () => place(true)
    window.addEventListener('resize', onResize)
    return () => window.removeEventListener('resize', onResize)
  }, [orient, anyOpen])

  return ref
}

// 펼쳐 보기: 전체 도면과 같은 Phase 단추 · 팀 풍선 · 자료 칸으로, 한 번에 한 단계씩 연다.
//   Phase → 팀(Subsystem) → Task Card → Task.
//   Across: 줄기가 왼쪽에서 오른쪽, 펼친 단계는 그 Phase 아래로 들여 내려간다.
//   Down:   줄기가 위에서 아래, 펼친 단계는 오른쪽 열(Team | Task card | Task)로 뻗는다.
// Phase는 단추·이름·+개수 어디를 눌러도 펼친다. Task Card를 누르면 패널: 전체 보기에서 누른 것과 같은 화면이다.
function StepView({ orient, tree, team, expanded, hidePhase, onToggle, onExpandAll, onCollapseAll, depth, onDepth, onCard }: Props) {
  const phases = tree.children ?? []
  const anyOpen = phases.some((p) => expanded.has(p.id))
  const scroll = useCenter(orient, anyOpen)
  const trunk = useTrunkEnd(orient)

  return (
    <section className="steps" data-overview data-view="step" data-orient={orient} data-team={team} aria-label="Mission tree, step by step">
      <h1 className="visually-hidden">{tree.title} mission tree</h1>

      <div className="steps-tools">
        <button type="button" className="btn" onClick={onExpandAll}>
          Expand all
        </button>
        <button type="button" className="btn" onClick={onCollapseAll} disabled={!anyOpen}>
          Collapse all
        </button>
        <Legend inline />
      </div>

      {/* 세로(Down): 열 이름. 누르면 그 단계까지만 펼치고 그 아래는 접는다.
          이미 그 단계까지 펼쳐 있으면(눌린 상태) 다시 눌러 그 단계를 접는다: 한 단계 위까지로 돌아간다 */}
      {orient === 'down' && (
        <div className="steps-cols" role="group" aria-label="Expand to level">
          {['Phase', 'Subsystem', 'Materials', 'Task'].map((name, d) => (
            <button
              key={name}
              type="button"
              aria-pressed={depth === d}
              title={d === 0 ? 'Show phases only' : depth === d ? `Collapse ${name.toLowerCase()}` : `Expand down to ${name.toLowerCase()}`}
              onClick={() => onDepth(depth === d ? Math.max(0, d - 1) : d)}
            >
              {name}
            </button>
          ))}
        </div>
      )}

      <div ref={scroll} className="steps-scroll">
        <ol ref={trunk} className="steps-trunk">
          {phases.map((phase) => {
            const code = phase.code ?? ''
            const teams = phase.children ?? []
            const open = expanded.has(phase.id)
            const dim = !!team && !teams.some((t) => t.code === team)
            return (
              <li
                key={phase.id}
                className="phase-col step-phase"
                data-phase={code}
                data-open={open || undefined}
                data-dim={dim || undefined}
                style={code === hidePhase ? { visibility: 'hidden' } : undefined}
              >
                <div className="phase-cell">
                  {/* data-part: 보기를 바꾸거나 패널을 열 때 함께 움직이는 조각 (hooks/useOrientMotion.ts, useBranchMotion.ts) */}
                  <button type="button" className="phase-head" data-part="head" aria-expanded={open} onClick={() => onToggle(phase.id)}>
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
                  <span className="phase-sub" data-part="sub">
                    <Toggle open={open} count={teams.length} noun="teams" of={`Phase ${code}`} onClick={() => onToggle(phase.id)} />
                    <span className="step-noun" aria-hidden="true">
                      {teams.length} team{teams.length === 1 ? '' : 's'}
                    </span>
                  </span>
                </div>

                <Kids open={open}>
                  {teams.map((t) => (
                    <TeamNode key={t.id} phase={code} node={t} team={team} expanded={expanded} onToggle={onToggle} onCard={onCard} />
                  ))}
                </Kids>
              </li>
            )
          })}
        </ol>
      </div>
    </section>
  )
}

interface NodeProps {
  phase: string
  node: MissionNode
  team?: string
  expanded: Set<string>
  active?: string // 옆 패널에 열린 Task Card (패널 왼쪽 가지에서만)
  onToggle: (id: string) => void
  onCard: Props['onCard']
}

// 팀: 줄 전체가 펼침 단추 (팀 자체는 열리는 화면이 없다)
export function TeamNode({ phase, node, team, expanded, active, onToggle, onCard }: NodeProps) {
  const code = node.code ?? ''
  const cards = node.children ?? []
  const open = expanded.has(node.id)
  const name = TEAMS.find((t) => t.code === code)?.name ?? node.title
  return (
    <li
      className="step-node team-node"
      data-part={`team-${teamNumber(code)}`}
      data-match={team === code || undefined}
      data-open={open || undefined}
      style={{ '--c': teamColor(code), '--on': teamOn(code) } as CSSProperties}
    >
      <div className="step-cell">
        <button
          type="button"
          className="step-row team-row"
          aria-expanded={open}
          aria-label={`${code} ${name}: ${open ? 'hide' : 'show'} ${cards.length} task cards`}
          onClick={() => onToggle(node.id)}
        >
          <Balloon code={code} />
          <span className="team-code">{code}</span>
          <span className="team-name">{name}</span>
          {!open && (
            <span className="step-toggle" aria-hidden="true">
              +{cards.length}
            </span>
          )}
        </button>
      </div>

      <Kids open={open}>
        {cards.map((ws) => (
          <CardNode key={ws.id} phase={phase} node={ws} manual={!!node.manual} team={code} expanded={expanded} active={active} onToggle={onToggle} onCard={onCard} />
        ))}
      </Kids>
    </li>
  )
}

// Task Card(Materials 열): 줄을 누르면 Task를 펼치고 접는다. 자료는 오른쪽 두 칸으로 연다 (v1처럼)
function CardNode({ phase, node, manual, team, expanded, active, onToggle, onCard }: Omit<NodeProps, 'team'> & { manual: boolean; team: string }) {
  const id = cardId(node)
  const tasks = node.children ?? []
  const open = expanded.has(node.id)
  return (
    <li className="step-node card-node" data-open={open || undefined}>
      <div className="step-cell">
        {/* 카드 하나 안에 [코드 + 이름 = 펼침 단추] [자료 칸 두 개] [+개수]. 펼침 단추는 카드 전체를 누를 수 있게 덮는다 (cad.css .card-hit) */}
        <div className="step-row card-row" title={cardTitle(node)} aria-current={active === id || undefined}>
          {tasks.length > 0 ? (
            <button
              type="button"
              className="card-hit"
              aria-expanded={open}
              aria-label={`${team} ${node.code} ${node.title}: ${open ? 'hide' : 'show'} ${tasks.length} tasks`}
              onClick={() => onToggle(node.id)}
            >
              <span className="step-code">{node.code}</span>
              <span className="step-name">{node.title}</span>
            </button>
          ) : (
            <span className="card-hit">
              <span className="step-code">{node.code}</span>
              <span className="step-name">{node.title}</span>
            </span>
          )}
          <Slots manual={manual} notebook={hasWorkshop(node)} label={`${team} ${node.code}`} onOpen={(tab) => onCard(phase, id, tab)} />
          {tasks.length > 0 && <Toggle open={open} count={tasks.length} noun="tasks" of={`${team} ${node.code}`} onClick={() => onToggle(node.id)} />}
        </div>
      </div>

      <Kids open={open} as="ol">
        {tasks.map((t, k) => {
          const label = `${node.code}.${k + 1}`
          return (
            <li key={t.id} className="step-node task-node">
              <div className="step-cell">
                <button type="button" className="step-row task-row" title={t.detail} onClick={() => onCard(phase, id, 'tasks')}>
                  <span className="step-code">{label}</span>
                  <span className="step-name">{t.title}</span>
                </button>
              </div>
            </li>
          )
        })}
      </Kids>
    </li>
  )
}

export default StepView

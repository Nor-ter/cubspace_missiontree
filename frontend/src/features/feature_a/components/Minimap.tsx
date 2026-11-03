import { useEffect, useRef, useState } from 'react'
import type { MissionNode } from '../types'
import type { CSSProperties } from 'react'
import { teamColor, teamNumber, teamOn as teamOnColor } from '../teams'
import { cardId } from '../tree'
import { Icon } from './Drawing'
import './minimap.css'

// 미니맵: 화면 오른쪽 아래에 고정된 작은 전체 트리. 지금 어디를 보고 있는지 불을 켜서 보여 준다.
//   전체 도면을 볼 때: 모든 가지에 불
//   Phase 상세도를 볼 때: Pre-A부터 그 Phase까지 줄기 + 그 Phase의 가지 전부
//   Workshop을 열었을 때: Pre-A부터 그 Phase까지 줄기 + 그 팀 + 그 Workshop만
// 글자는 Phase 코드, 팀 번호, Workshop 코드만 쓴다.

export interface Lit {
  phase?: string // 없으면 전체
  team?: string
  card?: string
}

interface Props {
  tree: MissionNode
  lit: Lit
  orient: 'across' | 'down' // 도면과 같은 방향으로 그린다
  onPhase: (code: string) => void
  onWorkshop: (phase: string, card: string) => void
}

// 그림 치수 (px). Workshop 코드는 팀 번호 옆에 한 줄로, 3개마다 줄을 바꾼다 (미니맵이 낮아진다)
const COL_W = 54
const PAD = 10
const STATION_R = 9
const STATION_Y = PAD + STATION_R
const BRANCH_TOP = STATION_Y + STATION_R + 7
const LINE_H = 10
const PER_LINE = 3
const CODE_W = 12.5
const TEAM_R = 4
// 세로 방향: Phase마다 한 줄, 팀은 번호대로 같은 열 (도면의 세로 방향과 같은 배치)
const DOWN_X0 = PAD + STATION_R * 2 + 16
const DOWN_COL_W = PER_LINE * CODE_W + 6
const ROW_GAP = 7
const COLLAPSE_KEY = 'mission-tree.minimap-collapsed'

function readCollapsed() {
  try {
    return localStorage.getItem(COLLAPSE_KEY) === '1'
  } catch {
    return false
  }
}

function Minimap({ tree, lit, orient, onPhase, onWorkshop }: Props) {
  const phases = tree.children ?? []
  const [collapsed, setCollapsed] = useState(readCollapsed)
  const ref = useRef<HTMLElement>(null)

  const toggle = () =>
    setCollapsed((c) => {
      try {
        localStorage.setItem(COLLAPSE_KEY, c ? '0' : '1')
      } catch {
        // 저장이 막힌 브라우저에서는 이번 방문 동안만 기억한다
      }
      return !c
    })

  // 도면이 미니맵 아래로 가려지지 않게, 실제 높이를 --minimap-h로 알려 준다 (sheet.css가 그만큼 비운다)
  useEffect(() => {
    const el = ref.current
    if (!el) return
    const root = document.documentElement
    const ro = new ResizeObserver(() => root.style.setProperty('--minimap-h', `${el.offsetHeight}px`))
    ro.observe(el)
    return () => {
      ro.disconnect()
      root.style.removeProperty('--minimap-h')
    }
  }, [])

  const litIndex = lit.phase ? phases.findIndex((p) => p.code === lit.phase) : phases.length - 1
  const all = !lit.phase

  // Phase마다 원의 자리(sx, sy), 팀 풍선의 자리(cx, cy), 가지선의 시작 · 끝을 계산한다
  type Leaf = { ws: MissionNode; x: number; y: number }
  type Team = { t: MissionNode; cx: number; cy: number; leaves: Leaf[] }
  // 가로: 코드는 풍선 오른쪽에 / 세로: 풍선이 가로 가지선 위에 있으므로 코드는 그 아래 줄부터
  const leavesOf = (t: MissionNode, cx: number, cy: number): Leaf[] =>
    (t.children ?? []).map((ws, k) => ({
      ws,
      x: orient === 'down' ? cx - TEAM_R + (k % PER_LINE) * CODE_W : cx + TEAM_R + 2.5 + (k % PER_LINE) * CODE_W,
      y: cy + (Math.floor(k / PER_LINE) + (orient === 'down' ? 1 : 0)) * LINE_H,
    }))
  const lines = (t: MissionNode) => Math.max(1, Math.ceil((t.children?.length ?? 0) / PER_LINE))

  // 세로 방향: 줄마다 높이(가장 긴 팀의 코드 줄 수)를 먼저 재고, 그 합으로 각 줄의 위치를 정한다
  const rowBottom = (phase: MissionNode, sy: number) =>
    sy + Math.max(STATION_R, (Math.max(1, ...(phase.children ?? []).map(lines)) + 0.5) * LINE_H)
  const rowTops = phases.reduce<number[]>(
    (tops, _phase, i) => (i === 0 ? [PAD + STATION_R] : [...tops, rowBottom(phases[i - 1], tops[i - 1]) + ROW_GAP + STATION_R]),
    [],
  )
  const columns = phases.map((phase, i) => {
    if (orient === 'down') {
      const sx = PAD + STATION_R
      const sy = rowTops[i]
      const teams: Team[] = (phase.children ?? []).map((t) => {
        const cx = DOWN_X0 + (teamNumber(t.code ?? '') - 1) * DOWN_COL_W
        return { t, cx, cy: sy, leaves: leavesOf(t, cx, sy) }
      })
      return { phase, sx, sy, teams, bottom: rowBottom(phase, sy) }
    }
    let y = BRANCH_TOP
    const sx = PAD + STATION_R + i * COL_W
    const teams: Team[] = (phase.children ?? []).map((t) => {
      const cy = y + LINE_H / 2
      const cx = sx + 4 + TEAM_R + 0.5
      y += lines(t) * LINE_H + 1
      return { t, cx, cy, leaves: leavesOf(t, cx, cy) }
    })
    return { phase, sx, sy: STATION_Y, teams, bottom: y }
  })
  const width =
    orient === 'down'
      ? DOWN_X0 + 6 * DOWN_COL_W - TEAM_R + PER_LINE * CODE_W + PAD
      : PAD * 2 + STATION_R + (phases.length - 1) * COL_W + 15 + PER_LINE * CODE_W
  const height = Math.max(...columns.map((c) => c.bottom)) + PAD

  // 가지선: 가로 방향은 원에서 아래로, 세로 방향은 원에서 오른쪽으로 (end = 끝 팀까지)
  const branchLine = (c: (typeof columns)[number], to: Team) =>
    orient === 'down'
      ? { x1: c.sx + STATION_R, y1: c.sy, x2: to.cx - TEAM_R, y2: c.sy }
      : { x1: c.sx, y1: c.sy + STATION_R, x2: c.sx, y2: to.cy }

  const phaseOn = (i: number) => all || i <= litIndex
  const branchOn = (code?: string) => all || (lit.phase === code && !lit.card)
  const teamOn = (phase?: string, team?: string) => branchOn(phase) || (lit.phase === phase && lit.team === team)
  const leafOn = (phase: string | undefined, team: string | undefined, card: string) =>
    branchOn(phase) || (lit.phase === phase && lit.team === team && lit.card === card)

  return (
    <aside ref={ref} className={collapsed ? 'minimap collapsed' : 'minimap'} aria-label="Minimap">
      <button
        type="button"
        className="minimap-toggle"
        aria-expanded={!collapsed}
        aria-label={collapsed ? 'Show minimap' : 'Hide minimap'}
        title={collapsed ? 'Show minimap' : 'Hide minimap'}
        onClick={toggle}
      >
        {collapsed ? <span className="minimap-chip">Map</span> : <Icon name="shrink" />}
      </button>
      {!collapsed && (
        <svg className="minimap-map" viewBox={`0 0 ${width} ${height}`} width={width} height={height}>
          {/* 줄기: Phase 원 사이의 선. 불이 켜진 Phase끼리는 먹색 */}
          {columns.slice(1).map((c, i) => {
            const p = columns[i]
            const seg =
              orient === 'down'
                ? { x1: p.sx, y1: p.sy + STATION_R, x2: c.sx, y2: c.sy - STATION_R }
                : { x1: p.sx + STATION_R, y1: p.sy, x2: c.sx - STATION_R, y2: c.sy }
            return <line key={c.phase.id} className={phaseOn(i + 1) ? 'mm-line on' : 'mm-line'} {...seg} />
          })}
          {columns.map((c) => {
            const code = c.phase.code ?? ''
            const last = c.teams.at(-1)
            // 가지의 세로선: 불이 켜진 마지막 팀까지만 먹색, 그 아래는 연하게
            const litTo = [...c.teams].reverse().find(({ t }) => teamOn(code, t.code))
            return (
              <g key={c.phase.id}>
                {last && <line className="mm-line" {...branchLine(c, last)} />}
                {litTo && <line className="mm-line on" {...branchLine(c, litTo)} />}
                <g
                  className={phaseOn(columns.indexOf(c)) ? 'mm-station on' : 'mm-station'}
                  onClick={() => onPhase(code)}
                >
                  <title>{`Phase ${code}: ${c.phase.title}`}</title>
                  {/* 도면의 Phase 단추와 같은 모양: 낮 = 원(지구), 밤 = 네모(인공위성) */}
                  <circle className="mm-shape globe" cx={c.sx} cy={c.sy} r={STATION_R} />
                  <rect
                    className="mm-shape sat"
                    x={c.sx - STATION_R}
                    y={c.sy - STATION_R}
                    width={STATION_R * 2}
                    height={STATION_R * 2}
                    rx={1.5}
                  />
                  <text x={c.sx} y={c.sy} className={code.length > 1 ? 'small' : undefined}>
                    {code}
                  </text>
                </g>
                {c.teams.map(({ t, cx, cy, leaves }) => {
                  const on = teamOn(code, t.code)
                  return (
                    <g
                      key={t.id}
                      className={on ? 'mm-team on' : 'mm-team'}
                      style={{ '--c': teamColor(t.code ?? ''), '--on': teamOnColor(t.code ?? '') } as CSSProperties}
                    >
                      {orient === 'across' && (
                        <line className="mm-tick" x1={c.sx} x2={cx - TEAM_R} y1={cy} y2={cy} />
                      )}
                      <circle cx={cx} cy={cy} r={TEAM_R} />
                      <text className="mm-num" x={cx} y={cy}>
                        {teamNumber(t.code ?? '')}
                      </text>
                      {leaves.map(({ ws, x: lx, y: ly }) => {
                        const id = cardId(ws)
                        return (
                          <text
                            key={ws.id}
                            className={leafOn(code, t.code, id) ? 'mm-leaf on' : 'mm-leaf'}
                            x={lx}
                            y={ly}
                            onClick={() => onWorkshop(code, id)}
                          >
                            <title>{`${t.code} ${ws.code} ${ws.title}`}</title>
                            {ws.code}
                          </text>
                        )
                      })}
                    </g>
                  )
                })}
              </g>
            )
          })}
        </svg>
      )}
    </aside>
  )
}

export default Minimap

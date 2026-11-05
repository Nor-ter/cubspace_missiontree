import type { Level, MissionNode, Status } from './types'
import type { StatsMap } from './tree'

// 좌표 단위는 SVG viewBox 기준 (화면 크기와 무관)
export const VIEW_WIDTH = 1200
export const SPINE_X = 190 // 위성 본체 왼쪽 태양전지 날개(본체 왼쪽 46px)가 SVG 밖으로 잘리지 않는 위치
export const MISSION_Y = 82
export const COLUMNS = [
  { level: 'subsystem', label: 'Subsystem', x: 480 },
  { level: 'task', label: 'Workshop', x: 765 },
  { level: 'subtask', label: 'Task', x: 1045 },
] as const

const SIZE: Record<Level, { w: number; h: number }> = {
  // 제목 15px이 버튼과 겹치지 않고 들어가는 크기
  mission: { w: 250, h: 64 },
  phase: { w: 250, h: 78 }, // PM Phase 이름이 길어 제목을 두 줄까지 쓴다
  subsystem: { w: 220, h: 54 },
  task: { w: 240, h: 54 }, // 오른쪽에 실습 버튼 자리를 둔다
  subtask: { w: 230, h: 50 },
}
// 단계 표시: 태양전지 칸 수로 단계를 구분한다 (2줄 × 열 수). 위 단계일수록 칸이 많다
// Subsystem 3열 = 6칸 / Task 2열 = 4칸 / Subtask 1열 = 2칸
export const CELL_COLS: Partial<Record<Level, number>> = { subsystem: 3, task: 2, subtask: 1 }
const ROW = 74 // 패널 한 줄 높이 (카드 사이 20~24px: 지금 할 일 배지 자리 포함)
// Subsystem 배열: 펼친 Subsystem이 없는 Phase는 Subsystem을 격자로 놓아 세로 길이와 빈 공간을 줄인다
const ARRAY = {
  cols: 3,
  left: 370, // 첫 열 카드의 왼쪽 (가지 모양일 때 Subsystem 열과 같은 자리)
  gapX: 44, // 카드 오른쪽의 "+n" 탭(30px)이 옆 카드와 겹치지 않는 간격
  pad: 14, // 배열 틀과 카드 사이
}
const PHASE_MIN = 112 // 접힌 Phase 한 칸 높이
const HEADER = 34 // 가지 모양 블록 위에 열 이름(Subsystem / Workshop / Task)을 놓을 자리
const FIRST_PHASE_TOP = 150

export interface PlacedNode {
  node: MissionNode
  label: string
  x: number // 가운데 x
  y: number // 가운데 y
  w: number
  h: number
  status: Status
  progress: number
  expanded: boolean
  hiddenCount: number // 접혀서 안 보이는 자식 수
}

export interface ArmGroup {
  parent: PlacedNode
  children: PlacedNode[]
}

// Phase 하나의 Subsystem 배열 (태양전지판 배열 틀 + 그 안의 카드)
export interface ArrayGroup {
  parent: PlacedNode
  frame: { x: number; y: number; w: number; h: number } // 왼쪽 위 기준
  children: PlacedNode[]
}

export interface SpineSegment {
  y1: number
  y2: number
  status: Status
}

export interface TreeLayout {
  mission: PlacedNode
  phases: PlacedNode[]
  panels: PlacedNode[]
  arms: ArmGroup[]
  arrays: ArrayGroup[]
  spine: SpineSegment[]
  columns: (typeof COLUMNS)[number][] // 가지 모양으로 놓인 카드가 있는 열만
  columnLabelY: number // 열 이름(Subsystem / Workshop / Task)을 첫 패널 바로 위에 둔다
  height: number
}

const letter = (i: number) => String.fromCharCode(65 + i) // 0 → A
const columnX = (level: Level) => COLUMNS.find((c) => c.level === level)?.x ?? 0

// 세로축: Phase를 위에서 아래로 쌓는다.
// 가로축: 펼친 노드의 자식을 오른쪽 열에 세로로 쌓는다.
// 단, 펼친 Subsystem이 없는 Phase는 Subsystem을 격자(배열)로 놓는다.
export function layoutTree(mission: MissionNode, expanded: Set<string>, stats: StatsMap): TreeLayout {
  const panels: PlacedNode[] = []
  const treePanels: PlacedNode[] = [] // 가지 모양으로 놓인 카드 (열 이름 표시용)
  const arms: ArmGroup[] = []
  const arrays: ArrayGroup[] = []

  const isOpen = (n: MissionNode) => expanded.has(n.id) && (n.children?.length ?? 0) > 0
  const heightOf = (n: MissionNode): number =>
    isOpen(n) ? (n.children ?? []).reduce((sum, c) => sum + heightOf(c), 0) : ROW
  // 이 Phase의 Subsystem을 배열로 놓을 수 있는가 (펼친 Subsystem이 하나도 없을 때)
  const asArray = (ph: MissionNode) => isOpen(ph) && !(ph.children ?? []).some(isOpen)
  const arrayShape = (ph: MissionNode) => {
    const n = ph.children?.length ?? 0
    const cols = Math.min(ARRAY.cols, n)
    const rows = Math.ceil(n / cols)
    const { w, h } = SIZE.subsystem
    return { n, cols, rows, frameW: cols * w + (cols - 1) * ARRAY.gapX + 2 * ARRAY.pad, frameH: rows * ROW - (ROW - h) + 2 * ARRAY.pad }
  }
  const phaseInner = (ph: MissionNode) => (!isOpen(ph) ? 0 : asArray(ph) ? arrayShape(ph).frameH : heightOf(ph))

  const place = (n: MissionNode, label: string, x: number, y: number): PlacedNode => {
    const stat = stats.get(n.id) ?? { status: 'pending', progress: 0 }
    const open = isOpen(n)
    return {
      node: n,
      label,
      x,
      y,
      ...SIZE[n.level],
      ...stat,
      expanded: open,
      hiddenCount: open ? 0 : (n.children?.length ?? 0),
    }
  }

  const placeChildren = (parent: PlacedNode, top: number, taskCode: string) => {
    const placed: PlacedNode[] = []
    let cursor = top
    parent.node.children?.forEach((c, i) => {
      const h = heightOf(c)
      const label =
        c.level === 'subsystem'
          ? (c.code ?? 'Subsystem')
          : c.level === 'task'
            ? (c.code ?? `Workshop ${letter(i)}`)
            : `${taskCode}.${i + 1}`
      const p = place(c, label, columnX(c.level), cursor + h / 2)
      panels.push(p)
      treePanels.push(p)
      placed.push(p)
      if (p.expanded) placeChildren(p, cursor, c.level === 'task' ? p.label : taskCode)
      cursor += h
    })
    arms.push({ parent, children: placed })
  }

  // Subsystem 배열: 왼쪽부터 행 단위로 채운다 (3 · 3 · 1)
  const placeArray = (parent: PlacedNode, top: number) => {
    const { cols, frameW, frameH } = arrayShape(parent.node)
    const { w, h } = SIZE.subsystem
    const children = (parent.node.children ?? []).map((c, i) => {
      const col = i % cols
      const row = Math.floor(i / cols)
      const x = ARRAY.left + w / 2 + col * (w + ARRAY.gapX)
      const y = top + ARRAY.pad + h / 2 + row * ROW
      const p = place(c, c.code ?? 'Subsystem', x, y)
      panels.push(p)
      return p
    })
    arrays.push({ parent, frame: { x: ARRAY.left - ARRAY.pad, y: top, w: frameW, h: frameH }, children })
  }

  const m = place(mission, 'Mission', SPINE_X, MISSION_Y)
  const phases: PlacedNode[] = []
  const spine: SpineSegment[] = []
  let cursor = FIRST_PHASE_TOP
  let prevBottom = m.y + m.h / 2

  mission.children?.forEach((ph, i) => {
    const inner = phaseInner(ph)
    // 가지 모양으로 펼친 Phase는 위쪽에 열 이름 자리를 따로 둔다 (위 배열 틀과 겹치지 않게)
    const header = isOpen(ph) && !asArray(ph) ? HEADER : 0
    const rowH = Math.max(PHASE_MIN, inner + 24 + header)
    const p = place(ph, `Phase ${ph.code ?? String(i + 1).padStart(2, '0')}`, SPINE_X, cursor + rowH / 2)
    phases.push(p)
    spine.push({ y1: prevBottom, y2: p.y - p.h / 2, status: p.status })
    prevBottom = p.y + p.h / 2
    if (p.expanded) {
      if (asArray(ph)) placeArray(p, p.y - inner / 2)
      else placeChildren(p, p.y - inner / 2 + header / 2, '')
    }
    cursor += rowH
  })

  const panelTop = Math.min(...treePanels.map((p) => p.y - p.h / 2))
  const columnLabelY = treePanels.length ? panelTop - 14 : 0
  const columns = COLUMNS.filter((c) => treePanels.some((p) => p.node.level === c.level))

  return { mission: m, phases, panels, arms, arrays, spine, columns, columnLabelY, height: cursor + 60 }
}

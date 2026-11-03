import type { Level, MissionNode, NodeStats, Status } from './types'

export type StatsMap = Map<string, NodeStats>

// 잎(Subtask)의 상태를 모아 위 단계의 상태와 진행률(0~1)을 계산한다.
// 진행 중인 Subtask는 절반 완료로 센다.
export function computeStats(root: MissionNode): StatsMap {
  const map: StatsMap = new Map()

  const visit = (n: MissionNode): { done: number; active: number; total: number } => {
    if (!n.children?.length) {
      const status = n.status ?? 'pending'
      const r = { done: status === 'done' ? 1 : 0, active: status === 'active' ? 1 : 0, total: 1 }
      map.set(n.id, { status, progress: r.done + r.active * 0.5 })
      return r
    }
    const sum = { done: 0, active: 0, total: 0 }
    for (const c of n.children) {
      const r = visit(c)
      sum.done += r.done
      sum.active += r.active
      sum.total += r.total
    }
    const status: Status =
      sum.done === sum.total ? 'done' : sum.done + sum.active === 0 ? 'pending' : 'active'
    map.set(n.id, { status, progress: (sum.done + sum.active * 0.5) / sum.total })
    return sum
  }

  visit(root)
  return map
}

// 펼칠 수 있는(자식이 있는) 노드 id 전부
export function collectExpandableIds(root: MissionNode): string[] {
  const ids: string[] = []
  const walk = (n: MissionNode) => {
    if (n.children?.length) {
      ids.push(n.id)
      n.children.forEach(walk)
    }
  }
  walk(root)
  return ids
}

// id → 부모 노드
export function buildParentMap(root: MissionNode): Map<string, MissionNode> {
  const parents = new Map<string, MissionNode>()
  const walk = (n: MissionNode) =>
    n.children?.forEach((c) => {
      parents.set(c.id, n)
      walk(c)
    })
  walk(root)
  return parents
}

// 위로 올라가며 해당 단계의 조상을 찾는다 (예: Subtask → 소속 Subsystem)
export function findAncestor(node: MissionNode, level: Level, parents: Map<string, MissionNode>) {
  let cur: MissionNode | undefined = node
  while (cur && cur.level !== level) cur = parents.get(cur.id)
  return cur
}

// 화면에 쓰는 짧은 이름: Task → PM 카드 번호 "A2", Subtask → "A2.1"
export function shortLabel(node: MissionNode, parents: Map<string, MissionNode>): string {
  const parent = parents.get(node.id)
  const index = parent?.children?.indexOf(node) ?? 0
  const letter = (i: number) => String.fromCharCode(65 + i)
  if (node.level === 'phase') return `Phase ${node.code ?? String(index + 1).padStart(2, '0')}`
  if (node.level === 'task') return node.code ?? `Workshop ${letter(index)}`
  if (node.level === 'subtask' && parent) return `${shortLabel(parent, parents)}.${index + 1}`
  return ''
}

// 루트에서 node까지 (mission 제외): 패널의 경로 표시용
export function trailTo(node: MissionNode, parents: Map<string, MissionNode>): MissionNode[] {
  const trail: MissionNode[] = []
  let cur: MissionNode | undefined = node
  while (cur && cur.level !== 'mission') {
    trail.unshift(cur)
    cur = parents.get(cur.id)
  }
  return trail
}

// 실습 순서상 다음 노트북: Task → 첫 Subtask, Subtask → 다음 Subtask
export function nextNotebook(node: MissionNode, parents: Map<string, MissionNode>): MissionNode | undefined {
  if (node.level === 'task') return node.children?.find((c) => c.notebook)
  const siblings = parents.get(node.id)?.children ?? []
  return siblings.slice(siblings.indexOf(node) + 1).find((c) => c.notebook)
}

// Workshop(Task)의 PM 카드 id: detail이 "TC-ADCS-A2 원문 제목" 형식이다
export const cardId = (node: MissionNode) => node.detail?.split(' ')[0] ?? node.id

// PM 원문 제목 (카드 id를 뺀 부분)
export const cardTitle = (node: MissionNode) => node.detail?.split(' ').slice(1).join(' ') ?? node.title

// PM 카드 id로 Workshop을 찾는다 (주소창의 #/A/TC-ADCS-A2 처럼)
export function findWorkshop(root: MissionNode, id: string): MissionNode | undefined {
  for (const phase of root.children ?? [])
    for (const team of phase.children ?? [])
      for (const ws of team.children ?? []) if (cardId(ws) === id) return ws
  return undefined
}

// Workshop에 딸린 노트북: Workshop 자신(따라 하기) → Task들(직접 해 보기) 순서
export const notebooksOf = (ws: MissionNode) => [ws, ...(ws.children ?? [])].filter((n) => n.notebook)

// 자료 칸을 읽어 주는 말 (화면 낭독기용)
export function slotLabel(manual: boolean, notebook: boolean) {
  const has = [manual && 'manual', notebook && 'notebook'].filter(Boolean)
  return has.length ? `has ${has.join(' and ')}` : 'no material yet'
}

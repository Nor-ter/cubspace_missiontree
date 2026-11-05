import type { MissionNode } from './types'

// Subsystem = Melbourne Space Program의 팀 단위 (키 = PM 카드 라벨)
// 팀을 골라 강조하면 그 팀의 노드가 팀 색으로 바뀐다. 색 값은 global.css의 --team-* 토큰.
export const TEAMS = [
  { code: 'SYS', name: 'Mission & Systems' },
  { code: 'BOX', name: 'Structure & Thermal' },
  { code: 'EPS', name: 'Electrical Power' },
  { code: 'ADCS', name: 'Attitude Control' },
  { code: 'COM', name: 'Comms & Ground' },
  { code: 'OBC', name: 'Computer & Flight SW' },
  { code: 'PAY', name: 'Payload' },
] as const

export const teamColor = (code: string) => `var(--team-${code.toLowerCase()})`

// 노드 id → 소속 팀 (Subsystem과 그 아래 Task, Subtask). Mission과 Phase는 팀이 없다.
export function buildTeamMap(root: MissionNode): Map<string, string> {
  const teams = new Map<string, string>()
  const walk = (n: MissionNode, team?: string) => {
    const t = n.level === 'subsystem' ? n.code : team
    if (t) teams.set(n.id, t)
    n.children?.forEach((c) => walk(c, t))
  }
  walk(root)
  return teams
}

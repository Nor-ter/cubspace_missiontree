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

// 팀 번호: 도면의 부품 번호 풍선처럼, 팀 순서대로 1~7
export const teamNumber = (code: string) => TEAMS.findIndex((t) => t.code === code) + 1

export const teamColor = (code: string) => `var(--team-${code.toLowerCase()})`
// 레이어색으로 채운 풍선 위 숫자색 (밝은 색 위에는 먹, 어두운 색 위에는 종이)
export const teamOn = (code: string) => `var(--team-${code.toLowerCase()}-on)`

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

const TEAM_KEY = 'mission-tree.team' // 고른 팀은 이 브라우저에만 기억한다 (미션 트리와 Workflow가 같이 쓴다)

export function readTeam(): string | undefined {
  try {
    const t = localStorage.getItem(TEAM_KEY) ?? undefined
    return TEAMS.some((x) => x.code === t) ? t : undefined
  } catch {
    return undefined
  }
}

export function saveTeam(code?: string) {
  try {
    if (code) localStorage.setItem(TEAM_KEY, code)
    else localStorage.removeItem(TEAM_KEY)
  } catch {
    // 저장이 막힌 브라우저에서는 이번 방문 동안만 기억한다
  }
}

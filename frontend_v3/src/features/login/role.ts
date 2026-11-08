// 프로토타입: 인증 없이 역할만 고른다. 고른 역할은 이 브라우저에만 기억한다
export type Role = 'admin' | 'junior'

const ROLE_KEY = 'mission-tree.role'

export function readRole(): Role | undefined {
  try {
    const r = localStorage.getItem(ROLE_KEY)
    return r === 'admin' || r === 'junior' ? r : undefined
  } catch {
    return undefined
  }
}

export function saveRole(role: Role) {
  try {
    localStorage.setItem(ROLE_KEY, role)
  } catch {
    // 저장이 막힌 브라우저에서는 이번 방문 동안만 기억한다
  }
}

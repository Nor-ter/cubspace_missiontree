import { useLayoutEffect, useRef } from 'react'
import type { RefObject } from 'react'
import type { TreeLayout } from '../layout'

// 펼치기 · 접기 애니메이션. 목적은 "어느 노드가 펼쳐지고 접혔는가"를 알려 주는 것.
// - 펼치기: 새로 나온 카드가 부모 카드에서 제자리로 펼쳐져 나온다 (태양전지판 전개). 형제끼리 짧게 시차.
// - 접기: 남은 카드들이 새 자리로 미끄러져 모인다 (접힌 자리가 닫히는 것이 보인다). 펼치기보다 빠르게.
// - 누른 카드: 테두리가 잠깐 밝아졌다가 원래대로.
// - 다시 이어진 로봇 암은 카드가 도착할 즈음 나타난다.
// 위치는 SVG 속성(x, y)으로 그리므로, 바뀐 만큼의 차이를 transform으로 되돌렸다가 0으로 푼다 (FLIP).

const EASE = 'cubic-bezier(0.16, 1, 0.3, 1)'
const OPEN_MS = 380
const CLOSE_MS = 240
const STAGGER_MS = 24
const STAGGER_MAX = 120
const FLASH_MS = 520
const MARGIN = 200 // 화면 밖 이만큼까지만 움직인다 (전체 펼치기에서도 가볍게)

type Point = { x: number; y: number }

function positions(layout: TreeLayout) {
  const map = new Map<string, Point>()
  for (const p of [layout.mission, ...layout.phases, ...layout.panels]) map.set(p.node.id, { x: p.x, y: p.y })
  return map
}

// 노드 id는 위치 기반(m.1.3.0)이라 앞부분을 잘라 가면 조상 id가 된다
const parentId = (id: string) => id.slice(0, id.lastIndexOf('.'))

export function useTreeMotion(svgRef: RefObject<SVGSVGElement | null>, layout: TreeLayout, expanded: Set<string>) {
  const prev = useRef<{ pos: Map<string, Point>; expanded: Set<string>; arms: Map<string, string> } | null>(null)

  useLayoutEffect(() => {
    const svg = svgRef.current
    if (!svg) return
    const pos = positions(layout)
    const arms = new Map<string, string>()
    svg.querySelectorAll<SVGGElement>('[data-arm]').forEach((g) => arms.set(g.dataset.arm!, g.dataset.sig!))
    const before = prev.current
    prev.current = { pos, expanded, arms }
    if (!before) return

    const opened = [...expanded].filter((id) => !before.expanded.has(id))
    const closed = [...before.expanded].filter((id) => !expanded.has(id))
    if (!opened.length && !closed.length) return
    const closing = !opened.length
    const ms = closing ? CLOSE_MS : OPEN_MS
    const still = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    const view = { top: -MARGIN, bottom: window.innerHeight + MARGIN }
    const onScreen = (el: Element) => {
      const r = el.getBoundingClientRect()
      return r.bottom > view.top && r.top < view.bottom
    }

    const sibling = new Map<string, number>() // 같은 부모 아래 몇 번째로 나타나는가 (시차)
    svg.querySelectorAll<SVGGElement>(':scope [data-node-id]').forEach((el) => {
      const id = el.dataset.nodeId!
      const now = pos.get(id)
      if (!now || !onScreen(el)) return
      el.getAnimations().forEach((a) => a.cancel())
      const old = before.pos.get(id)
      if (old) {
        // 원래 있던 카드: 옛 자리에서 새 자리로
        const dx = old.x - now.x
        const dy = old.y - now.y
        if (still || (Math.abs(dx) < 0.5 && Math.abs(dy) < 0.5)) return
        el.animate([{ transform: `translate(${dx}px, ${dy}px)` }, { transform: 'none' }], { duration: ms, easing: EASE })
        return
      }
      // 새로 나온 카드: 옛 화면에 있던 가장 가까운 조상 자리에서 펼쳐져 나온다
      let anc = parentId(id)
      while (anc && !before.pos.has(anc)) anc = parentId(anc)
      const from = before.pos.get(anc) ?? now
      const p = parentId(id)
      const i = sibling.get(p) ?? 0
      sibling.set(p, i + 1)
      const delay = Math.min(i * STAGGER_MS, STAGGER_MAX)
      const start = still
        ? { opacity: 0 }
        : { opacity: 0, transform: `translate(${from.x - now.x}px, ${from.y - now.y}px) scale(0.92)` }
      // 끝 키프레임을 비워 두면 원래 값으로 돌아간다 (팀 강조로 어두운 카드는 어두운 채로)
      el.animate([start, {}], { duration: still ? 180 : OPEN_MS, delay, easing: EASE, fill: 'backwards' })
    })

    // 모양이 바뀌었거나 새로 생긴 로봇 암: 카드가 도착할 즈음 이어진다
    svg.querySelectorAll<SVGGElement>('[data-arm]').forEach((g) => {
      if (before.arms.get(g.dataset.arm!) === g.dataset.sig || !onScreen(g)) return
      g.getAnimations().forEach((a) => a.cancel())
      g.animate([{ opacity: 0 }, {}], { duration: closing ? 160 : 260, delay: closing ? 60 : 140, easing: 'ease-out', fill: 'backwards' })
    })

    // 누른 카드: 테두리가 잠깐 밝아진다 (어느 노드를 펼치고 접었는지)
    if (opened.length + closed.length <= 2) {
      const fg = getComputedStyle(document.documentElement).getPropertyValue('--fg').trim()
      for (const id of [...opened, ...closed]) {
        const frame = svg.querySelector<SVGElement>(`[data-node-id="${id}"] .frame`)
        if (!frame) continue
        frame.animate([{ stroke: fg, strokeWidth: 2.5 }, {}], { duration: FLASH_MS, easing: 'ease-out' })
      }
    }
  }, [svgRef, layout, expanded])
}

import { useCallback, useLayoutEffect, useRef } from 'react'

// 트리 방향(가로 ↔ 세로)을 바꿀 때 실제 요소를 움직인다 (FLIP, useBranchMotion과 같은 방식).
//   Phase 머리와 팀 가지(data-part)가 이전 자리에서 새 자리로 직접 이동한다. Phase 순, 팀 번호 순으로 조금씩 늦게.
//   모양이 바뀌는 연결선 · 범례는 움직임이 거의 끝날 때 나타난다.

const MOVE_MS = 620
const PHASE_STAGGER_MS = 28
const TEAM_STAGGER_MS = 18
const EASE = 'cubic-bezier(0.3, 0, 0, 1)'

type Rects = Map<string, DOMRect>

function measure(): Rects {
  const rects: Rects = new Map()
  document.querySelectorAll<HTMLElement>('main .sheet .phase-col').forEach((col) => {
    col.querySelectorAll<HTMLElement>('[data-part]').forEach((el) => {
      rects.set(`${col.dataset.phase}:${el.dataset.part}`, el.getBoundingClientRect())
    })
  })
  return rects
}

export function useOrientMotion<T>(orient: T, setOrient: (o: T) => void) {
  const before = useRef<Rects | null>(null)

  const change = useCallback(
    (o: T) => {
      const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches
      before.current = reduce ? null : measure()
      setOrient(o)
    },
    [setOrient],
  )

  useLayoutEffect(() => {
    const start = before.current
    before.current = null
    if (!start) return
    window.scrollTo(0, 0)
    const cols = [...document.querySelectorAll<HTMLElement>('main .sheet .phase-col')]
    cols.forEach((col, i) => {
      col.querySelectorAll<HTMLElement>('[data-part]').forEach((el) => {
        const a = start.get(`${col.dataset.phase}:${el.dataset.part}`)
        if (!a) return
        const b = el.getBoundingClientRect()
        const team = el.dataset.part!.startsWith('team-') ? Number(el.dataset.part!.slice(5)) : 0
        el.animate([{ transform: `translate(${a.left - b.left}px, ${a.top - b.top}px)` }, { transform: 'none' }], {
          duration: MOVE_MS,
          delay: i * PHASE_STAGGER_MS + team * TEAM_STAGGER_MS,
          easing: EASE,
          fill: 'backwards',
        })
      })
    })
    // 연결선 · 범례: 새 모양으로 나타난다
    const appear = { duration: 260, delay: MOVE_MS * 0.7, easing: 'ease-out', fill: 'backwards' as const }
    const trunk = document.querySelector<HTMLElement>('main .sheet .trunk')
    trunk?.animate([{ opacity: 0 }, { opacity: 1 }], { ...appear, pseudoElement: '::before' })
    trunk?.animate([{ opacity: 0 }, { opacity: 1 }], { ...appear, pseudoElement: '::after' })
    cols.forEach((col) => {
      col.animate([{ opacity: 0 }, { opacity: 1 }], { ...appear, pseudoElement: '::before' })
      col.querySelector('.branch')?.animate([{ opacity: 0 }, { opacity: 1 }], { ...appear, pseudoElement: '::before' })
    })
    document
      .querySelectorAll<HTMLElement>('main .sheet .legend')
      .forEach((el) => el.animate([{ opacity: 0 }, { opacity: 1 }], appear))
  }, [orient])

  return change
}

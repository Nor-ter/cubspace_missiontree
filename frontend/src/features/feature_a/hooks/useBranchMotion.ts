import { useEffect, useLayoutEffect, useRef, useState } from 'react'
import { branchMotion } from './useRoute'

// 전체 도면 ↔ 가지 + 옆 패널을 실제 요소로 움직인다 (FLIP: 처음 자리와 끝 자리를 재고, 그 차이만큼 옮긴다).
//   가지: Phase 머리와 팀 가지 하나하나(data-part)가 도면의 자리에서 왼쪽 가지의 자리로 직접 이동한다.
//         세로 도면에서는 팀이 번호 순으로 조금씩 늦게 출발해 왼쪽 열로 모인다.
//   패널: 도면이 비쳐 보이는 반투명에서 불투명으로 (닫을 때는 거꾸로).
//   그동안 도면은 뒤에 고정된 사본(ghost)으로 남아 패널 너머로 보이다가 사라진다.

export interface Ghost {
  top: number // 사본을 놓을 화면 위치 (바뀌기 전 main의 위치)
  phase: string // 사본에서 숨길 Phase (그 가지는 실제로 옮겨 가는 중이다)
  dir: 'in' | 'out'
}

const MOVE_MS = 560
const FADE_MS = 460
const STAGGER_MS = 32
const EASE = 'cubic-bezier(0.3, 0, 0, 1)'
const PANEL_FROM = 0.25 // 패널이 처음 나타날 때의 불투명도: 뒤의 도면이 비쳐 보인다

const parts = (col: Element | null | undefined) =>
  new Map([...(col?.querySelectorAll<HTMLElement>('[data-part]') ?? [])].map((el) => [el.dataset.part!, el]))

const sheetColumn = (phase: string, scope = '.sheet') =>
  document.querySelector<HTMLElement>(`${scope} .phase-col[data-phase="${CSS.escape(phase)}"]`)

const rectsOf = (col: Element | null | undefined) =>
  new Map([...parts(col)].map(([k, el]) => [k, el.getBoundingClientRect()]))

const delayOf = (key: string, stagger: boolean) =>
  stagger && key.startsWith('team-') ? Number(key.slice(5)) * STAGGER_MS : 0

export function useBranchMotion() {
  const [ghost, setGhost] = useState<Ghost | null>(null)
  const from = useRef<{ rects: Map<string, DOMRect>; stagger: boolean } | null>(null)
  const done = useRef<((y: number) => void) | null>(null)
  const savedScroll = useRef(0) // 도면에서 Workshop을 열 때 보던 스크롤 자리

  useEffect(() => {
    branchMotion.enter = (phase) => {
      const col = sheetColumn(phase)
      const main = document.querySelector('main')
      if (!col || !main) return
      const down = !!col.closest(".sheet[data-orient='down']")
      // 가로 도면: 왼쪽 가지의 폭을 도면의 열 폭과 같게 해 글자 크기가 변하지 않고 자리만 옮긴다
      document.documentElement.style.setProperty('--branch-w', down ? '220px' : `${col.offsetWidth}px`)
      from.current = { rects: rectsOf(col), stagger: down }
      savedScroll.current = window.scrollY
      setGhost({ top: main.getBoundingClientRect().top, phase, dir: 'in' })
    }
    branchMotion.exit = (phase) =>
      new Promise<number>((resolve) => {
        const pane = document.querySelector<HTMLElement>('.branch-pane')
        if (!pane) return resolve(0)
        from.current = { rects: new Map(), stagger: pane.dataset.from === 'down' }
        done.current = resolve
        // 도면 사본은 떠날 때 보던 스크롤 자리 그대로 놓는다: 위아래 Phase가 원래 자리에서 다시 보인다
        setGhost({ top: 52 - savedScroll.current, phase, dir: 'out' })
      })
    return () => {
      branchMotion.enter = undefined
      branchMotion.exit = undefined
    }
  }, [])

  // 사본과 새 화면이 그려진 뒤, 그리기 전에 움직임을 건다
  useLayoutEffect(() => {
    if (!ghost) return
    const ghostEl = document.querySelector<HTMLElement>('.ghost-sheet')
    const paneCol = document.querySelector('.branch-pane .phase-col')
    const panel = document.querySelector<HTMLElement>('.panel')
    const stagger = from.current?.stagger ?? false
    const anims: Animation[] = []

    if (ghost.dir === 'in') {
      window.scrollTo(0, 0)
      const start = from.current?.rects ?? new Map<string, DOMRect>()
      for (const [key, el] of parts(paneCol)) {
        const a = start.get(key)
        if (!a) continue
        const b = el.getBoundingClientRect()
        anims.push(
          el.animate([{ transform: `translate(${a.left - b.left}px, ${a.top - b.top}px)` }, { transform: 'none' }], {
            duration: MOVE_MS,
            delay: delayOf(key, stagger),
            easing: EASE,
            fill: 'backwards',
          }),
        )
      }
      if (panel) anims.push(panel.animate([{ opacity: PANEL_FROM }, { opacity: 1 }], { duration: FADE_MS, easing: 'ease-out' }))
      if (ghostEl) anims.push(ghostEl.animate([{ opacity: 1 }, { opacity: 0 }], { duration: FADE_MS, fill: 'forwards' }))
    } else {
      const target = rectsOf(sheetColumn(ghost.phase, '.ghost-sheet'))
      for (const [key, el] of parts(paneCol)) {
        const b = target.get(key)
        if (!b) continue
        const a = el.getBoundingClientRect()
        anims.push(
          el.animate([{ transform: 'none' }, { transform: `translate(${b.left - a.left}px, ${b.top - a.top}px)` }], {
            duration: MOVE_MS,
            delay: delayOf(key, stagger),
            easing: EASE,
            fill: 'forwards',
          }),
        )
      }
      if (panel) anims.push(panel.animate([{ opacity: 1 }, { opacity: 0 }], { duration: FADE_MS, easing: 'ease-in', fill: 'forwards' }))
      if (ghostEl) anims.push(ghostEl.animate([{ opacity: 0 }, { opacity: 1 }], { duration: FADE_MS, fill: 'forwards' }))
    }

    let cancelled = false
    Promise.all(anims.map((a) => a.finished)).finally(() => {
      if (cancelled) return
      const resolve = done.current
      done.current = null
      from.current = null
      setGhost(null)
      resolve?.(savedScroll.current)
    })
    return () => {
      cancelled = true
    }
  }, [ghost])

  return ghost
}

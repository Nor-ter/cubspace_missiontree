// 트리 카드를 화면의 보이는 자리로 스크롤한다.
// 넓은 화면: 화면 가운데 / 좁은 화면에서 자료 패널이 아래 시트로 열려 있으면: 위쪽 남은 띠의 가운데
const EDGE = 24 // 카드와 화면 가장자리 사이 여유

export const SHEET_TOP = 0.34 // 좁은 화면에서 시트가 시작하는 높이 (화면 높이 비율). CSS와 같은 값

export function revealNode(id: string) {
  const behavior: ScrollBehavior = window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth'
  // 펼침·패널·축소가 화면에 반영된 다음 위치를 잰다
  requestAnimationFrame(() =>
    requestAnimationFrame(() => {
      const el = document.querySelector(`[data-node-id="${id}"]`)
      if (!el) return
      const r = el.getBoundingClientRect()
      const sheetOpen = window.matchMedia('(max-width: 999px)').matches && !!document.querySelector('.res-panel:not(.full)')
      const visibleH = sheetOpen ? window.innerHeight * SHEET_TOP : window.innerHeight
      window.scrollBy({ top: r.top + r.height / 2 - visibleH / 2, behavior })
      const canvas = el.closest<HTMLElement>('.tree-canvas')
      if (canvas) {
        // 가로는 카드가 보일 만큼만 움직인다 (가운데로 맞추면 왼쪽 Phase 이름이 잘린다)
        const c = canvas.getBoundingClientRect()
        const right = Math.min(c.right, window.innerWidth) - EDGE
        const left = c.left + EDGE
        const dx = r.right > right ? r.right - right : r.left < left ? r.left - left : 0
        if (dx) canvas.scrollBy({ left: dx, behavior })
      }
    }),
  )
}

// 노드를 화면 세로 가운데로 스크롤한다 (Phase 바로 가기용).
// offsetTop: 화면 위쪽을 가리는 막대가 있으면 그 아래 남은 영역의 가운데에 놓는다
export function scrollNodeToCenter(id: string, offsetTop: number) {
  const behavior: ScrollBehavior = window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth'
  const el = document.querySelector(`[data-node-id="${id}"]`)
  if (!el) return
  const r = el.getBoundingClientRect()
  const center = offsetTop + (window.innerHeight - offsetTop) / 2
  window.scrollBy({ top: r.top + r.height / 2 - center, behavior })
  // Phase는 트리 왼쪽 끝에 있으므로 가로 스크롤은 처음으로 되돌린다
  el.closest<HTMLElement>('.tree-canvas')?.scrollTo({ left: 0, behavior })
}

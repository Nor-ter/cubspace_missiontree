import { useCallback, useEffect, useRef, useState } from 'react'
import { flushSync } from 'react-dom'

export type Tab = 'tasks' | 'manual' | 'workshop'

// 주소창이 곧 화면 상태다: 뒤로 가기, 새로 고침, 링크 공유가 그대로 된다.
//   #/            미션 트리 (펼쳐 보기 또는 전체 보기: 어느 보기인지는 페이지가 기억한다)
//   #/B           Phase B 상세도
//   #/B/TC-ADCS-B2/manual          + 옆 패널 (탭)
//   #/A/TC-ADCS-A2/workshop/A2.1   + 어느 Workshop(실습 노트북)
//   …?via=sheet   미션 트리에서 바로 연 Task Card (왼쪽에 그 Phase의 가지가 남는다)
export interface Route {
  phase?: string
  card?: string
  tab?: Tab
  notebook?: string
  via?: 'sheet'
}

const TABS: Tab[] = ['tasks', 'manual', 'workshop']

function parse(hash: string): Route {
  const [path, query = ''] = hash.replace(/^#\/?/, '').split('?')
  const [phase, card, tab, notebook] = path.split('/').map(decodeURIComponent)
  // #/workflow… · #/login 은 다른 페이지의 주소다: 미션 트리에는 아무 화면도 열지 않는다
  if (!phase || phase === 'workflow' || phase === 'login') return {}
  if (!card) return { phase }
  const via = new URLSearchParams(query).get('via') === 'sheet' ? 'sheet' : undefined
  return { phase, card, tab: TABS.includes(tab as Tab) ? (tab as Tab) : 'manual', notebook: notebook || undefined, via }
}

export function routeHash(r: Route): string {
  const parts = [r.phase, r.card, r.card && r.tab, r.tab === 'workshop' ? r.notebook : undefined]
  const path = '#/' + parts.filter(Boolean).map((p) => encodeURIComponent(p!)).join('/')
  return r.card && r.via ? `${path}?via=sheet` : path
}

const STATION_RADIUS = 22 // 상세도 원(Phase 표시)의 반지름

// 낮: Phase 단추가 지구(원)라 원이 펼쳐지고, 밤: 인공위성(네모)이라 네모가 펼쳐진다 (테마 토큰 --station-radius)
const squareStations = () =>
  getComputedStyle(document.documentElement).getPropertyValue('--station-radius').trim() !== '50%'

function stationCircle(phase: string) {
  const el = document.querySelector<HTMLElement>(`[data-station="${CSS.escape(phase)}"]`)
  const r = el?.getBoundingClientRect()
  const vw = window.innerWidth
  const vh = window.innerHeight
  const x = r ? r.left + r.width / 2 : vw / 2
  const y = r ? r.top + r.height / 2 : 0
  const far = Math.hypot(Math.max(x, vw - x), Math.max(y, vh - y))
  const square = squareStations()
  // 네모: 단추의 사각형 → 화면 전체 (inset의 네 변이 함께 벌어진다)
  const box = r ?? new DOMRect(x - STATION_RADIUS, y - STATION_RADIUS, STATION_RADIUS * 2, STATION_RADIUS * 2)
  return {
    x,
    y,
    far,
    square,
    box,
    small: square
      ? `inset(${box.top}px ${vw - box.right}px ${vh - box.bottom}px ${box.left}px round 3px)`
      : `circle(${STATION_RADIUS}px at ${x}px ${y}px)`,
    large: square ? 'inset(0px 0px 0px 0px round 0px)' : `circle(${far}px at ${x}px ${y}px)`,
  }
}

// 상세도 원의 테두리: 잘라 내는 원과 같은 반지름으로 함께 움직이는 가는 선 (전환이 끝나면 지운다).
// 화면 크기의 막 하나에 마스크로 고리를 그리고 반지름(--ring-r)만 바꾼다.
// 큰 원을 그려 놓고 확대 · 축소하면 고해상도 화면에서 수천 px짜리 이미지가 되어 프레임이 끊긴다.
// 밤(네모)에는 같은 막 대신 테두리만 있는 네모 하나를 단추 크기에서 화면 크기로 키운다.
function detailRing({ x, y, square }: { x: number; y: number; square: boolean }) {
  const ring = document.createElement('div')
  ring.className = square ? 'vt-ring square' : 'vt-ring'
  ring.style.setProperty('--ring-x', `${x}px`)
  ring.style.setProperty('--ring-y', `${y}px`)
  document.body.append(ring)
  return ring
}

// 전체 도면 ↔ 가지 + 옆 패널은 화면 사진(View Transition)이 아니라 실제 요소를 움직인다.
// 움직임은 페이지가 맡고(hooks/useBranchMotion.ts), 여기서는 순서만 정한다:
//   들어갈 때: 바뀌기 전 자리를 재고(enter) → 화면을 바꾼다
//   나올 때: 움직임을 먼저 끝내고(exit) → 화면을 바꾼다
export const branchMotion: {
  enter?: (phase: string) => void
  exit?: (phase: string) => Promise<number> // 돌아갈 도면의 스크롤 위치 (들어올 때 보던 자리)
} = {}

// 상세도를 열 때 보던 미션 트리의 스크롤 자리: 닫으면 그 자리로 돌아간다 (펼쳐 둔 가지가 길어도 제자리)
let treeScroll = 0

// 전체 도면 ↔ 상세도 전환: 도면의 상세도 원이 커져 한 장이 되고, 닫으면 다시 원으로 줄어든다
function transition(update: () => void, from: Route, to: Route) {
  const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches
  if (!reduce && !from.phase && to.via) {
    branchMotion.enter?.(to.phase!)
    update()
    return
  }
  if (!reduce && from.via && !to.phase && branchMotion.exit) {
    // 도면을 그리고 바로(그리기 전에) 떠날 때 보던 스크롤 자리로 돌려놓는다. 위아래 Phase가 제자리에 있어야 이어져 보인다
    branchMotion.exit(from.phase!).then(
      (y) => {
        flushSync(update)
        window.scrollTo(0, y)
      },
      update,
    )
    return
  }
  const opening = !from.phase && !!to.phase
  const closing = !!from.phase && !to.phase
  if ((!opening && !closing) || reduce || !document.startViewTransition) {
    update()
    return
  }
  const root = document.documentElement
  root.dataset.vt = opening ? 'open' : 'close'
  const before = opening ? stationCircle(to.phase!) : undefined
  let c = before
  let ring: HTMLElement | undefined
  const t = document.startViewTransition(() => {
    flushSync(update)
    // 스크롤은 새 화면을 찍기 전에 여기서 맞춘다. 나중에(effect에서) 맞추면 전환 도중에 화면이 튄다.
    // 열 때: 고른 팀이 있으면 그 팀 묶음을 맨 위로 (DetailSheet와 같은 규칙), 없으면 맨 위. 닫을 때: 열 때 보던 자리
    const group = opening ? document.querySelector('.group[data-match]') : null
    if (group) group.scrollIntoView({ block: 'start' })
    else window.scrollTo(0, opening ? 0 : treeScroll)
    // 닫을 때는 새 화면(전체 도면)에서 Phase 원의 위치를 잰다
    c = before ?? stationCircle(from.phase!)
    ring = detailRing(c)
  })
  t.ready.then(() => {
    if (!c) return
    const timing = {
      duration: opening ? 700 : 480,
      easing: opening ? 'cubic-bezier(0.45, 0, 0.2, 1)' : 'cubic-bezier(0.5, 0, 0.75, 0.2)',
    }
    const radius = [`${STATION_RADIUS}px`, `${c.far}px`]
    root.animate(
      { clipPath: opening ? [c.small, c.large] : [c.large, c.small] },
      // fill: 끝난 모양(닫을 때는 작은 원)을 유지한다. 없으면 전환이 정리되기 직전 한두 프레임 동안
      // 이전 화면 사진이 원래 크기로 돌아와 보여, 새로 고침한 것처럼 화면이 튄다
      { ...timing, fill: 'forwards', pseudoElement: opening ? '::view-transition-new(root)' : '::view-transition-old(root)' },
    )
    // 새 화면 쪽 요소는 전환 중에도 살아 있으므로 요소 자체를 움직인다 (원: 반지름, 네모: 네 변)
    if (c.square) {
      const b = c.box
      const frames = [
        { left: `${b.left}px`, top: `${b.top}px`, width: `${b.width}px`, height: `${b.height}px` },
        { left: '0px', top: '0px', width: `${window.innerWidth}px`, height: `${window.innerHeight}px` },
      ]
      ring?.animate(opening ? frames : frames.reverse(), { ...timing, fill: 'forwards' })
    } else {
      ring?.animate({ '--ring-r': opening ? radius : radius.reverse() }, { ...timing, fill: 'forwards' })
    }
  })
  t.finished.finally(() => {
    ring?.remove()
    delete root.dataset.vt
  })
}

export function useRoute() {
  const [route, setRoute] = useState<Route>(() => parse(window.location.hash))
  const current = useRef(route)

  useEffect(() => {
    const onChange = () => {
      const prev = current.current
      const next = parse(window.location.hash)
      current.current = next
      if (!prev.phase && next.phase) treeScroll = window.scrollY
      // 같은 상세도 안의 이동(패널, 탭)은 그냥 바꾸고, 도면 ↔ 상세도는 전환을 그린다
      transition(() => setRoute(next), prev, next)
    }
    window.addEventListener('hashchange', onChange)
    return () => window.removeEventListener('hashchange', onChange)
  }, [])

  // 상세도에 들어가거나 Phase를 넘기면 맨 위부터 보여 준다 (Task Card를 바로 열 때는 그 줄로 간다).
  // 미션 트리로 돌아오면 떠날 때 보던 자리로
  const opensCard = !!route.card
  useEffect(() => {
    if (!opensCard) window.scrollTo(0, route.phase ? 0 : treeScroll)
    // Phase가 바뀔 때만 실행한다
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [route.phase])

  const navigate = useCallback((r: Route) => {
    const hash = routeHash(r)
    if (hash !== window.location.hash) window.location.hash = hash
  }, [])

  return { route, navigate }
}

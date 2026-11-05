import { useCallback, useEffect, useRef, useState } from 'react'
import { scrollNodeToCenter } from '../reveal'
import './phaseNav.css'

export interface PhaseLink {
  id: string
  code: string // Pre-A, A … F
  title: string
  dim?: boolean // 팀 강조 중인데 고른 팀이 이 Phase에 없다
}

interface Props {
  phases: PhaseLink[]
  layoutKey: string // 펼침·배율이 바뀌면 지금 보이는 Phase를 다시 계산한다
  onArrive?: (id: string) => void // 버튼으로 이동한 뒤 스크롤이 멈추면 (트리에서 도착 강조)
}

const GAP = 12 // 위쪽 가로 막대와 Phase 모듈 사이 여유

// 화면 위쪽을 가리는 높이: 위쪽 가로 막대(좁은 화면)면 그 아래까지,
// 왼쪽 세로 막대(넓은 화면)면 위에 붙는 보기 도구 줄(.toolbar) 아래까지.
// 막대는 스크롤하면 화면 맨 위에 붙으므로, 지금 위치가 아니라 '붙었을 때'의 높이로 계산한다.
const stuckBottom = (el: HTMLElement) => (parseFloat(getComputedStyle(el).top) || 0) + el.getBoundingClientRect().height
function topInset(nav: HTMLElement | null) {
  if (!nav) return 0
  if (getComputedStyle(nav).flexDirection === 'row') return stuckBottom(nav) + GAP
  const bar = document.querySelector<HTMLElement>('.toolbar')
  return bar && getComputedStyle(bar).position === 'sticky' ? stuckBottom(bar) + GAP : 0
}

// Phase 바로 가기 막대: 트리 왼쪽 세로 막대(좁은 화면은 위쪽 가로 막대). 누르면 그 Phase로 스크롤한다.
// 스크롤하는 동안 지금 보이는 Phase를 강조한다.
function PhaseNav({ phases, layoutKey, onArrive }: Props) {
  const navRef = useRef<HTMLElement>(null)
  const [activeId, setActiveId] = useState(phases[0]?.id)
  // 버튼으로 이동하는 동안은 누른 Phase를 강조로 고정한다 (스크롤이 멈추면 고정을 푼다)
  const lockRef = useRef(false)
  const idleRef = useRef(0)
  const targetRef = useRef<string | null>(null) // 이동 중인 Phase (스크롤이 멈추면 도착)
  const onArriveRef = useRef(onArrive)
  useEffect(() => {
    onArriveRef.current = onArrive
  }, [onArrive])
  const releaseSoon = () => {
    window.clearTimeout(idleRef.current)
    idleRef.current = window.setTimeout(() => {
      lockRef.current = false
      if (targetRef.current) onArriveRef.current?.(targetRef.current)
      targetRef.current = null
    }, 200)
  }

  // 판정선(막대 아래 남은 화면의 세로 가운데)을 넘어 올라온 마지막 Phase가 지금 보이는 Phase.
  // 버튼을 누르면 Phase를 화면 가운데로 옮기므로 판정선도 가운데에 둔다.
  // 페이지 맨 끝에서는 마지막 Phase가 판정선까지 올라올 수 없으므로, 화면에 보이는 마지막 Phase를 고른다.
  const update = useCallback(() => {
    const inset = topInset(navRef.current)
    const line = inset + (window.innerHeight - inset) / 2
    const atBottom = window.scrollY + window.innerHeight >= document.documentElement.scrollHeight - 2
    let current = phases[0]?.id
    for (const ph of phases) {
      const top = document.querySelector(`[data-node-id="${ph.id}"]`)?.getBoundingClientRect().top
      if (top === undefined) continue
      if (top <= line || (atBottom && top < window.innerHeight)) current = ph.id
    }
    setActiveId(current)
  }, [phases])

  useEffect(() => {
    let frame = 0
    const onScroll = () => {
      if (lockRef.current) return releaseSoon()
      cancelAnimationFrame(frame)
      frame = requestAnimationFrame(update)
    }
    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    window.addEventListener('resize', onScroll)
    return () => {
      cancelAnimationFrame(frame)
      window.clearTimeout(idleRef.current)
      window.removeEventListener('scroll', onScroll)
      window.removeEventListener('resize', onScroll)
    }
  }, [update, layoutKey])

  // 강조된 버튼이 막대 밖(좁은 화면)에 있으면 막대 안에서 보이게 넘긴다 (페이지는 움직이지 않는다)
  useEffect(() => {
    const list = navRef.current?.querySelector('ol')
    const btn = list?.querySelector<HTMLElement>('button.on')
    if (!list || !btn) return
    const l = btn.offsetLeft - list.offsetLeft
    if (list.scrollWidth > list.clientWidth && (l < list.scrollLeft || l + btn.offsetWidth > list.scrollLeft + list.clientWidth)) {
      list.scrollTo({ left: l - (list.clientWidth - btn.offsetWidth) / 2 })
    }
  }, [activeId])

  const jump = (id: string) => {
    lockRef.current = true
    targetRef.current = id
    releaseSoon() // 이미 그 자리라 스크롤이 일어나지 않아도 고정이 풀리게
    setActiveId(id)
    scrollNodeToCenter(id, topInset(navRef.current))
  }

  return (
    <nav ref={navRef} className="phase-nav" aria-label="Jump to phase">
      <span className="phase-nav-label">Phase</span>
      <ol>
        {phases.map((ph) => (
          <li key={ph.id}>
            <button
              type="button"
              className={[ph.id === activeId && 'on', ph.dim && 'dim'].filter(Boolean).join(' ') || undefined}
              aria-current={ph.id === activeId ? 'location' : undefined}
              aria-label={`Go to Phase ${ph.code} ${ph.title}`}
              title={ph.title}
              onClick={() => jump(ph.id)}
            >
              <i className="phase-dot" aria-hidden="true" />
              {ph.code}
            </button>
          </li>
        ))}
      </ol>
    </nav>
  )
}

export default PhaseNav

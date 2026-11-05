import { useLayoutEffect, useRef } from 'react'

// 줄기는 Pre-A에서 시작해 F 정거장 가운데에서 끝난다 (펼쳐 보기 · 전체 보기 공통). F 뒤로 선이 이어지지 않도록,
// F 가운데가 줄기 끝에서 얼마나 떨어져 있는지 재어 CSS 변수로 넘긴다 (cad.css의 --trunk-end).
// F를 펼치거나 창 크기가 바뀌면 줄기 크기가 달라지므로 다시 잰다.
export function useTrunkEnd(orient: 'across' | 'down') {
  const ref = useRef<HTMLOListElement>(null)

  useLayoutEffect(() => {
    const ol = ref.current
    if (!ol) return
    const measure = () => {
      const last = ol.querySelector<HTMLElement>(':scope > li:last-child .station')
      if (!last) return
      // 화면 위치(getBoundingClientRect)가 아니라 레이아웃 위치(offset)로 잰다:
      // 방향을 바꿀 때 정거장이 이동 애니메이션(transform) 중이어도 값이 흔들리지 않는다
      let x = last.offsetWidth / 2
      let y = last.offsetHeight / 2
      for (let el: HTMLElement | null = last; el && el !== ol; el = el.offsetParent as HTMLElement | null) {
        x += el.offsetLeft
        y += el.offsetTop
      }
      const end = orient === 'across' ? ol.offsetWidth - x : ol.offsetHeight - y
      ol.style.setProperty('--trunk-end', `${Math.max(0, Math.round(end))}px`)
    }
    measure()
    const ro = new ResizeObserver(measure)
    ro.observe(ol)
    return () => ro.disconnect()
  }, [orient])

  return ref
}

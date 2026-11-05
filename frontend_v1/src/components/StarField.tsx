import { useEffect, useRef } from 'react'

// 화면 전체에 깔리는 별 배경 (장식용, 클릭을 막지 않음)
function StarField() {
  const ref = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const canvas = ref.current
    const ctx = canvas?.getContext('2d')
    if (!canvas || !ctx) return

    const draw = () => {
      const dpr = window.devicePixelRatio || 1
      canvas.width = innerWidth * dpr
      canvas.height = innerHeight * dpr
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
      let seed = 11
      const rnd = () => (seed = (seed * 16807) % 2147483647) / 2147483647
      const count = Math.round((innerWidth * innerHeight) / 9000) // 드문드문
      for (let i = 0; i < count; i++) {
        ctx.globalAlpha = rnd() * 0.35 + 0.1 // 은은하게
        ctx.fillStyle = '#dfe3ea'
        ctx.beginPath()
        ctx.arc(rnd() * innerWidth, rnd() * innerHeight, rnd() * 1.1 + 0.2, 0, Math.PI * 2)
        ctx.fill()
      }
    }

    draw()
    window.addEventListener('resize', draw)
    return () => window.removeEventListener('resize', draw)
  }, [])

  return <canvas ref={ref} className="star-field" aria-hidden="true" />
}

export default StarField

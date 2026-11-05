import { Slots } from './Drawing'
import './legend.css'

function LegendItems() {
  return (
    <>
      <span>
        <Slots manual notebook={false} /> Technical manual
      </span>
      <span>
        <Slots manual={false} notebook /> Lab notebook
      </span>
      <span>
        <span className="slot" aria-hidden="true" /> Not written yet
      </span>
    </>
  )
}

// 범례: 자료 칸의 뜻. 전체 도면에서는 Pre-A 아래 빈 자리에, 상세도에서는 마감선 옆에 둔다
function Legend({ hint }: { hint?: string }) {
  return (
    <aside className="legend" aria-label="Legend">
      <p className="legend-title">Slots after each workshop</p>
      <LegendItems />
      {hint && <p className="legend-hint">{hint}</p>}
    </aside>
  )
}

export default Legend

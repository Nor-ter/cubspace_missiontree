import { useEffect, useRef } from 'react'
import type { MissionNode } from '../types'
import type { Tab } from '../hooks/useRoute'
import { useTrunkEnd } from '../hooks/useTrunkEnd'
import PhaseColumn from './PhaseColumn'
import Legend from './Legend'
import './sheet.css'

interface Props {
  hidePhase?: string // 이 Phase의 가지는 자리만 지키고 숨긴다 (도면 사본에서)
  orient: 'across' | 'down'
  tree: MissionNode
  team?: string
  onPhase: (code: string) => void
  onWorkshop: (phase: string, card: string, tab?: Tab) => void
}

// 전체 보기 (Sheet 1): 미션 전체 여정. 왼쪽에서 오른쪽으로 Pre-A → F 줄기가 흐르고,
// Phase마다 팀 가지와 Task Card 잎이 내려온다. 한 장에 80개 Task Card가 모두 보인다.
function Sheet({ hidePhase, orient, tree, team, onPhase, onWorkshop }: Props) {
  const phases = tree.children ?? []
  const trunk = useTrunkEnd(orient)

  // 범례의 실제 높이만큼 Pre-A 열의 아래쪽을 비운다 (미니맵 자리는 sheet.css가 --minimap-h로 비운다)
  const wrapRef = useRef<HTMLDivElement>(null)
  useEffect(() => {
    const wrap = wrapRef.current
    const legend = wrap?.querySelector<HTMLElement>(':scope > .legend')
    if (!wrap || !legend) return
    const ro = new ResizeObserver(() => wrap.style.setProperty('--legend-h', `${legend.offsetHeight}px`))
    ro.observe(legend)
    return () => ro.disconnect()
  }, [])

  return (
    <section className="sheet" data-overview data-view="sheet" aria-label="Whole mission, sheet 1" data-team={team} data-orient={orient}>
      <h1 className="visually-hidden">{tree.title} mission tree</h1>
      <div className="trunk-wrap" ref={wrapRef}>
        <ol ref={trunk} className="trunk">
          {phases.map((phase) => (
            <PhaseColumn
              key={phase.id}
              phase={phase}
              hidden={phase.code === hidePhase}
              team={team}
              onPhase={onPhase}
              onWorkshop={onWorkshop}
            />
          ))}
        </ol>
        <Legend hint="Click a phase for its detail sheet, a card for its material." />
      </div>
    </section>
  )
}

export default Sheet

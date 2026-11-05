import { useEffect, useMemo, useRef, useState } from 'react'
import type { MissionNode } from '../types'
import type { StatsMap } from '../tree'
import { SPINE_X, VIEW_WIDTH, layoutTree } from '../layout'
import { buildTeamMap } from '../teams'
import { useTreeMotion } from '../hooks/useTreeMotion'
import SvgDefs from './SvgDefs'
import SatelliteBody from './SatelliteBody'
import Truss from './Truss'
import RobotArms from './RobotArms'
import PhaseModule from './PhaseModule'
import SolarPanel from './SolarPanel'
import type { ResourceKind } from './PanelButton'
import './missionTree.css'

interface Props {
  tree: MissionNode
  stats: StatsMap
  expanded: Set<string>
  openPath: string[] // 패널에 열린 자료까지의 경로 (Phase … 자료 카드)
  arrival?: { id: string; n: number } | null // Phase 바로 가기로 방금 도착한 Phase
  scale: number
  teams: string[] // 강조할 팀(Subsystem 코드). 비어 있으면 모두 평소대로
  activeResource?: { id: string; kind: ResourceKind }
  onToggle: (id: string) => void
  onOpenResource: (node: MissionNode, kind: ResourceKind) => void
}

// 트리 전체를 인공위성 한 대로 그린다.
function MissionTreeView({ tree, stats, expanded, openPath, arrival, scale, teams, activeResource, onToggle, onOpenResource }: Props) {
  const layout = useMemo(() => layoutTree(tree, expanded, stats), [tree, expanded, stats])
  const openSet = useMemo(() => new Set(openPath), [openPath])
  const openId = openPath.at(-1)
  const H = layout.height
  const teamOf = useMemo(() => buildTeamMap(tree), [tree])
  // 팀을 고르면: 고른 팀의 노드는 팀 색, 나머지는 어둡게. Phase는 고른 팀이 하나도 없을 때만 어둡게
  const picked = useMemo(() => new Set(teams), [teams])
  const filtering = picked.size > 0
  const pickedTeam = (id: string) => {
    const t = teamOf.get(id)
    return t && picked.has(t) ? t : undefined
  }
  const isDim = (id: string) => filtering && !pickedTeam(id)
  const phaseDim = (p: { node: MissionNode }) =>
    filtering && !(p.node.children ?? []).some((s) => s.code && picked.has(s.code))

  // 모두 접힌 상태(펼친 Phase 없음)에서는 위성 줄기를 보이는 영역 가운데에 둔다.
  // 하나라도 펼치면 오른쪽에 가지가 생기므로 원래 자리(왼쪽)로 미끄러져 간다.
  const canvasRef = useRef<HTMLDivElement>(null)
  const [canvasW, setCanvasW] = useState(0)
  useEffect(() => {
    const el = canvasRef.current
    if (!el) return
    const ro = new ResizeObserver(() => setCanvasW(el.clientWidth))
    ro.observe(el)
    return () => ro.disconnect()
  }, [])
  const svgRef = useRef<SVGSVGElement>(null)
  useTreeMotion(svgRef, layout, expanded)
  const allCollapsed = layout.phases.every((p) => !p.expanded)
  // 보이는 영역의 가운데 (viewBox 단위). 축소해서 SVG가 영역보다 좁아도 위성이 SVG 밖으로 나가지 않게 막는다
  const center = Math.min(canvasW / scale / 2, VIEW_WIDTH - SPINE_X)
  const shift = allCollapsed && canvasW ? Math.max(0, center - SPINE_X) : 0

  return (
    <div className="tree-canvas" ref={canvasRef}>
      <svg
        ref={svgRef}
        viewBox={`0 0 ${VIEW_WIDTH} ${H}`}
        style={{ width: VIEW_WIDTH * scale }}
        role="group"
        aria-label="Mission tree"
      >
        <SvgDefs />
        <g className="tree-shift" style={{ transform: `translateX(${shift}px)` }}>
          {layout.columns.map((c) => (
            <text key={c.level} x={c.x} y={layout.columnLabelY} textAnchor="middle" className="lbl column">
              {c.label}
            </text>
          ))}

          <Truss segments={layout.spine} />
          <RobotArms arms={layout.arms} arrays={layout.arrays} openPath={openSet} isDim={isDim} />
          <SatelliteBody p={layout.mission} />
          {layout.phases.map((p) => (
            <PhaseModule
              key={p.node.id}
              p={p}
              onOpenPath={openSet.has(p.node.id)}
              dimmed={phaseDim(p)}
              arriveKey={arrival?.id === p.node.id ? arrival.n : undefined}
              onToggle={onToggle}
            />
          ))}
          {layout.panels.map((p) => (
            <SolarPanel
              key={p.node.id}
              p={p}
              onOpenPath={openSet.has(p.node.id)}
              isOpen={p.node.id === openId}
              team={filtering ? pickedTeam(p.node.id) : undefined}
              dimmed={isDim(p.node.id)}
              activeKind={activeResource?.id === p.node.id ? activeResource.kind : undefined}
              onToggle={onToggle}
              onOpenResource={onOpenResource}
            />
          ))}
        </g>
      </svg>
    </div>
  )
}

export default MissionTreeView

import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import type { CSSProperties } from 'react'
import StarField from '../components/StarField'
import Earth from '../components/Earth'
import { getMissionTree } from '../features/feature_a/api'
import {
  buildParentMap,
  collectExpandableIds,
  computeStats,
  findAncestor,
  nextNotebook,
  shortLabel,
  trailTo,
} from '../features/feature_a/tree'
import { revealNode } from '../features/feature_a/reveal'
import { CELL_COLS } from '../features/feature_a/layout'
import { useExpanded } from '../features/feature_a/hooks/useExpanded'
import MissionTreeView from '../features/feature_a/components/MissionTreeView'
import PhaseNav from '../features/feature_a/components/PhaseNav'
import TeamFilter from '../features/feature_a/components/TeamFilter'
import ResourcePanel, { PANEL_DEFAULT } from '../features/feature_a/components/ResourcePanel'
import { ResourceGlyph } from '../features/feature_a/components/PanelButton'
import type { ResourceKind } from '../features/feature_a/components/PanelButton'
import type { MissionNode } from '../features/feature_a/types'
import './MissionTreePage.css'

const MIN_SCALE = 0.4
const MAX_SCALE = 1.6
// 화면에 보이는 배율(100%)이 실제로 그리는 크기의 몇 배인가: 예전 90% 크기를 지금의 100%로 삼는다
const BASE_SCALE = 0.9
const MINI_SCALE = 0.8 // 자료 패널을 보는 동안 트리는 미니맵 크기로 줄어든다 (실제 0.72배, 예전 75%와 비슷)

// 사이드 패널에 무엇이 열려 있는가
interface PanelState {
  subsystem?: MissionNode // 매뉴얼 탭: 이 Subsystem의 Technical Manual
  work?: MissionNode // 노트북 탭: 이 Task / Subtask의 실습 노트북
  tab: ResourceKind
}

// 범례 아이콘: 트리 패널의 버튼과 같은 모양
function LegendIcon({ kind }: { kind: ResourceKind }) {
  return (
    <svg className="legend-icon" viewBox="0 0 22 24" aria-hidden="true">
      <rect x={0.5} y={0.5} width={21} height={23} rx={2} className="res-bg" />
      <ResourceGlyph kind={kind} cx={11} y={12} />
    </svg>
  )
}

// 범례 아이콘: 트리 카드의 태양전지 칸과 같은 모양 (칸 수 = 단계)
function LevelIcon({ cols }: { cols: number }) {
  const w = 4 + cols * 6
  return (
    <svg className="level-icon" viewBox={`0 0 ${w} 16`} style={{ width: w }} aria-hidden="true">
      {Array.from({ length: cols * 2 }, (_, i) => (
        <rect key={i} x={2 + (i % cols) * 6} y={2 + Math.floor(i / cols) * 6.5} width={5} height={5.5} />
      ))}
    </svg>
  )
}

// 실습 순서 안내 (안내만 하고, 순서를 강제하지는 않는다)
function guideFor(work: MissionNode | undefined, parents: Map<string, MissionNode>) {
  if (!work) return undefined
  if (work.level === 'task') {
    const next = (work.children ?? []).filter((c) => c.notebook)
    if (!next.length) return 'Run the finished code from top to bottom and follow along.'
    const names = next.map((c) => `${shortLabel(c, parents)} ${c.title}`).join(' and ')
    return `Run the finished code from top to bottom and follow along. Then build it yourself in ${names}.`
  }
  // 소속 Task에 따라 하기 노트북이 있을 때만 그쪽으로 안내한다
  const task = parents.get(work.id)
  if (!task?.notebook) return 'Fill in the blanks and run the check cells.'
  return `Fill in the blanks and run the check cells. If you get stuck, go back through ${shortLabel(task, parents)} ${task.title}.`
}

// 사용자 역할 구분 없음: 모두 같은 트리를 본다. 처음에는 Phase만 보이게 접어 둔다 (카드 80장 · 단계 245개).
function MissionTreePage() {
  const tree = useMemo(() => getMissionTree(), [])
  const stats = useMemo(() => computeStats(tree), [tree])
  const parents = useMemo(() => buildParentMap(tree), [tree])
  const { expanded, toggle, expandAll, expandMany, collapseAll } = useExpanded([])
  const [scale, setScale] = useState(1)
  const [showLegend, setShowLegend] = useState(false) // 범례는 기본으로 숨기고, 버튼으로 펼친다
  const [miniScale, setMiniScale] = useState(MINI_SCALE)
  const [panel, setPanel] = useState<PanelState | null>(null)
  const [panelWidth, setPanelWidth] = useState(PANEL_DEFAULT)
  const [fullPanel, setFullPanel] = useState(false)
  const [teams, setTeams] = useState<string[]>([]) // 강조할 팀 (Subsystem 코드)

  // 보기 도구 줄은 스크롤하면 화면 위에 붙는다 (넓은 화면, CSS sticky). 붙었는지 재서 모양을 바꾼다
  const toolbarRef = useRef<HTMLDivElement>(null)
  const [stuck, setStuck] = useState(false)
  useEffect(() => {
    let frame = 0
    const measure = () => {
      frame = 0
      const bar = toolbarRef.current
      if (!bar) return
      const style = getComputedStyle(bar)
      const top = parseFloat(style.top) || 0
      setStuck(style.position === 'sticky' && window.scrollY > 0 && bar.getBoundingClientRect().top <= top + 0.5)
    }
    const onChange = () => {
      if (!frame) frame = requestAnimationFrame(measure)
    }
    measure()
    window.addEventListener('scroll', onChange, { passive: true })
    window.addEventListener('resize', onChange)
    return () => {
      cancelAnimationFrame(frame)
      window.removeEventListener('scroll', onChange)
      window.removeEventListener('resize', onChange)
    }
  }, [])

  // 팀을 새로 고르면 그 팀이 있는 Phase를 펼쳐 팀 카드가 바로 보이게 한다
  const toggleTeam = useCallback(
    (code: string) => {
      const adding = !teams.includes(code)
      setTeams(adding ? [...teams, code] : teams.filter((t) => t !== code))
      if (adding)
        expandMany((tree.children ?? []).filter((ph) => ph.children?.some((s) => s.code === code)).map((ph) => ph.id))
    },
    [teams, tree, expandMany],
  )
  const clearTeams = useCallback(() => setTeams([]), [])

  const openResource = useCallback(
    (node: MissionNode, kind: ResourceKind) => {
      if (kind === 'manual') {
        // 같은 Subsystem의 노트북이 열려 있었다면 탭으로 남겨 둔다
        setPanel((prev) => ({
          subsystem: node,
          work: prev?.work && findAncestor(prev.work, 'subsystem', parents)?.id === node.id ? prev.work : undefined,
          tab: 'manual',
        }))
      } else {
        setPanel({ subsystem: findAncestor(node, 'subsystem', parents), work: node, tab: 'notebook' })
      }
      revealNode(node.id)
    },
    [parents],
  )
  const closePanel = useCallback(() => {
    // 트리가 원래 크기로 돌아온 뒤에도 보던 카드가 화면에 남게 한다
    const last = panel?.work ?? panel?.subsystem
    setPanel(null)
    setFullPanel(false)
    if (last) revealNode(last.id)
  }, [panel])
  // 패널의 경로 단계를 누르면: 그 카드까지 펼치고 트리에서 보여 준다
  const revealInTree = useCallback(
    (id: string) => {
      const path: string[] = []
      for (let cur = parents.get(id); cur && cur.level !== 'mission'; cur = parents.get(cur.id)) path.push(cur.id)
      expandMany(path)
      revealNode(id)
    },
    [parents, expandMany],
  )
  const toggleFullPanel = useCallback(() => setFullPanel((f) => !f), [])
  const changeTab = useCallback((tab: ResourceKind) => setPanel((prev) => (prev ? { ...prev, tab } : prev)), [])

  const activeId = panel?.tab === 'manual' ? panel.subsystem?.id : panel?.work?.id
  const activeResource = panel && activeId ? { id: activeId, kind: panel.tab } : undefined

  // 패널이 옆에 열려 있으면(전체 화면 제외) 미니맵 배율을, 아니면 기본 배율을 조절한다
  const miniMode = !!panel && !fullPanel
  const viewScale = miniMode ? miniScale : scale
  const zoom = (delta: number) =>
    (miniMode ? setMiniScale : setScale)((s) =>
      Math.min(MAX_SCALE, Math.max(MIN_SCALE, Math.round((s + delta) * 10) / 10)),
    )

  const panelTarget = panel?.tab === 'notebook' ? panel.work : (panel?.subsystem ?? panel?.work)
  // 미니맵에 표시할 "열린 자료의 경로" (전체 화면일 때는 트리가 가려지므로 빼도 된다)
  const openPathIds = useMemo(
    () => (panelTarget ? trailTo(panelTarget, parents).map((n) => n.id) : []),
    [panelTarget, parents],
  )
  const trail = panelTarget
    ? trailTo(panelTarget, parents)
        .slice(0, -1)
        .map((n) => ({ id: n.id, label: n.level === 'subsystem' ? n.title : `${shortLabel(n, parents)} ${n.title}` }))
    : []
  const nextNode = panel?.work ? nextNotebook(panel.work, parents) : undefined
  const next = nextNode
    ? {
        label: `${shortLabel(nextNode, parents)} ${nextNode.title}`,
        onOpen: () => {
          revealInTree(nextNode.id)
          openResource(nextNode, 'notebook')
        },
      }
    : undefined

  // Phase 바로 가기로 도착한 Phase: 트리에서 잠깐 "포착" 애니메이션으로 강조한다
  const [arrival, setArrival] = useState<{ id: string; n: number } | null>(null)
  const arrivalTimer = useRef(0)
  const onArrive = useCallback((id: string) => {
    setArrival((a) => ({ id, n: (a?.n ?? 0) + 1 }))
    window.clearTimeout(arrivalTimer.current)
    arrivalTimer.current = window.setTimeout(() => setArrival(null), 1700)
  }, [])
  useEffect(() => () => window.clearTimeout(arrivalTimer.current), [])

  // Phase 바로 가기 막대에 넣을 목록
  const phaseLinks = useMemo(
    () =>
      (tree.children ?? []).map((ph) => ({
        id: ph.id,
        code: ph.code ?? '',
        title: ph.title,
        dim: teams.length > 0 && !ph.children?.some((s) => s.code && teams.includes(s.code)),
      })),
    [tree, teams],
  )

  return (
    <>
      <StarField />
      <Earth />
      <main
        className={panel ? 'page with-panel' : 'page'}
        style={{ '--panel-w': `${panelWidth}px` } as CSSProperties}
      >
        <header className="page-header">
          {/* 헤더는 단체 이름. 미션 이름(ACRUX-II)은 트리 맨 위 위성 본체에 있다 */}
          <h1>
            <i className="brand-mark" aria-hidden="true" />
            Melbourne Space Program
          </h1>
        </header>

        <section className="workspace" aria-label="Mission tree view">
          {/* 보기 도구와 범례를 트리 바로 위 한 줄에 둔다: 처음 화면에서 기호 설명이 보이게 */}
          <div ref={toolbarRef} className={stuck ? 'toolbar stuck' : 'toolbar'}>
            {/* 위에 붙었을 때만 보이는 단체 약칭 (머리말 h1이 가려진 동안 대신한다) */}
            <span className="toolbar-brand" aria-hidden="true" title="Melbourne Space Program">
              <i className="brand-mark" />
              MSP
            </span>
            <div className="tools" aria-label="View controls">
              <button type="button" onClick={() => zoom(-0.1)} aria-label="Zoom out">−</button>
              <span className="zoom" title={miniMode ? 'Tree size while a resource is open' : undefined}>
                {Math.round(viewScale * 100)}%
              </span>
              <button type="button" onClick={() => zoom(0.1)} aria-label="Zoom in">+</button>
              <button type="button" onClick={() => expandAll(collectExpandableIds(tree))}>Expand all</button>
              <button type="button" onClick={collapseAll}>Collapse all</button>
              <button
                type="button"
                className="legend-toggle"
                aria-expanded={showLegend}
                aria-controls="legend"
                onClick={() => setShowLegend((v) => !v)}
              >
                Legend
                <svg className="chevron" viewBox="0 0 12 12" aria-hidden="true">
                  <path d="M3 4.5 L6 7.5 L9 4.5" />
                </svg>
              </button>
            </div>
            <TeamFilter picked={teams} onToggle={toggleTeam} onClear={clearTeams} />
            <div className="legend" id="legend" aria-label="Legend" hidden={!showLegend}>
              <ul>
                <li><LevelIcon cols={CELL_COLS.subsystem ?? 3} />Subsystem</li>
                <li><LevelIcon cols={CELL_COLS.task ?? 2} />Workshop</li>
                <li><LevelIcon cols={CELL_COLS.subtask ?? 1} />Task</li>
              </ul>
              <ul>
                <li><LegendIcon kind="manual" />Technical manual</li>
                <li><LegendIcon kind="notebook" />Lab notebook</li>
                <li><i className="path-swatch open" />Open in panel</li>
                <li>Click a card to expand or collapse it</li>
              </ul>
            </div>
          </div>

          {/* 트리 왼쪽: Phase 바로 가기 세로 막대 (좁은 화면에서는 트리 위 가로 막대) */}
          <div className="tree-area">
            <PhaseNav
              phases={phaseLinks}
              layoutKey={`${expanded.size}:${viewScale}:${panel ? 1 : 0}`}
              onArrive={onArrive}
            />

            <MissionTreeView
              tree={tree}
              stats={stats}
              expanded={expanded}
              openPath={openPathIds}
              arrival={arrival}
              scale={viewScale * BASE_SCALE}
              teams={teams}
              activeResource={activeResource}
              onToggle={toggle}
              onOpenResource={openResource}
            />
          </div>
        </section>
      </main>
      {panel && (
        <ResourcePanel
          subsystem={panel.subsystem}
          work={panel.work}
          workLabel={panel.work ? shortLabel(panel.work, parents) : ''}
          guide={guideFor(panel.work, parents)}
          trail={trail}
          next={next}
          onReveal={revealInTree}
          tab={panel.tab}
          width={panelWidth}
          full={fullPanel}
          onTabChange={changeTab}
          onWidthChange={setPanelWidth}
          onToggleFull={toggleFullPanel}
          onClose={closePanel}
        />
      )}
    </>
  )
}

export default MissionTreePage

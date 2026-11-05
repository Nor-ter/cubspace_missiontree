import { useCallback, useEffect, useMemo, useState } from 'react'
import { getMissionTree } from '../features/feature_a/api'
import { buildParentMap, cardId, findWorkshop, notebooksOf } from '../features/feature_a/tree'
import { TEAMS } from '../features/feature_a/teams'
import { useRoute } from '../features/feature_a/hooks/useRoute'
import { useBranchMotion } from '../features/feature_a/hooks/useBranchMotion'
import { useOrientMotion } from '../features/feature_a/hooks/useOrientMotion'
import { readThemeMode, saveThemeMode } from '../features/feature_a/theme'
import type { Tab } from '../features/feature_a/hooks/useRoute'
import TopBar from '../features/feature_a/components/TopBar'
import type { Orient, Theme, View } from '../features/feature_a/components/TopBar'
import Sheet from '../features/feature_a/components/Sheet'
import StepView from '../features/feature_a/components/StepView'
import DetailSheet from '../features/feature_a/components/DetailSheet'
import WorkshopPanel from '../features/feature_a/components/WorkshopPanel'
import BranchPane from '../features/feature_a/components/BranchPane'
import Minimap from '../features/feature_a/components/Minimap'
import CadSpace from '../features/feature_a/components/CadSpace'
import './MissionTreePage.css'

const COHORT = 2026
const TEAM_KEY = 'mission-tree.team' // 고른 팀은 이 브라우저에만 기억한다

const ORIENT_KEY = 'mission-tree.orient' // 트리 방향도 이 브라우저에만 기억한다

function readOrient(): Orient {
  try {
    return localStorage.getItem(ORIENT_KEY) === 'down' ? 'down' : 'across'
  } catch {
    return 'across'
  }
}

function readTeam() {
  try {
    const t = localStorage.getItem(TEAM_KEY) ?? undefined
    return TEAMS.some((x) => x.code === t) ? t : undefined
  } catch {
    return undefined
  }
}

// 입력 중이거나 목록을 고르는 중에는 화살표 · Esc를 가로채지 않는다
const typing = (el: EventTarget | null) =>
  el instanceof HTMLElement && (el.isContentEditable || /^(INPUT|TEXTAREA|SELECT)$/.test(el.tagName))

// 사용자 역할 구분 없음: 모두 같은 트리를 본다. 보기 두 가지는 사용자가 고른다:
//   펼쳐 보기(Step by step) = 한 단계씩 연다. 처음 온 학생 기준이라 접속하면 늘 이 보기로 시작한다 (기억하지 않는다)
//   전체 보기(Whole sheet) = 도면 한 장에 전부
// 어느 보기에서 누르든 같은 상세도 · 같은 패널로 간다
function MissionTreePage() {
  const tree = useMemo(() => getMissionTree(), [])
  const parents = useMemo(() => buildParentMap(tree), [tree])
  const phases = useMemo(() => tree.children ?? [], [tree])
  const { route, navigate } = useRoute()
  const ghost = useBranchMotion()
  const [team, setTeam] = useState(readTeam)
  const [full, setFull] = useState(false)
  const [orient, setOrient] = useState(readOrient)
  const [theme, setTheme] = useState<Theme>(readThemeMode)
  const [view, setView] = useState<View>('step')
  // 보기를 바꾸면 Phase 단추와 팀 가지가 실제로 새 자리로 옮겨 간다 (방향을 바꿀 때와 같은 움직임)
  const pickView = useOrientMotion(view, setView)

  // 펼쳐 보기에서 펼친 것들 (Phase · 팀 · Task Card의 id). 상세도나 패널에 다녀와도 그대로 남는다
  const [expanded, setExpanded] = useState<Set<string>>(() => new Set())
  const toggle = useCallback(
    (id: string) =>
      setExpanded((s) => {
        const n = new Set(s)
        if (n.has(id)) n.delete(id)
        else n.add(id)
        return n
      }),
    [],
  )
  // 단계별로 펼칠 수 있는 id: [Phase, 팀, Task Card]. 열 이름(Phase | Subsystem | Materials | Task)을 누르면
  // 그 단계까지만 펼치고 그 아래는 접는다 (0 = Phase만, 1 = Subsystem까지, 2 = Materials까지, 3 = Task까지 = 모두)
  const levels = useMemo(() => {
    const teams = phases.flatMap((p) => p.children ?? [])
    const cards = teams.flatMap((t) => (t.children ?? []).filter((c) => c.children?.length))
    return [phases.map((p) => p.id), teams.map((t) => t.id), cards.map((c) => c.id)]
  }, [phases])
  const expandTo = useCallback((depth: number) => setExpanded(new Set(levels.slice(0, depth).flat())), [levels])
  // 지금 펼친 상태가 정확히 어느 단계까지인지 (섞여 있으면 undefined)
  const depth = useMemo(() => {
    for (let d = 0; d <= 3; d++) {
      const want = levels.slice(0, d).flat()
      if (want.length === expanded.size && want.every((id) => expanded.has(id))) return d
    }
    return undefined
  }, [levels, expanded])
  const expandAll = useCallback(() => expandTo(3), [expandTo])
  const collapseAll = useCallback(() => expandTo(0), [expandTo])

  const pickTheme = useCallback((t: Theme) => {
    setTheme(t)
    saveThemeMode(t)
  }, [])

  const saveOrient = useCallback((o: Orient) => {
    setOrient(o)
    try {
      localStorage.setItem(ORIENT_KEY, o)
    } catch {
      // 저장이 막힌 브라우저에서는 이번 방문 동안만 기억한다
    }
  }, [])
  // 방향을 바꾸면 가지들이 실제로 새 자리로 옮겨 간다
  const pickOrient = useOrientMotion(orient, saveOrient)

  const pickTeam = useCallback((code?: string) => {
    setTeam(code)
    try {
      if (code) localStorage.setItem(TEAM_KEY, code)
      else localStorage.removeItem(TEAM_KEY)
    } catch {
      // 저장이 막힌 브라우저에서는 이번 방문 동안만 기억한다
    }
  }, [])

  const index = phases.findIndex((p) => p.code === route.phase)
  const phase = index >= 0 ? phases[index] : undefined
  const found = phase && route.card ? findWorkshop(tree, route.card) : undefined
  const workshop = found && parents.get(parents.get(found.id)!.id) === phase ? found : undefined
  const teamNode = workshop && parents.get(workshop.id)
  const panelOpen = !!(phase && workshop && teamNode)

  // Workshop(실습 노트북)이 있는 Task Card 목록 (Workshop이 없는 패널에서 같은 팀의 것만 안내한다)
  const elsewhere = useMemo(
    () =>
      phases.flatMap((ph) =>
        (ph.children ?? []).flatMap((t) =>
          (t.children ?? [])
            .filter((ws) => notebooksOf(ws).length)
            .map((ws) => ({
              phase: ph.code ?? '',
              team: t.code ?? '',
              card: cardId(ws),
              label: `${ph.code} · ${t.code} ${ws.code} ${ws.title}`,
            })),
        ),
      ),
    [phases],
  )

  const goPhase = useCallback((code?: string) => navigate({ phase: code }), [navigate])
  const via = route.via
  // Task Card를 열 때는 어디서 열든 Manual부터 (배우는 순서의 첫 단계). 자료 칸 · Task를 직접 눌렀으면 그 탭으로.
  // 미션 트리(어느 보기든, 또는 그 가지)에서 열었으면 via=sheet: 닫으면 트리로, 상세도에서 열었으면 상세도로 돌아간다
  const openWorkshop = useCallback(
    (p: string, card: string, from?: 'sheet', tab: Tab = 'manual', notebook?: string) =>
      navigate({ phase: p, card, tab, notebook, via: from }),
    [navigate],
  )
  const goWorkshop = useCallback(
    (p: string, card: string, tab?: Tab) => openWorkshop(p, card, via, tab),
    [openWorkshop, via],
  )
  const fromSheet = useCallback(
    (p: string, card: string, tab?: Tab, notebook?: string) => openWorkshop(p, card, 'sheet', tab, notebook),
    [openWorkshop],
  )
  const closePanel = useCallback(() => {
    setFull(false)
    navigate(via ? {} : { phase: route.phase })
  }, [navigate, route.phase, via])
  const setTab = useCallback(
    (tab: Tab, notebook?: string) => navigate({ ...route, tab, notebook }),
    [navigate, route],
  )

  // 키보드: ← → 로 Phase 넘기기, Esc로 패널 닫기 → 전체 도면으로
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.defaultPrevented || e.metaKey || e.ctrlKey || e.altKey || typing(e.target)) return
      if (e.key === 'Escape') {
        if (panelOpen) closePanel()
        else if (phase) goPhase(undefined)
      } else if (phase && !panelOpen && (e.key === 'ArrowLeft' || e.key === 'ArrowRight')) {
        const to = phases[index + (e.key === 'ArrowLeft' ? -1 : 1)]
        if (to) goPhase(to.code)
      }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [panelOpen, phase, phases, index, closePanel, goPhase])

  // 미니맵에서 불을 켤 곳: 지금 보고 있는 Phase · 팀 · Workshop (없으면 전체)
  const lit = { phase: phase?.code, team: panelOpen ? teamNode?.code : undefined, card: panelOpen ? route.card : undefined }

  // Task Card를 열면 어디서 열었든 같은 화면: 왼쪽에 그 Phase의 가지, 오른쪽에 패널
  const branchMode = panelOpen
  const workspaceClass = [
    'workspace',
    panelOpen && 'with-panel',
    branchMode && 'with-branch',
    panelOpen && full && 'full',
    ghost && 'moving',
  ]
    .filter(Boolean)
    .join(' ')

  // 미션 트리: 고른 보기로 (가지가 옮겨 가는 동안 뒤에 남는 사본도 같은 보기로 그린다)
  const missionTree = (hidePhase?: string) =>
    view === 'step' ? (
      <StepView
        orient={orient}
        tree={tree}
        team={team}
        expanded={expanded}
        hidePhase={hidePhase}
        onToggle={toggle}
        onExpandAll={expandAll}
        onCollapseAll={collapseAll}
        depth={depth}
        onDepth={expandTo}
        onCard={fromSheet}
      />
    ) : (
      <Sheet hidePhase={hidePhase} orient={orient} tree={tree} team={team} onPhase={goPhase} onWorkshop={fromSheet} />
    )

  return (
    <>
      {/* 배경: CAD로 작도한 우주 (모눈 위, 내용 뒤) */}
      <CadSpace />
      <TopBar
        mission={tree.title}
        cohort={COHORT}
        team={team}
        onTeam={pickTeam}
        view={phase ? undefined : view}
        onView={pickView}
        orient={phase ? undefined : orient}
        onOrient={pickOrient}
        theme={theme}
        onTheme={pickTheme}
      />
      {/* 가지가 옮겨 가는 동안 뒤에 남는 도면 사본: 패널 너머로 비쳐 보이다 사라진다 */}
      {ghost && (
        <div className="ghost-sheet" style={{ top: ghost.top }} aria-hidden="true" inert>
          {missionTree(ghost.phase)}
        </div>
      )}
      <main className={workspaceClass}>
        {phase && branchMode ? (
          <BranchPane
            orient={orient}
            view={via ? view : 'sheet'}
            phase={phase}
            team={team}
            activeCard={route.card}
            expanded={expanded}
            onToggle={toggle}
            onPhase={goPhase}
            onWorkshop={(p, card, tab, notebook) => openWorkshop(p, card, via, tab, notebook)}
          />
        ) : phase ? (
          <DetailSheet
            key={phase.id}
            phase={phase}
            prev={phases[index - 1]}
            next={phases[index + 1]}
            team={team}
            onPhase={goPhase}
            onWorkshop={(card) => goWorkshop(phase.code ?? '', card)}
          />
        ) : (
          missionTree()
        )}
        {phase && workshop && teamNode && (
          <WorkshopPanel
            phase={phase}
            team={teamNode}
            workshop={workshop}
            parents={parents}
            tab={route.tab ?? 'manual'}
            notebookKey={route.notebook}
            full={full}
            elsewhere={elsewhere}
            onTab={setTab}
            onGo={goWorkshop}
            onToggleFull={() => setFull((f) => !f)}
            onClose={closePanel}
          />
        )}
      </main>
      <Minimap tree={tree} lit={lit} orient={orient} onPhase={goPhase} onWorkshop={fromSheet} />
    </>
  )
}

export default MissionTreePage

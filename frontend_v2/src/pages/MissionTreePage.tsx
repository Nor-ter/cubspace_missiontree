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
import type { Orient, Theme } from '../features/feature_a/components/TopBar'
import Sheet from '../features/feature_a/components/Sheet'
import DetailSheet from '../features/feature_a/components/DetailSheet'
import WorkshopPanel from '../features/feature_a/components/WorkshopPanel'
import BranchPane from '../features/feature_a/components/BranchPane'
import Minimap from '../features/feature_a/components/Minimap'
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

// 사용자 역할 구분 없음: 모두 같은 도면을 본다
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

  // 노트북이 있는 Workshop 목록 (노트북이 없는 패널에서 같은 팀의 것만 안내한다)
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
  // Workshop을 처음 열 때는 어디서 열든 Manual부터 (배우는 순서의 첫 단계).
  // 전체 도면(또는 그 가지)에서 열었으면 via=sheet: 닫으면 도면으로, 상세도에서 열었으면 상세도로 돌아간다
  const openWorkshop = useCallback(
    (p: string, card: string, from?: 'sheet') => navigate({ phase: p, card, tab: 'manual', via: from }),
    [navigate],
  )
  const goWorkshop = useCallback((p: string, card: string) => openWorkshop(p, card, via), [openWorkshop, via])
  const fromSheet = useCallback((p: string, card: string) => openWorkshop(p, card, 'sheet'), [openWorkshop])
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

  // Workshop을 열면 어디서 열었든 같은 화면: 왼쪽에 그 Phase의 가지, 오른쪽에 패널
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

  return (
    <>
      <TopBar
        mission={tree.title}
        cohort={COHORT}
        team={team}
        onTeam={pickTeam}
        orient={phase ? undefined : orient}
        onOrient={pickOrient}
        theme={theme}
        onTheme={pickTheme}
      />
      {/* 가지가 옮겨 가는 동안 뒤에 남는 도면 사본: 패널 너머로 비쳐 보이다 사라진다 */}
      {ghost && (
        <div className="ghost-sheet" style={{ top: ghost.top }} aria-hidden="true" inert>
          <Sheet
            hidePhase={ghost.phase}
            orient={orient}
            tree={tree}
            team={team}
            onPhase={() => {}}
            onWorkshop={() => {}}
          />
        </div>
      )}
      <main className={workspaceClass}>
        {phase && branchMode ? (
          <BranchPane orient={orient} phase={phase} team={team} activeCard={route.card} onPhase={goPhase} onWorkshop={goWorkshop} />
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
          <Sheet orient={orient} tree={tree} team={team} onPhase={goPhase} onWorkshop={fromSheet} />
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

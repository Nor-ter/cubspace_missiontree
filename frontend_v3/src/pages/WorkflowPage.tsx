import { useCallback, useEffect, useMemo, useState } from 'react'
import { getMissionTree } from '../features/feature_a/api'
import { TEAMS, readTeam, saveTeam } from '../features/feature_a/teams'
import { readThemeMode, saveThemeMode } from '../features/feature_a/theme'
import TopBar from '../features/feature_a/components/TopBar'
import type { Theme } from '../features/feature_a/components/TopBar'
import CadSpace from '../features/feature_a/components/CadSpace'
import WorkflowBoard from '../features/workflow/components/WorkflowBoard'
import TeamPicker from '../features/workflow/components/TeamPicker'

const COHORT = 2026

// 주소의 팀: #/workflow/BOX → BOX (없거나 모르는 팀이면 undefined)
function teamFromHash(): string | undefined {
  const code = window.location.hash.replace(/^#\/?workflow\/?/, '').split(/[/?]/)[0]
  return TEAMS.some((t) => t.code === code) ? code : undefined
}

// Workflow: 한 팀의 일만 모든 Phase에 걸쳐 본다. 팀은 주소에 있다 (링크를 보내면 같은 팀 화면이 열린다)
function WorkflowPage() {
  const tree = useMemo(() => getMissionTree(), [])
  const phases = useMemo(() => tree.children ?? [], [tree])
  const [team, setTeam] = useState(() => teamFromHash() ?? readTeam())
  const [theme, setTheme] = useState<Theme>(readThemeMode)

  // 주소에 팀이 없으면 기억해 둔 팀을 주소에 적는다 (기록을 새로 쌓지 않는다)
  useEffect(() => {
    if (team && !teamFromHash()) history.replaceState(null, '', `#/workflow/${team}`)
  }, [team])

  useEffect(() => {
    const onChange = () => setTeam(teamFromHash())
    window.addEventListener('hashchange', onChange)
    return () => window.removeEventListener('hashchange', onChange)
  }, [])

  const pickTeam = useCallback((code?: string) => {
    saveTeam(code)
    window.location.hash = code ? `#/workflow/${code}` : '#/workflow'
  }, [])

  const pickTheme = useCallback((t: Theme) => {
    setTheme(t)
    saveThemeMode(t)
  }, [])

  return (
    <>
      <CadSpace />
      <TopBar page="workflow" mission={tree.title} cohort={COHORT} team={team} onTeam={pickTeam} theme={theme} onTheme={pickTheme} />
      <main className="workspace">{team ? <WorkflowBoard phases={phases} team={team} /> : <TeamPicker onTeam={pickTeam} />}</main>
    </>
  )
}

export default WorkflowPage

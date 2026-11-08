import { TEAMS } from '../teams'
import type { Page } from '../../../hooks/usePage'
import { Balloon, Icon } from './Drawing'
import './topBar.css'

export type Orient = 'across' | 'down'
export type View = 'step' | 'sheet'
export type Theme = 'day' | 'night' | 'auto'

interface Props {
  page: Page
  mission: string
  cohort: number
  team?: string
  onTeam: (code?: string) => void
  view?: View // 미션 트리에서만: 펼쳐 보기 / 전체 보기
  onView?: (v: View) => void
  orient?: Orient // 미션 트리에서만: 트리 방향 (두 보기가 함께 쓴다)
  onOrient?: (o: Orient) => void
  theme: Theme
  onTheme: (t: Theme) => void
}

// 낮: 해 / 밤: 지구 곁을 도는 인공위성 (밤이 켜져 있으면 천천히 돈다) / Auto: 반쪽만 밝은 원
const ORBIT = 'M14.2 6.6 A6.6 2.6 -25 1 1 1.8 9.4 A6.6 2.6 -25 1 1 14.2 6.6'
const reduceMotion = () => window.matchMedia('(prefers-reduced-motion: reduce)').matches

function ThemeGlyph({ theme, active }: { theme: Theme; active: boolean }) {
  if (theme === 'day')
    return (
      <svg className="icon" viewBox="0 0 16 16" aria-hidden="true">
        <circle cx="8" cy="8" r="3" />
        <path d="M8 1.5v1.8M8 12.7v1.8M1.5 8h1.8M12.7 8h1.8M3.4 3.4l1.3 1.3M11.3 11.3l1.3 1.3M3.4 12.6l1.3-1.3M11.3 4.7l1.3-1.3" />
      </svg>
    )
  if (theme === 'night')
    return (
      <svg className="icon night-glyph" viewBox="0 0 16 16" aria-hidden="true">
        <circle cx="8" cy="8" r="3.6" />
        <path d={ORBIT} className="orbit" />
        {/* 궤도를 도는 동안에는 animateMotion이 자리를 정하고, 멈춰 있을 때는 궤도의 오른쪽 끝에 둔다 */}
        {active && !reduceMotion() ? (
          <rect className="sat" x="-0.9" y="-0.9" width="1.8" height="1.8">
            <animateMotion dur="6s" repeatCount="indefinite" path={ORBIT} />
          </rect>
        ) : (
          <rect className="sat" x="13.3" y="5.7" width="1.8" height="1.8" />
        )}
      </svg>
    )
  return (
    <svg className="icon" viewBox="0 0 16 16" aria-hidden="true">
      <circle cx="8" cy="8" r="5" />
      <path d="M8 3a5 5 0 0 1 0 10z" className="fill" />
    </svg>
  )
}

// 위 막대: 제품 이름, 페이지(Tree | Workflow), 미션과 코호트, 팀 레이어
function TopBar({ page, mission, cohort, team, onTeam, view, onView, orient, onOrient, theme, onTheme }: Props) {
  return (
    <header className="topbar">
      <a className="wordmark" href="#/">
        Mission Tree
      </a>

      {/* 페이지 전환. Workflow는 고른 팀으로 바로 연다 */}
      <nav className="page-switch" aria-label="Page">
        <a href="#/" aria-current={page === 'tree' ? 'page' : undefined}>
          Tree
        </a>
        <a href={team ? `#/workflow/${team}` : '#/workflow'} aria-current={page === 'workflow' ? 'page' : undefined}>
          Workflow
        </a>
      </nav>

      <div className="mission-id">
        <span className="mission-name">
          <span className="mission-label">Mission:</span> {mission}
        </span>
        {/* 지난 코호트 기록은 Phase 3에서 들어온다. 지금은 현재 코호트 하나뿐 */}
        <label className="cohort">
          <span className="visually-hidden">Cohort</span>
          <select defaultValue={cohort}>
            <option value={cohort}>{cohort} cohort</option>
            <option disabled>No earlier cohorts yet</option>
          </select>
        </label>
      </div>

      {view && onView && (
        <div className="orient view-switch" role="group" aria-label="View">
          {(['step', 'sheet'] as const).map((v) => (
            // 좁은 화면에서는 아이콘만 남는다 (이름은 마우스를 올리면 보인다)
            <button
              key={v}
              type="button"
              aria-pressed={view === v}
              aria-label={v === 'step' ? 'Step by step' : 'Whole sheet'}
              title={v === 'step' ? 'Step by step' : 'Whole sheet'}
              onClick={() => onView(v)}
            >
              <Icon name={v === 'step' ? 'steps' : 'sheet'} />
              <span className="view-label">{v === 'step' ? 'Step by step' : 'Whole sheet'}</span>
            </button>
          ))}
        </div>
      )}

      {orient && onOrient && (
        <div className="orient" role="group" aria-label="Tree direction">
          {(['across', 'down'] as const).map((o) => (
            // 화살표만 (보기 단추가 들어오며 위 막대가 좁아졌다). 이름은 마우스를 올리면 보인다
            <button
              key={o}
              type="button"
              className="icon-only"
              aria-pressed={orient === o}
              aria-label={o === 'across' ? 'Across' : 'Down'}
              title={o === 'across' ? 'Across: phases left to right' : 'Down: phases top to bottom'}
              onClick={() => onOrient(o)}
            >
              <svg className="icon" viewBox="0 0 16 16" aria-hidden="true">
                <path d={o === 'across' ? 'M2 8h11M10 5l3 3-3 3' : 'M8 2v11M5 10l3 3 3-3'} />
              </svg>
            </button>
          ))}
        </div>
      )}

      <div className="theme-switch" role="group" aria-label="Day or night">
        {(['day', 'night', 'auto'] as const).map((t) => (
          <button
            key={t}
            type="button"
            aria-pressed={theme === t}
            aria-label={t === 'auto' ? 'Auto: follow this computer' : t === 'day' ? 'Day' : 'Night'}
            title={t === 'auto' ? 'Auto: follow this computer' : t === 'day' ? 'Day' : 'Night'}
            onClick={() => onTheme(t)}
          >
            <ThemeGlyph theme={t} active={theme === t} />
          </button>
        ))}
      </div>

      <div className="layers" role="group" aria-label="Highlight a team">
        <span className="layers-label" aria-hidden="true">
          Team
        </span>
        {TEAMS.map((t) => {
          const on = team === t.code
          return (
            <button
              key={t.code}
              type="button"
              className="layer"
              aria-pressed={on}
              data-picked={on || undefined}
              title={t.name}
              onClick={() => onTeam(on ? undefined : t.code)}
            >
              <Balloon code={t.code} />
              <span className="layer-code">{t.code}</span>
            </button>
          )
        })}
      </div>
    </header>
  )
}

export default TopBar

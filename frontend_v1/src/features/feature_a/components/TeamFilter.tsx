import { TEAMS, teamColor } from '../teams'
import type { CSSProperties } from 'react'
import './teamFilter.css'

interface Props {
  picked: string[]
  onToggle: (code: string) => void
  onClear: () => void
}

// 팀 강조: 여러 팀을 함께 고를 수 있다. 고른 팀은 트리에서 팀 색으로, 나머지는 어둡게.
function TeamFilter({ picked, onToggle, onClear }: Props) {
  return (
    <div className="team-filter" role="group" aria-label="Highlight teams">
      <span className="team-filter-label">Teams</span>
      {TEAMS.map((t) => {
        const on = picked.includes(t.code)
        return (
          <button
            key={t.code}
            type="button"
            className="team-chip"
            aria-pressed={on}
            title={t.name}
            aria-label={`${t.code} ${t.name}`}
            style={{ '--team': teamColor(t.code) } as CSSProperties}
            onClick={() => onToggle(t.code)}
          >
            <i className="team-dot" aria-hidden="true" />
            {t.code}
          </button>
        )
      })}
      {picked.length > 0 && (
        <button type="button" className="team-clear" onClick={onClear}>
          Clear
        </button>
      )}
    </div>
  )
}

export default TeamFilter

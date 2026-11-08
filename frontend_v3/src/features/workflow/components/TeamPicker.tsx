import { TEAMS } from '../../feature_a/teams'
import { Balloon } from '../../feature_a/components/Drawing'
import './teamPicker.css'

// 팀을 고르지 않고 Workflow에 왔을 때: 팀부터 고른다
function TeamPicker({ onTeam }: { onTeam: (code: string) => void }) {
  return (
    <section className="team-picker" aria-labelledby="team-picker-title">
      <h1 id="team-picker-title">Pick your team</h1>
      <p>Workflow shows only your team's manuals, task cards and workshops, phase by phase.</p>
      <ul>
        {TEAMS.map((t) => (
          <li key={t.code}>
            <button type="button" className="btn" onClick={() => onTeam(t.code)}>
              <Balloon code={t.code} />
              <span className="team-picker-code">{t.code}</span>
              {t.name}
            </button>
          </li>
        ))}
      </ul>
    </section>
  )
}

export default TeamPicker

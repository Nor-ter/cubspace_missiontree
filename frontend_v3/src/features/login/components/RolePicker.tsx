import type { Role } from '../role'
import './rolePicker.css'

const ROLES: { role: Role; label: string }[] = [
  { role: 'admin', label: 'Admin' },
  { role: 'junior', label: 'Junior' },
]

// 역할 고르기: 프로토타입이라 입력 · 인증 없이 누르면 바로 들어간다
function RolePicker({ onPick }: { onPick: (role: Role) => void }) {
  return (
    <div className="role-picker" role="group" aria-label="Enter as">
      <span className="role-picker-label">Enter as</span>
      {ROLES.map(({ role, label }) => (
        <button key={role} type="button" className="role-btn" onClick={() => onPick(role)}>
          {label}
          <svg className="icon" viewBox="0 0 16 16" aria-hidden="true">
            <path d="M2.5 8h11M9.5 4l4 4-4 4" />
          </svg>
        </button>
      ))}
    </div>
  )
}

export default RolePicker

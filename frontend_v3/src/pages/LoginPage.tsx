import { useCallback } from 'react'
import { saveRole } from '../features/login/role'
import type { Role } from '../features/login/role'
import MissionFilm from '../features/login/components/MissionFilm'
import RolePicker from '../features/login/components/RolePicker'
import './LoginPage.css'

// 첫 화면: 조각난 패널 안에서 미션의 줄기가 1U → 3U 위성이 되는 영상이 돌고, 왼쪽에 제품 이름, 그 오른쪽에 역할 고르기
function LoginPage() {
  const enter = useCallback((role: Role) => {
    saveRole(role)
    if (window.location.hash === '#/') window.dispatchEvent(new HashChangeEvent('hashchange'))
    else window.location.hash = '#/'
  }, [])

  return (
    <main className="login">
      <span className="login-mark">CubSpace</span>

      <section className="login-panel" aria-labelledby="login-title">
        <MissionFilm />
        <div className="login-hero">
          <div className="login-copy">
            <h1 id="login-title" className="login-title">
              Mission
              <br />
              Tree
            </h1>
            <p className="login-lede">Engineers may leave. The mission carries on.</p>
          </div>
          <RolePicker onPick={enter} />
        </div>
      </section>

      <span className="login-side" aria-hidden="true">
        1U → 3U
      </span>
    </main>
  )
}

export default LoginPage

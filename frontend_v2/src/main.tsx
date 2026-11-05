import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
// Geologica: CRSV(필기체 글자꼴) 축으로 부드러운 글자를 쓰는 가변 글꼴 (global.css의 font-variation-settings)
import '@fontsource-variable/geologica/full.css'
import './styles/global.css'
import App from './App.tsx'
import { applyTheme, followSystemTheme, readThemeMode } from './features/feature_a/theme'

// 고른 낮 / 밤을 첫 화면을 그리기 전에 적용한다 (깜빡임 방지). 없으면 Auto = 컴퓨터 설정
applyTheme(readThemeMode())
followSystemTheme()

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)

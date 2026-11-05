import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
// Inter Tight(본문) + Archivo 폭 축(넓고 두꺼운 제목) + JetBrains Mono(도면 글자: 코드 · 개수) — global.css의 --font · --font-display · --font-mono
import '@fontsource-variable/inter-tight'
import '@fontsource-variable/archivo/wdth.css'
import '@fontsource-variable/jetbrains-mono'
import './styles/global.css'
import App from './App.tsx'
// CAD 소프트웨어(모델 공간)의 모양: 다른 스타일 뒤에 와서 덮어쓴다
import './styles/cad.css'
import { applyTheme, followSystemTheme, readThemeMode } from './features/feature_a/theme'

// 고른 낮 / 밤을 첫 화면을 그리기 전에 적용한다 (깜빡임 방지). 없으면 Auto = 컴퓨터 설정
applyTheme(readThemeMode())
followSystemTheme()

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)

// 낮 / 밤 테마. 고른 값(mode)은 day · night · auto, 화면에 적용되는 값(data-theme)은 늘 day · night 둘 중 하나다.
// auto면 컴퓨터 설정(prefers-color-scheme)을 읽어 day / night로 바꿔 적어 둔다.
// 그래서 밤 색 값은 global.css의 :root[data-theme='night'] 한 곳에만 있으면 된다.

export type ThemeMode = 'day' | 'night' | 'auto'

const KEY = 'mission-tree.theme' // 고른 값은 이 브라우저에만 기억한다 (auto면 지운다)
const systemDark = () => window.matchMedia('(prefers-color-scheme: dark)')

export function readThemeMode(): ThemeMode {
  try {
    const t = localStorage.getItem(KEY)
    return t === 'day' || t === 'night' ? t : 'auto'
  } catch {
    return 'auto'
  }
}

export function applyTheme(mode: ThemeMode) {
  const root = document.documentElement
  root.dataset.themeMode = mode
  root.dataset.theme = mode === 'auto' ? (systemDark().matches ? 'night' : 'day') : mode
}

export function saveThemeMode(mode: ThemeMode) {
  applyTheme(mode)
  try {
    if (mode === 'auto') localStorage.removeItem(KEY)
    else localStorage.setItem(KEY, mode)
  } catch {
    // 저장이 막힌 브라우저에서는 이번 방문 동안만 기억한다
  }
}

// auto인 동안 컴퓨터가 낮 ↔ 밤으로 바뀌면 따라간다
export function followSystemTheme() {
  systemDark().addEventListener('change', () => {
    if (document.documentElement.dataset.themeMode === 'auto') applyTheme('auto')
  })
}

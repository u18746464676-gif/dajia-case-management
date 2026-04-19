// 主题管理
const THEME_KEY = 'app_theme' // 'light' | 'dark' | 'system'

export function getTheme() {
  return localStorage.getItem(THEME_KEY) || 'system'
}

export function setTheme(theme) {
  localStorage.setItem(THEME_KEY, theme)
  applyTheme(theme)
}

export function applyTheme(theme) {
  const root = document.documentElement
  root.classList.remove('dark')

  if (theme === 'dark') {
    root.classList.add('dark')
  } else if (theme === 'system') {
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches
    if (prefersDark) root.classList.add('dark')
  }
  // light: just remove dark class
}

export function initTheme() {
  applyTheme(getTheme())
  // Listen for system theme changes
  window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', () => {
    if (getTheme() === 'system') applyTheme('system')
  })
}

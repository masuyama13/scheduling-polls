import { useState } from 'react'

export type Theme = 'light' | 'dark'

export const THEME_STORAGE_KEY = 'app-theme'

export function useTheme() {
  const [theme, setTheme] = useState<Theme>(document.documentElement.dataset.theme === 'dark' ? 'dark' : 'light')

  const toggleTheme = () => {
    const nextTheme = theme === 'dark' ? 'light' : 'dark'
    document.documentElement.dataset.theme = nextTheme

    try {
      window.localStorage.setItem(THEME_STORAGE_KEY, nextTheme)
    } catch {
      // Theme changes still apply when storage is unavailable.
    }

    setTheme(nextTheme)
  }

  return { theme, toggleTheme }
}

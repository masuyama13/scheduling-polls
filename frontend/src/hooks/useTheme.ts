import { useState } from 'react'
import { updateAppPreferences, type Theme } from '../lib/appPreferences.ts'

export type { Theme } from '../lib/appPreferences.ts'

export function useTheme() {
  const [theme, setTheme] = useState<Theme>(document.documentElement.dataset.theme === 'dark' ? 'dark' : 'light')

  const toggleTheme = () => {
    const nextTheme = theme === 'dark' ? 'light' : 'dark'
    document.documentElement.dataset.theme = nextTheme

    updateAppPreferences({ theme: nextTheme })

    setTheme(nextTheme)
  }

  return { theme, toggleTheme }
}

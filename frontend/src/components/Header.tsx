import { useEffect, useRef, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Check, CircleHelp, Globe, Moon, Sun } from 'lucide-react'
import { Link } from 'react-router'
import HowItWorksModal from './HowItWorksModal'
import { SERVICE_NAME } from '../config/appConfig.ts'
import { useTheme } from '../hooks/useTheme.ts'
import { useTimeFormat } from '../hooks/useTimeFormat.ts'
import i18n from '../i18n/index.ts'
import { LANGUAGES, isLanguage } from '../i18n/languages.ts'

export default function Header() {
  const [isHowItWorksOpen, setIsHowItWorksOpen] = useState(false)
  const [isLanguageMenuOpen, setIsLanguageMenuOpen] = useState(false)
  const languageMenuRef = useRef<HTMLDivElement>(null)
  const languageButtonRef = useRef<HTMLButtonElement>(null)
  const { theme, toggleTheme } = useTheme()
  const { timeFormat, toggleTimeFormat } = useTimeFormat()
  const { t } = useTranslation('common')

  useEffect(() => {
    if (!isLanguageMenuOpen) return

    const closeOnOutsidePointer = (event: PointerEvent) => {
      if (event.target instanceof Node && !languageMenuRef.current?.contains(event.target)) {
        setIsLanguageMenuOpen(false)
      }
    }
    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setIsLanguageMenuOpen(false)
        languageButtonRef.current?.focus()
      }
    }

    document.addEventListener('pointerdown', closeOnOutsidePointer)
    document.addEventListener('keydown', closeOnEscape)
    return () => {
      document.removeEventListener('pointerdown', closeOnOutsidePointer)
      document.removeEventListener('keydown', closeOnEscape)
    }
  }, [isLanguageMenuOpen])

  return (
    <header className="w-full">
      <div className="mx-auto flex max-w-4xl items-center gap-4 px-4 py-3">
        <div className="flex min-w-0 flex-col-reverse items-start sm:flex-row sm:items-center sm:gap-4">
          <span className="font-serif text-lg font-semibold text-content-primary">
            <Link to="/">{SERVICE_NAME}</Link>
          </span>
          <span className="font-serif text-xs text-content-secondary">{t('headerSubtitle')}</span>
        </div>
        <div className="ml-auto flex shrink-0 items-center gap-2">
          <button
            type="button"
            aria-label={t('helpLabel')}
            aria-haspopup="dialog"
            title={t('helpLabel')}
            onClick={() => setIsHowItWorksOpen(true)}
            className="flex h-8 w-8 cursor-pointer items-center justify-center rounded-full border border-border-subtle text-content-secondary transition hover:border-border-strong hover:bg-surface-muted hover:text-content-primary focus:outline-none focus-visible:ring-1 focus-visible:ring-border-strong"
          >
            <CircleHelp size={16} aria-hidden="true" />
          </button>
          <button
            type="button"
            aria-label={timeFormat === '12-hour' ? t('switchTo24Hour') : t('switchTo12Hour')}
            title={timeFormat === '12-hour' ? t('switchTo24Hour') : t('switchTo12Hour')}
            onClick={toggleTimeFormat}
            className="flex h-8 w-8 cursor-pointer items-center justify-center rounded-full border border-border-subtle text-content-secondary transition hover:border-border-strong hover:bg-surface-muted hover:text-content-primary focus:outline-none focus-visible:ring-1 focus-visible:ring-border-strong"
          >
            <span aria-hidden="true" className="text-[0.65rem] font-bold leading-none">
              {timeFormat === '12-hour' ? '24h' : '12h'}
            </span>
          </button>
          <button
            type="button"
            aria-label={theme === 'dark' ? t('switchToLight') : t('switchToDark')}
            title={theme === 'dark' ? t('switchToLight') : t('switchToDark')}
            onClick={toggleTheme}
            className="flex h-8 w-8 cursor-pointer items-center justify-center rounded-full border border-border-subtle text-content-secondary transition hover:border-border-strong hover:bg-surface-muted hover:text-content-primary focus:outline-none focus-visible:ring-1 focus-visible:ring-border-strong"
          >
            {theme === 'dark' ? <Sun size={16} aria-hidden="true" /> : <Moon size={16} aria-hidden="true" />}
          </button>
          <div ref={languageMenuRef} className="relative">
            <button
              ref={languageButtonRef}
              type="button"
              aria-label={t('languageLabel')}
              aria-expanded={isLanguageMenuOpen}
              aria-controls="language-menu"
              title={t('languageLabel')}
              onClick={() => setIsLanguageMenuOpen((isOpen) => !isOpen)}
              className="flex h-8 w-8 cursor-pointer items-center justify-center rounded-full border border-border-subtle text-content-secondary transition hover:border-border-strong hover:bg-surface-muted hover:text-content-primary focus:outline-none focus-visible:ring-1 focus-visible:ring-border-strong"
            >
              <Globe size={16} aria-hidden="true" />
            </button>
            {isLanguageMenuOpen && (
              <div
                id="language-menu"
                role="group"
                aria-label={t('languageLabel')}
                className="absolute right-0 top-full z-20 mt-2 min-w-36 rounded-xl border border-border-subtle bg-surface-panel p-1 shadow-lg"
              >
                {Object.entries(LANGUAGES).map(([language, config]) => {
                  const isSelected = (i18n.resolvedLanguage ?? i18n.language) === language
                  return (
                    <button
                      key={language}
                      type="button"
                      aria-pressed={isSelected}
                      onClick={() => {
                        if (isLanguage(language)) void i18n.changeLanguage(language)
                        setIsLanguageMenuOpen(false)
                      }}
                      className="flex w-full cursor-pointer items-center justify-between gap-4 rounded-lg px-3 py-2 text-left text-sm text-content-primary hover:bg-surface-muted focus:outline-none focus-visible:ring-1 focus-visible:ring-border-strong"
                    >
                      <span>{config.label}</span>
                      {isSelected && <Check size={16} aria-hidden="true" />}
                    </button>
                  )
                })}
              </div>
            )}
          </div>
        </div>
      </div>
      {isHowItWorksOpen && <HowItWorksModal onClose={() => setIsHowItWorksOpen(false)} />}
    </header>
  )
}

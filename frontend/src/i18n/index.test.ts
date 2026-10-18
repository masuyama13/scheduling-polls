import { afterEach, describe, expect, it } from 'vitest'
import axios from 'axios'
import i18n, { getActiveIntlLocale } from './index'

describe('internationalization setup', () => {
  afterEach(async () => {
    await i18n.changeLanguage('en')
  })

  it('uses English as the fallback language', () => {
    expect(i18n.t('headerSubtitle', { ns: 'common', lng: 'fr' })).toBe('Schedule across time zones')
  })

  it('resolves the active language to its date formatting locale', async () => {
    await i18n.changeLanguage('ja')

    expect(getActiveIntlLocale()).toBe('ja-JP')
    expect(document.documentElement).toHaveAttribute('lang', 'ja')
    expect(axios.defaults.headers.common['Accept-Language']).toBe('ja')
  })
})

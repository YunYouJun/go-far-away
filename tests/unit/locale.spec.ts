import { describe, expect, it } from 'vitest'
import {
  resolveLocale,
  toAmapLocale,
  toVuetifyLocale,
} from '@/utils/locale'

describe('locale preferences', () => {
  it('prefers a persisted supported locale', () => {
    expect(resolveLocale('en', ['zh-CN'])).toBe('en')
  })

  it('falls back to the first supported browser language', () => {
    expect(resolveLocale(null, ['fr-FR', 'zh-Hans-CN'])).toBe('zh-CN')
    expect(resolveLocale(null, ['fr-FR', 'en-US'])).toBe('en')
    expect(resolveLocale(null, ['fr-FR'])).toBe('zh-CN')
  })

  it('maps application locales to provider locale identifiers', () => {
    expect(toAmapLocale('zh-CN')).toBe('zh_cn')
    expect(toAmapLocale('en')).toBe('en')
    expect(toVuetifyLocale('zh-CN')).toBe('zhHans')
    expect(toVuetifyLocale('en')).toBe('en')
  })
})

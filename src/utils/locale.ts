export const APP_LOCALE_STORAGE_KEY = 'go-far-away:locale'

export type AppLocale = 'en' | 'zh-CN'

const DEFAULT_LOCALE: AppLocale = 'zh-CN'

function normalizeLocale(locale: string | null | undefined): AppLocale | null {
  if (locale == null || locale.length === 0)
    return null

  const normalized = locale.toLowerCase()

  if (normalized === 'en' || normalized.startsWith('en-'))
    return 'en'

  if (normalized === 'zh' || normalized.startsWith('zh-'))
    return 'zh-CN'

  return null
}

export function resolveLocale(
  persistedLocale: string | null,
  browserLanguages: readonly string[],
): AppLocale {
  return normalizeLocale(persistedLocale)
    ?? browserLanguages.map(normalizeLocale).find(locale => locale !== null)
    ?? DEFAULT_LOCALE
}

export function getInitialLocale(): AppLocale {
  if (typeof window === 'undefined')
    return DEFAULT_LOCALE

  let persistedLocale: string | null = null

  try {
    persistedLocale = window.localStorage.getItem(APP_LOCALE_STORAGE_KEY)
  }
  catch {
    // Storage may be unavailable in privacy-restricted browser contexts.
  }

  return resolveLocale(persistedLocale, navigator.languages ?? [navigator.language])
}

export function persistLocale(locale: AppLocale): void {
  if (typeof document !== 'undefined')
    document.documentElement.lang = locale

  if (typeof window === 'undefined')
    return

  try {
    window.localStorage.setItem(APP_LOCALE_STORAGE_KEY, locale)
  }
  catch {
    // The language still applies to the current session when storage is blocked.
  }
}

export function toAmapLocale(locale: AppLocale): AMap.Lang {
  return locale === 'zh-CN' ? 'zh_cn' : 'en'
}

export function toVuetifyLocale(locale: AppLocale): 'en' | 'zhHans' {
  return locale === 'zh-CN' ? 'zhHans' : 'en'
}

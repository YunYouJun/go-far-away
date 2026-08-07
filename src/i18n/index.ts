import { createI18n } from 'vue-i18n'
import { getInitialLocale, persistLocale } from '@/utils/locale'
import en from './en'
import zhCN from './zh-CN'

const messages = {
  en,
  'zh-CN': zhCN,
}

const locale = getInitialLocale()
persistLocale(locale)

export default createI18n({
  legacy: false,
  globalInjection: true,
  locale,
  fallbackLocale: 'en',
  messages,
})

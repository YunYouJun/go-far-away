import { createVuetify } from 'vuetify'
import { aliases, mdi } from 'vuetify/iconsets/mdi-svg'
import { en, zhHans } from 'vuetify/locale'
import { getInitialLocale, toVuetifyLocale } from '@/utils/locale'
import 'vuetify/styles'

export default createVuetify({
  icons: {
    defaultSet: 'mdi',
    aliases,
    sets: {
      mdi,
    },
  },
  locale: {
    locale: toVuetifyLocale(getInitialLocale()),
    fallback: 'en',
    messages: {
      en,
      zhHans,
    },
  },
})

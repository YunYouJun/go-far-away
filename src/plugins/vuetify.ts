import { createVuetify } from 'vuetify'
import { aliases, mdi } from 'vuetify/iconsets/mdi-svg'
import { en, zhHans } from 'vuetify/locale'
import { getInitialLocale, toVuetifyLocale } from '@/utils/locale'
import 'vuetify/styles'

export default createVuetify({
  theme: {
    defaultTheme: 'journeyLight',
    themes: {
      journeyLight: {
        dark: false,
        colors: {
          'background': '#FFFFFF',
          'surface': '#FFFFFF',
          'surface-variant': '#F4F6F8',
          'primary': '#5F9F41',
          'secondary': '#3977C8',
          'success': '#5F9F41',
          'info': '#3977C8',
          'warning': '#C9812E',
          'error': '#C94A4A',
        },
        variables: {
          'border-color': '#111820',
          'border-opacity': 0.12,
          'high-emphasis-opacity': 0.92,
          'medium-emphasis-opacity': 0.68,
        },
      },
      journeyDark: {
        dark: true,
        colors: {
          'background': '#10151C',
          'surface': '#171C23',
          'surface-variant': '#222830',
          'primary': '#77B956',
          'secondary': '#70A8F1',
          'success': '#77B956',
          'info': '#70A8F1',
          'warning': '#E2A45F',
          'error': '#F07B7B',
        },
        variables: {
          'border-color': '#FFFFFF',
          'border-opacity': 0.13,
          'high-emphasis-opacity': 0.94,
          'medium-emphasis-opacity': 0.7,
        },
      },
    },
  },
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

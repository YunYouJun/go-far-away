import type { ComposerTranslation } from 'vue-i18n'

declare module '@vue/runtime-core' {
  interface ComponentCustomProperties {
    $t: ComposerTranslation
  }
}

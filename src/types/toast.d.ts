import type toast from '@/components/core/toast'

declare module '@vue/runtime-core' {
  interface ComponentCustomProperties {
    $toast: typeof toast
  }
}

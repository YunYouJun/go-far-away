import { createApp } from 'vue'
import i18n from '@/i18n'
import vuetify from '@/plugins/vuetify'
import Toast from './Toast.vue'

interface ToastOptions {
  closeable?: boolean
  color?: string
  multiLine?: boolean
  timeout?: number
}

interface ToastParams {
  title?: string
  text: string
  type?: string
  color?: string
  options?: ToastOptions
}

const queue: ToastParams[] = []
let showing = false

function open(params: ToastParams): void {
  if (params.text.length === 0) {
    console.error('[toast] no text supplied')
    return
  }

  const type = params.type ?? 'info'
  const color = params.color ?? params.options?.color ?? type
  const hasTitle = params.title !== undefined && params.title.length > 0

  queue.push({
    ...params,
    type,
    options: {
      color,
      closeable: true,
      timeout: 3000,
      multiLine: hasTitle || params.text.length > 80,
      ...params.options,
    },
  })
  processQueue()
}

function processQueue(): void {
  if (showing || queue.length < 1)
    return

  const nextInLine = queue.shift()
  if (!nextInLine)
    return

  spawn(nextInLine)
  showing = true
}

function spawn(params: ToastParams): void {
  const mountNode = document.createElement('div')
  document.body.appendChild(mountNode)

  const toastApp = createApp(Toast, {
    ...params,
    onClose: () => {
      toastApp.unmount()
      mountNode.remove()
      showing = false
      processQueue()
    },
  })

  toastApp.use(i18n)
  toastApp.use(vuetify)
  toastApp.mount(mountNode)
}

export { Toast }
export default { open }

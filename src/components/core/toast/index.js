import Vue from 'vue'
import Toast from './Toast'

const queue = []
let showing = false

export { Toast }
export default {
  open(params) {
    if (!params.text) return console.error('[toast] no text supplied')
    if (!params.type) params.type = 'info'

    const propsData = {
      title: params.title,
      text: params.text,
      type: params.type
    }

    const defaultOptions = {
      color: params.color || 'info',
      closeable: true,
      autoHeight: true,
      timeout: 3000,
      multiLine: !!params.title || params.text.length > 80
    }

    params.options = Object.assign(defaultOptions, params.options)
    propsData.options = params.options

    // push into queue
    queue.push(propsData)
    processQueue()
  }
}

function processQueue() {
  if (queue.length < 1) return
  if (showing) return

  const nextInLine = queue[0]
  spawn(nextInLine)
  showing = true

  queue.shift()
}

function spawn(propsData) {
  const ToastComponent = Vue.extend(Toast)
  return new ToastComponent({
    el: document.createElement('div'),
    propsData,
    onClose: function() {
      showing = false
      processQueue()
    }
  })
}

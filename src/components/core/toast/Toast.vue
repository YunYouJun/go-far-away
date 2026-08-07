<script setup lang="ts">
import { onMounted, shallowRef, watch } from 'vue'

interface ToastOptions {
  closeable?: boolean
  color?: string
  multiLine?: boolean
  timeout?: number
}

const props = withDefaults(defineProps<{
  title?: string
  text: string
  type?: string
  options?: ToastOptions
}>(), {
  title: '',
  type: 'info',
  options: () => ({}),
})

const emit = defineEmits<{
  close: []
}>()

const open = shallowRef(false)
const snackbarOptions = {
  color: props.options.color || props.type,
  timeout: props.options.timeout ?? 3000,
  multiLine: props.options.multiLine,
}

watch(open, (value) => {
  if (!value)
    close()
})

onMounted(() => {
  open.value = true
})

function close(): void {
  window.setTimeout(() => {
    emit('close')
  }, 300)
}
</script>

<template>
  <v-snackbar
    v-model="open"
    v-bind="snackbarOptions"
    role="status"
    aria-live="polite"
  >
    <div class="toast-content">
      <div v-if="title" class="text-subtitle-1 mb-2">
        {{ title }}
      </div>
      <div>
        {{ text }}
      </div>
    </div>
    <template v-if="options.closeable" #actions>
      <v-btn variant="text" @click="open = false">
        {{ $t('actions.close') }}
      </v-btn>
    </template>
  </v-snackbar>
</template>

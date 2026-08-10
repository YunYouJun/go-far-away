<script setup lang="ts">
import { computed, onBeforeUnmount, onMounted, watchEffect } from 'vue'
import { useI18n } from 'vue-i18n'
import { useRoute } from 'vue-router'
import { useTheme } from 'vuetify'
import AppBar from '@/components/core/AppBar.vue'
import AppFooter from '@/components/core/AppFooter.vue'

const route = useRoute()
const { t, locale } = useI18n()
const theme = useTheme()
const isImmersiveRoute = computed(() => route.name === 'home' || route.name === 'go')
let colorScheme: MediaQueryList | undefined

function syncTheme(event?: MediaQueryListEvent): void {
  const savedTheme = window.localStorage.getItem('go-far-away-theme')
  if (savedTheme === 'journeyDark' || savedTheme === 'journeyLight') {
    theme.change(savedTheme)
    return
  }

  const prefersDark = event?.matches ?? colorScheme?.matches ?? false
  theme.change(prefersDark ? 'journeyDark' : 'journeyLight')
}

onMounted(() => {
  colorScheme = window.matchMedia('(prefers-color-scheme: dark)')
  syncTheme()
  colorScheme.addEventListener('change', syncTheme)
})

onBeforeUnmount(() => {
  colorScheme?.removeEventListener('change', syncTheme)
})

watchEffect(() => {
  const titleKey = typeof route.meta.titleKey === 'string'
    ? route.meta.titleKey
    : 'seo.home'
  const pageTitle = `${t(titleKey)} · go-far-away`
  const description = t('description')

  document.title = pageTitle
  document.documentElement.lang = locale.value
  document.documentElement.style.colorScheme = theme.global.current.value.dark ? 'dark' : 'light'
  setMetaContent('meta[name="description"]', description)
  setMetaContent('meta[name="theme-color"]', theme.global.current.value.dark ? '#10151c' : '#ffffff')
  setMetaContent('meta[property="og:title"]', pageTitle)
  setMetaContent('meta[property="og:description"]', description)
})

function setMetaContent(selector: string, content: string): void {
  document.querySelector<HTMLMetaElement>(selector)?.setAttribute('content', content)
}
</script>

<template>
  <v-app class="app-shell">
    <AppBar />
    <v-main class="app-main">
      <router-view />
    </v-main>
    <AppFooter v-if="!isImmersiveRoute" />
  </v-app>
</template>

<style>
html,
body,
#app {
  min-height: 100%;
  margin: 0;
}

body {
  background: rgb(var(--v-theme-background));
}
</style>

<style scoped>
.app-shell {
  min-height: 100vh;
  min-height: 100dvh;
}

.app-shell :deep(.v-application__wrap) {
  min-height: 100vh;
  min-height: 100dvh;
}

.app-main {
  flex: 1 0 auto;
  background: rgb(var(--v-theme-background));
}
</style>

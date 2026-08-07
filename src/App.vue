<script setup lang="ts">
import { watchEffect } from 'vue'
import { useI18n } from 'vue-i18n'
import { useRoute } from 'vue-router'
import AppBar from '@/components/core/AppBar.vue'
import AppFooter from '@/components/core/AppFooter.vue'

const route = useRoute()
const { t, locale } = useI18n()

watchEffect(() => {
  const titleKey = typeof route.meta.titleKey === 'string'
    ? route.meta.titleKey
    : 'seo.home'
  const pageTitle = `${t(titleKey)} · go-far-away`
  const description = t('description')

  document.title = pageTitle
  document.documentElement.lang = locale.value
  setMetaContent('meta[name="description"]', description)
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
    <AppFooter />
  </v-app>
</template>

<style>
html,
body,
#app {
  min-height: 100%;
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
}
</style>

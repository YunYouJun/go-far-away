<script setup lang="ts">
import {
  mdiCrosshairsGps,
  mdiHome,
  mdiInformationOutline,
  mdiSwapHorizontal,
} from '@mdi/js'
import Locales from '@/components/core/Locales.vue'

const toolItems = [
  {
    icon: mdiCrosshairsGps,
    label: 'menu["Location Search"]',
    to: '/go',
  },
  {
    icon: mdiSwapHorizontal,
    label: 'menu["Unit Transform"]',
    to: '/unit',
  },
  {
    icon: mdiInformationOutline,
    label: 'menu.About',
    to: '/about',
  },
]
</script>

<template>
  <v-app-bar>
    <v-btn
      :icon="mdiHome"
      to="/"
      variant="text"
      :aria-label="$t('accessibility.home')"
      :title="$t('accessibility.home')"
    />
    <v-toolbar-title class="app-bar__title text-uppercase">
      <span>go</span>
      <span class="hidden-sm-and-down">-far-away</span>
    </v-toolbar-title>

    <v-spacer />
    <v-btn
      v-for="toolItem in toolItems"
      :key="toolItem.to"
      :to="toolItem.to"
      class="app-bar__tool mr-2"
      variant="text"
      :aria-label="$t(toolItem.label)"
      :title="$t(toolItem.label)"
    >
      <v-icon>{{ toolItem.icon }}</v-icon>
      <span class="ml-2 hidden-sm-and-down">{{ $t(toolItem.label) }}</span>
    </v-btn>
    <Locales />
  </v-app-bar>
</template>

<style scoped>
.app-bar__title {
  flex: 0 1 auto;
  min-width: 0;
  margin-right: 0.5rem;
  letter-spacing: 0;
}

@media (max-width: 600px) {
  .app-bar__tool {
    min-width: 40px !important;
    padding: 0 !important;
    margin-right: 0 !important;
  }
}
</style>

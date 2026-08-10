<script setup lang="ts">
import {
  mdiCrosshairsGps,
  mdiInformationOutline,
  mdiSwapHorizontal,
  mdiWeatherNight,
  mdiWeatherSunny,
} from '@mdi/js'
import { computed } from 'vue'
import { useRoute } from 'vue-router'
import { useTheme } from 'vuetify'
import Locales from '@/components/core/Locales.vue'

const route = useRoute()
const theme = useTheme()
const isDark = computed(() => theme.global.current.value.dark)
const brandIconUrl = `${import.meta.env.BASE_URL}img/go-far-away-app-icon.svg`

const toolItems = [
  {
    icon: mdiCrosshairsGps,
    label: 'menu["Location Search"]',
    to: '/',
    matches: ['home', 'go'],
  },
  {
    icon: mdiSwapHorizontal,
    label: 'menu["Unit Transform"]',
    to: '/unit',
    matches: ['unit'],
  },
  {
    icon: mdiInformationOutline,
    label: 'menu.About',
    to: '/about',
    matches: ['about'],
  },
]

function toggleTheme(): void {
  const nextTheme = isDark.value ? 'journeyLight' : 'journeyDark'
  theme.change(nextTheme)
  window.localStorage.setItem('go-far-away-theme', nextTheme)
}
</script>

<template>
  <v-app-bar class="app-bar" :elevation="0" height="64">
    <router-link class="app-bar__brand" to="/" :aria-label="$t('accessibility.home')">
      <img class="app-bar__brand-icon" :src="brandIconUrl" alt="">
      <span>GO-FAR-AWAY</span>
    </router-link>

    <v-spacer />

    <nav class="app-bar__nav" :aria-label="$t('accessibility.primaryNavigation')">
      <v-btn
        v-for="(toolItem, index) in toolItems"
        :key="toolItem.to"
        :to="toolItem.to"
        class="app-bar__tool"
        :class="{
          'app-bar__tool--active': toolItem.matches.includes(String(route.name)),
          'app-bar__tool--secondary': index > 0,
        }"
        variant="text"
        :aria-current="toolItem.matches.includes(String(route.name)) ? 'page' : undefined"
        :aria-label="$t(toolItem.label)"
        :title="$t(toolItem.label)"
      >
        <v-icon size="19">
          {{ toolItem.icon }}
        </v-icon>
        <span>{{ $t(toolItem.label) }}</span>
      </v-btn>
      <v-btn
        class="app-bar__utility"
        :icon="isDark ? mdiWeatherSunny : mdiWeatherNight"
        variant="text"
        :aria-label="$t(isDark ? 'accessibility.useLightTheme' : 'accessibility.useDarkTheme')"
        :title="$t(isDark ? 'accessibility.useLightTheme' : 'accessibility.useDarkTheme')"
        @click="toggleTheme"
      />
      <Locales />
    </nav>
  </v-app-bar>
</template>

<style scoped>
.app-bar {
  border-bottom: 1px solid rgb(var(--v-theme-on-surface), 0.09);
  background: rgb(var(--v-theme-surface), 0.94) !important;
  backdrop-filter: blur(18px);
}

.app-bar__brand {
  display: inline-flex;
  align-items: center;
  gap: 0.75rem;
  min-width: 0;
  margin-left: clamp(1rem, 2.2vw, 2rem);
  color: rgb(var(--v-theme-on-surface));
  font-size: 0.98rem;
  font-weight: 550;
  letter-spacing: 0.025em;
  text-decoration: none;
}

.app-bar__brand-icon {
  width: 30px;
  height: 30px;
  border-radius: 8px;
  object-fit: cover;
}

.app-bar__nav {
  display: flex;
  align-items: center;
  gap: 0.15rem;
  margin-right: clamp(0.75rem, 1.8vw, 1.5rem);
}

.app-bar__tool {
  min-width: 0;
  padding: 0 0.75rem !important;
  color: rgb(var(--v-theme-on-surface), 0.72);
  font-size: 0.86rem;
  font-weight: 500;
  letter-spacing: 0;
  text-transform: none;
}

.app-bar__tool :deep(.v-btn__content) {
  gap: 0.45rem;
}

.app-bar__tool--active {
  color: rgb(var(--v-theme-on-surface));
}

.app-bar__utility {
  width: 42px;
  min-width: 42px;
}

@media (max-width: 720px) {
  .app-bar__brand {
    gap: 0.6rem;
    margin-left: 0.85rem;
    font-size: 0.88rem;
  }

  .app-bar__brand-icon {
    width: 28px;
    height: 28px;
    border-radius: 7px;
  }

  .app-bar__nav {
    margin-right: 0.35rem;
  }

  .app-bar__tool {
    width: 42px;
    min-width: 42px;
    padding: 0 !important;
  }

  .app-bar__tool span {
    display: none;
  }

  .app-bar__tool--secondary {
    display: none;
  }

}

@media (max-width: 360px) {
  .app-bar__brand span {
    display: none;
  }
}
</style>

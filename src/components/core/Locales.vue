<script setup lang="ts">
import type { AppLocale } from '@/utils/locale'
import { mdiTranslate } from '@mdi/js'
import { computed } from 'vue'
import { useI18n } from 'vue-i18n'
import { useLocale } from 'vuetify'
import languages from '@/data/i18n/languages.json'
import { persistLocale, toVuetifyLocale } from '@/utils/locale'

interface Language {
  name: string
  locale: string
  alternate?: string
}

const { locale } = useI18n()
const { current: vuetifyLocale } = useLocale()

const currentLanguage = computed(() =>
  (languages as Language[]).find(
    language => language.alternate === locale.value || language.locale === locale.value,
  ),
)

function translateI18n(language: Language): void {
  const nextLocale = (language.locale || language.alternate) as AppLocale
  locale.value = nextLocale
  vuetifyLocale.value = toVuetifyLocale(nextLocale)
  persistLocale(nextLocale)
}
</script>

<template>
  <v-menu location="bottom end">
    <template #activator="{ props }">
      <v-btn
        v-bind="props"
        class="locale-button"
        :icon="mdiTranslate"
        variant="text"
        :aria-label="$t('accessibility.language')"
        :title="$t('accessibility.language')"
      />
    </template>
    <v-list density="compact">
      <v-list-item
        v-for="language in languages"
        :key="language.locale"
        :active="currentLanguage?.locale === language.locale"
        @click="translateI18n(language)"
      >
        <v-list-item-title>{{ language.name }}</v-list-item-title>
      </v-list-item>
    </v-list>
  </v-menu>
</template>

<style scoped>
@media (max-width: 600px) {
  .locale-button {
    width: 40px;
    min-width: 40px;
  }
}
</style>

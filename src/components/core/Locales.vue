<template>
  <v-menu attach bottom left offset-y>
    <v-btn slot="activator" flat style="min-width: 48px">
      <v-icon class="mr-2 hidden-sm-and-down">translate</v-icon>
      <v-img
        :src="
          `https://cdn.vuetifyjs.com/images/flags/${
            currentLanguage.country
          }.png`
        "
        width="26px"
      />
    </v-btn>
    <v-list dense light>
      <v-list-tile
        v-for="language in languages"
        :key="language.locale"
        avatar
        @click="translateI18n(language)"
      >
        <v-list-tile-avatar tile size="24px">
          <v-img
            :src="
              `https://cdn.vuetifyjs.com/images/flags/${language.country}.png`
            "
            width="24px"
          />
        </v-list-tile-avatar>
        <v-list-tile-title v-text="language.name" />
      </v-list-tile>
    </v-list>
  </v-menu>
</template>

<script>
// Utilities
import languages from '@/data/i18n/languages.json'
export default {
  data: () => ({
    languages
  }),
  computed: {
    currentLanguage() {
      const locale = this.$i18n.locale
      return this.languages.find(
        l => l.alternate === locale || l.locale === locale
      )
    }
  },
  methods: {
    translateI18n(lang) {
      lang = lang.locale || lang.alternate
      this.$i18n.locale = lang
    }
  }
}
</script>

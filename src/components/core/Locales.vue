<template>
  <v-menu left bottom>
    <template v-slot:activator="{ on }">
      <v-btn v-on="on" slot="activator" text>
        <v-icon class="mr-2 hidden-sm-and-down">mdi-translate</v-icon>
        <v-img
          :src="
            `https://cdn.vuetifyjs.com/images/flags/${currentLanguage.country}.png`
          "
          width="26px"
        />
      </v-btn>
    </template>
    <v-list dense light>
      <v-list-item
        v-for="language in languages"
        :key="language.locale"
        avatar
        @click="translateI18n(language)"
      >
        <v-list-item-icon>
          <v-img
            :src="
              `https://cdn.vuetifyjs.com/images/flags/${language.country}.png`
            "
            width="24px"
          />
        </v-list-item-icon>
        <v-list-item-title v-text="language.name" />
      </v-list-item>
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

<template>
  <v-menu left bottom>
    <template v-slot:activator="{ on }">
      <v-btn v-on="on" slot="activator" text>
        <v-icon>translate</v-icon>
      </v-btn>
    </template>
    <v-list dense light>
      <v-list-item
        v-for="language in languages"
        :key="language.locale"
        @click="translateI18n(language)"
      >
        <v-list-item-title v-text="language.name" />
      </v-list-item>
    </v-list>
  </v-menu>
</template>

<script>
// Utilities
import languages from "@/data/i18n/languages.json";
export default {
  data: () => ({
    languages,
  }),
  computed: {
    currentLanguage() {
      const locale = this.$i18n.locale;
      return this.languages.find(
        (l) => l.alternate === locale || l.locale === locale
      );
    },
  },
  methods: {
    translateI18n(lang) {
      lang = lang.locale || lang.alternate;
      this.$i18n.locale = lang;
    },
  },
};
</script>

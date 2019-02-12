<template>
  <v-toolbar app>
    <router-link :to="{ name: 'home' }">
      <v-img
        alt="Logo"
        src="/img/logo.png"
        contain
        transition="scale-transition"
        height="38px"
        width="38px"
      />
    </router-link>
    <v-toolbar-title class="headline text-uppercase font-weight-light">
      <span>go</span>
      <span class="hidden-sm-and-down">-far-away</span>
    </v-toolbar-title>
    <v-spacer></v-spacer>
    <v-toolbar-items>
      <v-btn flat style="min-width: 48px">
        <v-icon>location_searching</v-icon>
        <span class="ml-2 hidden-sm-and-down">{{
          $t('menu["Location Search"]')
        }}</span>
      </v-btn>
      <v-btn flat style="min-width: 48px">
        <v-icon>transform</v-icon>
        <span class="ml-2 hidden-sm-and-down">{{
          $t('menu["Unit Transform"]')
        }}</span>
      </v-btn>
      <locales />
    </v-toolbar-items>
  </v-toolbar>
</template>

<script>
import locales from '@/components/core/Locales'
export default {
  components: {
    locales
  }
}
</script>

<style></style>

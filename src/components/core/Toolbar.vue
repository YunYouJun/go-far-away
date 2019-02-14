<template>
  <v-toolbar app style="z-index:2000;">
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
      <v-btn
        v-for="toolItem in toolItems"
        :key="toolItem.to"
        flat
        :to="toolItem.to"
        style="min-width: 48px"
      >
        <v-icon>{{ toolItem.icon }}</v-icon>
        <span class="ml-2 hidden-sm-and-down">{{ $t(toolItem.label) }}</span>
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
  },
  data() {
    return {
      toolItems: [
        {
          icon: 'location_searching',
          label: 'menu["Location Search"]',
          to: '/go'
        },
        {
          icon: 'transform',
          label: 'menu["Unit Transform"]',
          to: '/unit'
        }
      ]
    }
  }
}
</script>

<style></style>

<template>
  <v-app-bar app>
    <v-btn icon to="/">
      <v-icon>home</v-icon>
    </v-btn>
    <v-toolbar-title class="text-uppercase">
      <span>go</span>
      <span class="hidden-sm-and-down">-far-away</span>
    </v-toolbar-title>

    <v-spacer></v-spacer>
    <v-btn
      v-for="toolItem in toolItems"
      :key="toolItem.to"
      :to="toolItem.to"
      text
    >
      <v-icon>{{ toolItem.icon }}</v-icon>
      <span class="ml-2 hidden-sm-and-down">{{ $t(toolItem.label) }}</span>
    </v-btn>
    <locales />
  </v-app-bar>
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

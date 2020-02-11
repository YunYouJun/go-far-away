<template>
  <v-app>
    <app-bar />
    <v-content>
      <router-view />
    </v-content>
    <app-footer />
  </v-app>
</template>

<script>
import AppBar from './components/core/AppBar'
import AppFooter from './components/core/AppFooter'
export default {
  name: 'App',
  components: {
    AppBar,
    AppFooter
  }
}
</script>

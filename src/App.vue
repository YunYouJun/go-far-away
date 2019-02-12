<template>
  <v-app>
    <toolbar />
    <v-content>
      <router-view />
    </v-content>
    <app-footer />
  </v-app>
</template>

<script>
import Toolbar from './components/core/Toolbar'
import AppFooter from './components/core/AppFooter'

export default {
  name: 'App',
  components: {
    AppFooter,
    Toolbar
  },
  data() {
    return {
      //
    }
  }
}
</script>

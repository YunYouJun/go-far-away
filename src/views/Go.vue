<template>
  <v-container>
    <map-container />
    <float-menu style="z-index:2000;" />
  </v-container>
</template>

<script>
import FloatMenu from '@/components/map/FloatMenu'
import MapContainer from '@/components/map/MapContainer'

export default {
  components: {
    FloatMenu,
    MapContainer
  }
}
</script>

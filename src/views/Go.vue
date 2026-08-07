<script setup lang="ts">
import { reactive, shallowRef } from 'vue'
import FloatMenu from '@/components/map/FloatMenu.vue'
import MapContainer from '@/components/map/MapContainer.vue'

const goFarAwayTrigger = shallowRef(0)
const accurateLocationTrigger = shallowRef(0)
const mapActions = reactive({
  canGoFarAway: false,
  canLocate: false,
})

function updateMapActions(state: typeof mapActions): void {
  mapActions.canGoFarAway = state.canGoFarAway
  mapActions.canLocate = state.canLocate
}
</script>

<template>
  <v-container>
    <MapContainer
      :go-far-away-trigger="goFarAwayTrigger"
      :accurate-location-trigger="accurateLocationTrigger"
      @action-state-change="updateMapActions"
    />
    <FloatMenu
      style="z-index: 999"
      :go-disabled="!mapActions.canGoFarAway"
      :location-disabled="!mapActions.canLocate"
      @go-far-away="goFarAwayTrigger += 1"
      @get-accurate-location="accurateLocationTrigger += 1"
    />
  </v-container>
</template>

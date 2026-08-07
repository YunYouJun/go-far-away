<script setup lang="ts">
import {
  mdiCrosshairsGps,
  mdiGolf,
  mdiRadar,
} from '@mdi/js'

withDefaults(defineProps<{
  goDisabled?: boolean
  locationDisabled?: boolean
}>(), {
  goDisabled: false,
  locationDisabled: false,
})

const emit = defineEmits<{
  goFarAway: []
  getAccurateLocation: []
}>()
</script>

<template>
  <div
    class="float-menu"
    role="group"
    :aria-label="$t('map.actions.quickActions')"
  >
    <v-btn
      icon
      color="green"
      :disabled="goDisabled"
      :aria-label="$t('map.actions.goFarAway')"
      :title="$t('map.actions.goFarAway')"
      @click="emit('goFarAway')"
    >
      <v-icon>{{ mdiGolf }}</v-icon>
    </v-btn>
    <v-btn
      icon
      color="indigo"
      :disabled="locationDisabled"
      :aria-label="$t('map.actions.locate')"
      :title="$t('map.actions.locate')"
      @click="emit('getAccurateLocation')"
    >
      <v-icon>{{ mdiCrosshairsGps }}</v-icon>
    </v-btn>
    <v-btn
      icon
      color="blue-grey"
      href="https://baike.baidu.com/item/旅行者1号探测器"
      target="_blank"
      rel="noopener noreferrer"
      :aria-label="$t('map.actions.voyager')"
      :title="$t('map.actions.voyager')"
    >
      <v-icon>{{ mdiRadar }}</v-icon>
    </v-btn>
  </div>
</template>

<style scoped>
.float-menu {
  position: fixed;
  right: 24px;
  bottom: 24px;
  display: flex;
  flex-direction: column;
  gap: 12px;
}

@media (max-width: 600px) {
  .float-menu {
    right: 16px;
    bottom: 16px;
  }
}
</style>

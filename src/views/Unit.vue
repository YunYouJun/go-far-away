<script setup lang="ts">
import UnitTransform from '@/components/unit/UnitTransform.vue'
</script>

<template>
  <div>
    <h1 class="unit-title text-h4 text-sm-h3 text-center mt-5">
      {{ $t('menu["Unit Transform"]') }}
    </h1>
    <v-form>
      <v-container>
        <UnitTransform
          kind="latitude"
          :label="`${$t('geographic.latitude.north')} °N`"
        />
        <UnitTransform
          kind="longitude"
          :label="`${$t('geographic.longitude.east')} °E`"
        />
      </v-container>
    </v-form>
  </div>
</template>

<style scoped>
.unit-title {
  overflow-wrap: anywhere;
}
</style>

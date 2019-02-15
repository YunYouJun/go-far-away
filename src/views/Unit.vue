<template>
  <div>
    <h3 class="display-2 text-xs-center mt-4">
      {{ $t('menu["Unit Transform"]') }}
    </h3>
    <v-form>
      <v-container>
        <unit-transform :label="$t('geographic.latitude.north') + ' °N'" />
        <unit-transform :label="$t('geographic.longitude.east') + ' °E'" />
      </v-container>
    </v-form>
  </div>
</template>

<script>
import UnitTransform from '@/components/unit/UnitTransform'
export default {
  components: {
    UnitTransform
  }
}
</script>

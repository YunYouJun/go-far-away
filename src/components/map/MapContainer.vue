<template>
  <div>
    <v-form>
      <v-container>
        <v-layout wrap>
          <v-flex xs12 md6>
            <v-text-field
              id="address"
              prepend-icon="location_city"
              :label="$t('form.address.label')"
              persistent-hint
              :hint="$t('form.address.hint')"
              v-model="address"
            ></v-text-field>
          </v-flex>
          <v-flex xs6 md3>
            <v-text-field
              v-model="lat"
              :label="$t('geographic.latitude.north')"
              required
            ></v-text-field>
          </v-flex>
          <v-flex xs6 md3>
            <v-text-field
              v-model="lng"
              :label="$t('geographic.longitude.east')"
              required
            ></v-text-field>
          </v-flex>
        </v-layout>
      </v-container>
    </v-form>
    <amap-wrapper :address="address" @center="onGeographic" @city="onAddress" />
  </div>
</template>

<script>
import AmapWrapper from '@/components/map/AmapWrapper'
export default {
  components: {
    AmapWrapper
  },
  data() {
    return {
      address: '',
      autocomplete: [],
      isLocated: true,
      lat: 0,
      lng: 0
    }
  },
  methods: {
    onAddress(address) {
      this.address = address.province + address.city + address.district
    },
    onGeographic(center) {
      this.lat = center.lat
      this.lng = center.lng
    },
    doSome() {
      console.log('do')
    }
  }
}
</script>

<style></style>

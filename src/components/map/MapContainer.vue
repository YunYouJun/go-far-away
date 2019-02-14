<template>
  <div>
    <v-form>
      <v-container>
        <v-layout wrap>
          <v-flex xs12 md6>
            <v-autocomplete
              id="address"
              prepend-icon="location_city"
              :items="autocomplete"
              :label="$t('form.address.label')"
              item-text="name"
              item-value="name"
              :search-input.sync="curPosition.address"
              :placeholder="curPosition.address"
              :aria-placeholder="curPosition.address"
              dense
              hide-no-data
              persistent-hint
              :hint="searchHint"
              return-object
              no-filter
              @change="searchPlace"
              style="z-index:1000;"
            >
              <template slot="item" slot-scope="data">
                <v-list-tile-content>
                  <v-list-tile-title
                    v-html="data.item.name"
                  ></v-list-tile-title>
                  <v-list-tile-sub-title
                    v-html="data.item.district"
                  ></v-list-tile-sub-title>
                </v-list-tile-content>
              </template>
              <v-slide-x-reverse-transition slot="append-outer" mode="out-in">
                <v-icon :color="isLocated ? 'success' : 'info'" @click="doSome"
                  >location_on</v-icon
                >
              </v-slide-x-reverse-transition>
            </v-autocomplete>
          </v-flex>
          <v-flex xs6 md3>
            <v-text-field
              v-model="curPosition.location.lat"
              :label="$t('geographic.latitude.north') + ' °N'"
              type="number"
              max="180"
              min="-180"
              required
              @change="getAddressByLnglat"
            ></v-text-field>
          </v-flex>
          <v-flex xs6 md3>
            <v-text-field
              v-model="curPosition.location.lng"
              :label="$t('geographic.longitude.east') + ' °E'"
              type="number"
              max="180"
              min="-180"
              required
              @change="getAddressByLnglat"
            ></v-text-field>
          </v-flex>
        </v-layout>
      </v-container>
    </v-form>
    <amap-wrapper />
  </div>
</template>

<script>
import AmapWrapper from '@/components/map/AmapWrapper'
export default {
  mixins: [AmapWrapper],
  components: {
    AmapWrapper
  },
  data() {
    return {
      autocomplete: [],
      formattedAddress: '',
      curPosition: {
        address: '',
        location: {
          lat: 39.90923,
          lng: 116.397428
        }
      },
      isLocated: true
    }
  },
  computed: {
    searchHint() {
      if (this.formattedAddress) {
        return this.formattedAddress
      }
      return this.$t('form.address.hint')
    }
  },
  watch: {
    'curPosition.address': function(val) {
      if (val) {
        this.getAutoComplete(val)
      }
    }
  },
  methods: {
    setCurLnglat(location) {
      this.curPosition.location = location
    },
    searchPlace(obj) {
      if (obj) {
        if (typeof obj === 'object') {
          this.formattedAddress = obj.district + obj.address + obj.name
          this.getPlaceBySearch(obj)
        } else {
          console.log('no obj')
          console.log(obj)
        }
      }
    },
    doSome() {
      console.log('do')
    }
  }
}
</script>

<style></style>

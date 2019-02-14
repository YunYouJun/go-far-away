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
              :search-input.sync="curPosition.address"
              :placeholder="curPosition.address"
              :aria-placeholder="curPosition.address"
              clearable
              dense
              hide-no-data
              item-text="name"
              item-value="name"
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
                <v-icon
                  :color="isLocated ? 'success' : 'info'"
                  @click="getCurPositionByBrowser"
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
    <amap-wrapper @lnglat="setCurLnglat" @addressHint="setAddressHint" />
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
          lat: 0,
          lng: 0
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
    setAddressHint(address) {
      this.formattedAddress = address
    },
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
    }
  }
}
</script>

<style></style>

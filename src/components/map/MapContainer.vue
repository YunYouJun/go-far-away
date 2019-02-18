<template>
  <div>
    <div class="text-xs-center" v-if="isLoading">
      <v-progress-circular indeterminate color="red"></v-progress-circular>
    </div>
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
              :hint="oldLocation.lat"
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
              :hint="oldLocation.lng"
              @change="getAddressByLnglat"
            ></v-text-field>
          </v-flex>
          <v-flex xs12 v-if="distance">
            <div class="text-xs-center">
              <v-chip color="indigo" text-color="white">
                <v-avatar>
                  <v-icon>timeline</v-icon>
                </v-avatar>
                {{ distance + ' ' + $t('unit.m') }}
              </v-chip>
            </div>
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
      distance: '',
      formattedAddress: '',
      curPosition: {
        address: '',
        location: {
          lat: 0,
          lng: 0
        }
      },
      oldLocation: {
        lat: null,
        lng: null
      },
      isLoading: false,
      isLocated: false
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
  created() {
    this.bus.$on('goFarAway', () => {
      this.getFarthestInEarth(this.curPosition.location)
    })
    this.bus.$on('getAccurateLocation', () => {
      this.isLoading = true
      this.getCurPositionByBrowser()
    })
  },
  methods: {
    setAddressHint(address) {
      this.formattedAddress = address
    },
    setCurLnglat(location) {
      this.oldLocation.lng = this.curPosition.location.lng.toString()
      this.oldLocation.lat = this.curPosition.location.lat.toString()
      this.curPosition.location = location
    },
    searchPlace(obj) {
      if (obj) {
        if (typeof obj === 'object') {
          this.formattedAddress = obj.district + obj.address + obj.name
          this.getPlaceBySearch(obj)
        } else {
          this.$toast.open({
            color: 'warning',
            text: '请选中您的地址~'
          })
        }
      }
    },
    getFarthestInEarth(location) {
      let lng = location.lng
      let lat = location.lat
      let go_lat = -lat
      let go_lng
      if (lng <= 0) {
        go_lng = lng + 180
      } else if (lng > 0) {
        go_lng = lng - 180
      }
      let goLocation = {
        lng: go_lng,
        lat: go_lat
      }
      this.setCurLnglat(goLocation)
      this.getAddressByLnglat()
      let map = this.amapManager.getMap()
      map.setZoom(3)
      let curLnglat = [location.lng, location.lat]
      let goLnglat = [goLocation.lng, goLocation.lat]
      this.distance = this.formatDistance(
        AMap.GeometryUtil.distance(curLnglat, goLnglat)
      )
    },
    formatDistance(num, n = 2) {
      // n 精确位数
      num = num.toFixed(n)
      let sub_val = num
        .split('.')[0]
        .split('')
        .reverse()
      let sub_xs = num.split('.')[1]

      let distance = ''
      for (let i = 0; i < sub_val.length; i++) {
        distance +=
          sub_val[i] + ((i + 1) % 3 === 0 && i + 1 != sub_val.length ? ',' : '')
      }

      if (n === 0) {
        distance = distance
          .split('')
          .reverse()
          .join('')
      } else {
        distance =
          distance
            .split('')
            .reverse()
            .join('') +
          '.' +
          sub_xs
      }
      return distance
    }
  }
}
</script>

<style></style>

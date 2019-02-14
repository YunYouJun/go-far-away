<template>
  <div class="amap-wrapper">
    <el-amap
      class="amap-box"
      :vid="'amap-vue'"
      :amap-manager="amapManager"
      :animateEnable="true"
      :center="center"
      :plugin="plugins"
      :lang="lang"
      :resizeEnable="true"
      :events="events"
    >
      <el-amap-marker
        v-for="(marker, index) in markers"
        :key="index"
        :position="marker.position"
        :title="marker.title"
        :animation="'AMAP_ANIMATION_DROP'"
      ></el-amap-marker>
    </el-amap>
  </div>
</template>

<script>
import { AMapManager } from 'vue-amap'
import { lazyAMapApiLoaderInstance } from 'vue-amap'
let amapManager = new AMapManager()
export default {
  data() {
    let self = this
    return {
      amapManager,
      center: [116.397428, 39.90923],
      loaded: false,
      markers: [],
      events: {
        init: o => {
          self.map = o
          // this.$emit('location', o.getCenter())
          o.getCity(result => {
            console.log(result)
            this.$emit(
              'address',
              result.province + result.city + result.district
            )
          })
          self.addMarker(o.getCenter())
        }
      },
      plugins: [
        {
          pName: 'Autocomplete',
          events: {
            init(o) {
              self.autoComplete = o
            }
          }
        },
        // {
        //   pName: 'Geolocation',
        //   buttonPosition: 'RB',
        //   events: {
        //     init(o) {
        //       o.getCurrentPosition((status, result) => {
        //         console.log(status)
        //         console.log(result)
        //         if (result && result.position) {
        //           self.lng = result.position.lng
        //           self.lat = result.position.lat
        //           self.center = [self.lng, self.lat]
        //           self.loaded = true
        //         }
        //       })
        //     }
        //   }
        // },
        'MapType',
        'Scale',
        'ToolBar'
      ]
    }
  },
  computed: {
    lang() {
      return this.$i18n.locale === 'zh-CN' ? 'zh_cn' : this.$i18n.locale
    }
  },
  created() {
    this.initAutoComplete()
    this.initPlaceSearch()
  },
  methods: {
    displayLocationMarker(poi) {
      let lnglat = [poi.location.lng, poi.location.lat]
      let marker = new AMap.Marker({
        position: lnglat,
        title: poi.location.name
      })
      let map = this.amapManager.getMap()
      map.clearMap()
      map.add(marker)
      map.setCenter(lnglat)
      map.setFitView()
    },
    addMarker(point) {
      let marker = {
        position: [point.lng, point.lat]
      }
      this.markers.push(marker)
    },
    setCurMarker(center) {
      this.center = center
      let marker = {
        position: center
      }
      this.markers.shift()
      this.markers.unshift(marker)
    },
    getAutoComplete(keywords) {
      let self = this
      this.autoComplete.search(keywords, function(status, result) {
        self.autocomplete = result.tips
      })
    },
    getLnglatByAddress(address) {
      let self = this
      lazyAMapApiLoaderInstance.load().then(() => {
        let geocoder = new AMap.Geocoder()
        geocoder.getLocation(address, function(status, result) {
          if (status === 'complete' && result.geocodes.length) {
            let lnglat = result.geocodes[0].location
            self.displayLocationMarker(result.geocodes[0])
            self.setCurLnglat(lnglat)
          }
        })
      })
    },
    getAddressByLnglat() {
      let self = this
      let lnglat =
        this.curPosition.location.lng + ',' + this.curPosition.location.lat
      this.displayLocationMarker(this.curPosition)
      lazyAMapApiLoaderInstance.load().then(() => {
        let geocoder = new AMap.Geocoder()
        geocoder.getAddress(lnglat, function(status, result) {
          if (status === 'complete' && result.regeocode) {
            let formattedAddress = result.regeocode.formattedAddress
            self.formattedAddress = formattedAddress
            self.curPosition.address = formattedAddress
          }
        })
      })
    },
    getPlaceBySearch(poi) {
      let self = this
      this.placeSearch.setCity(poi.adcode)
      this.placeSearch.search(poi.name, function(status, result) {
        if (status === 'complete') {
          let pois = result.poiList.pois
          self.displayLocationMarker(pois[0])
          self.setCurLnglat(pois[0].location)
        }
      })
    },
    initAutoComplete() {
      let self = this
      lazyAMapApiLoaderInstance.load().then(() => {
        let autoComplete = new AMap.Autocomplete()
        self.autoComplete = autoComplete
      })
    },
    initPlaceSearch() {
      let self = this
      lazyAMapApiLoaderInstance.load().then(() => {
        let placeSearch = new AMap.PlaceSearch({
          map: self.map
        })
        self.placeSearch = placeSearch
      })
    }
  }
}
</script>

<style>
.amap-wrapper {
  height: 400px;
  width: 100%;
  box-shadow: 5px 5px 20px rgba(55, 55, 55, 0.5);
}
</style>

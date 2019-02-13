<template>
  <div class="amap-wrapper">
    <el-amap
      class="amap-box"
      :vid="'amap-vue'"
      :plugin="plugins"
      :lang="lang"
      :resizeEnable="true"
      :events="events"
    >
      <el-amap-marker
        v-for="(marker, index) in markers"
        :key="index"
        :position="marker.position"
        :animation="'AMAP_ANIMATION_DROP'"
      ></el-amap-marker>
    </el-amap>
  </div>
</template>

<script>
export default {
  data() {
    let self = this
    return {
      lng: 0,
      lat: 0,
      loaded: false,
      markers: [],
      events: {
        init: o => {
          console.log(o.getCenter())
          this.$emit('center', o.getCenter())
          o.getCity(result => {
            console.log(result)
            this.$emit('city', result)
          })
          self.addMarker(o.getCenter())
        }
      },
      plugins: [
        {
          pName: 'Autocomplete',
          input: 'address'
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
  methods: {
    addMarker(point) {
      let marker = {
        position: [point.lng, point.lat]
      }
      this.markers.push(marker)
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

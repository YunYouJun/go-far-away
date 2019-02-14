import Vue from 'vue'
import VueAMap from 'vue-amap'
import { lazyAMapApiLoaderInstance } from 'vue-amap'

Vue.use(VueAMap)
VueAMap.initAMapApiLoader({
  key: process.env.VUE_APP_AMAP_KEY,
  plugin: [
    'Autocomplete',
    'CircleEditor',
    'Geocoder',
    'Geolocation',
    'MapType',
    'OverView',
    'PlaceSearch',
    'PolyEditor',
    'Scale',
    'ToolBar'
  ],
  v: '1.4.12'
})

lazyAMapApiLoaderInstance.load().then(() => {
  // your code ...
})

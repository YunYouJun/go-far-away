import Vue from "vue";
import VueAMap, { lazyAMapApiLoaderInstance } from "vue-amap";

Vue.use(VueAMap);

const key = process.env.VUE_APP_AMAP_KEY;
console.log(key);
VueAMap.initAMapApiLoader({
  key,
  plugin: [
    "Autocomplete",
    "CircleEditor",
    "Geocoder",
    "Geolocation",
    "MapType",
    "OverView",
    "PlaceSearch",
    "PolyEditor",
    "Scale",
    "ToolBar",
  ],
  v: "1.4.12",
});

lazyAMapApiLoaderInstance.load().then(() => {
  // your code ...
});

<template>
  <div class="amap-wrapper">
    <el-amap
      class="amap-box"
      :vid="'amap-vue'"
      :amap-manager="amapManager"
      :animateEnable="true"
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
import { AMapManager } from "vue-amap";
import { lazyAMapApiLoaderInstance } from "vue-amap";
let amapManager = new AMapManager();
export default {
  data() {
    let self = this;
    return {
      amapManager,
      center: [],
      loaded: false,
      markers: [],
      events: {
        init: (o) => {
          let oCenter = o.getCenter();
          self.center = [oCenter.lng, oCenter.lat];
          self.$emit("lnglat", oCenter);
          o.getCity((result) => {
            self.formattedAddress =
              result.province + result.city + result.district;
            self.$emit("addressHint", self.formattedAddress);
          });
          self.addMarker(oCenter);
        },
      },
      plugins: ["MapType", "Scale", "ToolBar"],
    };
  },
  watch: {
    center(val) {
      let map = this.amapManager.getMap();
      map.setCenter(val);
    },
  },
  computed: {
    lang() {
      return this.$i18n.locale === "zh-CN" ? "zh_cn" : this.$i18n.locale;
    },
  },
  created() {
    this.map = this.amapManager.getMap();
    this.initAutoComplete();
    this.initPlaceSearch();
    this.initGeolocation();
  },
  mounted() {
    this.getLnglatByAddress(this.formattedAddress);
  },
  methods: {
    displayLocationMarker(poi) {
      let lnglat = [poi.location.lng, poi.location.lat];
      let marker = new AMap.Marker({
        position: lnglat,
        title: poi.location.name,
      });
      let map = this.amapManager.getMap();
      map.clearMap();
      map.add(marker);
      map.setCenter(lnglat);
      map.setFitView();
    },
    addMarker(point) {
      let marker = {
        position: [point.lng, point.lat],
      };
      this.markers.push(marker);
    },
    setCurMarker(center) {
      this.center = center;
      let marker = {
        position: center,
      };
      this.markers.shift();
      this.markers.unshift(marker);
    },
    getAutoComplete(keywords) {
      let self = this;
      this.autoComplete.search(keywords, function (status, result) {
        self.autocomplete = result.tips;
      });
    },
    getLnglatByAddress(address) {
      let self = this;
      lazyAMapApiLoaderInstance.load().then(() => {
        let geocoder = new AMap.Geocoder();
        geocoder.getLocation(address, function (status, result) {
          if (status === "complete" && result.geocodes.length) {
            let lnglat = result.geocodes[0].location;
            self.displayLocationMarker(result.geocodes[0]);
            self.setCurLnglat(lnglat);
          }
        });
      });
    },
    getAddressByLnglat() {
      let self = this;
      let lnglat =
        this.curPosition.location.lng + "," + this.curPosition.location.lat;
      this.displayLocationMarker(this.curPosition);
      lazyAMapApiLoaderInstance.load().then(() => {
        let geocoder = new AMap.Geocoder();
        geocoder.getAddress(lnglat, function (status, result) {
          if (status === "complete" && result.regeocode) {
            let formattedAddress = result.regeocode.formattedAddress;
            self.formattedAddress = formattedAddress;
            self.curPosition.address = formattedAddress;
          }
        });
      });
    },
    getPlaceBySearch(poi) {
      let self = this;
      this.placeSearch.setCity(poi.adcode);
      this.placeSearch.search(poi.name, function (status, result) {
        if (status === "complete") {
          let pois = result.poiList.pois;
          self.displayLocationMarker(pois[0]);
          self.setCurLnglat(pois[0].location);
        }
      });
    },
    initAutoComplete() {
      let self = this;
      lazyAMapApiLoaderInstance.load().then(() => {
        let autoComplete = new AMap.Autocomplete();
        self.autoComplete = autoComplete;
      });
    },
    initPlaceSearch() {
      let self = this;
      lazyAMapApiLoaderInstance.load().then(() => {
        let placeSearch = new AMap.PlaceSearch({
          map: self.map,
        });
        self.placeSearch = placeSearch;
      });
    },
    initGeolocation() {
      let self = this;
      lazyAMapApiLoaderInstance.load().then(() => {
        AMap.plugin("AMap.Geolocation", function () {
          let geolocation = new AMap.Geolocation({
            showButton: false,
            zoomToAccuracy: true,
          });
          self.geolocation = geolocation;
        });
      });
    },
    // 浏览器定位
    getCurPositionByBrowser() {
      let self = this;
      let map = this.amapManager.getMap();
      map.addControl(this.geolocation);
      this.geolocation.getCurrentPosition(function (status, result) {
        if (status == "complete") {
          self.setCurLnglat(result.position);
          self.formattedAddress = result.formattedAddress;
          let poi = {
            location: result.position,
          };
          self.displayLocationMarker(poi);
          self.isLocated = true;
          self.$toast.open({
            color: "success",
            title: result.info,
            text: result.message,
          });
        } else {
          self.$toast.open({
            color: "error",
            title: result.info,
            text: result.message,
          });
        }
        self.isLoading = false;
      });
    },
  },
};
</script>

<style>
.amap-wrapper {
  margin: 0 0 1rem 0;
  height: 400px;
  width: 100%;
  box-shadow: 5px 5px 20px rgba(55, 55, 55, 0.5);
}
</style>

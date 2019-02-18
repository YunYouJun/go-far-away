<template>
  <v-speed-dial v-model="fab" fixed bottom right>
    <v-btn slot="activator" v-model="fab" dark fab>
      <v-icon>menu</v-icon>
      <v-icon>close</v-icon>
    </v-btn>
    <v-btn fab dark small color="green" @click="goFarAway">
      <v-icon>golf_course</v-icon>
    </v-btn>
    <v-btn fab dark small color="indigo" @click="getAccurateLocation">
      <v-icon>my_location</v-icon>
    </v-btn>
    <v-btn
      fab
      dark
      small
      color="blue-grey"
      href="https://baike.baidu.com/item/旅行者1号探测器"
      target="_blank"
    >
      <v-icon>track_changes</v-icon>
    </v-btn>
  </v-speed-dial>
</template>

<script>
export default {
  data: () => ({
    fab: false,
    fling: false,
    tabs: null,
    left: false
  }),
  methods: {
    goFarAway() {
      this.bus.$emit('goFarAway')
    },
    getAccurateLocation() {
      this.bus.$emit('getAccurateLocation')
    }
  }
}
</script>

<style></style>

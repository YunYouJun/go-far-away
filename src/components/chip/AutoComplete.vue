<template>
  <v-autocomplete
    id="address"
    prepend-icon="location_city"
    :items="autocomplete"
    :label="$t('form.address.label')"
    item-text="name"
    item-value="name"
    :search-input.sync="address"
    :filter="filter"
    dense
    hide-no-data
    persistent-hint
    :hint="$t('form.address.hint')"
  >
    <template slot="item" slot-scope="data">
      <v-list-tile-content>
        <v-list-tile-title v-html="data.item.name"></v-list-tile-title>
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
</template>

<script>
export default {
  methods: {
    filter() {
      // return amap result directly
      return true
    },
    onAutoComplete(result) {
      console.log(result)
      this.autocomplete = result.tips
    }
  }
}
</script>

<style></style>

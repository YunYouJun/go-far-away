<template>
  <v-container>
    <v-row class="text-center">
      <v-col cols="12">
        <v-img
          :src="require('../assets/logo.svg')"
          class="my-3"
          contain
          height="200"
        ></v-img>
      </v-col>

      <v-col>
        <h1 class="display-3 mb-3 font-weight-light text-uppercase">
          {{ name }}
        </h1>
        <p class="display-1 font-weight-light pt-3">
          {{ $t('description') }}
        </p>
      </v-col>

      <v-col cols="12">
        <v-btn dark rounded to="/go">
          {{ $t("Let's go far away!") }}
        </v-btn>
      </v-col>
    </v-row>
  </v-container>
</template>

<script>
import { name, description } from '@/../package.json'
export default {
  data: () => ({
    name: name,
    description: description
  })
}
</script>

<style></style>

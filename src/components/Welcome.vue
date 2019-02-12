<template>
  <v-container>
    <v-layout text-xs-center wrap>
      <v-flex xs12>
        <v-img
          :src="require('../assets/logo.svg')"
          class="my-3"
          contain
          height="200"
        ></v-img>
      </v-flex>

      <v-flex xs12>
        <h1 class="display-3 mb-3 font-weight-light text-uppercase">
          {{ name }}
        </h1>
        <p class="display-1 font-weight-light">
          {{ description }}
        </p>
      </v-flex>

      <v-flex xs12>
        <v-btn>
          {{ $t("Let's go far away!") }}
        </v-btn>
      </v-flex>
    </v-layout>
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

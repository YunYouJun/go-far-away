<script setup lang="ts">
import logoUrl from '@/assets/logo.svg'
import packageInfo from '../../package.json'

const name = packageInfo.name
</script>

<template>
  <v-container class="welcome">
    <v-row class="text-center">
      <v-col cols="12">
        <v-img
          :src="logoUrl"
          alt="go-far-away"
          class="my-3"
          contain
          height="200"
        />
      </v-col>

      <v-col>
        <h1 class="welcome__title text-h2 mb-3 font-weight-light text-uppercase">
          {{ name }}
        </h1>
        <p class="welcome__description text-h4 font-weight-light pt-3">
          {{ $t('description') }}
        </p>
      </v-col>

      <v-col cols="12">
        <v-btn size="large" rounded to="/go">
          {{ $t('Let\'s go far away!') }}
        </v-btn>
      </v-col>
    </v-row>
  </v-container>
</template>

<style scoped>
.welcome__title,
.welcome__description {
  max-width: 100%;
  letter-spacing: 0 !important;
  overflow-wrap: anywhere;
  word-break: break-word;
}

@media (max-width: 600px) {
  .welcome__title {
    font-size: 2.75rem !important;
    line-height: 1.1;
  }

  .welcome__description {
    max-width: 20rem;
    margin-right: auto;
    margin-left: auto;
    font-size: 1.45rem !important;
    line-height: 1.35;
  }
}

@media (max-width: 360px) {
  .welcome__title {
    font-size: 2.4rem !important;
  }
}
</style>

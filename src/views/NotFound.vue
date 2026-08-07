<script setup lang="ts">
import {
  mdiHome,
  mdiMapMarkerQuestionOutline,
} from '@mdi/js'
</script>

<template>
  <v-container class="not-found text-center py-16">
    <v-icon color="blue-grey" size="72">
      {{ mdiMapMarkerQuestionOutline }}
    </v-icon>
    <h1 class="text-h3 mt-6 mb-4">
      {{ $t('notFound.title') }}
    </h1>
    <p class="text-body-1 mb-8">
      {{ $t('notFound.description') }}
    </p>
    <v-btn color="primary" to="/">
      <v-icon start>
        {{ mdiHome }}
      </v-icon>
      {{ $t('notFound.home') }}
    </v-btn>
  </v-container>
</template>

<style scoped>
.not-found {
  max-width: 680px;
}
</style>

<script setup lang="ts">
import { mdiGithub } from '@mdi/js'
</script>

<template>
  <v-container class="about py-10">
    <article>
      <h1 class="text-h3 text-sm-h2 mb-6">
        {{ $t('about.title') }}
      </h1>
      <p class="text-h6 font-weight-regular mb-10">
        {{ $t('about.intro') }}
      </p>

      <h2 class="text-h5 mb-4">
        {{ $t('about.howTitle') }}
      </h2>
      <ol class="about__steps mb-10">
        <li>{{ $t('about.locate') }}</li>
        <li>{{ $t('about.calculate') }}</li>
        <li>{{ $t('about.explore') }}</li>
      </ol>

      <h2 class="text-h5 mb-4">
        {{ $t('about.privacyTitle') }}
      </h2>
      <p class="mb-8">
        {{ $t('about.privacy') }}
      </p>

      <v-btn
        color="primary"
        href="https://github.com/YunYouJun/go-far-away"
        target="_blank"
        rel="noopener noreferrer"
      >
        <v-icon start>
          {{ mdiGithub }}
        </v-icon>
        {{ $t('about.source') }}
      </v-btn>
    </article>
  </v-container>
</template>

<style scoped>
.about {
  max-width: 760px;
}

.about p,
.about__steps {
  line-height: 1.8;
}

.about__steps {
  padding-left: 1.5rem;
}

.about__steps li + li {
  margin-top: 0.75rem;
}
</style>

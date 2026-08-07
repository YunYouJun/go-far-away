<script setup lang="ts">
import {
  mdiEmail,
  mdiGithub,
  mdiSinaWeibo,
  mdiWeb,
} from '@mdi/js'
import pkg from '../../../package.json'

const name = pkg.name
const author = pkg.author
const description = pkg.description
const currentYear = new Date().getFullYear()

const links = [
  {
    color: 'black',
    href: 'https://github.com/YunYouJun/go-far-away/',
    icon: mdiGithub,
    tooltip: 'GitHub Source Code',
  },
  {
    color: 'red',
    href: 'https://weibo.com/jizhideyunyoujun',
    icon: mdiSinaWeibo,
    tooltip: 'Weibo: 机智的云游君',
  },
  {
    color: 'blue',
    href: 'mailto:me@yunyoujun.cn',
    icon: mdiEmail,
    tooltip: 'Email: me@yunyoujun.cn',
  },
  {
    color: 'indigo',
    href: 'https://yunyoujun.cn',
    icon: mdiWeb,
    tooltip: 'Blog: yunyoujun.cn',
  },
]
</script>

<template>
  <v-footer class="app-footer pa-0">
    <v-card class="app-footer__surface text-center bg-grey-lighten-3" flat>
      <v-card-text>
        <v-tooltip v-for="link in links" :key="link.icon" location="top">
          <template #activator="{ props }">
            <v-btn
              v-bind="props"
              class="app-footer__link mx-4"
              icon
              :href="link.href"
              target="_blank"
              rel="noopener noreferrer"
              variant="text"
              :aria-label="link.tooltip"
            >
              <v-icon
                :color="link.color"
                size="24px"
              >
                {{ link.icon }}
              </v-icon>
            </v-btn>
          </template>
          <span>{{ link.tooltip }}</span>
        </v-tooltip>
      </v-card-text>

      <v-card-text class="app-footer__description pt-0 font-weight-light">
        <strong class="subheading">{{ description }}</strong>
        <v-btn class="mt-2" size="small" variant="text" to="/about">
          {{ $t('menu.About') }}
        </v-btn>
      </v-card-text>

      <v-divider />

      <v-card-text class="app-footer__copyright font-weight-light">
        2017 - {{ currentYear }} &copy;
        <strong>{{ name }} -
          <a :href="author.url" target="_blank" rel="noopener noreferrer">{{ author.name }}</a></strong>
      </v-card-text>
    </v-card>
  </v-footer>
</template>

<style scoped>
.app-footer {
  flex: 0 0 auto;
  width: 100%;
}

.app-footer__surface {
  width: 100%;
  border-radius: 0;
}

.app-footer__description,
.app-footer__copyright {
  white-space: normal;
  overflow-wrap: anywhere;
}

.app-footer__description .subheading {
  display: block;
  max-width: 100%;
  white-space: normal;
  overflow-wrap: anywhere;
}

@media (max-width: 600px) {
  .app-footer__link {
    width: 40px;
    min-width: 40px;
    margin-right: 0.25rem !important;
    margin-left: 0.25rem !important;
  }
}
</style>

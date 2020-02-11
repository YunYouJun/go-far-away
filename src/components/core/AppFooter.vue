<template>
  <v-footer padless>
    <v-card flat class="flex text-center grey lighten-3">
      <v-card-text>
        <v-tooltip v-for="link in links" :key="link.icon" top>
          <template #activator="data">
            <v-btn
              v-on="data.on"
              class="mx-4"
              dark
              icon
              :href="link.href"
              target="_blank"
              :key="link.icon"
            >
              <v-icon :color="link.color" size="24px">{{ link.icon }}</v-icon>
            </v-btn>
          </template>
          <span>{{ link.tooltip }}</span>
        </v-tooltip>
      </v-card-text>

      <v-card-text class="pt-0 font-weight-light">
        <strong class="subheading">{{ description }}</strong>
      </v-card-text>

      <v-divider></v-divider>

      <v-card-text class="font-weight-light">
        2017 - {{ new Date().getFullYear() }} &copy;
        <strong>{{ name }} - {{ author }}</strong>
      </v-card-text>
    </v-card>
  </v-footer>
</template>

<script>
import pkg from '@/../package.json'
export default {
  data: () => ({
    name: pkg.name,
    author: pkg.author,
    description: pkg.description,
    version: 'v' + pkg.version,
    links: [
      {
        color: 'black',
        href: 'https://github.com/YunYouJun/go-far-away/',
        icon: 'iconfont icon-github',
        tooltip: 'GitHub Source Code'
      },
      {
        color: 'red',
        href: 'https://weibo.com/jizhideyunyoujun',
        icon: 'iconfont icon-weibo',
        tooltip: 'Weibo: 机智的云游君'
      },
      {
        color: 'blue',
        href: 'mailto:me@yunyoujun.cn',
        icon: 'iconfont icon-email',
        tooltip: 'Email: me@yunyoujun.cn'
      },
      {
        color: 'indigo',
        href: 'https://yunyoujun.cn',
        icon: 'iconfont icon-globe',
        tooltip: 'Blog: yunyoujun.cn'
      }
    ]
  })
}
</script>

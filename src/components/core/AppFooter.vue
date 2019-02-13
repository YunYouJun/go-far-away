<template>
  <v-footer dark height="auto" :fixed="false">
    <v-card class="flex" flat tile>
      <v-card-title class="indigo lighten-1">
        <strong class="subheading">{{ description }}</strong>

        <v-spacer></v-spacer>

        <v-tooltip v-for="link in links" :key="link.icon" top>
          <template #activator="data">
            <v-btn
              v-on="data.on"
              class="mx-3"
              dark
              icon
              :href="link.href"
              target="_blank"
            >
              <v-icon size="24px">{{ link.icon }}</v-icon>
            </v-btn>
          </template>
          <span>{{ link.tooltip }}</span>
        </v-tooltip>
      </v-card-title>

      <v-card-actions class="indigo justify-center">
        {{ version }} - {{ name }} @{{ author }}
      </v-card-actions>
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
        // color: 'black',
        href: 'https://github.com/YunYouJun/go-far-away/',
        icon: 'iconfont icon-github',
        tooltip: 'GitHub Source Code'
      },
      // {
      //   // color: 'red',
      //   href: 'https://weibo.com/jizhideyunyoujun',
      //   icon: 'iconfont icon-weibo',
      // },
      {
        // color: 'blue',
        href: 'mailto:me@yunyoujun.cn',
        icon: 'iconfont icon-email',
        tooltip: 'Email: me@yunyoujun.cn'
      },
      {
        // color: 'indigo',
        href: 'https://yunyoujun.cn',
        icon: 'iconfont icon-globe',
        tooltip: 'Blog: yunyoujun.cn'
      }
    ]
  })
}
</script>

<template>
  <v-footer dark height="auto" :fixed="false">
    <v-card class="flex" flat tile>
      <v-card-title class="indigo lighten-1">
        <strong class="subheading">{{ description }}</strong>

        <v-spacer></v-spacer>

        <v-btn
          v-for="link in links"
          :key="link.icon"
          class="mx-3"
          dark
          icon
          :href="link.href"
          target="_blank"
        >
          <v-icon size="24px">{{ link.icon }}</v-icon>
        </v-btn>
      </v-card-title>

      <v-card-actions class="indigo justify-center">
        {{ version }} — <strong>{{ author }}</strong>
      </v-card-actions>
    </v-card>
  </v-footer>
</template>

<script>
import pkg from '@/../package.json'
export default {
  data: () => ({
    author: pkg.author,
    description: pkg.description,
    version: 'v' + pkg.version,
    links: [
      {
        // color: 'black',
        href: 'https://github.com/YunYouJun/go-far-away/',
        icon: 'iconfont icon-github'
      },
      // {
      //   // color: 'red',
      //   href: 'https://weibo.com/jizhideyunyoujun',
      //   icon: 'iconfont icon-weibo',
      // },
      {
        // color: 'blue',
        href: 'mailto:me@yunyoujun.cn',
        icon: 'iconfont icon-email'
      },
      {
        // color: 'indigo',
        href: 'https://yunyoujun.cn',
        icon: 'iconfont icon-globe'
      }
    ]
  })
}
</script>

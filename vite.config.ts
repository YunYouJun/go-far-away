/// <reference types="vitest/config" />

import process from 'node:process'
import { fileURLToPath, URL } from 'node:url'
import vue from '@vitejs/plugin-vue'
import { defineConfig } from 'vite'
import vuetify from 'vite-plugin-vuetify'

const githubPagesBase = '/go-far-away/'
const githubPagesUrl = 'https://yunyoujun.github.io/go-far-away'
const cloudflarePagesUrl = 'https://go-far-away.yyj.moe'

export default defineConfig(({ command }) => {
  const configuredBase = process.env.VITE_BASE_PATH
  const base = command === 'build'
    ? configuredBase != null && configuredBase.length > 0
      ? configuredBase
      : githubPagesBase
    : '/'
  const configuredPublicUrl = process.env.VITE_PUBLIC_URL
  const publicUrl = (configuredPublicUrl != null && configuredPublicUrl.length > 0
    ? configuredPublicUrl
    : (base === '/' ? cloudflarePagesUrl : githubPagesUrl))
    .replace(/\/$/, '')

  return {
    base,
    plugins: [
      {
        name: 'public-url-html',
        transformIndexHtml: html => html.replaceAll('%PUBLIC_URL%', publicUrl),
      },
      vue(),
      vuetify({ autoImport: true }),
    ],
    resolve: {
      alias: {
        '@': fileURLToPath(new URL('./src', import.meta.url)),
      },
    },
    test: {
      environment: 'happy-dom',
      globals: true,
      include: ['tests/unit/**/*.spec.ts'],
    },
  }
})

/// <reference types="vitest/config" />

import process from 'node:process'
import { fileURLToPath, URL } from 'node:url'
import vue from '@vitejs/plugin-vue'
import { defineConfig } from 'vite'
import vuetify from 'vite-plugin-vuetify'

const githubPagesBase = '/go-far-away/'

export default defineConfig(({ command }) => {
  const configuredBase = process.env.VITE_BASE_PATH
  const base = command === 'build'
    ? configuredBase != null && configuredBase.length > 0
      ? configuredBase
      : githubPagesBase
    : '/'

  return {
    base,
    plugins: [
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

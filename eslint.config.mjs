import antfu from '@antfu/eslint-config'

export default antfu({
  type: 'app',
  vue: true,
  typescript: {
    tsconfigPath: 'tsconfig.json',
  },
  ignores: [
    'dist',
    'coverage',
    'src/data/city/china-city.json',
  ],
}, {
  rules: {
    'vue/multi-word-component-names': 'off',
  },
})

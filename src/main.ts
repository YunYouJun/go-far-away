import { createApp } from 'vue'
import App from './App.vue'
import toast from './components/core/toast'
import i18n from './i18n'
import vuetify from './plugins/vuetify'
import { registerServiceWorker } from './registerServiceWorker'
import router from './router'

const app = createApp(App)

app.config.globalProperties.$toast = toast

app
  .use(i18n)
  .use(router)
  .use(vuetify)
  .mount('#app')

registerServiceWorker()

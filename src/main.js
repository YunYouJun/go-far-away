import Vue from 'vue'
import './plugins/vuetify'
import './plugins/vue-amap'
import App from './App.vue'
import router from './router'
import './registerServiceWorker'
import i18n from './i18n'

Vue.config.productionTip = false

import Toast from '@/components/core/toast'
Vue.prototype.$toast = Toast

Vue.prototype.bus = new Vue()

new Vue({
  i18n,
  router,
  render: h => h(App)
}).$mount('#app')

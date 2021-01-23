import Vue from "vue";
import "./plugins/vuetify";
import "./plugins/vue-amap";
import App from "./App.vue";
import router from "./router";
import "./registerServiceWorker";
import i18n from "./i18n";

Vue.config.productionTip = false;

import Toast from "@/components/core/toast";
import vuetify from "./plugins/vuetify";
Vue.prototype.$toast = Toast;

Vue.prototype.bus = new Vue();

new Vue({
  i18n,
  router,
  vuetify,
  render: (h) => h(App),
}).$mount("#app");

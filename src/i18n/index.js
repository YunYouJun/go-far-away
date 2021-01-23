import Vue from "vue";
import VueI18n from "vue-i18n";

import en from "./en";
import zhCN from "./zh-CN";

Vue.use(VueI18n);

const messages = {
  en,
  "zh-CN": zhCN,
};

const i18n = new VueI18n({
  locale: "zh-CN",
  messages,
});

export default i18n;

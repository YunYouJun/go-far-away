import Vue from "vue";
import VueRouter from "vue-router";
import Home from "../views/Home.vue";
import Go from "../views/Go.vue";
import Unit from "../views/Unit.vue";
import About from "../views/About.vue";

Vue.use(VueRouter);

const routes = [
  {
    path: "/",
    name: "home",
    component: Home,
  },
  {
    path: "/go",
    name: "go",
    component: Go,
  },
  {
    path: "/unit",
    name: "unit",
    component: Unit,
  },
  {
    path: "/about",
    name: "about",
    component: About,
  },
];

const router = new VueRouter({
  mode: "hash",
  base: process.env.BASE_URL,
  routes,
});

export default router;

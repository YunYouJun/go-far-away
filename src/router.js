import Vue from 'vue'
import Router from 'vue-router'
import Home from './views/Home.vue'
import Go from './views/Go.vue'
import Unit from './views/Unit.vue'
import About from './views/About.vue'

Vue.use(Router)

export default new Router({
  mode: 'hash',
  base: process.env.BASE_URL,
  routes: [
    {
      path: '/',
      name: 'home',
      component: Home
    },
    {
      path: '/go',
      name: 'go',
      component: Go
    },
    {
      path: '/unit',
      name: 'unit',
      component: Unit
    },
    {
      path: '/about',
      name: 'about',
      component: About
    }
  ]
})

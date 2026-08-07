import type { RouteRecordRaw } from 'vue-router'
import { createRouter, createWebHashHistory } from 'vue-router'

const routes: RouteRecordRaw[] = [
  {
    path: '/',
    name: 'home',
    component: async () => import('@/views/Home.vue'),
    meta: {
      titleKey: 'seo.home',
    },
  },
  {
    path: '/go',
    name: 'go',
    component: async () => import('@/views/Go.vue'),
    meta: {
      titleKey: 'seo.go',
    },
  },
  {
    path: '/unit',
    name: 'unit',
    component: async () => import('@/views/Unit.vue'),
    meta: {
      titleKey: 'seo.unit',
    },
  },
  {
    path: '/about',
    name: 'about',
    component: async () => import('@/views/About.vue'),
    meta: {
      titleKey: 'seo.about',
    },
  },
  {
    path: '/:pathMatch(.*)*',
    name: 'not-found',
    component: async () => import('@/views/NotFound.vue'),
    meta: {
      titleKey: 'seo.notFound',
    },
  },
]

const router = createRouter({
  history: createWebHashHistory(import.meta.env.BASE_URL),
  routes,
  scrollBehavior() {
    return { top: 0 }
  },
})

export default router

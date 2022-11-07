import { createRouter, createWebHistory } from 'vue-router'
import HomeView from '../views/HomeView.vue'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'home',
      component: HomeView
    },
    {
      path: '/big-five',
      name: 'Big Five',
      component: () => import('../views/BigFive.vue')
    },
    {
      path: '/real-time',
      name: 'Real Time',
      component: () => import('../views/RealTime.vue')
    }
  ]
})

export default router

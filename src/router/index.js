import { createRouter, createWebHistory } from 'vue-router'
import HomeView from '../views/HomeView.vue'
import ToDay from '../views/ToDay.vue'
import Login from '../views/Login.vue'
import Rankings from '../views/Rankings.vue'

const router = createRouter({
  history: createWebHistory(),
  routes: [
    {
      path: '/home',
      name: 'home',
      component: HomeView
    },
    {
      path: '/today',
      name: 'today',
      component: ToDay
    },
    {
      path: '/bind',
      name: 'login',
      component: Login
    },
    {
      path: '/rank',
      name: 'rankings',
      component: Rankings
    },
  ]
})

export default router

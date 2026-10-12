import { createRouter, createWebHistory } from 'vue-router'
import HomeView from '../views/HomeView.vue'
import LoginView from '../views/LoginView.vue'
import CategoryView from '../views/CategoryView.vue'
import SearchView from '../views/SearchView.vue'
import GameDetailView from '../views/GameDetailView.vue'
import CartView from '../views/CartView.vue'
import { useAuthStore } from '../stores/auth'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'Home',
      component: HomeView
    },
    {
      path: '/login',
      name: 'Login',
      component: LoginView
    },
    {
      path: '/register',
      name: 'Register',
      component: LoginView
    },
    {
      path: '/category/:category',
      name: 'Category',
      component: CategoryView
    },
    {
      path: '/search',
      name: 'Search',
      component: SearchView
    },
    {
      path: '/product/:id',
      name: 'GameDetail',
      component: GameDetailView
    },
    {
      path: '/cart',
      name: 'Cart',
      component: CartView,
      meta: { requiresAuth: true }
    }
  ]
})

router.beforeEach((to) => {
  if (to.meta.requiresAuth) {
    const authStore = useAuthStore()
    if (!authStore.isAuthenticated) {
      return {
        path: '/login',
        query: { mode: 'login', redirect: to.fullPath }
      }
    }
  }
  return true
})

export default router

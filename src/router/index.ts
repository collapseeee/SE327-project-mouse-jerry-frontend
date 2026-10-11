import { createRouter, createWebHistory } from 'vue-router'
import HomeView from '../views/HomeView.vue'
import LoginView from '../views/LoginView.vue'
import CategoryView from '../views/CategoryView.vue'
import SearchView from '../views/SearchView.vue'
import GameDetailView from '../views/GameDetailView.vue'

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
    }
  ],
})

export default router

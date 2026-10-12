import { createRouter, createWebHistory } from 'vue-router'
import HomeView from '../views/HomeView.vue'
import LoginView from '../views/LoginView.vue'
import CategoryView from '../views/CategoryView.vue'
import SearchView from '../views/SearchView.vue'
import GameDetailView from '../views/GameDetailView.vue'
import AccountView from '../views/AccountView.vue'
import CartView from '../views/CartView.vue'
import PurchaseView from '../views/PurchaseView.vue'
import SuccessView from '../views/SuccessView.vue'
import KeysView from '../views/KeysView.vue'

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
      path: '/account',
      name: 'Account',
      component: AccountView
    },
    {
      path: '/cart',
      name: 'Cart',
      component: CartView
    },
    {
      path: '/purchase-page',
      name: 'Purchase',
      component: PurchaseView
    },
    {
      path: '/success',
      name: 'Success',
      component: SuccessView
    },
    {
      path: '/my-keys',
      name: 'Keys',
      component: KeysView
    }
  ],
})

export default router

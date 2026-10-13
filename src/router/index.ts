import { createRouter, createWebHistory, type RouteLocationNormalized } from 'vue-router'
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
import ContactView from '../views/ContactView.vue'
import AdminGamesView from '../views/AdminGamesView.vue'
import AdminGameFormView from '../views/AdminGameFormView.vue'
import AdminCategoriesView from '../views/AdminCategoriesView.vue'
import AdminHighlightsView from '../views/AdminHighlightsView.vue'
import AdminSaleHistoryView from '../views/AdminSaleHistoryView.vue'
import AdminProfileView from '../views/AdminProfileView.vue'
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
      path: '/contact',
      name: 'Contact',
      component: ContactView
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
    },
    {
      path: '/account',
      name: 'Account',
      component: AccountView,
      meta: { requiresAuth: true }
    },
    {
      path: '/purchase-page',
      name: 'Purchase',
      component: PurchaseView,
      meta: { requiresAuth: true }
    },
    {
      path: '/success',
      name: 'Success',
      component: SuccessView,
      meta: { requiresAuth: true }
    },
    {
      path: '/my-keys',
      name: 'Keys',
      component: KeysView,
      meta: { requiresAuth: true }
    },
    {
      path: '/admin',
      redirect: '/admin/games'
    },
    {
      path: '/admin/games',
      name: 'AdminGames',
      component: AdminGamesView,
      meta: { requiresAuth: true, requiresAdmin: true }
    },
    {
      path: '/admin/games/new',
      name: 'AdminGameNew',
      component: AdminGameFormView,
      meta: { requiresAuth: true, requiresAdmin: true }
    },
    {
      path: '/admin/games/:id/edit',
      name: 'AdminGameEdit',
      component: AdminGameFormView,
      meta: { requiresAuth: true, requiresAdmin: true }
    },
    {
      path: '/admin/categories',
      name: 'AdminCategories',
      component: AdminCategoriesView,
      meta: { requiresAuth: true, requiresAdmin: true }
    },
    {
      path: '/admin/sale-history',
      name: 'AdminSaleHistory',
      component: AdminSaleHistoryView,
      meta: { requiresAuth: true, requiresAdmin: true }
    },
    {
      path: '/admin/sales',
      redirect: '/admin/sale-history'
    },
    {
      path: '/admin/highlights',
      name: 'AdminHighlights',
      component: AdminHighlightsView,
      meta: { requiresAuth: true, requiresAdmin: true }
    },
    {
      path: '/admin/highlight',
      redirect: '/admin/highlights'
    },
    {
      path: '/admin/profile',
      name: 'AdminProfile',
      component: AdminProfileView,
      meta: { requiresAuth: true, requiresAdmin: true }
    },
    {
      path: '/admin/account',
      redirect: '/admin/profile'
    }
  ]
})

const shouldRedirectAdminAccount = (to: RouteLocationNormalized, isAdmin: boolean): boolean =>
  to.path === '/account' && isAdmin

const isUnauthorizedAdminAccess = (to: RouteLocationNormalized, isAdmin: boolean): boolean =>
  Boolean(to.meta.requiresAdmin) && !isAdmin

const resolveAuthRedirect = (to: RouteLocationNormalized, authStore: ReturnType<typeof useAuthStore>) => {
  if (!authStore.isAuthenticated) {
    return {
      path: '/login',
      query: { mode: 'login', redirect: to.fullPath }
    }
  }
  if (shouldRedirectAdminAccount(to, authStore.isAdmin)) {
    return { path: '/admin/profile' }
  }
  if (isUnauthorizedAdminAccess(to, authStore.isAdmin)) {
    return { path: '/' }
  }
  return true
}

router.beforeEach((to) => {
  if (to.meta.requiresAuth) {
    const authStore = useAuthStore()
    return resolveAuthRedirect(to, authStore)
  }
  return true
})

export default router

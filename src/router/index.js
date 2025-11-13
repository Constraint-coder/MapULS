import { createRouter, createWebHistory } from 'vue-router'

// Importa los componentes de las rutas
import Login from '@/components/Login.vue'
import Dashboard from '../Dashboard.vue'
import CustomMap from '@/CustomMap.vue'

const routes = [
  {
    path: '/',
    redirect: '/login' // redirige a login por defecto
  },
  {
    path: '/login',
    name: 'Login',
    component: Login
  },
  {
    path: '/dashboard',
    name: 'Dashboard',
    component: Dashboard,
    meta: { requiresAuth: true } // opcional, si quieres proteger la ruta
  },
   {
    path: '/map',
    name: 'CustomMap',
    component: CustomMap,
    meta: { requiresAuth: true } // opcional, si quieres proteger la ruta
  }
]

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes
})

// 🔹 Protege rutas si el usuario no está logueado
router.beforeEach((to, from, next) => {
  const token = localStorage.getItem('token') // verifica el token

  if (to.meta.requiresAuth && !token) {
    next('/login')
  } else {
    next()
  }
})

export default router

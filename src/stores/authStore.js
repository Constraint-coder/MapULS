// src/stores/authStore.js
import { defineStore } from 'pinia'
import { loginUsuario, getUsuario, logoutUsuario } from '@/services/loginServices'

export const useAuthStore = defineStore('auth', {
  state: () => ({
    user: null,
    token: localStorage.getItem('token') || null,
  }),
  getters: {
    isAdmin: (state) => state.user?.role === 'admin',
    isLogged: (state) => !!state.token,
  },
  actions: {
    async login(email, password) {
      const data = await loginUsuario(email, password)
      this.token = data.token
      localStorage.setItem('token', data.token)
      this.user = data.user
    },
    async fetchUser() {
      if (!this.token) return
      const data = await getUsuario()
      this.user = data.user
    },
    async logout() {
      await logoutUsuario()
      this.user = null
      this.token = null
      localStorage.removeItem('token')
    }
  }
})

import { defineStore } from 'pinia'
import $api from '../api/axios'

export const useAuthStore = defineStore('auth', {
  state: () => ({
    user: null as any,
    tempUser: null as any,
    accessToken: localStorage.getItem('accessToken') as string | null,
    isAuth: false,
    profileCompleted: false
  }),

  getters: {
    needsProfileSetup: (state) => {
      return !!state.tempUser && !state.profileCompleted
    }
  },

  actions: {

    async checkAuth() {
      try {
        const token = localStorage.getItem('accessToken')

        if (!token) {
          this.isAuth = false
          return
        }

        const response = await $api.get('/refresh')

        this.user = response.data.user
        this.accessToken = response.data.accessToken
        this.isAuth = true

        localStorage.setItem('accessToken', response.data.accessToken)

      } catch (e) {
        this.isAuth = false
        this.user = null
        localStorage.removeItem('accessToken')
      }
    },

    async login(email: string, password: string) {
      const response = await $api.post('/login', { email, password })

      this.user = response.data.user
      this.accessToken = response.data.accessToken
      this.isAuth = true

      localStorage.setItem('accessToken', response.data.accessToken)
    },

    async registration(email: string, password: string) {
      const response = await $api.post('/registration', { email, password })

      this.user = response.data.user
      this.accessToken = response.data.accessToken
      this.isAuth = true
      this.tempUser = response.data.user

      localStorage.setItem('accessToken', response.data.accessToken)
    },

    completeProfileSetup() {
      this.profileCompleted = true
      this.tempUser = null
    },

    logout() {
      this.user = null
      this.tempUser = null
      this.isAuth = false
      this.accessToken = null
      this.profileCompleted = false

      localStorage.removeItem('accessToken')
    }

  }
})
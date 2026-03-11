import { defineStore } from 'pinia'
import $api from '../api/axios'

export const useAuthStore = defineStore('auth', {
  state: () => ({
    user: null as any,
    tempUser: null as any,
    accessToken: localStorage.getItem('accessToken'),
    isAuth: !!localStorage.getItem('accessToken'),
    profileCompleted: false
  }),

  actions: {

    async login(email: string, password: string) {
      const response = await $api.post('/login', { email, password })
      this.setAuthData(response.data)
    },

    async registration(email: string, password: string) {
      const response = await $api.post('/registration', { email, password })
      this.setAuthData(response.data)
      this.tempUser = response.data.user
    },

    async googleLogin(token: string) {
      const response = await $api.post('/google', { token })

      this.setAuthData(response.data)
      this.tempUser = response.data.user
    },

    setAuthData(data: any) {
      this.user = data.user
      this.accessToken = data.accessToken
      this.isAuth = true

      localStorage.setItem('accessToken', data.accessToken)
    },

    logout() {
      this.user = null
      this.accessToken = null
      this.isAuth = false
      this.tempUser = null

      localStorage.removeItem('accessToken')
    }

  }
})
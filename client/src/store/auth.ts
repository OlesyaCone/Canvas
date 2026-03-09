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

      this.accessToken = response.data.accessToken
      this.user = response.data.user
      this.profileCompleted = response.data.user.profileCompleted

      this.isAuth = true

      localStorage.setItem('accessToken', response.data.accessToken)

      if (!this.profileCompleted) {
        this.tempUser = response.data.user
      }
    },

    async registration(email: string, password: string) {
      const response = await $api.post('/registration', { email, password })

      this.accessToken = response.data.accessToken
      this.user = response.data.user
      this.profileCompleted = false

      this.isAuth = true
      this.tempUser = response.data.user

      localStorage.setItem('accessToken', response.data.accessToken)
    },

    async completeRegistration(data: any) {
      const response = await $api.post('/complete-profile', data)

      this.user = response.data.user
      this.profileCompleted = true
      this.tempUser = null
    }
  }
})
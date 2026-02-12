import { defineStore } from 'pinia'
import $api from '../api/axios' 

export const useAuthStore = defineStore('auth', {
  state: () => ({
    user: null,
    accessToken: localStorage.getItem('accessToken'),
    isAuth: !!localStorage.getItem('accessToken')
  }),
  actions: {
    async login(email: string, password: string) {
      try {
        const response = await $api.post('/login', { email, password }) 
        this.accessToken = response.data.accessToken
        this.user = response.data.user
        this.isAuth = true
        localStorage.setItem('accessToken', response.data.accessToken)
      } catch (e) {
        console.error(e)
      }
    }, 
    
    async registration(email: string, password: string) {
      try {
        const response = await $api.post('/registration', { email, password }) 
        this.accessToken = response.data.accessToken
        this.user = response.data.user
        this.isAuth = true
        localStorage.setItem('accessToken', response.data.accessToken)
      } catch (e) {
        console.error(e)
      }
    }
  }
})
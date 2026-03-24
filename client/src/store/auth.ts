import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import $api from '../api/axios'
import type { User } from '../types/user'

export const useAuthStore = defineStore('auth', () => {
  const user = ref<User | null>(null)  
  const tempUser = ref<User | null>(null)
  const accessToken = ref<string | null>(localStorage.getItem('accessToken'))
  const isAuth = ref<boolean>(false)
  const profileCompleted = ref<boolean>(false)

  const needsProfileSetup = computed<boolean>(() => {
    return !!tempUser.value && !profileCompleted.value
  })

  async function checkAuth() {
    const token = localStorage.getItem('accessToken')

    if (!token) {
      isAuth.value = false
      return
    }

    try {
      const response = await $api.get('/refresh')

      user.value = response.data.user
      accessToken.value = response.data.accessToken
      isAuth.value = true

      localStorage.setItem('accessToken', response.data.accessToken)
    } catch (e) {
      isAuth.value = false
      user.value = null
      localStorage.removeItem('accessToken')
    }
  }

  async function login(email: string, password: string) {
    const response = await $api.post('/login', { email, password })

    user.value = response.data.user
    accessToken.value = response.data.accessToken
    isAuth.value = true

    localStorage.setItem('accessToken', response.data.accessToken)
  }

  async function registration(email: string, password: string) {
    const response = await $api.post('/registration', { email, password })

    user.value = response.data.user
    accessToken.value = response.data.accessToken
    isAuth.value = true
    tempUser.value = response.data.user

    localStorage.setItem('accessToken', response.data.accessToken)
  }

  function completeProfileSetup() {
    profileCompleted.value = true
    tempUser.value = null
  }

  function logout() {
    user.value = null
    tempUser.value = null
    isAuth.value = false
    accessToken.value = null
    profileCompleted.value = false

    localStorage.removeItem('accessToken')
  }

  return {
    user,
    tempUser,
    accessToken,
    isAuth,
    profileCompleted,
    needsProfileSetup,
    checkAuth,
    login,
    registration,
    completeProfileSetup,
    logout
  }
})
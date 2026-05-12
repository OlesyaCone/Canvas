import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import type { User } from '../types/index'

export const useAuthStore = defineStore('auth', () => {
  const user = ref<User | null>(null)
  const isAuth = ref(false)
  const isProfileSetup = ref(false)
  const accessToken = ref<string | null>(null)
  const refreshToken = ref<string | null>(null)

  const userName = computed(() => user.value?.displayName || 'Гость')
  const userAvatar = computed(() => user.value?.avatar || 'https://via.placeholder.com/40')

  const completeProfileSetup = () => {
    isProfileSetup.value = true
    localStorage.setItem('profileSetup', 'true')
  }

  const setUser = (userData: User) => {
    user.value = userData
    isAuth.value = true
  }

  const setAuth = (data: { user: User; accessToken: string; refreshToken: string }) => {
    user.value = data.user
    isAuth.value = true
    accessToken.value = data.accessToken
    refreshToken.value = data.refreshToken
    localStorage.setItem('refreshToken', data.refreshToken)
  }

  const logout = () => {
    user.value = null
    isAuth.value = false
    isProfileSetup.value = false
    accessToken.value = null
    refreshToken.value = null
    localStorage.removeItem('profileSetup')
    localStorage.removeItem('refreshToken')
  }

  return {
    user, isAuth, isProfileSetup,
    accessToken, refreshToken,
    userName, userAvatar,
    completeProfileSetup, setUser, setAuth, logout
  }
})
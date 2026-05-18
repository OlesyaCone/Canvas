import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import type { User } from '../types/index'
import { api } from '../../api/axios'

export const useAuthStore = defineStore('auth', () => {
  const user = ref<User | null>(null)
  const isAuth = ref(false)
  const accessToken = ref<string | null>(null)
  const refreshToken = ref<string | null>(null)

  const userName = computed(() => user.value?.username || 'Гость')
  const userAvatar = computed(() => user.value?.avatar || 'https://via.placeholder.com/40')

  const setAuth = (data: { user: User; accessToken: string; refreshToken: string }) => {
    user.value = data.user
    isAuth.value = true
    accessToken.value = data.accessToken
    refreshToken.value = data.refreshToken
    localStorage.setItem('refreshToken', data.refreshToken)
  }

  const register = async (email: string, username: string, password: string) => {
    return await api('/auth/register', {
      method: 'POST',
      body: { email, username, password },
    })
  }

  const login = async (email: string, password: string) => {
    const data = await api('/auth/login', {
      method: 'POST',
      body: { email, password },
    })
    setAuth(data)
    return data
  }

  const logout = () => {
    user.value = null
    isAuth.value = false
    accessToken.value = null
    refreshToken.value = null
    localStorage.removeItem('refreshToken')
  }

  return { user, isAuth, accessToken, refreshToken, userName, userAvatar, setAuth, register, login, logout }
})
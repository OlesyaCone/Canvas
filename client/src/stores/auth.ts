import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import type { User } from '../types/index'
import api from '../../api/axios'

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
  const { data } = await api.post('/auth/register', { email, username, password })
  if (data.accessToken) setAuth(data)
  return data
}

const login = async (email: string, password: string) => {
  const { data } = await api.post('/auth/login', { email, password })
  if (data.accessToken) setAuth(data)
  return data
}

const completeProfileSetup = async (username: string, avatar: string) => {
  const { data } = await api.patch('/auth/profile', { username, avatar })
  if (data.user) {
    user.value = data.user
  }
  return data
}


  const logout = () => {
    user.value = null
    isAuth.value = false
    accessToken.value = null
    refreshToken.value = null
    localStorage.removeItem('refreshToken')
  }

  return { user, isAuth, accessToken, refreshToken, userName, userAvatar, setAuth, register, login, logout, completeProfileSetup }
})
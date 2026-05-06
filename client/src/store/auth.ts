import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import type { User} from '../types/index'

export const useAuthStore = defineStore('auth', () => {
  const user = ref<User | null>(null)
  const isAuth = ref(false)
  const isProfileSetup = ref(false)

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

  const logout = () => {
    user.value = null
    isAuth.value = false
    isProfileSetup.value = false
    localStorage.removeItem('profileSetup')
  }

  return {
    user,
    isAuth,
    isProfileSetup,
    userName,
    userAvatar,
    completeProfileSetup,
    setUser,
    logout
  }
})
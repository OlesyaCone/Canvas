<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useAuthStore } from './stores/auth'
import TheHeader from './components/Header.vue'
import TheSidebar from './components/Sidebar.vue'
import TheCanvas from './components/Canvas.vue'
import SettingsModal from './components/avatar/Settings.vue'
import Register from './components/Register.vue'
import { api } from '../api/axios'

const auth = useAuthStore()
const showSettings = ref(false)
const verifyStatus = ref<'loading' | 'success' | 'error' | null>(null)

onMounted(async () => {
  const params = new URLSearchParams(window.location.search)
  const token = params.get('token')

  if (token) {
    verifyStatus.value = 'loading'
    try {
      const data = await api(`/auth/verify/${token}`)
      if (data.accessToken) {
        auth.setAuth({
          user: data.user,
          accessToken: data.accessToken,
          refreshToken: data.refreshToken,
        })
        verifyStatus.value = null
        window.history.replaceState({}, '', '/')
        return
      }
      verifyStatus.value = 'success'
    } catch {
      verifyStatus.value = 'error'
    }
  }
})
</script>

<template>
  <div class="app">
    <template v-if="auth.isAuth">
      <TheHeader />
      <div class="main">
        <TheSidebar @open-settings="showSettings = true" />
        <TheCanvas />
      </div>
      <SettingsModal :is-open="showSettings" @close="showSettings = false" />
    </template>

    <template v-else>
      <div v-if="verifyStatus" class="verify-banner" :class="verifyStatus">
      </div>
      <Register />
    </template>
  </div>
</template>
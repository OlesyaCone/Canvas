<script setup lang="ts">
import { ref } from 'vue'
import { useAuthStore } from './stores/auth'
import TheHeader from './components/Header.vue'
import TheSidebar from './components/Sidebar.vue'
import TheCanvas from './components/Canvas.vue'
import SettingsModal from './components/avatar/Settings.vue'
import Register from './components/Register.vue'

const auth = useAuthStore()
const showSettings = ref(false)
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
      <Register @close="() => {}" />
    </template>
  </div>
</template>
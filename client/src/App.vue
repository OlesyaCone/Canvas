<script setup lang="ts">
import { ref } from 'vue'
import TheHeader from './components/Header.vue'
import TheSidebar from './components/Sidebar.vue'
import TheCanvas from './components/Canvas.vue'
import SettingsModal from './components/avatar/Settings.vue'

const showSettings = ref(false)
</script>

<template>
  <div class="app">
    <TheHeader />
    <div class="main">
      <TheSidebar @open-settings="showSettings = true" />
      <TheCanvas />
    </div>
    <SettingsModal 
      :is-open="showSettings" 
      @close="showSettings = false" 
    />
  </div>
</template>
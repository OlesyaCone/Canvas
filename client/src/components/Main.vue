<script setup lang="ts">
import { ref } from 'vue'
import Panel from "./app/Panel.vue";
import Chat from "./app/Chat.vue";
import Settings from "./app/Settings.vue"; 

const isSettingsOpen = ref(false)

const handleOpenSettings = (): void => {
  isSettingsOpen.value = true
}

const handleCloseSettings = (): void => {
  isSettingsOpen.value = false
}
</script>

<template>
  <div class="main-layout">
    <Panel @open-settings="handleOpenSettings" />
    <Chat />
    
    <Settings 
      :is-open="isSettingsOpen" 
      @close="handleCloseSettings"
    />
  </div>
</template>
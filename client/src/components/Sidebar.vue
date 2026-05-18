<script setup lang="ts">
import { useAuthStore } from "../stores/auth"
import { storeToRefs } from "pinia"

const authStore = useAuthStore()
const { user } = storeToRefs(authStore)

const emit = defineEmits<{
  (e: "open-settings"): void
}>()
</script>

<template>
  <aside class="sidebar">
    <p>Панель инструментов</p>
    <div class="sidebar-footer">
      <div class="user-profile">
        <div class="user-avatar">
          <img :src="user?.avatar || 'https://via.placeholder.com/40'" />
        </div>
        <div class="user-info">
          <div class="user-name">{{ user?.username }}</div>
        </div>
      </div>
      <button class="setting-btn" @click="emit('open-settings')">
        <span class="bar bar1"></span>
        <span class="bar bar2"></span>
        <span class="bar bar1"></span>
      </button>
    </div>
  </aside>
</template>
<script setup lang="ts">
import { useAuthStore } from "../stores/auth"
import { storeToRefs } from "pinia"

const authStore = useAuthStore()
const { user, userAvatar } = storeToRefs(authStore)

const emit = defineEmits<{
  (e: "open-settings"): void
  (e: "navigate", page: 'personal' | 'completed' | 'creating'): void
}>()
</script>

<template>
  <aside class="sidebar">
    <div class="search-box">
      <svg class="search-icon" viewBox="0 0 512 512" height="16" xmlns="http://www.w3.org/2000/svg">
        <path d="M416 208c0 45.9-14.9 88.3-40 122.7L502.6 457.4c12.5 12.5 12.5 32.8 0 45.3s-32.8 12.5-45.3 0L330.7 376c-34.4 25.2-76.8 40-122.7 40C93.1 416 0 322.9 0 208S93.1 0 208 0S416 93.1 416 208zM208 352a144 144 0 1 0 0-288 144 144 0 1 0 0 288z"/>
      </svg>
      <input class="search-input" placeholder="Найти тест" type="text" />
    </div>

    <nav class="sidebar-nav">
      <a class="nav-item" @click="emit('navigate', 'personal')">Мои тесты</a>
      <a class="nav-item" @click="emit('navigate', 'completed')">Пройденные тесты</a>
      <a class="nav-item" @click="emit('navigate', 'creating')">Составить тест</a>
    </nav>

    <div class="sidebar-footer">
      <div class="user-profile">
        <div class="user-avatar">
          <img :src="userAvatar" />
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
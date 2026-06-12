<script setup lang="ts">
import { useAuthStore } from "../../stores/auth";
import { storeToRefs } from "pinia";

const authStore = useAuthStore();
const { user, userAvatar } = storeToRefs(authStore);

const emit = defineEmits<{
  (e: "open-settings"): void;
  (e: "navigate", page: "personal" | "completed" | "creating" | "public" | "profile" | "myGroups"): void;
}>();
</script>

<template>
  <aside class="sidebar">
    <nav class="sidebar-nav">
      <a class="nav-item" @click="emit('navigate', 'personal')">Мои тесты</a>
      <a class="nav-item" @click="emit('navigate', 'completed')">Пройденные тесты</a>
      <a class="nav-item" @click="emit('navigate', 'creating')">Составить тест</a>
      <a class="nav-item" @click="emit('navigate', 'public')">Публичные тесты</a>
      <a class="nav-item" @click="emit('navigate', 'myGroups')">Мои группы</a>
      <a class="nav-item" @click="emit('navigate', 'profile')">Профиль</a>
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
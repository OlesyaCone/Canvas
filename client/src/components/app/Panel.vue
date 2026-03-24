<script setup lang="ts">
import { useAuthStore } from "../../store/auth";
import { storeToRefs } from "pinia";

const authStore = useAuthStore();

const { user, isAuth } =
  storeToRefs(authStore);

const emit = defineEmits<{
  (e: "open-settings"): void;
}>();
</script>

<template>
  <div class="sidebar">
    <div class="sidebar-header">
      <h2 class="sidebar-title">Чаты</h2>

      <div class="container">
        <input checked class="checkbox" type="checkbox" />
        <div class="mainbox">
          <div class="iconContainer">
            <svg
              viewBox="0 0 512 512"
              height="1em"
              xmlns="http://www.w3.org/2000/svg"
              class="search_icon"
            >
              <path
                d="M416 208c0 45.9-14.9 88.3-40 122.7L502.6 457.4c12.5 12.5 12.5 32.8 0 45.3s-32.8 12.5-45.3 0L330.7 376c-34.4 25.2-76.8 40-122.7 40C93.1 416 0 322.9 0 208S93.1 0 208 0S416 93.1 416 208zM208 352a144 144 0 1 0 0-288 144 144 0 1 0 0 288z"
              ></path>
            </svg>
          </div>
          <input class="search_input" placeholder="Поиск" type="text" />
        </div>
      </div>
    </div>

    <div class="chats-list">
      <div class="chat-item" v-for="i in 5" :key="i">
        <div class="chat-avatar">
          <img src="https://via.placeholder.com/40" alt="avatar" />
        </div>
        <div class="chat-info">
          <div class="chat-name">Пользователь {{ i }}</div>
          <div class="chat-last-message">Последнее сообщение...</div>
        </div>
        <div class="chat-meta">
          <span class="chat-time">12:30</span>
          <span class="chat-unread" v-if="i === 1">3</span>
        </div>
      </div>
    </div>

    <div class="sidebar-footer">
      <div class="user-profile">
        <div class="user-avatar">
          <img 
            :src="user?.avatar || 'https://via.placeholder.com/40'" 
            :alt="user?.displayName || 'User'" 
          />
        </div>
        <div class="user-info">
          <div class="user-name">{{ user?.displayName || 'Гость' }}</div>
          <div class="user-status">{{ isAuth ? 'онлайн' : 'офлайн' }}</div>
        </div>
      </div>

      <button class="setting-btn" @click="emit('open-settings')">
        <span class="bar bar1"></span>
        <span class="bar bar2"></span>
        <span class="bar bar1"></span>
      </button>
    </div>
  </div>
</template>
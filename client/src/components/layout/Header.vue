<script setup lang="ts">
import { ref, onMounted, onUnmounted, watch } from "vue";
import { useNotificationStore } from "../../stores/notifications";

const notifStore = useNotificationStore();

const isDark = ref(false);
const showNotifications = ref(false);

let interval: ReturnType<typeof setInterval> | null = null;

function getSystemTheme(): boolean {
  return window.matchMedia("(prefers-color-scheme: dark)").matches;
}

function applyTheme() {
  document.documentElement.setAttribute("data-theme", isDark.value ? "dark" : "light");
}

function toggleTheme() {
  applyTheme();
  localStorage.setItem("theme", isDark.value ? "dark" : "light");
}

watch(isDark, applyTheme);

function closeNotifications(e: MouseEvent) {
  const target = e.target as HTMLElement;
  if (!target.closest(".notif-bell") && !target.closest(".notif-dropdown")) {
    showNotifications.value = false;
  }
}

onMounted(function () {
  const savedTheme = localStorage.getItem("theme");
  if (savedTheme) {
    isDark.value = savedTheme === "dark";
  } else {
    isDark.value = getSystemTheme();
  }
  applyTheme();

  window.matchMedia("(prefers-color-scheme: dark)").addEventListener("change", function (e) {
    if (!localStorage.getItem("theme")) {
      isDark.value = e.matches;
      applyTheme();
    }
  });

  notifStore.fetchNotifications();
  notifStore.connectSocket();
  interval = setInterval(function () {
    notifStore.fetchNotifications();
  }, 60000);

  document.addEventListener("click", closeNotifications);
});

onUnmounted(function () {
  if (interval !== null) {
    clearInterval(interval);
  }
  document.removeEventListener("click", closeNotifications);
});
</script>

<template>
  <header class="header">
    <span class="header__title">Canvas</span>

    <div class="header-right">
      <div class="notif-bell" @click.stop="showNotifications = !showNotifications">
        <svg
          width="22"
          height="22"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          stroke-width="1.5"
          stroke-linecap="round"
          stroke-linejoin="round"
        >
          <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
          <path d="M13.73 21a2 2 0 0 1-3.46 0" />
        </svg>
        <span v-if="notifStore.unreadCount > 0" class="notif-badge">
          {{ notifStore.unreadCount }}
        </span>
      </div>

      <div v-if="showNotifications" class="notif-dropdown">
        <div class="notif-header">
          <span>Уведомления</span>
          <button v-if="notifStore.unreadCount > 0" @click="notifStore.markRead()">
            Прочитать все
          </button>
        </div>

        <div v-if="notifStore.notifications.length === 0" class="notif-empty">Нет уведомлений</div>

        <div
          v-for="n in notifStore.notifications"
          :key="n._id"
          class="notif-item"
          :class="{ unread: !n.read }"
        >
          <p>{{ n.text }}</p>
          <span>{{ new Date(n.createdAt).toLocaleString() }}</span>
        </div>
      </div>

      <label class="theme-toggle">
        <input v-model="isDark" type="checkbox" class="theme-toggle-input" @change="toggleTheme" />
        <svg class="theme-toggle-svg" viewBox="0 0 20 20" fill="currentColor" stroke="none">
          <mask id="moon-mask">
            <rect x="0" y="0" width="20" height="20" fill="white" />
            <circle cx="11" cy="3" r="8" fill="black" />
          </mask>
          <circle class="sun-moon" cx="10" cy="10" r="8" mask="url(#moon-mask)" />
          <g>
            <circle class="sun-ray ray-1" cx="18" cy="10" r="1.5" />
            <circle class="sun-ray ray-2" cx="14" cy="16.928" r="1.5" />
            <circle class="sun-ray ray-3" cx="6" cy="16.928" r="1.5" />
            <circle class="sun-ray ray-4" cx="2" cy="10" r="1.5" />
            <circle class="sun-ray ray-5" cx="6" cy="3.1718" r="1.5" />
            <circle class="sun-ray ray-6" cx="14" cy="3.1718" r="1.5" />
          </g>
        </svg>
      </label>
    </div>
  </header>
</template>

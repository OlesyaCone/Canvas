<script setup lang="ts">
import { ref, onMounted, watch } from "vue";
import Auth from "./components/Auth.vue";
import Main from "./components/Main.vue";
import Settings from "./components/app/Settings.vue";
import { useAuthStore } from "./store/auth";

const authStore = useAuthStore();
const showAuth = ref(false);
const isDark = ref(false);
const showSettings = ref(false);

watch(() => authStore.isAuth, (newVal) => {
  if (newVal) {
    showAuth.value = false;

    if (authStore.needsProfileSetup) {
      showSettings.value = true;
    }
  }
});

watch(() => authStore.needsProfileSetup, (val) => {
  if (val && authStore.isAuth) {
    showSettings.value = true;
  }
});

const toggleTheme = (): void => {
  applyTheme();
  localStorage.setItem("theme", isDark.value ? "dark" : "light");
};

const applyTheme = (): void => {
  document.documentElement.setAttribute(
    "data-theme",
    isDark.value ? "dark" : "light",
  );
};

onMounted(async () => {
  const params = new URLSearchParams(window.location.search);
  const token = params.get("accessToken");
  const isNewUser = params.get("isNewUser");

  if (token) {

    localStorage.setItem("accessToken", token);

    authStore.accessToken = token;
    authStore.isAuth = true;

    if (isNewUser === "true") {
      authStore.tempUser = {};
    }
    window.history.replaceState({}, document.title, "/");
  }
  await authStore.checkAuth();
  const savedTheme = localStorage.getItem("theme");
  const systemDark = window.matchMedia("(prefers-color-scheme: dark)").matches;

  isDark.value = savedTheme ? savedTheme === "dark" : systemDark;

  applyTheme();
});
</script>
<template>
  <div id="app">
    <div v-if="!authStore.isAuth" class="welcome-screen">
      <div class="welcome-content">
        <h1 class="welcome-title">Добро пожаловать!</h1>
        <p class="welcome-subtitle">Войдите или зарегистрируйтесь, чтобы начать общение</p>
        <button @click="showAuth = true" class="auth-btn">
          Войти / Зарегистрироваться
        </button>
      </div>
    </div>

    <Main v-else />

    <Teleport to="body">
      <Auth v-if="showAuth" @close="showAuth = false" />
    </Teleport>

    <Teleport to="body">
      <Settings
        v-if="showSettings"
        :is-open="showSettings"
        @close="showSettings = false"
      />
    </Teleport>

    <label class="theme-toggle">
      <input
        type="checkbox"
        class="theme-toggle-input"
        v-model="isDark"
        @change="toggleTheme"
      />
      <svg
        class="theme-toggle-svg"
        viewBox="0 0 20 20"
        fill="currentColor"
        stroke="none"
      >
        <mask id="moon-mask">
          <rect x="0" y="0" width="20" height="20" fill="white"></rect>
          <circle cx="11" cy="3" r="8" fill="black"></circle>
        </mask>
        <circle
          class="sun-moon"
          cx="10"
          cy="10"
          r="8"
          mask="url(#moon-mask)"
        ></circle>
        <g>
          <circle class="sun-ray ray-1" cx="18" cy="10" r="1.5"></circle>
          <circle class="sun-ray ray-2" cx="14" cy="16.928" r="1.5"></circle>
          <circle class="sun-ray ray-3" cx="6" cy="16.928" r="1.5"></circle>
          <circle class="sun-ray ray-4" cx="2" cy="10" r="1.5"></circle>
          <circle class="sun-ray ray-5" cx="6" cy="3.1718" r="1.5"></circle>
          <circle class="sun-ray ray-6" cx="14" cy="3.1718" r="1.5"></circle>
        </g>
      </svg>
    </label>
  </div>
</template>
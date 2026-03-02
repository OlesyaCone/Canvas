<script setup lang="ts">
import { ref, onMounted } from 'vue'
import Auth from './components/Auth.vue'
import Main from './components/Main.vue'

const showAuth = ref(false)
const isDark = ref(false);

const toggleTheme = (): void => {
  applyTheme();
  localStorage.setItem("theme", isDark.value ? "dark" : "light");
};

const applyTheme = (): void => {
  document.documentElement.setAttribute(
    "data-theme",
    isDark.value ? "dark" : "light"
  );
};

onMounted(() => {
  const savedTheme = localStorage.getItem("theme");
  const systemDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
  isDark.value = savedTheme ? savedTheme === "dark" : systemDark;
  applyTheme();
});
</script>

<template>
  <div id="app">
    <div class="theme-controls">
      <button @click="showAuth = true" class="auth-btn">
        Войти / Зарегистрироваться
      </button>
    </div>

    <Auth v-if="showAuth" @close="showAuth = false" />
    <Main />
    
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
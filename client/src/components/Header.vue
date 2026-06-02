<script setup lang="ts">
import { ref, onMounted, watch } from "vue"

const getSystemTheme = (): boolean => {
  return window.matchMedia("(prefers-color-scheme: dark)").matches
}

const isDark = ref<boolean>(getSystemTheme())

const applyTheme = (): void => {
  document.documentElement.setAttribute(
    "data-theme",
    isDark.value ? "dark" : "light"
  )
}

const toggleTheme = (): void => {
  localStorage.setItem("theme", isDark.value ? "dark" : "light")
}

watch(isDark, () => {
  applyTheme()
})

onMounted(() => {
  const savedTheme = localStorage.getItem("theme")

  if (savedTheme) {
    isDark.value = savedTheme === "dark"
  } else {
    isDark.value = getSystemTheme()
  }

  applyTheme()

  window.matchMedia("(prefers-color-scheme: dark)").addEventListener("change", (e) => {
    if (!localStorage.getItem("theme")) {
      isDark.value = e.matches
      applyTheme()
    }
  })
})
</script>

<template>
  <header class="header">
    <span class="header__title">Сanvas</span>

    <label class="theme-toggle">
      <input type="checkbox" class="theme-toggle-input" v-model="isDark" @change="toggleTheme" />
      <svg class="theme-toggle-svg" viewBox="0 0 20 20" fill="currentColor" stroke="none">
        <mask id="moon-mask">
          <rect x="0" y="0" width="20" height="20" fill="white"></rect>
          <circle cx="11" cy="3" r="8" fill="black"></circle>
        </mask>
        <circle class="sun-moon" cx="10" cy="10" r="8" mask="url(#moon-mask)"></circle>
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
  </header>
</template>
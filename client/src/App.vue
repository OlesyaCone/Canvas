<script setup lang="ts">
import TheHeader from './components/Header.vue'
import TheSidebar from './components/Sidebar.vue'
import TheCanvas from './components/Canvas.vue'
</script>

<template>
  <div class="app">
    <TheHeader />
    <div class="main">
      <TheSidebar />
      <TheCanvas />
    </div>
  </div>
</template>
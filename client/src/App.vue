<script setup lang="ts">
import { ref } from 'vue'
import Auth from './components/Auth.vue'

const showAuth = ref(false)
</script>

<template>
  <div class="app">
    <button @click="showAuth = true" class="auth-btn">
      Войти / Зарегистрироваться
    </button>

    <Auth v-if="showAuth" @close="showAuth = false" />
  </div>
</template>
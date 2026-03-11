<script setup lang="ts">
import { useAuthStore } from '../store/auth'
import { ref } from 'vue'

const authStore = useAuthStore()
const isLogin = ref(true)
const email = ref('')
const password = ref('')

const emit = defineEmits<{
  (e: 'close'): void
}>()

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000'

const handleSubmit = async () => {
  try {
    if (isLogin.value) {
      await authStore.login(email.value, password.value)
    } else {
      await authStore.registration(email.value, password.value)
    }
    emit('close')
  } catch (e) {
    console.error(e)
  }
}

const handleGoogleLogin = () => {
  // Сохраняем текущий путь для редиректа обратно
  localStorage.setItem('google_redirect', window.location.pathname)
  window.location.href = `${API_URL}/api/auth/google`
}
</script>

<template>
  <div class="modal">
    <div class="modal-content">
      <button class="close-btn" @click="emit('close')">✕</button>
      
      <form class="form" @submit.prevent="handleSubmit">
        <h1 class="title">{{ isLogin ? 'Вход' : 'Регистрация' }}</h1>

        <span class="input-span">
          <label for="email" class="label">Почта</label>
          <input type="email" id="email" v-model="email" required />
        </span>
        
        <span class="input-span">
          <label for="password" class="label">Пароль</label>
          <input type="password" id="password" v-model="password" required />
        </span>
        
        <input class="submit" type="submit" :value="isLogin ? 'Войти' : 'Зарегистрироваться'" />

        <span class="span toggle-auth">
          {{ isLogin ? 'Нет аккаунта?' : 'Уже есть аккаунт?' }}
          <a href="#" @click.prevent="isLogin = !isLogin">
            {{ isLogin ? 'Зарегистрироваться' : 'Войти' }}
          </a>
        </span>

        <div class="divider">
          <span class="divider-text">или</span>
        </div>

        <button 
          type="button" 
          class="google-btn" 
          @click="handleGoogleLogin"
        >
          <svg class="google-icon" viewBox="0 0 24 24">
            <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
            <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
            <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
            <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
          </svg>
          <span>Войти через Google</span>
        </button>
      </form>
    </div>
  </div>
</template>
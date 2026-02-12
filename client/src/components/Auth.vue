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
        
        <span class="span">
          {{ isLogin ? 'Нет аккаунта?' : 'Уже есть аккаунт?' }}
          <a href="#" @click.prevent="isLogin = !isLogin">
            {{ isLogin ? 'Зарегистрироваться' : 'Войти' }}
          </a>
        </span>
      </form>
    </div>
  </div>
</template>
import { createApp } from 'vue'
import { createPinia } from 'pinia'
import App from './App.vue'
import { useAuthStore } from './store/auth'
import "./scss/main.scss";

const app = createApp(App)
const pinia = createPinia()
app.use(pinia)


const authStore = useAuthStore()
authStore.checkAuth()

app.mount('#app')
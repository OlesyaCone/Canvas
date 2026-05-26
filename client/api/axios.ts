import axios from 'axios';
import { useAuthStore } from '../src/stores/auth';

const api = axios.create({
  baseURL: 'http://localhost:5000/api',
  withCredentials: true, 
});

api.interceptors.request.use((config) => {
  const authStore = useAuthStore();
  if (authStore.accessToken) {
    config.headers.Authorization = `Bearer ${authStore.accessToken}`;
  }
  if (config.data instanceof FormData) {
    delete config.headers['Content-Type'];
  }
  return config;
});

export default api;
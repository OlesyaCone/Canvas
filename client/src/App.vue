<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { useAuthStore } from './stores/auth';
import TheHeader from './components/Header.vue';
import TheSidebar from './components/Sidebar.vue';
import TheCanvas from './components/Canvas.vue';
import SettingsModal from './components/user/Settings.vue';
import Register from './components/Register.vue';
import api from '../api/axios';

const auth = useAuthStore();
const showSettings = ref(false);
const verifyStatus = ref<'loading' | 'success' | 'error' | null>(null);
const currentPage = ref<'personal' | 'completed' | 'creating' | 'playing'>('personal');
const playingTestId = ref<string | null>(null);

onMounted(async () => {
  try {
    const { data } = await api.post('/auth/refresh');
    if (data.accessToken) {
      auth.accessToken = data.accessToken;
      auth.isAuth = true;
      const profile = await api.get('/auth/profile');
      if (profile.data.user) auth.user = profile.data.user;
      return;
    }
  } catch (e) {}

  const params = new URLSearchParams(window.location.search);
  const token = params.get('token');
  const accessToken = params.get('accessToken');
  const userParam = params.get('user');

  if (accessToken) {
    let userData: { id: string; username: string; avatar: string } = {
      id: '',
      username: 'Пользователь',
      avatar: '',
    };
    if (userParam) {
      userData = JSON.parse(decodeURIComponent(userParam));
    } else {
      try {
        const payload = JSON.parse(atob(accessToken.split('.')[1]));
        userData.id = payload.id;
      } catch (e) {}
    }
    auth.setAuth({ user: userData, accessToken });
    try {
      const { data } = await api.get('/auth/profile');
      if (data.user) auth.user = data.user;
    } catch (e) {}
    window.history.replaceState({}, '', '/');
    return;
  }

  if (token) {
    verifyStatus.value = 'loading';
    try {
      const { data } = await api(`/auth/verify/${token}`);
      if (data.accessToken) {
        auth.setAuth(data);
        verifyStatus.value = null;
        window.history.replaceState({}, '', '/');
        return;
      }
      verifyStatus.value = 'success';
    } catch {
      verifyStatus.value = 'error';
    }
  }
});

const onNavigate = (page: 'personal' | 'completed' | 'creating') => {
  currentPage.value = page;
  playingTestId.value = null;
};

const onStartTest = (testId: string) => {
  currentPage.value = 'playing';
  playingTestId.value = testId;
};

const onBackToTests = () => {
  currentPage.value = 'personal';
  playingTestId.value = null;
};
</script>

<template>
  <div class="app" v-if="auth.isAuth">
    <TheHeader />
    <div class="main">
      <TheSidebar
        @open-settings="showSettings = true"
        @navigate="onNavigate"
      />
      <TheCanvas
        :currentPage="currentPage"
        :playingTestId="playingTestId"
        @start-test="onStartTest"
        @back-to-tests="onBackToTests"
      />
    </div>
    <SettingsModal :is-open="showSettings" @close="showSettings = false" />
  </div>
  <Register v-else />
</template>
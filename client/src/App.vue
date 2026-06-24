<script setup lang="ts">
import { ref, onMounted } from "vue";
import { useRouter } from "vue-router";
import { useAuthStore } from "./stores/auth";
import type { User } from "./types";
import TheHeader from "./components/layout/Header.vue";
import TheSidebar from "./components/layout/Sidebar.vue";
import SettingsModal from "./components/user/Settings.vue";
import Register from "./components/auth/Register.vue";
import api from "./api/axios";

const auth = useAuthStore();
const router = useRouter();
const showSettings = ref(false);

function getDefaultUser(): User {
  return {
    _id: "",
    username: "Пользователь",
    avatar: "",
    email: "",
    myTests: [],
    passedTests: [],
    groups: [],
    createdAt: new Date().toISOString(),
  };
}

async function tryRestoreFromStoredToken(): Promise<boolean> {
  const storedToken = localStorage.getItem("accessToken");
  if (!storedToken) {
    return false;
  }

  try {
    auth.accessToken = storedToken;
    const { data } = await api.get("/auth/profile");
    if (data.user) {
      auth.user = data.user;
      auth.isAuth = true;
      return true;
    }
  }
  catch {
    return false;
  }

  return false;
}

async function tryRefreshToken(): Promise<boolean> {
  try {
    const { data } = await api.post("/auth/refresh");
    if (data.accessToken) {
      auth.accessToken = data.accessToken;
      auth.isAuth = true;
      localStorage.setItem("accessToken", data.accessToken);

      const profile = await api.get("/auth/profile");
      if (profile.data.user) {
        auth.user = profile.data.user;
      }
      return true;
    }
  }
  catch {
    return false;
  }

  return false;
}

async function tryHandleOAuthParams(): Promise<boolean> {
  const params = new URLSearchParams(window.location.search);
  const accessToken = params.get("accessToken");
  const userParam = params.get("user");
  const token = params.get("token");

  if (accessToken) {
    let userData = getDefaultUser();

    if (userParam) {
      userData = JSON.parse(decodeURIComponent(userParam));
    }
    else {
      try {
        const payload = JSON.parse(atob(accessToken.split(".")[1]));
        userData._id = payload.id;
      }
      catch { }
    }

    auth.setAuth({ user: userData, accessToken });

    try {
      const { data } = await api.get("/auth/profile");
      if (data.user) {
        auth.user = data.user;
      }
    }
    catch { }

    window.history.replaceState({}, "", "/");
    return true;
  }

  if (token) {
    try {
      const { data } = await api(`/auth/verify/${token}`);
      if (data.accessToken) {
        auth.setAuth(data);
        window.history.replaceState({}, "", "/");
        return true;
      }
    }
    catch {
      return false;
    }
  }

  return false;
}

onMounted(async function () {
  const restored = await tryRestoreFromStoredToken();
  if (restored) {
    return;
  }

  const refreshed = await tryRefreshToken();
  if (refreshed) {
    return;
  }

  await tryHandleOAuthParams();
});

function onNavigate(page: string) {
  router.push({ name: page });
}

function onOpenSettings() {
  showSettings.value = true;
}
</script>

<template>
  <div v-if="auth.isAuth" class="app">
    <TheHeader />
    <div class="main">
      <TheSidebar @open-settings="onOpenSettings" @navigate="onNavigate" />
      <div class="canvas">
        <router-view />
      </div>
    </div>
    <SettingsModal :is-open="showSettings" @close="showSettings = false" />
  </div>
  <Register v-else />
</template>
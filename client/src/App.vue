<script setup lang="ts">
import { ref, onMounted } from "vue";
import { useAuthStore } from "./stores/auth";
import TheHeader from "./components/Header.vue";
import TheSidebar from "./components/Sidebar.vue";
import TheCanvas from "./components/Canvas.vue";
import SettingsModal from "./components/avatar/Settings.vue";
import Register from "./components/Register.vue";
import api from "../api/axios";

const auth = useAuthStore();
const showSettings = ref(false);
const verifyStatus = ref<"loading" | "success" | "error" | null>(null);

onMounted(async () => {
  const params = new URLSearchParams(window.location.search);
  const token = params.get("token");
  const accessToken = params.get("accessToken");
  const refreshToken = params.get("refreshToken");
  const userParam = params.get("user");

  if (accessToken && refreshToken) {
    let userData: { id: string; username: string; avatar: string };

    if (userParam) {
      userData = JSON.parse(decodeURIComponent(userParam));
    } else {
      const payload = JSON.parse(atob(accessToken.split(".")[1]));
      userData = { id: payload.id, username: "Пользователь", avatar: "" };
    }

    auth.setAuth({ user: userData, accessToken, refreshToken });
    window.history.replaceState({}, "", "/");
    return;
  }

  if (token) {
    verifyStatus.value = "loading";
    try {
      const { data } = await api(`/auth/verify/${token}`);
      if (data.accessToken) {
        auth.setAuth(data);
        verifyStatus.value = null;
        window.history.replaceState({}, "", "/");
        return;
      }
      verifyStatus.value = "success";
    } catch {
      verifyStatus.value = "error";
    }
  }
});
</script>

<template>
  <div class="app" v-if="auth.isAuth">
    <TheHeader />
    <div class="main">
      <TheSidebar @open-settings="showSettings = true" />
      <TheCanvas />
    </div>
    <SettingsModal :is-open="showSettings" @close="showSettings = false" />
  </div>
  <Register v-else />
</template>

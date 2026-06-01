<script setup lang="ts">
import { ref, onMounted } from "vue";
import { useAuthStore } from "./stores/auth";
import TheHeader from "./components/Header.vue";
import TheSidebar from "./components/Sidebar.vue";
import TheCanvas from "./components/Canvas.vue";
import SettingsModal from "./components/user/Settings.vue";
import Register from "./components/Register.vue";
import api from "./api/axios";

const auth = useAuthStore();
const showSettings = ref(false);
const currentPage = ref<"personal" | "completed" | "creating" | "playing" | "editing" | "myGroups" | "createGroup" | "groupView">("personal");
const playingTestId = ref<string | null>(null);
const editingTestId = ref<string | null>(null);
const viewingGroupId = ref<string | null>(null);

onMounted(async () => {
  const storedToken = localStorage.getItem("accessToken");
  if (storedToken) {
    try {
      auth.accessToken = storedToken;
      const { data } = await api.get("/auth/profile");
      if (data.user) {
        auth.user = data.user;
        auth.isAuth = true;
        return;
      }
    } catch (e) { }
  }

  try {
    const { data } = await api.post("/auth/refresh");
    if (data.accessToken) {
      auth.accessToken = data.accessToken;
      auth.isAuth = true;
      localStorage.setItem("accessToken", data.accessToken);
      const profile = await api.get("/auth/profile");
      if (profile.data.user) auth.user = profile.data.user;
      return;
    }
  } catch (e) { }

  const params = new URLSearchParams(window.location.search);
  const accessToken = params.get("accessToken");
  const userParam = params.get("user");
  const token = params.get("token");

  if (accessToken) {
    let userData = { id: "", username: "Пользователь", avatar: "" };
    if (userParam) {
      userData = JSON.parse(decodeURIComponent(userParam));
    } else {
      try {
        const payload = JSON.parse(atob(accessToken.split(".")[1]));
        userData.id = payload.id;
      } catch (e) { }
    }
    auth.setAuth({ user: userData, accessToken });
    try {
      const { data } = await api.get("/auth/profile");
      if (data.user) auth.user = data.user;
    } catch (e) { }
    window.history.replaceState({}, "", "/");
    return;
  }

  if (token) {
    try {
      const { data } = await api(`/auth/verify/${token}`);
      if (data.accessToken) {
        auth.setAuth(data);
        window.history.replaceState({}, "", "/");
        return;
      }
    } catch { }
  }
});

const onNavigate = (page: "personal" | "completed" | "creating" | "myGroups") => {
  currentPage.value = page;
  playingTestId.value = null;
  editingTestId.value = null;
  viewingGroupId.value = null;
};

const onStartTest = (testId: string) => {
  currentPage.value = "playing";
  playingTestId.value = testId;
};

const onEditTest = (testId: string) => {
  currentPage.value = "editing";
  editingTestId.value = testId;
};

const onSelectGroup = (groupId: string) => {
  currentPage.value = "groupView";
  viewingGroupId.value = groupId;
};

const onCreateGroup = () => {
  currentPage.value = "createGroup";
};

const onBackToTests = () => {
  currentPage.value = "personal";
  playingTestId.value = null;
  editingTestId.value = null;
};

const onBackToGroups = () => {
  currentPage.value = "myGroups";
  viewingGroupId.value = null;
};

const openSettings = () => {
  console.log('openSettings в App, showSettings было:', showSettings.value);
  showSettings.value = true;
  console.log('openSettings в App, showSettings стало:', showSettings.value);
};
</script>

<template>
  <div class="app" v-if="auth.isAuth">
    <TheHeader />
    <div class="main">
      <TheSidebar @open-settings="openSettings" @navigate="onNavigate" />
      <TheCanvas :currentPage="currentPage" :playingTestId="playingTestId" :editingTestId="editingTestId"
        :viewingGroupId="viewingGroupId" @start-test="onStartTest" @edit-test="onEditTest"
        @back-to-tests="onBackToTests" @select-group="onSelectGroup" @create-group="onCreateGroup"
        @back-to-groups="onBackToGroups" />
    </div>
    <SettingsModal :is-open="showSettings" @close="showSettings = false" />
  </div>
  <Register v-else />
</template>
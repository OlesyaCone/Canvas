<script setup lang="ts">
import { ref, onMounted } from "vue";
import { useAuthStore } from "./stores/auth";
import { useTestStore } from "./stores/test";
import { useGroupStore } from "./stores/group";
import TheHeader from "./components/layout/Header.vue";
import TheSidebar from "./components/layout/Sidebar.vue";
import TheCanvas from "./components/layout/Canvas.vue";
import SettingsModal from "./components/user/Settings.vue";
import Register from "./components/auth/Register.vue";
import api from "./api/axios";

const auth = useAuthStore();
const testStore = useTestStore();
const groupStore = useGroupStore();
const showSettings = ref(false);
const currentPage = ref<"personal" | "completed" | "creating" | "playing" | "editing" | "public" | "profile" | "myGroups" | "createGroup" | "groupView">("personal");
const previousPage = ref<"personal" | "completed" | "public" | "groupView">("personal");
const playingTestId = ref<string | null>(null);
const playingGroupTestId = ref<string | null>(null);
const editingTestId = ref<string | null>(null);
const viewingGroupId = ref<string | null>(null);
const viewingProfileId = ref<string | null>(null);

onMounted(async () => {
  const storedToken = localStorage.getItem("accessToken");
  if (storedToken) {
    try {
      auth.accessToken = storedToken;
      const { data } = await api.get("/auth/profile");
      if (data.user) { auth.user = data.user; auth.isAuth = true; return; }
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
    if (userParam) { userData = JSON.parse(decodeURIComponent(userParam)); }
    else { try { const payload = JSON.parse(atob(accessToken.split(".")[1])); userData.id = payload.id; } catch (e) { } }
    auth.setAuth({ user: userData, accessToken });
    try { const { data } = await api.get("/auth/profile"); if (data.user) auth.user = data.user; } catch (e) { }
    window.history.replaceState({}, "", "/");
    return;
  }

  if (token) {
    try {
      const { data } = await api(`/auth/verify/${token}`);
      if (data.accessToken) { auth.setAuth(data); window.history.replaceState({}, "", "/"); return; }
    } catch { }
  }
});

const onNavigate = async (page: "personal" | "completed" | "creating" | "public" | "profile" | "myGroups") => {
  currentPage.value = page;
  playingTestId.value = null;
  playingGroupTestId.value = null;
  editingTestId.value = null;
  viewingGroupId.value = null;
  viewingProfileId.value = null;
  if (page === "personal") await testStore.fetchMyTests();
  if (page === "completed") await testStore.fetchPassedTests();
  if (page === "myGroups") await groupStore.fetchMyGroups();
};

const onStartTest = (testId: string, groupTestId?: string) => {
  if (currentPage.value === 'public') previousPage.value = 'public';
  else if (currentPage.value === 'groupView') previousPage.value = 'groupView';
  else previousPage.value = 'personal';
  currentPage.value = "playing";
  playingTestId.value = testId;
  playingGroupTestId.value = groupTestId || null;
};

const onEditTest = (testId: string) => { currentPage.value = "editing"; editingTestId.value = testId; };
const onSelectGroup = (groupId: string) => { currentPage.value = "groupView"; viewingGroupId.value = groupId; };
const onCreateGroup = () => { currentPage.value = "createGroup"; };

const onViewProfile = (userId: string) => {
  viewingProfileId.value = userId;
  currentPage.value = "profile";
};

const onBackToTests = () => {
  currentPage.value = previousPage.value;
  playingTestId.value = null;
  playingGroupTestId.value = null;
  editingTestId.value = null;
  if (previousPage.value === "personal") testStore.fetchMyTests();
  if (previousPage.value === "completed") testStore.fetchPassedTests();
};

const onBackToGroups = () => {
  currentPage.value = "myGroups";
  viewingGroupId.value = null;
  groupStore.fetchMyGroups();
};
</script>

<template>
  <div class="app" v-if="auth.isAuth">
    <TheHeader />
    <div class="main">
      <TheSidebar @open-settings="showSettings = true" @navigate="onNavigate" />
      <TheCanvas :currentPage="currentPage" :playingTestId="playingTestId" :playingGroupTestId="playingGroupTestId"
        :editingTestId="editingTestId" :viewingGroupId="viewingGroupId" :viewingProfileId="viewingProfileId"
        @start-test="onStartTest" @edit-test="onEditTest" @back-to-tests="onBackToTests" @select-group="onSelectGroup"
        @create-group="onCreateGroup" @back-to-groups="onBackToGroups" @view-profile="onViewProfile" />
    </div>
    <SettingsModal :is-open="showSettings" @close="showSettings = false" />
  </div>
  <Register v-else />
</template>
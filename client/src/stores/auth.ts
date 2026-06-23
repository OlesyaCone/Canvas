import { defineStore } from "pinia";
import { ref, computed } from "vue";
import type { User } from "../types/index";
import api from "../api/axios";

export const useAuthStore = defineStore("auth", () => {
  const user = ref<User | null>(null);
  const isAuth = ref(false);
  const accessToken = ref<string | null>(null);
  const refreshToken = ref<string | null>(null);

  const userName = computed(() => user.value?.username || "Гость");

  const userAvatar = computed(() => {
  const avatar = user.value?.avatar;
  if (!avatar) return '';
  if (avatar.startsWith('http') || avatar.startsWith('data:')) return avatar;
  return `http://localhost:5000${avatar}`;
});

  const setAuth = (data: {
    user: User;
    accessToken: string;
    refreshToken?: string;
  }) => {
    user.value = data.user;
    isAuth.value = true;
    accessToken.value = data.accessToken;
    localStorage.setItem("accessToken", data.accessToken);
    if (data.refreshToken) {
      refreshToken.value = data.refreshToken;
      localStorage.setItem("refreshToken", data.refreshToken);
    }
  };

  const register = async (
    email: string,
    username: string,
    password: string,
  ) => {
    const { data } = await api.post("/auth/register", {
      email,
      username,
      password,
    });
    if (data.accessToken) setAuth(data);
    return data;
  };

  const login = async (email: string, password: string) => {
    const { data } = await api.post("/auth/login", { email, password });
    if (data.accessToken) setAuth(data);
    return data;
  };

  const completeProfileSetup = async (
    username: string,
    avatar: string | FormData,
  ) => {
    if (avatar instanceof FormData) {
      const { data } = await api.patch("/auth/profile", avatar);
      if (data.user) user.value = data.user;
      return data;
    } else {
      const { data } = await api.patch("/auth/profile", { username, avatar });
      if (data.user) user.value = data.user;
      return data;
    }
  };

  const logout = async () => {
    try {
      await api.post("/auth/logout");
    } catch (e) {}
    user.value = null;
    isAuth.value = false;
    accessToken.value = null;
    refreshToken.value = null;
    localStorage.removeItem("accessToken");
    localStorage.removeItem("refreshToken");
  };

  return {
    user,
    isAuth,
    accessToken,
    refreshToken,
    userName,
    userAvatar,
    setAuth,
    register,
    login,
    logout,
    completeProfileSetup,
  };
});

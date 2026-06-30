import { defineStore } from "pinia";
import { ref, computed } from "vue";
import type { User, AuthResponse, RegisterPayload, LoginPayload, ProfilePayload } from "../types";
import api from "../api/axios";

export const useAuthStore = defineStore("auth", () => {
  const user = ref<User | null>(null);
  const isAuth = ref(false);
  const accessToken = ref<string | null>(null);
  const refreshToken = ref<string | null>(null);

  const userName = computed(() => user.value?.username || "Гость");

  const userAvatar = computed(() => {
    const avatar = user.value?.avatar;
    if (!avatar) return "";
    if (avatar.startsWith("http") || avatar.startsWith("data:")) return avatar;
    return `http://localhost:5000${avatar}`;
  });

  const persistTokens = (access: string, refresh?: string) => {
    localStorage.setItem("accessToken", access);
    if (refresh) localStorage.setItem("refreshToken", refresh);
  };

  const clearTokens = () => {
    localStorage.removeItem("accessToken");
    localStorage.removeItem("refreshToken");
  };

  const setAuth = ({ user: u, accessToken: access, refreshToken: refresh }: AuthResponse) => {
    user.value = u;
    isAuth.value = true;
    accessToken.value = access;
    refreshToken.value = refresh ?? null;
    persistTokens(access, refresh);
  };

  const clearAuth = () => {
    user.value = null;
    isAuth.value = false;
    accessToken.value = null;
    refreshToken.value = null;
    clearTokens();
  };

  const register = async (payload: RegisterPayload) => {
    const { data } = await api.post<AuthResponse>("/auth/register", payload);
    if (data.accessToken) setAuth(data);
    return data;
  };

  const login = async (payload: LoginPayload) => {
    const { data } = await api.post<AuthResponse>("/auth/login", payload);
    if (data.accessToken) setAuth(data);
    return data;
  };

  const completeProfileSetup = async (username: string, avatar: string | FormData) => {
    if (avatar instanceof FormData) {
      avatar.set("username", username);
      const { data } = await api.patch<{ user: User }>("/auth/profile", avatar);
      if (data.user) user.value = data.user;
      return data;
    }

    const { data } = await api.patch<{ user: User }>("/auth/profile", {
      username,
      avatar,
    } as ProfilePayload);
    if (data.user) user.value = data.user;
    return data;
  };

  const logout = async () => {
    try {
      await api.post("/auth/logout");
    } catch {}
    clearAuth();
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

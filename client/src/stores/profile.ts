import { defineStore } from "pinia";
import { ref } from "vue";
import type { ProfileStats } from "../types";
import api from "../api/axios";

export const useProfileStore = defineStore("profile", () => {
  const stats = ref<ProfileStats | null>(null);
  const loading = ref(false);

  const fetchProfileStats = async () => {
    loading.value = true;
    try {
      const { data } = await api.get<ProfileStats>("/auth/profile/stats");
      stats.value = data;
    } catch (e) {
      console.error("Ошибка загрузки профиля:", e);
    } finally {
      loading.value = false;
    }
  };

  const fetchUserProfile = async (userId: string) => {
    loading.value = true;
    try {
      const { data } = await api.get<ProfileStats>(`/auth/profile/${userId}`);
      stats.value = data;
    } catch (e) {
      console.error("Ошибка загрузки профиля:", e);
    } finally {
      loading.value = false;
    }
  };

  return { stats, loading, fetchProfileStats, fetchUserProfile };
});

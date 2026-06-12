import { defineStore } from "pinia";
import { ref } from "vue";
import api from "../api/axios";

export const useProfileStore = defineStore("profile", () => {
  const stats = ref<any>(null);
  const loading = ref(false);

  const fetchProfileStats = async () => {
    loading.value = true;
    try {
      const { data } = await api.get("/auth/profile/stats");
      stats.value = data;
    } catch (e) {
      console.error("Ошибка загрузки профиля:", e);
    } finally {
      loading.value = false;
    }
  };

  return { stats, loading, fetchProfileStats };
});

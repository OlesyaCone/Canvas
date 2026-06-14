import { defineStore } from "pinia";
import { ref } from "vue";
import api from "../api/axios";

export const useNotificationStore = defineStore("notification", () => {
  const notifications = ref<any[]>([]);
  const unreadCount = ref(0);

  const fetchNotifications = async () => {
    const { data } = await api.get("/auth/notifications");
    notifications.value = data;
    unreadCount.value = data.filter((n: any) => !n.read).length;
  };

  const markRead = async () => {
    await api.post("/auth/notifications/read");
    unreadCount.value = 0;
    notifications.value.forEach((n) => (n.read = true));
  };

  return { notifications, unreadCount, fetchNotifications, markRead };
});

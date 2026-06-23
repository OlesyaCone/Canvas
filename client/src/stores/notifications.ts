import { defineStore } from "pinia";
import { ref } from "vue";
import api from "../api/axios";
import { io, Socket } from "socket.io-client";

export const useNotificationStore = defineStore("notification", () => {
  const notifications = ref<any[]>([]);
  const unreadCount = ref(0);
  let socket: Socket | null = null;

  const fetchNotifications = async () => {
    const { data } = await api.get("/auth/notifications");
    notifications.value = data;
    unreadCount.value = data.filter((n: any) => !n.read).length;
  };

  const connectSocket = () => {
    socket = io("http://localhost:5000", {
      auth: { token: localStorage.getItem("accessToken") },
    });
    socket.on("newNotification", (notif) => {
      notifications.value.unshift(notif);
      unreadCount.value++;
    });
  };

  const markRead = async () => {
    await api.post("/auth/notifications/read");
    unreadCount.value = 0;
    notifications.value.forEach((n) => (n.read = true));
  };

  return {
    notifications,
    unreadCount,
    fetchNotifications,
    connectSocket,
    markRead,
  };
});

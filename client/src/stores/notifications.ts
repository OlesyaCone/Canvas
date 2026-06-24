import { defineStore } from "pinia";
import { ref } from "vue";
import type { Notification } from "../types";
import api from "../api/axios";
import { io, type Socket } from "socket.io-client";

export const useNotificationStore = defineStore("notification", () => {
  const notifications = ref<Notification[]>([]);
  const unreadCount = ref(0);
  let socket: Socket | null = null;

  const fetchNotifications = async () => {
    const { data } = await api.get<Notification[]>("/auth/notifications");
    notifications.value = data;
    unreadCount.value = data.filter((n) => !n.read).length;
  };

  const connectSocket = () => {
    socket = io("http://localhost:5000", {
      auth: { token: localStorage.getItem("accessToken") },
    });
    socket.on("newNotification", (notif: Notification) => {
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

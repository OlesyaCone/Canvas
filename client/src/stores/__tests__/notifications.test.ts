import { describe, test, expect, beforeEach, vi } from "vitest";
import { setActivePinia, createPinia } from "pinia";
import { useNotificationStore } from "../notifications";
import { io } from "socket.io-client";

vi.mock("../../api/axios", function () {
  return {
    default: {
      get: vi.fn().mockResolvedValue({ data: [] }),
      post: vi.fn().mockResolvedValue({ data: {} }),
    },
  };
});

vi.mock("socket.io-client", function () {
  return {
    io: vi.fn().mockReturnValue({
      on: vi.fn(),
      emit: vi.fn(),
      disconnect: vi.fn(),
    }),
  };
});

describe("notification store", function () {
  beforeEach(function () {
    setActivePinia(createPinia());
  });

  test("начальное состояние", function () {
    const store = useNotificationStore();

    expect(store.notifications).toEqual([]);
    expect(store.unreadCount).toBe(0);
  });

  test("fetchNotifications загружает уведомления и считает непрочитанные", async function () {
    const store = useNotificationStore();
    const api = await import("../../api/axios");
    (api.default.get as ReturnType<typeof vi.fn>).mockResolvedValueOnce({
      data: [
        { _id: "n1", text: "Привет", read: false },
        { _id: "n2", text: "Пока", read: true },
        { _id: "n3", text: "Ещё", read: false },
      ],
    });

    await store.fetchNotifications();

    expect(store.notifications.length).toBe(3);
    expect(store.unreadCount).toBe(2);
  });

  test("fetchNotifications с пустым ответом", async function () {
    const store = useNotificationStore();
    const api = await import("../../api/axios");
    (api.default.get as ReturnType<typeof vi.fn>).mockResolvedValueOnce({
      data: [],
    });

    await store.fetchNotifications();

    expect(store.notifications.length).toBe(0);
    expect(store.unreadCount).toBe(0);
  });

  test("markRead обнуляет unreadCount и помечает всё прочитанным", async function () {
    const store = useNotificationStore();
    store.notifications = [
      { _id: "n1", text: "a", read: false },
      { _id: "n2", text: "b", read: false },
    ] as any[];
    store.unreadCount = 2;

    await store.markRead();

    expect(store.unreadCount).toBe(0);
    expect(store.notifications[0].read).toBe(true);
    expect(store.notifications[1].read).toBe(true);
  });

  test("connectSocket подключается и слушает newNotification", function () {
    type MockSocket = {
      on: ReturnType<typeof vi.fn>;
      emit: ReturnType<typeof vi.fn>;
      disconnect: ReturnType<typeof vi.fn>;
    };

    const store = useNotificationStore();
    const mockSocket = (io as unknown as () => MockSocket)();

    store.connectSocket();

    expect(io).toHaveBeenCalled();
    expect(mockSocket.on).toHaveBeenCalledWith(
      "newNotification",
      expect.any(Function),
    );
  });
});

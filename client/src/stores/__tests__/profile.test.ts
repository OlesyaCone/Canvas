import { describe, test, expect, beforeEach, vi } from "vitest";
import { setActivePinia, createPinia } from "pinia";
import { useProfileStore } from "../profile";

vi.mock("../../api/axios", function () {
  return {
    default: {
      get: vi.fn().mockResolvedValue({ data: {} }),
    },
  };
});

describe("profile store", function () {
  beforeEach(function () {
    setActivePinia(createPinia());
  });

  test("начальное состояние", function () {
    const store = useProfileStore();

    expect(store.stats).toBeNull();
    expect(store.loading).toBe(false);
  });

  test("fetchProfileStats загружает свою статистику", async function () {
    const store = useProfileStore();
    const api = await import("../../api/axios");
    (api.default.get as ReturnType<typeof vi.fn>).mockResolvedValueOnce({
      data: {
        user: {
          _id: "u1",
          username: "Alice",
          email: "a@a.com",
          avatar: "",
          createdAt: "2024-01-01",
        },
        stats: { testsCreated: 5, testsPassed: 10, groupsCount: 2 },
        publicTests: [{ _id: "t1", title: "Test", likes: 3, dislikes: 0, passes: 5 }],
      },
    });

    await store.fetchProfileStats();

    expect(store.stats!.user.username).toBe("Alice");
    expect(store.stats!.stats.testsCreated).toBe(5);
    expect(store.stats!.publicTests.length).toBe(1);
  });

  test("fetchUserProfile загружает чужую статистику", async function () {
    const store = useProfileStore();
    const api = await import("../../api/axios");
    (api.default.get as ReturnType<typeof vi.fn>).mockResolvedValueOnce({
      data: {
        user: {
          _id: "u2",
          username: "Bob",
          email: "b@b.com",
          avatar: "",
          createdAt: "2024-02-02",
        },
        stats: { testsCreated: 1, testsPassed: 3, groupsCount: 0 },
        publicTests: [],
      },
    });

    await store.fetchUserProfile("u2");

    expect(store.stats!.user.username).toBe("Bob");
    expect(store.stats!.stats.testsPassed).toBe(3);
  });

  test("fetchProfileStats обрабатывает ошибку", async function () {
    const store = useProfileStore();
    const api = await import("../../api/axios");
    const consoleSpy = vi.spyOn(console, "error").mockImplementation(function () {});
    (api.default.get as ReturnType<typeof vi.fn>).mockRejectedValueOnce(new Error("Сеть"));

    await store.fetchProfileStats();

    expect(consoleSpy).toHaveBeenCalled();
    consoleSpy.mockRestore();
  });
});

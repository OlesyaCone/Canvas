import { describe, test, expect, beforeEach, vi } from "vitest";
import { setActivePinia, createPinia } from "pinia";
import { useAuthStore } from "../auth";

vi.mock("../../api/axios", () => ({
  default: {
    post: vi.fn().mockResolvedValue({}),
    get: vi.fn().mockResolvedValue({}),
    patch: vi.fn().mockResolvedValue({}),
  },
}));

describe("auth store", function () {
  beforeEach(function () {
    setActivePinia(createPinia());
  });

  test("начальное состояние — не авторизован", function () {
    const store = useAuthStore();
    expect(store.isAuth).toBe(false);
    expect(store.user).toBeNull();
    expect(store.accessToken).toBeNull();
  });

  test("setAuth устанавливает пользователя и токены", function () {
    const store = useAuthStore();
    const user = {
      _id: "1",
      email: "a@a.com",
      username: "tester",
      avatar: "/ava.jpg",
      myTests: [],
      passedTests: [],
      groups: [],
      createdAt: new Date().toISOString(),
    };

    store.setAuth({
      user: user,
      accessToken: "access123",
      refreshToken: "refresh123",
    });

    expect(store.isAuth).toBe(true);
    expect(store.user?.email).toBe("a@a.com");
    expect(store.accessToken).toBe("access123");
    expect(localStorage.getItem("accessToken")).toBe("access123");
    expect(localStorage.getItem("refreshToken")).toBe("refresh123");
  });

  test("userName возвращает username или 'Гость'", function () {
    const store = useAuthStore();
    expect(store.userName).toBe("Гость");

    store.setAuth({
      user: {
        _id: "1",
        email: "a@a.com",
        username: "tester",
        avatar: "",
        myTests: [],
        passedTests: [],
        groups: [],
        createdAt: new Date().toISOString(),
      },
      accessToken: "token",
    });
    expect(store.userName).toBe("tester");
  });

  test("userAvatar возвращает URL или пустую строку", function () {
    const store = useAuthStore();
    expect(store.userAvatar).toBe("");

    store.setAuth({
      user: {
        _id: "1",
        email: "a@a.com",
        username: "tester",
        avatar: "/uploads/ava.jpg",
        myTests: [],
        passedTests: [],
        groups: [],
        createdAt: new Date().toISOString(),
      },
      accessToken: "token",
    });
    expect(store.userAvatar).toBe("http://localhost:5000/uploads/ava.jpg");
  });

  test("logout очищает состояние", async function () {
    const store = useAuthStore();
    store.setAuth({
      user: {
        _id: "1",
        email: "a@a.com",
        username: "tester",
        avatar: "",
        myTests: [],
        passedTests: [],
        groups: [],
        createdAt: new Date().toISOString(),
      },
      accessToken: "access123",
      refreshToken: "refresh123",
    });

    await store.logout();

    expect(store.isAuth).toBe(false);
    expect(store.user).toBeNull();
    expect(store.accessToken).toBeNull();
    expect(store.refreshToken).toBeNull();
    expect(localStorage.getItem("accessToken")).toBeNull();
    expect(localStorage.getItem("refreshToken")).toBeNull();
  });
});

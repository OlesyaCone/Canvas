import { describe, test, expect, beforeEach, vi } from "vitest";
import { setActivePinia, createPinia } from "pinia";
import { usePublicStore } from "../public";

vi.mock("../../api/axios", function () {
  return {
    default: {
      get: vi.fn().mockResolvedValue({ data: [] }),
      post: vi.fn().mockResolvedValue({ data: {} }),
    },
  };
});

describe("public store", function () {
  beforeEach(function () {
    setActivePinia(createPinia());
  });

  test("начальное состояние", function () {
    const store = usePublicStore();

    expect(store.tests).toEqual([]);
    expect(store.commentsMap).toEqual({});
    expect(store.loading).toBe(false);
  });

  test("fetchPublicTests загружает тесты", async function () {
    const store = usePublicStore();
    const api = await import("../../api/axios");
    (api.default.get as ReturnType<typeof vi.fn>).mockResolvedValueOnce({
      data: [
        {
          _id: "t1",
          title: "Test 1",
          likes: 0,
          dislikes: 0,
          myReaction: null,
          commentsCount: 0,
        },
        {
          _id: "t2",
          title: "Test 2",
          likes: 5,
          dislikes: 1,
          myReaction: "like",
          commentsCount: 3,
        },
      ],
    });

    await store.fetchPublicTests();

    expect(store.tests.length).toBe(2);
    expect(store.tests[0].title).toBe("Test 1");
  });

  test("toggleReaction ставит лайк", async function () {
    const store = usePublicStore();
    store.tests = [
      { _id: "t1", likes: 0, dislikes: 0, myReaction: null },
    ] as any[];

    await store.toggleReaction("t1", "like");

    expect(store.tests[0].myReaction).toBe("like");
    expect(store.tests[0].likes).toBe(1);
  });

  test("toggleReaction меняет лайк на дизлайк", async function () {
    const store = usePublicStore();
    store.tests = [
      { _id: "t1", likes: 1, dislikes: 0, myReaction: "like" },
    ] as any[];

    await store.toggleReaction("t1", "dislike");

    expect(store.tests[0].myReaction).toBe("dislike");
    expect(store.tests[0].likes).toBe(0);
    expect(store.tests[0].dislikes).toBe(1);
  });

  test("toggleReaction убирает реакцию при повторном клике", async function () {
    const store = usePublicStore();
    store.tests = [
      { _id: "t1", likes: 1, dislikes: 0, myReaction: "like" },
    ] as any[];

    await store.toggleReaction("t1", "like");

    expect(store.tests[0].myReaction).toBeNull();
    expect(store.tests[0].likes).toBe(0);
  });

  test("fetchComments загружает комментарии", async function () {
    const store = usePublicStore();
    store.tests = [{ _id: "t1" }] as any[];
    const api = await import("../../api/axios");
    (api.default.get as ReturnType<typeof vi.fn>).mockResolvedValueOnce({
      data: [
        { _id: "c1", text: "Привет", user: { _id: "u1", username: "Alice" } },
        { _id: "c2", text: "Пока", user: { _id: "u2", username: "Bob" } },
      ],
    });

    await store.fetchComments("t1");

    expect(store.commentsMap["t1"].length).toBe(2);
    expect(store.tests[0].commentsCount).toBe(2);
  });

  test("addComment добавляет комментарий", async function () {
    const store = usePublicStore();
    store.tests = [{ _id: "t1", commentsCount: 1 }] as any[];
    const api = await import("../../api/axios");
    (api.default.post as ReturnType<typeof vi.fn>).mockResolvedValueOnce({
      data: {
        _id: "c3",
        text: "Новое",
        user: { _id: "u1", username: "Alice" },
      },
    });

    await store.addComment("t1", "Новое");

    expect(store.commentsMap["t1"].length).toBe(1);
    expect(store.commentsMap["t1"][0].text).toBe("Новое");
    expect(store.tests[0].commentsCount).toBe(2);
  });

  test("getComments возвращает комментарии или пустой массив", function () {
    const store = usePublicStore();
    store.commentsMap["t1"] = [{ _id: "c1", text: "Hi" } as any];

    expect(store.getComments("t1").length).toBe(1);
    expect(store.getComments("t2")).toEqual([]);
  });
});

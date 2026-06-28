import { describe, test, expect, beforeEach, vi } from "vitest";
import { setActivePinia, createPinia } from "pinia";
import { useTestStore } from "../test";

vi.mock("../../api/axios", function () {
  return {
    default: {
      get: vi.fn().mockResolvedValue({ data: [] }),
      post: vi.fn().mockResolvedValue({ data: {} }),
      patch: vi.fn().mockResolvedValue({ data: {} }),
      delete: vi.fn().mockResolvedValue({ data: {} }),
    },
  };
});

describe("test store", function () {
  beforeEach(function () {
    setActivePinia(createPinia());
  });

  test("начальное состояние", function () {
    const store = useTestStore();

    expect(store.myTests).toEqual([]);
    expect(store.passedTests).toEqual([]);
    expect(store.currentTest).toBeNull();
    expect(store.loading).toBe(false);
  });

  test("fetchMyTests загружает мои тесты", async function () {
    const store = useTestStore();
    const api = await import("../../api/axios");
    (api.default.get as ReturnType<typeof vi.fn>).mockResolvedValueOnce({
      data: [
        { _id: "t1", title: "My Test 1" },
        { _id: "t2", title: "My Test 2" },
      ],
    });

    await store.fetchMyTests();

    expect(store.myTests.length).toBe(2);
    expect(store.myTests[0].title).toBe("My Test 1");
  });

  test("fetchPassedTests загружает пройденные тесты", async function () {
    const store = useTestStore();
    const api = await import("../../api/axios");
    (api.default.get as ReturnType<typeof vi.fn>).mockResolvedValueOnce({
      data: [{ _id: "t1", title: "Passed 1" }],
    });

    await store.fetchPassedTests();

    expect(store.passedTests.length).toBe(1);
    expect(store.passedTests[0].title).toBe("Passed 1");
  });

  test("createTest добавляет тест в начало списка", async function () {
    const store = useTestStore();
    store.myTests = [{ _id: "old", title: "Old" }] as any[];

    const api = await import("../../api/axios");
    (api.default.post as ReturnType<typeof vi.fn>).mockResolvedValueOnce({
      data: { _id: "new", title: "New" },
    });

    const result = await store.createTest(new FormData());

    expect(result._id).toBe("new");
    expect(store.myTests.length).toBe(2);
    expect(store.myTests[0]._id).toBe("new");
  });

  test("updateTest обновляет тест в списке", async function () {
    const store = useTestStore();
    store.myTests = [
      { _id: "t1", title: "Old" },
      { _id: "t2", title: "Keep" },
    ] as any[];

    const api = await import("../../api/axios");
    (api.default.patch as ReturnType<typeof vi.fn>).mockResolvedValueOnce({
      data: { _id: "t1", title: "Updated" },
    });

    await store.updateTest("t1", new FormData());

    expect(store.myTests[0].title).toBe("Updated");
    expect(store.myTests[1].title).toBe("Keep");
  });

  test("deleteTest удаляет тест из списка", async function () {
    const store = useTestStore();
    store.myTests = [
      { _id: "t1", title: "Test 1" },
      { _id: "t2", title: "Test 2" },
    ] as any[];

    await store.deleteTest("t1");

    expect(store.myTests.length).toBe(1);
    expect(store.myTests[0]._id).toBe("t2");
  });

  test("fetchTestById загружает тест в currentTest", async function () {
    const store = useTestStore();
    const api = await import("../../api/axios");
    (api.default.get as ReturnType<typeof vi.fn>).mockResolvedValueOnce({
      data: { _id: "t1", title: "Loaded", question: [] },
    });

    const result = await store.fetchTestById("t1");

    expect(store.currentTest!._id).toBe("t1");
    expect(result.title).toBe("Loaded");
  });
});

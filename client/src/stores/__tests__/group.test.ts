import { describe, test, expect, beforeEach, vi } from "vitest";
import { setActivePinia, createPinia } from "pinia";
import { useGroupStore } from "../group";

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

describe("group store", function () {
  beforeEach(function () {
    setActivePinia(createPinia());
  });

  test("начальное состояние", function () {
    const store = useGroupStore();

    expect(store.myGroups).toEqual([]);
    expect(store.currentGroup).toBeNull();
    expect(store.groupTests).toEqual([]);
    expect(store.groupResults).toEqual([]);
    expect(store.testStats).toBeNull();
    expect(store.loading).toBe(false);
  });

  test("fetchMyGroups загружает группы", async function () {
    const store = useGroupStore();
    const api = await import("../../api/axios");
    (api.default.get as ReturnType<typeof vi.fn>).mockResolvedValueOnce({
      data: [
        { _id: "g1", name: "Group 1" },
        { _id: "g2", name: "Group 2" },
      ],
    });

    await store.fetchMyGroups();

    expect(store.myGroups.length).toBe(2);
    expect(store.myGroups[0].name).toBe("Group 1");
  });

  test("fetchMyGroups обрабатывает ошибку", async function () {
    const store = useGroupStore();
    const api = await import("../../api/axios");
    const consoleSpy = vi
      .spyOn(console, "error")
      .mockImplementation(function () {});
    (api.default.get as ReturnType<typeof vi.fn>).mockRejectedValueOnce(
      new Error("Сеть"),
    );

    await store.fetchMyGroups();

    expect(consoleSpy).toHaveBeenCalled();
    consoleSpy.mockRestore();
  });

  test("createGroup добавляет группу в начало списка", async function () {
    const store = useGroupStore();
    store.myGroups = [{ _id: "old", name: "Old" } as any];

    const api = await import("../../api/axios");
    (api.default.post as ReturnType<typeof vi.fn>).mockResolvedValueOnce({
      data: { _id: "new", name: "New" },
    });

    const result = await store.createGroup(new FormData());

    expect(result._id).toBe("new");
    expect(store.myGroups.length).toBe(2);
    expect(store.myGroups[0]._id).toBe("new");
  });

  test("leaveGroup удаляет группу из списка", async function () {
    const store = useGroupStore();
    store.myGroups = [
      { _id: "g1", name: "Group 1" },
      { _id: "g2", name: "Group 2" },
    ] as any[];

    await store.leaveGroup("g1");

    expect(store.myGroups.length).toBe(1);
    expect(store.myGroups[0]._id).toBe("g2");
  });

  test("kickMember удаляет участника из currentGroup", async function () {
    const store = useGroupStore();
    store.currentGroup = {
      _id: "g1",
      members: [
        { _id: "u1", username: "Alice" },
        { _id: "u2", username: "Bob" },
      ],
      moderators: [{ _id: "u2", username: "Bob" }],
    } as any;

    await store.kickMember("g1", "u2");

    expect(store.currentGroup!.members.length).toBe(1);
    expect(store.currentGroup!.moderators.length).toBe(0);
  });

  test("promoteMember добавляет в модераторы", async function () {
    const store = useGroupStore();
    store.currentGroup = {
      _id: "g1",
      members: [],
      moderators: [{ _id: "u1", username: "Alice" }],
    } as any;

    const api = await import("../../api/axios");
    (api.default.post as ReturnType<typeof vi.fn>).mockResolvedValueOnce({
      data: {
        moderators: [
          { _id: "u1", username: "Alice" },
          { _id: "u2", username: "Bob" },
        ],
      },
    });

    await store.promoteMember("g1", "u2");

    expect(store.currentGroup!.moderators.length).toBe(2);
  });

  test("fetchGroupTests загружает тесты группы", async function () {
    const store = useGroupStore();
    const api = await import("../../api/axios");
    (api.default.get as ReturnType<typeof vi.fn>).mockResolvedValueOnce({
      data: [
        { _id: "t1", test: { title: "Test 1" } },
        { _id: "t2", test: { title: "Test 2" } },
      ],
    });

    const result = await store.fetchGroupTests("g1");

    expect(store.groupTests.length).toBe(2);
    expect(result.length).toBe(2);
  });
});

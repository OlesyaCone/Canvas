import { describe, test, expect, beforeEach, vi } from "vitest";
import { mount } from "@vue/test-utils";
import { setActivePinia, createPinia } from "pinia";
import Playing from "../tests/Playing.vue";

vi.mock("../../api/axios", function () {
  return {
    default: {
      get: vi.fn().mockResolvedValue({ data: {} }),
      post: vi.fn().mockResolvedValue({ data: { score: 2, total: 3 } }),
    },
  };
});

vi.mock("vue-router", function () {
  return {
    useRoute: vi.fn().mockReturnValue({ params: {} }),
    useRouter: vi.fn().mockReturnValue({ back: vi.fn(), push: vi.fn() }),
  };
});

function createWrapper() {
  return mount(Playing, {
    props: {
      testId: "t1",
      groupTestId: undefined,
    },
    global: {
      stubs: {
        "router-link": true,
      },
    },
  });
}

describe("Playing", function () {
  beforeEach(function () {
    setActivePinia(createPinia());
  });

  test("показывает загрузку пока тест не загружен", function () {
    const wrapper = createWrapper();
    expect(wrapper.find(".loading").exists()).toBe(true);
    expect(wrapper.text()).toContain("Загрузка теста...");
  });
});

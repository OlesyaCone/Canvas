import { describe, test, expect, beforeEach, vi } from "vitest";
import { mount } from "@vue/test-utils";
import { setActivePinia, createPinia } from "pinia";
import Register from "../auth/Register.vue";

vi.mock("../../api/axios", function () {
  return {
    default: {
      post: vi.fn().mockResolvedValue({ data: {} }),
    },
  };
});

function createWrapper() {
  return mount(Register, {
    global: {
      stubs: {
        "router-link": true,
      },
    },
  });
}

describe("Register", function () {
  beforeEach(function () {
    setActivePinia(createPinia());
  });

  test("по умолчанию режим входа", function () {
    const wrapper = createWrapper();
    expect(wrapper.text()).toContain("Вход");
    expect(wrapper.find('input[type="email"]').exists()).toBe(true);
    expect(wrapper.find('input[type="password"]').exists()).toBe(true);
  });

  test("в режиме входа нет поля username", function () {
    const wrapper = createWrapper();
    expect(wrapper.find('input[placeholder="username"]').exists()).toBe(false);
  });

  test("переключение на регистрацию показывает username", async function () {
    const wrapper = createWrapper();
    await wrapper.find(".auth-link").trigger("click");
    expect(wrapper.text()).toContain("Регистрация");
    expect(wrapper.find('input[placeholder="username"]').exists()).toBe(true);
  });

  test("переключение обратно на вход", async function () {
    const wrapper = createWrapper();
    await wrapper.find(".auth-link").trigger("click");
    await wrapper.find(".auth-link").trigger("click");
    expect(wrapper.text()).toContain("Вход");
  });

  test("кнопка отправки есть", function () {
    const wrapper = createWrapper();
    const btn = wrapper.find(".auth-btn");
    expect(btn.exists()).toBe(true);
    expect(btn.text()).toContain("Войти");
  });

  test("в режиме регистрации кнопка меняет текст", async function () {
    const wrapper = createWrapper();
    await wrapper.find(".auth-link").trigger("click");
    expect(wrapper.find(".auth-btn").text()).toContain("Создать аккаунт");
  });

  test("ошибка не видна изначально", function () {
    const wrapper = createWrapper();
    expect(wrapper.find(".auth-error").exists()).toBe(false);
  });

  test("google кнопка есть", function () {
    const wrapper = createWrapper();
    expect(wrapper.find(".google-btn").exists()).toBe(true);
  });
});

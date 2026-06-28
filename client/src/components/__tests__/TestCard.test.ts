import { describe, test, expect, beforeEach, vi } from "vitest";
import { mount } from "@vue/test-utils";
import { setActivePinia, createPinia } from "pinia";
import TestCard from "../tests/TestCard.vue";
import { useAuthStore } from "../../stores/auth";
import type { Test } from "../../types";

vi.mock("../../api/axios", function () {
  return {
    default: {
      get: vi.fn().mockResolvedValue({ data: {} }),
      post: vi.fn().mockResolvedValue({ data: {} }),
      delete: vi.fn().mockResolvedValue({ data: {} }),
    },
  };
});

const mockTest: Test = {
  _id: "t1",
  title: "Мой первый тест",
  description: "Описание теста",
  users: [],
  visibility: "public",
  author: { _id: "author1", username: "Автор" },
  img: undefined,
  question: [
    { question: "q1", answers: ["a", "b"], correctAnswer: "a" },
    { question: "q2", answers: ["x", "y"], correctAnswer: "y" },
  ],
  likes: 0,
  dislikes: 0,
  passes: 0,
  comments: [],
  commentsCount: 0,
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
};

function createWrapper() {
  return mount(TestCard, {
    props: { test: mockTest },
    global: {
      stubs: {
        "router-link": true,
      },
    },
  });
}

describe("TestCard", function () {
  beforeEach(function () {
    setActivePinia(createPinia());
  });

  test("отображает название теста", function () {
    const wrapper = createWrapper();
    expect(wrapper.text()).toContain("Мой первый тест");
  });

  test("отображает описание", function () {
    const wrapper = createWrapper();
    expect(wrapper.text()).toContain("Описание теста");
  });

  test("отображает количество вопросов", function () {
    const wrapper = createWrapper();
    expect(wrapper.text()).toContain("2 вопрос(ов)");
  });

  test("отображает имя автора", function () {
    const wrapper = createWrapper();
    expect(wrapper.text()).toContain("Автор");
  });

  test("кнопка 'Пройти тест' существует", function () {
    const wrapper = createWrapper();
    expect(wrapper.find(".btn-start").exists()).toBe(true);
  });

  test("эмитит start при клике на кнопку", async function () {
    const wrapper = createWrapper();
    await wrapper.find(".btn-start").trigger("click");
    expect(wrapper.emitted("start")).toBeTruthy();
    expect(wrapper.emitted("start")![0]).toEqual(["t1"]);
  });

  test("кнопки редактирования видны автору", async function () {
    const auth = useAuthStore();
    auth.setAuth({
      user: {
        _id: "author1",
        email: "",
        username: "",
        avatar: "",
        myTests: [],
        passedTests: [],
        groups: [],
        createdAt: "",
      },
      accessToken: "token",
    });

    const wrapper = createWrapper();
    expect(wrapper.find(".test-actions-overlay").exists()).toBe(true);
  });

  test("кнопки редактирования скрыты от не-автора", function () {
    const auth = useAuthStore();
    auth.setAuth({
      user: {
        _id: "other_user",
        email: "",
        username: "",
        avatar: "",
        myTests: [],
        passedTests: [],
        groups: [],
        createdAt: "",
      },
      accessToken: "token",
    });

    const wrapper = createWrapper();
    expect(wrapper.find(".test-actions-overlay").exists()).toBe(false);
  });

  test("эмитит edit при клике на кнопку редактирования", async function () {
    const auth = useAuthStore();
    auth.setAuth({
      user: {
        _id: "author1",
        email: "",
        username: "",
        avatar: "",
        myTests: [],
        passedTests: [],
        groups: [],
        createdAt: "",
      },
      accessToken: "token",
    });

    const wrapper = createWrapper();
    await wrapper.find(".btn-icon-circle").trigger("click");
    expect(wrapper.emitted("edit")).toBeTruthy();
    expect(wrapper.emitted("edit")![0]).toEqual(["t1"]);
  });
});

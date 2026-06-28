import { describe, test, expect, beforeEach, vi } from "vitest";
import { mount } from "@vue/test-utils";
import { setActivePinia, createPinia } from "pinia";
import Creating from "../tests/Creating.vue";

vi.mock("../../api/axios", function () {
  return {
    default: {
      post: vi.fn().mockResolvedValue({ data: {} }),
    },
  };
});

function createWrapper() {
  return mount(Creating, {
    global: {
      stubs: {
        "router-link": true,
      },
    },
  });
}

describe("Creating", function () {
  beforeEach(function () {
    setActivePinia(createPinia());
  });

  test("отображает заголовок", function () {
    const wrapper = createWrapper();
    expect(wrapper.text()).toContain("Создание теста");
  });

  test("кнопка создания заблокирована без названия и вопросов", function () {
    const wrapper = createWrapper();
    const btn = wrapper.find(".btn-primary");
    expect(btn.exists()).toBe(true);
    expect(btn.attributes("disabled")).toBeDefined();
  });

  test("поле названия принимает ввод", async function () {
    const wrapper = createWrapper();
    const input = wrapper.find('input[placeholder="Введите название"]');
    await input.setValue("Мой тест");
    expect((input.element as HTMLInputElement).value).toBe("Мой тест");
  });

  test("поле описания принимает ввод", async function () {
    const wrapper = createWrapper();
    const textarea = wrapper.find('textarea[placeholder="Описание теста"]');
    await textarea.setValue("Описание");
    expect((textarea.element as HTMLTextAreaElement).value).toBe("Описание");
  });

  test("добавление варианта ответа", async function () {
    const wrapper = createWrapper();
    const addBtn = wrapper.find(".add-question-form .btn-add");
    await addBtn.trigger("click");
    const inputs = wrapper.findAll(".add-question-form .answer-row input");
    expect(inputs.length).toBe(3);
  });

  test("удаление варианта ответа", async function () {
    const wrapper = createWrapper();
    const removeBtn = wrapper.find(".add-question-form .btn-icon");
    await removeBtn.trigger("click");
    const inputs = wrapper.findAll(".add-question-form .answer-row input");
    expect(inputs.length).toBe(1);
  });

  test("добавление вопроса", async function () {
    const wrapper = createWrapper();
    const questionInput = wrapper.find(
      '.add-question-form input[placeholder="Введите вопрос"]',
    );
    const correctInput = wrapper.find(
      '.add-question-form input[placeholder="Введите правильный ответ"]',
    );
    await questionInput.setValue("Вопрос 1");
    await correctInput.setValue("a");

    const buttons = wrapper.findAll(".add-question-form .btn-add");
    await buttons[buttons.length - 1].trigger("click");

    const questions = wrapper.findAll(".question-card");
    expect(questions.length).toBe(1);
    expect(wrapper.text()).toContain("Вопрос 1");
  });
});

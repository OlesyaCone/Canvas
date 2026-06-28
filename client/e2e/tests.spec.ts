import { test, expect } from "@playwright/test";

test("создание и прохождение теста", async ({ page }) => {
  await page.goto("/");

  await page.fill('input[placeholder="user@mail.com"]', "gizatullin.serzh1976@mail.ru");
  await page.fill('input[placeholder="••••••"]', "123321");
  await page.click("text=Войти");

  await expect(page.locator(".page-title")).toBeVisible({ timeout: 10000 });

  await page.click("text=Составить тест");
  await page.fill('input[placeholder="Введите название"]', "E2E Test");
  await page.fill('.add-question-form input[placeholder="Введите вопрос"]', "2+2?");
  await page.fill('.add-question-form input[placeholder="Введите правильный ответ"]', "4");
  await page.locator(".add-question-form .btn-add").last().click();
  await page.click("text=Создать тест");

  await expect(page.locator("text=E2E Test").first()).toBeVisible({
    timeout: 5000,
  });
  await page.locator(".btn-start").first().click();
  await page.locator(".answer-option").first().click();
  await page.locator("text=Отправить ответы").click();

  await expect(page.locator("text=Результат")).toBeVisible({ timeout: 5000 });
});

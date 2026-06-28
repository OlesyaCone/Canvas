import { test, expect } from "@playwright/test";

test("создание группы", async ({ page }) => {
  await page.goto("/");

  await page.fill('input[placeholder="user@mail.com"]', "gizatullin.serzh1976@mail.ru");
  await page.fill('input[placeholder="••••••"]', "123321");
  await page.click("text=Войти");

  await expect(page.locator(".page-title")).toBeVisible({ timeout: 10000 });

  await page.click("text=Мои группы");
  await page.click("text=Создать группу");
  await page.fill('input[placeholder="Введите название"]', "E2E Group");
  await page.click("text=Создать");

  await expect(page.locator("text=E2E Group")).toBeVisible({ timeout: 5000 });
});

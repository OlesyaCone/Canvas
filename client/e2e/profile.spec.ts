import { test, expect } from "@playwright/test";

test("редактирование профиля", async ({ page }) => {
  await page.goto("/");

  await page.fill(
    'input[placeholder="user@mail.com"]',
    "gizatullin.serzh1976@mail.ru",
  );
  await page.fill('input[placeholder="••••••"]', "123321");
  await page.click("text=Войти");
  await expect(page.locator(".page-title")).toBeVisible({ timeout: 10000 });

  await page.click(".setting-btn");
  await expect(page.locator("text=Настройки профиля")).toBeVisible({
    timeout: 5000,
  });

  const usernameInput = page.locator('input[placeholder="Введите имя"]');
  await usernameInput.clear();
  await usernameInput.fill("TestUser E2E");

  await page.click("text=Сохранить");

  await expect(page.locator("text=TestUser E2E").first()).toBeVisible({
    timeout: 5000,
  });
});

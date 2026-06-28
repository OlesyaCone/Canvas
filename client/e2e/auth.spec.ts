import { test, expect } from "@playwright/test";

test("вход в аккаунт", async ({ page }) => {
  await page.goto("/");

  await page.fill('input[placeholder="user@mail.com"]', "gizatullin.serzh1976@mail.ru");
  await page.fill('input[placeholder="••••••"]', "123321");
  await page.click("text=Войти");

  await expect(page.locator(".page-title")).toBeVisible({ timeout: 10000 });
});

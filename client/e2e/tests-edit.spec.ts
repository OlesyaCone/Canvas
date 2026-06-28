import { test, expect } from "@playwright/test";

test("редактирование теста", async ({ page }) => {
  await page.goto("/");

  await page.fill(
    'input[placeholder="user@mail.com"]',
    "gizatullin.serzh1976@mail.ru",
  );
  await page.fill('input[placeholder="••••••"]', "123321");
  await page.click("text=Войти");
  await expect(page.locator(".page-title")).toBeVisible({ timeout: 10000 });

  const editBtn = page
    .locator(".test-actions-overlay .btn-icon-circle")
    .first();
  await editBtn.hover();
  await editBtn.click();

  await expect(page.locator("text=Редактирование теста")).toBeVisible({
    timeout: 5000,
  });

  const titleInput = page.locator('input[type="text"]').first();
  await titleInput.clear();
  await titleInput.fill("E2E Edited Test");

  await page.click("text=Сохранить изменения");

  await expect(page.locator(".page-title")).toBeVisible({ timeout: 5000 });
  await expect(page.locator("text=E2E Edited Test").first()).toBeVisible({
    timeout: 5000,
  });
});

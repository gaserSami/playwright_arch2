import { expect } from "@playwright/test";
import { test } from "../../../utils/test";
import * as locators from "../../../utils/locators";
import "../setup";

test("should be able to write with row write", async ({ page }) => {
  // Get the frame
  const frame = await locators.frame(page);

  // Perform keyword search and like the first keyword
  await frame.getByPlaceholder('Keyword(s)').fill('food');
  await frame.getByPlaceholder('Keyword(s)').press('Enter');
  await frame.getByRole('button', { name: 'Search' }).click();
  // selecting all should have no effect
  await frame.getByRole("row").nth(0).getByRole("cell").nth(0).click();
  const expectedKeyword = await frame.getByRole('row').nth(1).getByRole('cell').nth(1).textContent() || '2124';
  await frame.getByRole('row').nth(1).getByRole('button').nth(0).click();

  await frame.getByRole("button", { name: "View advanced settings" }).click();

  // Verify the keyword is added to "My Keywords" tab
  await expect(frame.locator('span').filter({ hasText: expectedKeyword }).first()).toBeVisible();
  await expect(frame.locator('span').first()).toHaveCount(1);
});

test("should be able to select rows and write using floating write", async ({ page }) => {
  // Get the frame
  const frame = await locators.frame(page);

  // Perform keyword search
  await frame.getByPlaceholder('Keyword(s)').fill('food');
  await frame.getByPlaceholder('Keyword(s)').press('Enter');
  await frame.getByRole('button', { name: 'Search' }).click();

  // Select the first cell of the first row (select all)
  await frame.getByRole("row").nth(0).getByRole("cell").nth(0).click();
  // deselecting one should work correctly that it should not be included in the write
  await frame.getByRole("row").nth(1).getByRole("cell").nth(0).click();

  // Create an array of expected keywords from all rows starting from index 1
  const rowCount = await frame.getByRole('row').count();
  const expectedKeywords = [];
  for (let i = 2; i < rowCount; i++) {
    const keyword = await frame.getByRole('row').nth(i).getByRole('cell').nth(1).textContent();
    if (keyword) {
      expectedKeywords.push(keyword);
    }
  }

  // Click the button in the first row
  await frame.locator('.Polaris-BulkActions__ButtonGroupWrapper').locator("button").nth(0).click();

  // Click on "View advanced settings"
  await frame.getByRole("button", { name: "View advanced settings" }).click();

  // Verify the keywords are added to "My Keywords" tab
  await expect(frame.locator('.Polaris-TextField').locator("span").locator("button")).toHaveCount(expectedKeywords.length);
  for (const keyword of expectedKeywords) {
    await expect(frame.locator('span').filter({ hasText: keyword }).first()).toBeVisible();
  }
});
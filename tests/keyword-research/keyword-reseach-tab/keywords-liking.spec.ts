import { expect } from "@playwright/test";
import { test } from "../../../utils/test";
import * as locators from "../../../utils/locators";
import "../setup";

test("should be able to select results row and like it from floating like", async ({ page }) => {
  // Get the frame
  const frame = await locators.frame(page);

  // if there is any keyword in the my keywords tab, delete it
  await frame.getByRole('tab', { name: 'My Keywords' }).click();
  await frame.getByLabel("Count").waitFor({ state: "visible" });
  if (await frame.getByRole("row").count() > 0) {
    await frame.locator('thead').locator('tr').locator('th').nth(0).click();
    await frame.locator('.Polaris-BulkActions__ButtonGroupWrapper').locator("button").nth(1).click();
    await expect(frame.getByRole("row")).toHaveCount(0);
  }
  await frame.getByRole('tab', { name: 'Keyword Research' }).click();

  // Perform actions
  await frame.getByPlaceholder('Keyword(s)').fill('food');
  await frame.getByPlaceholder('Keyword(s)').press('Enter');
  await frame.getByRole('button', { name: 'Search' }).click();
  await expect(frame.locator('.Polaris-BulkActions__ButtonGroupWrapper')).not.toBeVisible();
  await frame.getByRole('row').nth(1).click();
  await expect(frame.locator('.Polaris-BulkActions__ButtonGroupWrapper')).toBeVisible();

  // selecting and deselecting should have no effect
  await frame.getByRole("row").nth(2).click();
  await frame.getByRole("row").nth(2).click();

  // like the keyword
  await frame.locator('.Polaris-BulkActions__ButtonGroupWrapper').locator("button").nth(1).click();
  const expectedKeyword = await frame.getByRole('row').nth(1).getByRole('cell').nth(1).textContent() || '2124';
  await frame.getByRole('tab', { name: 'My Keywords' }).click();
  await expect(frame.getByRole("row")).toHaveCount(2);
  await expect(await frame.getByRole('row').nth(1).getByRole('cell').nth(1).textContent()).toEqual(expectedKeyword);
});

test("should be able to like keyword row like", async ({ page }) => {
  // Get the frame
  const frame = await locators.frame(page);

  // Navigate to "My Keywords" tab and delete any existing keywords
  await frame.getByRole('tab', { name: 'My Keywords' }).click();
  await frame.getByLabel("Count").waitFor({ state: "visible" });
  if (await frame.getByRole("row").count() > 0) {
    await frame.locator('thead').locator('tr').locator('th').nth(0).click();
    await frame.locator('.Polaris-BulkActions__ButtonGroupWrapper').locator("button").nth(1).click();
    await expect(frame.getByRole("row")).toHaveCount(0);
  }

  // Navigate to "Keyword Research" tab
  await frame.getByRole('tab', { name: 'Keyword Research' }).click();

  // Perform keyword search and like the first keyword
  await frame.getByPlaceholder('Keyword(s)').fill('food');
  await frame.getByPlaceholder('Keyword(s)').press('Enter');
  await frame.getByRole('button', { name: 'Search' }).click();
  await frame.getByRole("row").nth(0).getByRole("cell").nth(0).click();
  await frame.getByRole('row').nth(1).getByRole('button').nth(1).click();
  const expectedKeyword = await frame.getByRole('row').nth(1).getByRole('cell').nth(1).textContent() || '2124';

  // Verify the keyword is added to "My Keywords" tab
  await frame.getByRole('tab', { name: 'My Keywords' }).click();
  await expect(frame.getByRole("row")).toHaveCount(2);
  await expect(await frame.getByRole('row').nth(1).getByRole('cell').nth(1).textContent()).toEqual(expectedKeyword);
});
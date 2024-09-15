import { expect } from "@playwright/test";
import { test } from "../../../utils/test";
import * as locators from "../../../utils/locators";
import "../setup";

test("selections should be reseted when the use researches a new keyword", async ({ page }) => {
  const frame = await locators.frame(page);
  const keyword = "food";
  const keyword2 = " gym";
  await frame.getByPlaceholder('Keyword(s)').fill(keyword);
  await frame.getByPlaceholder('Keyword(s)').press("Enter");
  await frame.getByRole("button", { name: "Search" }).click();
  await frame.getByRole("row").nth(0).waitFor({ state: "visible" });
  await frame.getByRole("row").nth(0).getByRole("cell").nth(0).click();
  // research
  await frame.getByLabel("Remove "+ keyword).click();
  await frame.getByPlaceholder('Keyword(s)').fill(keyword2);
  await frame.getByPlaceholder('Keyword(s)').press("Enter");
  await frame.getByRole("button", { name: "Search" }).click();
  await frame.getByRole("row").nth(0).waitFor({ state: "visible" });
  const expectedKeyword = await frame.getByRole('row').nth(1).getByRole('cell').nth(1).textContent() || '2124';
  await frame.getByRole("row").nth(1).getByRole("cell").nth(0).click();
  await frame.locator(".Polaris-BulkActions__ButtonGroupWrapper").locator("button").nth(0).click();
  await frame.getByRole("button", { name: "View advanced settings" }).click();

  // Verify the keyword is added to "My Keywords" tab
  await expect(frame.locator('span').filter({ hasText: expectedKeyword }).first()).toBeVisible();
  await expect(frame.locator('span').first()).toHaveCount(1);
});

test.fail("selections across moving between pages", async ({ page }) => {
  // either selections reset or the old selections are maintained
});

test.fixme("number of selections should be displayed correctly", async ({ page }) => {
  const frame = await locators.frame(page);
  const keyword = "food";
  const keyword2 = "gym";
  
  await frame.getByPlaceholder('Keyword(s)').fill(keyword);
  await frame.getByPlaceholder('Keyword(s)').press("Enter");
  await frame.getByRole("button", { name: "Search" }).click();
  await frame.getByRole("row").nth(0).waitFor({ state: "visible" });

  // Corrected expect statement
  await expect(await frame.getByRole("row").nth(0).getByRole("cell").nth(1).textContent()).toEqual("Keyword");

  await frame.getByRole("row").nth(0).getByRole("cell").nth(0).click();
  await frame.getByText(/20 selected/).waitFor({ state: "visible" });
  await frame.getByRole("row").nth(1).getByRole("cell").nth(0).click();
  await frame.getByText(/19 selected/).waitFor({ state: "visible" });
  // await frame.getByText('Select all 20 keywords19').click();
  await frame.getByRole("row").nth(0).getByRole("cell").nth(0).click();

  // Corrected expect statement
  await expect(await frame.getByRole("row").nth(0).getByRole("cell").nth(1).textContent()).toEqual("Keyword");

  await frame.getByRole("row").nth(0).getByRole("cell").nth(0).click();
  await frame.getByLabel("Remove " + keyword).click();
  await frame.getByPlaceholder('Keyword(s)').fill(keyword2);
  await frame.getByRole("row").nth(0).waitFor({ state: "visible" });

  // Corrected expect statement
  await expect(await frame.getByRole("row").nth(0).getByRole("cell").nth(1).textContent()).toEqual("Keyword");
});
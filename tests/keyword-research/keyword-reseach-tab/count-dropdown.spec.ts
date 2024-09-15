import { expect } from "@playwright/test";
import { test } from "../../../utils/test";
import * as locators from "../../../utils/locators";
import { loadGeoTargets } from "../../../utils/helpers";
import "../setup";

test("should be able to select count with mouse (UI, Functionality)", async ({ page }) => {
  const frame = await locators.frame(page);
  const keyword = "food";
  await frame.getByPlaceholder('Keyword(s)').fill(keyword);
  await frame.getByPlaceholder('Keyword(s)').press("Enter");
  await frame.getByRole("button", { name: "Search" }).click();
  await frame.getByRole("row").nth(0).waitFor({ state: "visible" });

  await frame.getByLabel("Count").click();
  await frame.getByLabel("Count").selectOption("500");
  await frame.getByRole("row").nth(0).waitFor({ state: "visible" , timeout: 50000});
  await expect(frame.locator('span').filter({ hasText: /^500$/ })).toBeVisible();
});

test("should check if each count dropdown option has the correct value", async ({ page }) => {
  const frame = await locators.frame(page);
  const keyword = "food";
  await frame.getByPlaceholder('Keyword(s)').fill(keyword);
  await frame.getByPlaceholder('Keyword(s)').press("Enter");
  await frame.getByRole("button", { name: "Search" }).click();
  await frame.getByRole("row").nth(0).waitFor({ state: "visible" });

  // Click on the dropdown to display all options
  await frame.getByLabel("Count").click();

  // Get all options from the dropdown
  const options = await frame.getByLabel("Count").locator('option');
  const optionCount = await options.count();

  // Loop through each option in the dropdown
  for (let i = 0; i < optionCount; i++) {
    const optionText = await options.nth(i).textContent();
    const optionValue = await options.nth(i).getAttribute('value');

    // Validate that the option text and value are the same
    expect(optionValue).toEqual(optionText);
  }
});

test("should be able to select a count option using keyboard (UI, functionality)", async ({ page }) => {
  const frame = await locators.frame(page);
  const keyword = "food";
  await frame.getByPlaceholder('Keyword(s)').fill(keyword);
  await frame.getByPlaceholder('Keyword(s)').press("Enter");
  await frame.getByRole("button", { name: "Search" }).click();
  await frame.getByRole("row").nth(0).waitFor({ state: "visible" });

  await frame.getByLabel("Count").click();
  await frame.getByLabel("Count").press("ArrowUp");
  await frame.getByLabel("Count").press("ArrowDown");
  await frame.getByLabel("Count").press("ArrowDown");
  await frame.getByLabel("Count").press("Enter");
  // UI
  await expect(await frame.locator('span').filter({ hasText: /^50$/ })).toBeVisible();
  // functionality
  await frame.getByRole("row").nth(0).waitFor({ state: "visible" });
  await expect(await frame.getByRole("row").count()).toEqual(51);
});

test("should be able to select a count option using search (UI, Functionality)", async ({ page }) => {
  const frame = await locators.frame(page);
  const keyword = "food";
  await frame.getByPlaceholder('Keyword(s)').fill(keyword);
  await frame.getByPlaceholder('Keyword(s)').press("Enter");
  await frame.getByRole("button", { name: "Search" }).click();
  await frame.getByRole("row").nth(0).waitFor({ state: "visible" });

  await frame.getByLabel("Count").click();
  await frame.getByLabel("Count").press("1");
  await frame.getByLabel("Count").press("2");
  await frame.getByLabel("Count").press("5");
  await frame.getByLabel("Count").press("Enter");
  await expect(await frame.locator('span').filter({ hasText: /^50$/ })).toBeVisible();
  // functionality
  await frame.getByRole("row").nth(0).waitFor({ state: "visible" });
  await expect(await frame.getByRole("row").count()).toEqual(51);
});

test("should be able to select a count option by using left and right keys (UI, Functionality)", async ({ page }) => {
  const frame = await locators.frame(page);
  const keyword = "food";
  await frame.getByPlaceholder('Keyword(s)').fill(keyword);
  await frame.getByPlaceholder('Keyword(s)').press("Enter");
  await frame.getByRole("button", { name: "Search" }).click();
  await frame.getByRole("row").nth(0).waitFor({ state: "visible" });

  await frame.getByLabel("Count").press("ArrowLeft");
  // UI
  await expect(frame.locator('span').filter({ hasText: /^10$/ })).toBeVisible();
  // functionality
  await frame.getByRole("row").nth(0).waitFor({ state: "visible" });
  await expect(await frame.getByRole("row").count()).toEqual(11);
});

test("should be able to select a count option by using up and down keys (UI, Functionality)", async ({ page }) => {
  const frame = await locators.frame(page);
  const keyword = "food";
  await frame.getByPlaceholder('Keyword(s)').fill(keyword);
  await frame.getByPlaceholder('Keyword(s)').press("Enter");
  await frame.getByRole("button", { name: "Search" }).click();
  await frame.getByRole("row").nth(0).waitFor({ state: "visible" });

  await frame.getByLabel("Count").press("ArrowUp");
  // UI
  await expect(await frame.locator('span').filter({ hasText: /^10$/ })).toBeVisible();
  // functionality
  await frame.getByRole("row").nth(0).waitFor({ state: "visible" });
  await expect(await frame.getByRole("row").count()).toEqual(11);
});
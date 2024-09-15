import { expect } from "@playwright/test";
import { test } from "../../../utils/test";
import * as locators from "../../../utils/locators";
import { loadGeoTargets } from "../../../utils/helpers";
import "../setup";

test("should be able to select country with mouse", async ({ page }) => {
  const frame = await locators.frame(page);
  await frame.getByRole("combobox").nth(0).click();
  await frame.getByRole("combobox").nth(0).selectOption("American Samoa");
  await expect(frame.locator("span").getByText(/American Samoa/)).toBeVisible();
});

test("should check if each dropdown option has the correct value", async ({ page }) => {
  // Load the geo targets from the CSV file
  const geoTargets = await loadGeoTargets('resources/geotargets-2024-08-13.csv');

  // Get the frame and dropdown
  const frame = await locators.frame(page);
  const countryBox = await frame.getByRole("combobox").nth(0);

  // Click on the dropdown to display all options
  await countryBox.click();

  // Get all options from the dropdown
  const options = await countryBox.locator('option');
  const optionCount = await options.count();

  // Loop through each option in the dropdown
  for (let i = 0; i < optionCount; i++) {
    const optionText = await options.nth(i).textContent();
    const optionValue = await options.nth(i).getAttribute('value');

    // Find the corresponding target from the CSV file
    const matchingTarget = geoTargets.find(target => target["Name"] === optionText);

    // If the option exists in the CSV file, validate its value
    if (matchingTarget) {
      expect(optionValue).toEqual(matchingTarget["Criteria ID"]);
    } else {
      console.warn(`Option ${optionText} not found in the CSV file`);
    }
  }
});

test("should be able to select an option using keyboard", async ({ page }) => {
  const frame = await locators.frame(page);
  await frame.getByRole("combobox").nth(0).click();
  await frame.getByRole("combobox").nth(0).press("ArrowUp");
  await frame.getByRole("combobox").nth(0).press("ArrowUp");
  await frame.getByRole("combobox").nth(0).press("Enter");
  await expect(frame.locator("span").getByText(/United Arab Emirates/)).toBeVisible();
  await frame.getByRole("combobox").nth(0).click();
  await frame.getByRole("combobox").nth(0).press("ArrowDown");
  await frame.getByRole("combobox").nth(0).press("Enter");
  await expect(frame.locator("span").getByText(/United Kingdom/)).toBeVisible();
});

test("should be able to select an option using search", async ({ page }) => {
  const frame = await locators.frame(page);
  await frame.getByRole("combobox").nth(0).click();
  await frame.getByRole("combobox").nth(0).press("u");
  await frame.getByRole("combobox").nth(0).press("n");
  await frame.getByRole("combobox").nth(0).press("a");
  await frame.getByRole("combobox").nth(0).press("b");
  await frame.getByRole("combobox").nth(0).press("Enter");
  await expect(frame.locator("span").getByText(/Bahrain/)).toBeVisible();
});

test("should be able to select an option by using left and right keys", async ({ page }) => {
  const frame = await locators.frame(page);
  await frame.getByRole("combobox").nth(0).press("ArrowRight");
  await frame.getByRole("combobox").nth(0).press("ArrowRight");
  await frame.getByRole("combobox").nth(0).press("ArrowLeft");
  await frame.getByRole("combobox").nth(0).press("ArrowLeft");
  await frame.getByRole("combobox").nth(0).press("ArrowLeft");
  await expect(frame.locator("span").getByText(/United Kingdom/)).toBeVisible();
});

test("should be able to select an option by using up and down keys", async ({ page }) => {
  const frame = await locators.frame(page);
  await frame.getByRole("combobox").nth(0).press("ArrowDown");
  await frame.getByRole("combobox").nth(0).press("ArrowDown");
  await frame.getByRole("combobox").nth(0).press("ArrowUp");
  await frame.getByRole("combobox").nth(0).press("ArrowUp");
  await frame.getByRole("combobox").nth(0).press("ArrowUp");
  await expect(frame.locator("span").getByText(/United Kingdom/)).toBeVisible();
});

test("should be able to select language with mouse", async ({ page }) => {
  const frame = await locators.frame(page);
  await frame.getByRole("combobox").nth(1).click();
  await frame.getByRole("combobox").nth(1).selectOption("Arabic");
  await expect(frame.locator("span").getByText(/Arabic/)).toBeVisible();
});

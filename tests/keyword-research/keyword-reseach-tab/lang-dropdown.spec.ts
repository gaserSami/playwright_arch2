import { expect } from "@playwright/test";
import { test } from "../../../utils/test";
import * as locators from "../../../utils/locators";
import { loadLangTargets } from "../../../utils/helpers";
import "../setup";

test("should check if each dropdown option has the correct value", async ({ page }) => {
  // Load the lang targets from the CSV file
  const langTargets = await loadLangTargets('resources/languagecodes.csv');

  // Get the frame and dropdown
  const frame = await locators.frame(page);
  const langBox = await frame.getByRole("combobox").nth(1);

  // Click on the dropdown to display all options
  await langBox.click();

  // Get all options from the dropdown
  const options = await langBox.locator('option');
  const optionCount = await options.count();

  // Loop through each option in the dropdown
  for (let i = 0; i < optionCount; i++) {
    const optionText = await options.nth(i).textContent();
    const optionValue = await options.nth(i).getAttribute('value');

    // Find the corresponding target from the CSV file
    const matchingTarget = langTargets.find(target => target["Language name"] === optionText);

    // If the option exists in the CSV file, validate its value
    if (matchingTarget) {
      expect(optionValue).toEqual(matchingTarget["Criterion ID"]);
    } else {
      console.warn(`Option ${optionText} not found in the CSV file`);
    }
  }
});

test("should be able to select an option using keyboard", async ({ page }) => {
  const frame = await locators.frame(page);
  await frame.getByRole("combobox").nth(1).click();
  await frame.getByRole("combobox").nth(1).press("ArrowUp");
  await frame.getByRole("combobox").nth(1).press("ArrowUp");
  await frame.getByRole("combobox").nth(1).press("Enter");
  await expect(frame.locator("span").getByText(/Danish/)).toBeVisible();
  await frame.getByRole("combobox").nth(1).click();
  await frame.getByRole("combobox").nth(1).press("ArrowDown");
  await frame.getByRole("combobox").nth(1).press("Enter");
  await expect(frame.locator("span").getByText(/Dutch/)).toBeVisible();
});

test("should be able to select an option using search", async ({ page }) => {
  const frame = await locators.frame(page);
  await frame.getByRole("combobox").nth(1).click();
  await frame.getByRole("combobox").nth(1).press("e");
  await frame.getByRole("combobox").nth(1).press("a");
  await frame.getByRole("combobox").nth(1).press("r");
  await frame.getByRole("combobox").nth(1).press("s");
  await frame.getByRole("combobox").nth(1).press("Enter");
  await expect(frame.locator("span").getByText(/serbian/)).toBeVisible();
});

test("should be able to change an option by using left and right keys", async ({ page }) => {
  const frame = await locators.frame(page);
  await frame.getByRole("combobox").nth(1).press("ArrowRight");
  await frame.getByRole("combobox").nth(1).press("ArrowRight");
  await frame.getByRole("combobox").nth(1).press("ArrowLeft");
  await frame.getByRole("combobox").nth(1).press("ArrowLeft");
  await frame.getByRole("combobox").nth(1).press("ArrowLeft");
  await expect(frame.locator("span").getByText(/Dutch/)).toBeVisible();
});

test("should be able to change an option by using up and down keys", async ({ page }) => {
  const frame = await locators.frame(page);
  await frame.getByRole("combobox").nth(1).press("ArrowDown");
  await frame.getByRole("combobox").nth(1).press("ArrowDown");
  await frame.getByRole("combobox").nth(1).press("ArrowUp");
  await frame.getByRole("combobox").nth(1).press("ArrowUp");
  await frame.getByRole("combobox").nth(1).press("ArrowUp");
  await expect(frame.locator("span").getByText(/Dutch/)).toBeVisible();
});
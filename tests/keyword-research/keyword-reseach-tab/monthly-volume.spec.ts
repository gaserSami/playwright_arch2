import { expect } from "@playwright/test";
import { test } from "../../../utils/test";
import * as locators from "../../../utils/locators";
import "../setup";

test("Monthly volume should be 0 initially", async ({ page }) => {
  // Get the frame
  const frame = await locators.frame(page);

  // Perform actions
  await frame.getByPlaceholder('Keyword(s)').fill('food');
  await frame.getByPlaceholder('Keyword(s)').press('Enter');
  await frame.getByRole('button', { name: 'Search' }).click();
  await expect(frame.getByLabel('Keyword Research')).toContainText("0.00");
});

test("Monthly volume should be updated correctly on selecting/deselecting keywords", async ({ page }) => {
  // Get the frame
  const frame = await locators.frame(page);

  // Perform actions
  await frame.getByPlaceholder('Keyword(s)').fill('food');
  await frame.getByPlaceholder('Keyword(s)').press('Enter');
  await frame.getByRole('button', { name: 'Search' }).click();

  // Wait for rows to be present
  await frame.getByRole("row").nth(0).waitFor({ state: "visible" });

  // Function to get the total volume from selected rows
  const getTotalVolume = async () => {
    const rowCount = await frame.getByRole('row').count();
    let totalVolume = 0;
    for (let i = 0; i < rowCount; i++) {
      const volumeText = await frame.getByRole('row').nth(i).getByRole('cell').nth(2).textContent();
      const volume = parseInt(volumeText.replace(/,/g, ''));
      totalVolume += volume;
    }
    return totalVolume;
  };

  // Select all rows and check the total volume
  await frame.locator('thead').locator('tr').locator('th').nth(0).click();
  let expectedTotalVolume = await getTotalVolume();
  let displayedTotalVolume = await frame.getByLabel('Keyword Research').textContent();
  await expect(parseInt(displayedTotalVolume.replace(/,/g, ''))).toEqual(expectedTotalVolume);

  // Deselect all rows and check the total volume
  await frame.getByText('Deselect all 20 keywords20').click();
  await expect(frame.getByLabel('Keyword Research')).toContainText("0.00");

  // Select the first row and check the total volume
  await frame.getByRole('row').nth(1).click();
  const firstRowVolume = await frame.getByRole('row').nth(1).getByRole('cell').nth(2).textContent();
  await expect(frame.getByLabel('Keyword Research')).toContainText(firstRowVolume);

  // Deselect the first row and check the total volume
  await frame.getByRole('row').nth(1).click();
  await expect(frame.getByLabel('Keyword Research')).toContainText("0.00");
});

test("should reset on search", async ({ page }) => {
  // Get the frame
  const frame = await locators.frame(page);

  // Perform actions
  await frame.getByPlaceholder('Keyword(s)').fill('food');
  await frame.getByPlaceholder('Keyword(s)').press('Enter');
  await frame.getByRole('button', { name: 'Search' }).click();
  await expect(frame.getByLabel('Keyword Research')).toContainText("0.00");

  // Select a row
  await frame.getByRole('row').nth(1).click();
  const firstRowVolume = await frame.getByRole('row').nth(1).getByRole('cell').nth(2).textContent();
  await expect(frame.getByLabel('Keyword Research')).toContainText(firstRowVolume);

  // Perform new search
  await frame.getByLabel("Remove " + "food").click();
  await frame.getByPlaceholder('Keyword(s)').fill('shrimp');
  await frame.getByPlaceholder('Keyword(s)').press('Enter');
  await frame.getByRole('button', { name: 'Search' }).click();
  await expect(frame.getByLabel('Keyword Research')).toContainText("0.00");
});
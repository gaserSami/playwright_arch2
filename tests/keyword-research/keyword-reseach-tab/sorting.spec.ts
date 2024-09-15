import { expect } from "@playwright/test";
import { test } from "../../../utils/test";
import * as locators from "../../../utils/locators";
import "../setup";

test("sorting should be across all the pages keyword (Asc order)", async ({ page }) => {
  // Get the frame
  const frame = await locators.frame(page);

  // Perform actions
  await frame.getByPlaceholder('Keyword(s)').fill('food');
  await frame.getByPlaceholder('Keyword(s)').press('Enter');
  await frame.getByRole('button', { name: 'Search' }).click();
  await frame.getByRole("row").nth(1).waitFor({ state: "visible" });

  // Get the total number of rows
  let previousKeyword = await frame.getByRole('row').nth(1).getByRole('cell').nth(1).textContent();
  let rowCount = await frame.getByRole('row').count();
  console.log(`Initial keyword: ${previousKeyword}`);

  // Helper function to compare keywords
  const compareKeywords = (a, b) => {
    return a.localeCompare(b, undefined, { numeric: true, sensitivity: 'base' });
  };

  for (let i = 2; i < rowCount; i++) {
    const currentKeyword = await frame.getByRole('row').nth(i).getByRole('cell').nth(1).textContent();
    console.log(`Comparing: ${previousKeyword} with ${currentKeyword}`);

    await expect(compareKeywords(currentKeyword, previousKeyword)).toBeGreaterThanOrEqual(0);
    previousKeyword = currentKeyword;
  }

  // now go the next page and contiue untill there is not page left
  while(await frame.getByLabel("Next").isEnabled()){
    await frame.getByLabel("Next").click();
    await frame.getByRole("row").nth(0).waitFor({ state: "visible" });
    let rowCount = await frame.getByRole('row').count();
    for (let i = 2; i < rowCount; i++) {
      const currentKeyword = await frame.getByRole('row').nth(i).getByRole('cell').nth(1).textContent();
      console.log(`Comparing: ${previousKeyword} with ${currentKeyword}`);

      await expect(compareKeywords(currentKeyword, previousKeyword)).toBeGreaterThanOrEqual(0);
      previousKeyword = currentKeyword;
    }
  }
});

test("sorting should be across all the pages keyword (desc order)", async ({ page }) => {
  // Get the frame
  const frame = await locators.frame(page);

  // Perform actions
  await frame.getByPlaceholder('Keyword(s)').fill('food');
  await frame.getByPlaceholder('Keyword(s)').press('Enter');
  await frame.getByRole('button', { name: 'Search' }).click();
  await frame.getByRole("row").nth(0).waitFor({ state: "visible" });
  await frame.getByRole("row").nth(1).waitFor({ state: "visible" });
  
  // sort descending
  await frame.getByRole("row").nth(0).getByRole("cell").nth(1).locator("button").filter({hasText: "keyword"}).click();
  await frame.getByRole("row").nth(1).waitFor({ state: "visible" });

  // Get the total number of rows
  let previousKeyword = await frame.getByRole('row').nth(1).getByRole('cell').nth(1).textContent();
  let rowCount = await frame.getByRole('row').count();
  console.log(`Initial keyword: ${previousKeyword}`);
  
  // Helper function to compare keywords
  const compareKeywords = (a, b) => {
    return a.localeCompare(b, undefined, { numeric: true, sensitivity: 'base' });
  };


  for (let i = 2; i < rowCount; i++) {
    const currentKeyword = await frame.getByRole('row').nth(i).getByRole('cell').nth(1).textContent();
    console.log(`Comparing: ${previousKeyword} with ${currentKeyword}`);

    await expect(compareKeywords(currentKeyword, previousKeyword)).toBeLessThanOrEqual(0);
    previousKeyword = currentKeyword;
  }

  // now go the next page and contiue untill there is not page left
  while(await frame.getByLabel("Next").isEnabled()){
    await frame.getByLabel("Next").click();
    await frame.getByRole("row").nth(0).waitFor({ state: "visible" });
    let rowCount = await frame.getByRole('row').count();
    for (let i = 2; i < rowCount; i++) {
      const currentKeyword = await frame.getByRole('row').nth(i).getByRole('cell').nth(1).textContent();
      console.log(`Comparing: ${previousKeyword} with ${currentKeyword}`);

      await expect(compareKeywords(currentKeyword, previousKeyword)).toBeLessThanOrEqual(0);
      previousKeyword = currentKeyword;
    }
  }
});

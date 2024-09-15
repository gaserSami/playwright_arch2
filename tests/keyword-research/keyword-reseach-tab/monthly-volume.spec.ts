import { expect } from "@playwright/test";
import { test } from "../../../utils/test";
import * as locators from "../../../utils/locators";
import { WordsBox } from "../../../utils/automation/wordsBox";
import { Table } from "../../../utils/automation/table";
import {Common} from "../../../utils/automation/common";
import "../setup";

const placeholder = 'Keyword(s)';

test("Monthly volume should be 0 initially", async ({ page }) => {
  // Get the frame
  const frame = await locators.frame(page);
  const wordsBox = new WordsBox(page, placeholder);

  // Perform actions
  await wordsBox.addWords(['food']);
  await frame.getByRole('button', { name: 'Search' }).click();
  await expect(frame.getByLabel('Keyword Research')).toContainText("0.00");
});

test("Monthly volume should be updated correctly on selecting/deselecting keywords", async ({ page }) => {
  // Get the frame
  const frame = await locators.frame(page);
  const wordsBox = new WordsBox(page, placeholder);

  // Perform actions
  await wordsBox.addWords(['food']);
  await frame.getByRole('button', { name: 'Search' }).click();

  // Wait for rows to be present
  await Common.waitLoading(frame);

  // Function to get the total volume from selected rows
  const getTotalVolume = async () => {
    const rowCount = await Table.rowCount(frame);
    let totalVolume = 0;
    for (let i = 0; i < rowCount; i++) {
      const volumeText = await (await Table.getCell(frame, { rowIndex: i, cellNumber: 2 })).textContent();
      const volume = parseInt(volumeText.replace(/,/g, ''));
      totalVolume += volume;
    }
    return totalVolume;
  };

  // Select all rows and check the total volume
  await Table.clickOnHeaderCell(frame, 0);
  let expectedTotalVolume = await getTotalVolume();
  let displayedTotalVolume = await frame.getByLabel('Keyword Research').textContent();
  await expect(parseInt(displayedTotalVolume.replace(/,/g, ''))).toEqual(expectedTotalVolume);

  // Deselect all rows and check the total volume
  await Table.deselectAllRows(frame);
  await expect(frame.getByLabel('Keyword Research')).toContainText("0.00");

  // Select the first row and check the total volume
  await Table.clickOnRows(frame, [1]);
  const firstRowVolume = await (await Table.getCell(frame, { rowIndex: 1, cellNumber: 2 })).textContent();
  await expect(frame.getByLabel('Keyword Research')).toContainText(firstRowVolume);

  // Deselect the first row and check the total volume
  await Table.clickOnRows(frame, [1]);
  await expect(frame.getByLabel('Keyword Research')).toContainText("0.00");
});

test("should reset on search", async ({ page }) => {
  // Get the frame
  const frame = await locators.frame(page);
  const wordsBox = new WordsBox(page, placeholder);

  // Perform actions
  await wordsBox.addWords(['food']);
  await frame.getByRole('button', { name: 'Search' }).click();
  await expect(frame.getByLabel('Keyword Research')).toContainText("0.00");

  // Select a row
  await Table.clickOnRows(frame, [1]);
  const firstRowVolume = await (await Table.getCell(frame, { rowIndex: 1, cellNumber: 2 })).textContent();
  await expect(frame.getByLabel('Keyword Research')).toContainText(firstRowVolume);

  // Perform new search
  await wordsBox.removeWords(['food']);
  await wordsBox.addWords(['shrimp']);
  await frame.getByRole('button', { name: 'Search' }).click();
  await expect(frame.getByLabel('Keyword Research')).toContainText("0.00");
});
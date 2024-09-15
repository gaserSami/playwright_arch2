import { expect } from "@playwright/test";
import { test } from "../../../utils/test";
import * as locators from "../../../utils/locators";
import { WordsBox } from "../../../utils/automation/wordsBox";
import { Table } from "../../../utils/automation/table";
import "../setup";

const placeholder = 'Keyword(s)';

test("should be able to write with row write", async ({ page }) => {
  // Get the frame
  const frame = await locators.frame(page);
  const wordsBox = new WordsBox(page, placeholder);
  const wordBox2 = new WordsBox(page, 'press "enter" to add');

  // Perform keyword search and like the first keyword
  await wordsBox.addWords(['food']);
  await frame.getByRole('button', { name: 'Search' }).click();

  // Selecting all should have no effect
  await Table.clickOnHeaderCell(frame, 0);
  const expectedKeyword = await (await Table.getCell(frame, { rowIndex: 1, cellNumber: 1 })).textContent();
  await (await Table.getRowActions(frame, { rowIndex: 1 }))[0].click();

  await frame.getByRole("button", { name: "View advanced settings" }).click();

  await expect(await wordBox2.checkIfWordsExist([expectedKeyword])).toEqual([true]);
  await expect(await wordBox2.count()).toEqual(1);
});

test.only("should be able to select rows and write using floating write", async ({ page }) => {
  // Get the frame
  const frame = await locators.frame(page);
  const wordsBox = new WordsBox(page, placeholder);
  const wordsBox2 = new WordsBox(page, 'press "enter" to add');

  // Perform keyword search
  await wordsBox.addWords(['food']);
  await frame.getByRole('button', { name: 'Search' }).click();

  // Select the first cell of the first row (select all)
  await Table.clickOnHeaderCell(frame, 0);
  // Deselecting one should work correctly that it should not be included in the write
  await (await Table.getCell(frame, { rowIndex: 1, cellNumber: 0 })).click();

  // Create an array of expected keywords from all rows starting from index 1
  const rowCount = await Table.rowCount(frame);
  const expectedKeywords = [];
  for (let i = 2; i <= rowCount; i++) {
    const keyword = await (await Table.getCell(frame, { rowIndex: i, cellNumber: 1 })).textContent();
    if (keyword) {
      expectedKeywords.push(keyword);
    }
  }

  // Click the button in the first row
  await locators.floatingBtns(frame).nth(0).click();

  // Click on "View advanced settings"
  await frame.getByRole("button", { name: "View advanced settings" }).click();

  // Verify the keywords are added to "My Keywords" tab
  await expect(await wordsBox2.checkIfWordsExist(expectedKeywords)).toEqual(expectedKeywords.map(() => true));
  await expect(await wordsBox2.count()).toEqual(expectedKeywords.length);
});
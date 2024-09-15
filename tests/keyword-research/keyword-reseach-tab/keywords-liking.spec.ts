import { expect } from "@playwright/test";
import { test } from "../../../utils/test";
import * as locators from "../../../utils/locators";
import { WordsBox } from "../../../utils/automation/wordsBox";
import { Table } from "../../../utils/automation/table";
import { Common } from "../../../utils/automation/common";
import "../setup";

const placeholder = 'Keyword(s)';

test("should be able to select results row and like it from floating like", async ({ page }) => {
  const wordsBox = new WordsBox(page, placeholder);
  const frame = await locators.frame(page);

  // if there is any keyword in the my keywords tab, delete it
  await frame.getByRole('tab', { name: 'My Keywords' }).click();
  await Common.waitLoading(frame);
  if (await Table.rowCount(frame) > 0) {
    await Table.clickOnHeaderCell(frame, 0);
    await locators.floatingBtns(frame).nth(1).click();
    await Common.waitLoading(frame);
    await expect(await Table.rowCount(frame)).toEqual(0);
  }
  await frame.getByRole('tab', { name: 'Keyword Research' }).click();

  // Perform actions
  await wordsBox.addWords(['food']);
  await frame.getByRole('button', { name: 'Search' }).click();
  await Common.waitLoading(frame);
  await expect(await locators.floatingBtns(frame).count()).toEqual(0);
  await Table.clickOnRows(frame, [1]);
  await expect(await locators.floatingBtns(frame).count()).toBeGreaterThan(0);

  // selecting and deselecting should have no effect
  await Table.clickOnRows(frame, [2]);
  await Table.clickOnRows(frame, [2]);

  // like the keyword
  await locators.floatingBtns(frame).nth(1).click();
  const expectedKeyword = await (await Table.getCell(frame, { rowIndex: 1, cellNumber: 1 })).innerText();
  await frame.getByRole('tab', { name: 'My Keywords' }).click();
  await Common.waitLoading(frame);
  await expect(await Table.rowCount(frame)).toEqual(1);
  await expect(await (await Table.getCell(frame, { rowIndex: 1, cellNumber: 1 })).innerText()).toEqual(expectedKeyword);
});

test.only("should be able to like keyword row like", async ({ page }) => {
  const wordsBox = new WordsBox(page, placeholder);
  const frame = await locators.frame(page);

  // Navigate to "My Keywords" tab and delete any existing keywords
  await frame.getByRole('tab', { name: 'My Keywords' }).click();
  await Common.waitLoading(frame);
  if (await Table.rowCount(frame) > 0) {
    await Table.clickOnHeaderCell(frame, 0);
    await locators.floatingBtns(frame).nth(1).click();
    await Common.waitLoading(frame);
    await expect(await Table.rowCount(frame)).toEqual(0);
  }

  // Navigate to "Keyword Research" tab
  await frame.getByRole('tab', { name: 'Keyword Research' }).click();

  // Perform keyword search and like the first keyword
  await wordsBox.addWords(['food']);
  await frame.getByRole('button', { name: 'Search' }).click();
  await Common.waitLoading(frame);
  await Table.clickOnRows(frame, [1, 3]); // shouldn't have any effect
  (await Table.getRowActions(frame, { rowIndex: 2 }))[1].click();
  const expectedKeyword = await (await Table.getCell(frame, { rowIndex: 2, cellNumber: 1 })).innerText();

  // Verify the keyword is added to "My Keywords" tab
  await frame.getByRole('tab', { name: 'My Keywords' }).click();
  await Common.waitLoading(frame);
  await expect(await Table.rowCount(frame)).toEqual(1);
  await expect(await (await Table.getCell(frame, { rowIndex: 1, cellNumber: 1 })).innerText()).toEqual(expectedKeyword);
});
import { expect } from "@playwright/test";
import { test } from "../../../utils/test";
import * as locators from "../../../utils/locators";
import { WordsBox } from "../../../utils/automation/wordsBox";
import { Table } from "../../../utils/automation/table";
import { Common } from "../../../utils/automation/common";
import "../setup";

const placeholder = 'Keyword(s)';

test("selections should be reseted when the user researches a new keyword", async ({ page }) => {
  const frame = await locators.frame(page);
  const wordsBox = new WordsBox(page, placeholder);
  const wordBox2 = new WordsBox(page, 'press "enter" to add');
  const keyword = "food";
  const keyword2 = "gym";

  // Perform initial search
  await wordsBox.addWords([keyword]);
  await frame.getByRole("button", { name: "Search" }).click();
  await Common.waitLoading(frame);
  await Table.clickOnRows(frame, [0]);

  // Research with new keyword
  await wordsBox.removeWords([keyword]);
  await wordsBox.addWords([keyword2]);
  await frame.getByRole("button", { name: "Search" }).click();
  await Common.waitLoading(frame);

  const expectedKeyword = await (await Table.getCell(frame, { rowIndex: 1, cellNumber: 1 })).textContent();
  await Table.clickOnRows(frame, [1]);
  await locators.floatingBtns(frame).nth(0).click();
  await frame.getByRole("button", { name: "View advanced settings" }).click();

  await expect(await wordBox2.checkIfWordsExist([expectedKeyword])).toEqual([true]);
  await expect(await wordBox2.count()).toEqual(1);
});

test.fail("selections across moving between pages", async ({ page }) => {
  // either selections reset or the old selections are maintained
});

test.only("number of selections should be displayed correctly", async ({ page }) => {
  const frame = await locators.frame(page);
  const wordsBox = new WordsBox(page, placeholder);
  const keyword = "food";
  const keyword2 = "gym";

  // Perform initial search
  await wordsBox.addWords([keyword]);
  await frame.getByRole("button", { name: "Search" }).click();
  await Common.waitLoading(frame);

  await Table.clickOnHeaderCell(frame, 0);
  await expect(frame.getByText("Deselect all 20 keywords20")).toBeVisible();
  await Table.clickOnRows(frame, [1]);
  await expect(frame.getByText("Select all 20 keywords19")).toBeVisible();
  await Table.deselectAllRows(frame);
  await expect(frame.getByText("Deselect all 20 keywords20")).not.toBeVisible();
  await expect(frame.getByText("Deselect all 20 keywords20")).not.toBeVisible(); 

  await Table.clickOnHeaderCell(frame, 0);
  await expect(frame.getByText("Deselect all 20 keywords20")).toBeVisible();
  await wordsBox.removeWords([keyword]);
  await wordsBox.addWords([keyword2]);
  await frame.getByRole("button", { name: "Search" }).click();
  await Common.waitLoading(frame);
  await expect(frame.getByText("Deselect all 20 keywords20")).not.toBeVisible();
});
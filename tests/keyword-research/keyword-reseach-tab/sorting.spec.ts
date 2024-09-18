import { expect } from "@playwright/test";
import { test } from "../../../utils/test";
import * as locators from "../../../utils/locators";
import { Table } from "../../../utils/automation/table";
import { WordsBox } from "../../../utils/automation/wordsBox";
import { Common } from "../../../utils/automation/common";
import "../setup";

test("sorting should be across all the pages keyword in Asc order initially or dont show that its sorted", async ({ page }) => {
  // Get the frame
  const frame = await locators.frame(page);
  const wordsBox = new WordsBox(page, 'Keyword(s)');

  // Perform actions
  await wordsBox.addWords(['keyboard']);
  await frame.getByRole('button', { name: 'Search' }).click();
  await Common.waitLoading(frame);

  // Helper function to compare keywords
  const compareKeywords = (a, b) => a.localeCompare(b, undefined, { numeric: true, sensitivity: 'base' });

  // Check sorting on all pages
  const isSorted = await Table.checkSorting(frame, 1, compareKeywords, 40, true);
  expect(isSorted).toBe(true);
});

test("sorting should be across all the pages keyword (Asc order)", async ({ page }) => {
  // Get the frame
  const frame = await locators.frame(page);
  const wordsBox = new WordsBox(page, 'Keyword(s)');

  // Perform actions
  await wordsBox.addWords(['keyboard']);
  await frame.getByRole('button', { name: 'Search' }).click();
  await Common.waitLoading(frame);

  // Sort Ascending
  await Table.clickOnHeaderCell(frame, 1);
  await Common.waitLoading(frame);
  await Table.clickOnHeaderCell(frame, 1);
  await Common.waitLoading(frame);

  // Helper function to compare keywords
  const compareKeywords = (a, b) => a.localeCompare(b, undefined, { numeric: true, sensitivity: 'base' });

  // Check sorting on all pages
  const isSorted = await Table.checkSorting(frame, 1, compareKeywords, 40, true);
  expect(isSorted).toBe(true);
});

test("sorting should be across all the pages keyword (desc order)", async ({ page }) => {
  // Get the frame
  const frame = await locators.frame(page);
  const wordsBox = new WordsBox(page, 'Keyword(s)');

  // Perform actions
  await wordsBox.addWords(['keyboard']);
  await frame.getByRole('button', { name: 'Search' }).click();
  await Common.waitLoading(frame);

  // Sort descending
  await Table.clickOnHeaderCell(frame, 1);
  await Common.waitLoading(frame);

  // Helper function to compare keywords
  const compareKeywords = (a, b) => b.localeCompare(a, undefined, { numeric: true, sensitivity: 'base' });

  // Check sorting on all pages
  const isSorted = await Table.checkSorting(frame, 1, compareKeywords, 40, true);
  expect(isSorted).toBe(true);
});

test("sorting should be across all the pages by volume (Desc order)", async ({ page }) => {
  // Get the frame
  const frame = await locators.frame(page);
  const wordsBox = new WordsBox(page, 'Keyword(s)');

  // Perform actions
  await wordsBox.addWords(['keyboard']);
  await frame.getByRole('button', { name: 'Search' }).click();
  await Common.waitLoading(frame);

  // Sort Desc
  await Table.clickOnHeaderCell(frame, 2);
  await Common.waitLoading(frame);

  // Helper function to compare keywords
  const compareKeywords = (a, b) => {
    const num1 = Number(a.replace(/,/g, ''));
    const num2 = Number(b.replace(/,/g, ''));
    return num2 - num1;
  };

  // Check sorting on all pages
  const isSorted = await Table.checkSorting(frame, 2, compareKeywords, 40, true);

  expect(isSorted).toBe(true);
});

test("sorting should be across all the pages by volume (Asc order)", async ({ page }) => {
  // Get the frame
  const frame = await locators.frame(page);
  const wordsBox = new WordsBox(page, 'Keyword(s)');

  // Perform actions
  await wordsBox.addWords(['keyboard']);
  await frame.getByRole('button', { name: 'Search' }).click();
  await Common.waitLoading(frame);

  // Sort Desc
  await Table.clickOnHeaderCell(frame, 2);
  await Common.waitLoading(frame);
  await Table.clickOnHeaderCell(frame, 2);
  await Common.waitLoading(frame);

  // Helper function to compare keywords
  const compareKeywords = (a, b) => {
    const num1 = Number(a.replace(/,/g, ''));
    const num2 = Number(b.replace(/,/g, ''));
    return num1 - num2;
  };

  // Check sorting on all pages
  const isSorted = await Table.checkSorting(frame, 2, compareKeywords, 40, true);

  expect(isSorted).toBe(true);
});

test("sorting should be across all the pages by Competetion (Desc order)", async ({ page }) => {
  // Get the frame
  const frame = await locators.frame(page);

  // Perform actions
  const wordsBox = new WordsBox(page, 'Keyword(s)');
  await wordsBox.addWords(['keyboard']);
  await frame.getByRole('button', { name: 'Search' }).click();
  await Common.waitLoading(frame);

  // Sort Desc
  await Table.clickOnHeaderCell(frame, 3);
  await Common.waitLoading(frame);

  // Helper function to compare keywords
  const compareKeywords = (a, b) => {
    const order = { 'HIGH': 1, 'MEDIUM': 2, 'LOW': 3 , "UNSPECIFIED": 4};
    return order[a] - order[b];
  };

  // Check sorting on all pages
  const isSorted = await Table.checkSorting(frame, 3, compareKeywords, 40, true);

  expect(isSorted).toBe(true);
});

//keyboard

test.only("sorting should be across all the pages by Competetion (Asc order)", async ({ page }) => {
  // Get the frame
  const frame = await locators.frame(page);

  // Perform actions
  const wordsBox = new WordsBox(page, 'Keyword(s)');
  await wordsBox.addWords(['keyboard']);
  await frame.getByRole('button', { name: 'Search' }).click();
  await Common.waitLoading(frame);
  
  await frame.getByLabel("Count").selectOption("500");
  await Common.waitLoading(frame);

  // Sort Desc
  await Table.clickOnHeaderCell(frame, 3);
  await Common.waitLoading(frame);
  await Table.clickOnHeaderCell(frame, 3);
  await Common.waitLoading(frame);

  // Helper function to compare keywords
  const compareKeywords = (a, b) => {
    const order = { 'HIGH': 1, 'MEDIUM': 2, 'LOW': 3 , "UNSPECIFIED": 4};
    return order[a] - order[b];
  };

  // Check sorting on all pages
  const isSorted = await Table.checkSorting(frame, 3, compareKeywords, 1, true);

  expect(isSorted).toBe(true);
});
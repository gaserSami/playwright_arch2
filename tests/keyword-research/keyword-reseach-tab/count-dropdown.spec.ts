import { expect } from "@playwright/test";
import { test } from "../../../utils/test";
import * as locators from "../../../utils/locators";
import { WordsBox } from "../../../utils/automation/wordsBox";
import { Table } from "../../../utils/automation/table";
import { Common } from "../../../utils/automation/common";
import "../setup";

const placeholder = 'Keyword(s)';

test.only("should be able to select count with mouse (UI, Functionality)", async ({ page }) => {
  const wordsBox = new WordsBox(page, placeholder);
  const frame = await locators.frame(page);
  const keyword = "food";
  
  await wordsBox.addWords([keyword]);
  await frame.getByRole("button", { name: "Search" }).click();
  await Common.waitLoading(frame);

  await frame.getByLabel("Count").click();
  await frame.getByLabel("Count").selectOption("500");
  await Common.waitLoading(frame);
  await expect(await frame.locator('span').filter({ hasText: /^500$/ })).toBeVisible();
});

test("should check if each count dropdown option has the correct value", async ({ page }) => {
  const wordsBox = new WordsBox(page, placeholder);
  const frame = await locators.frame(page);
  const keyword = "food";
  
  await wordsBox.addWords([keyword]);
  await frame.getByRole("button", { name: "Search" }).click();
  await Common.waitLoading(frame);

  await frame.getByLabel("Count").click();
  const options = await frame.getByLabel("Count").locator('option');
  const optionCount = await options.count();

  for (let i = 0; i < optionCount; i++) {
    const optionText = await options.nth(i).textContent();
    const optionValue = await options.nth(i).getAttribute('value');
    expect(optionValue).toEqual(optionText);
  }
});

test("should be able to select a count option using keyboard (UI, functionality)", async ({ page }) => {
  const wordsBox = new WordsBox(page, placeholder);
  const frame = await locators.frame(page);
  const keyword = "food";
  
  await wordsBox.addWords([keyword]);
  await frame.getByRole("button", { name: "Search" }).click();
  await Common.waitLoading(frame)

  await frame.getByLabel("Count").click();
  await frame.getByLabel("Count").press("ArrowUp");
  await frame.getByLabel("Count").press("ArrowDown");
  await frame.getByLabel("Count").press("ArrowDown");
  await frame.getByLabel("Count").press("Enter");
  
  await expect(frame.locator('span').filter({ hasText: /^50$/ })).toBeVisible();
  await Common.waitLoading(frame);
  await expect(await Table.rowCount(frame)).toEqual(50);
});

test("should be able to select a count option using search (UI, Functionality)", async ({ page }) => {
  const wordsBox = new WordsBox(page, placeholder);
  const frame = await locators.frame(page);
  const keyword = "food";
  
  await wordsBox.addWords([keyword]);
  await frame.getByRole("button", { name: "Search" }).click();
  await Common.waitLoading(frame);

  await frame.getByLabel("Count").click();
  await frame.getByLabel("Count").press("1");
  await frame.getByLabel("Count").press("2");
  await frame.getByLabel("Count").press("5");
  await frame.getByLabel("Count").press("Enter");
  
  await expect(frame.locator('span').filter({ hasText: /^50$/ })).toBeVisible();
  await Common.waitLoading(frame);
  await expect(await Table.rowCount(frame)).toEqual(50);
});

test("should be able to select a count option by using left and right keys (UI, Functionality)", async ({ page }) => {
  const wordsBox = new WordsBox(page, placeholder);
  const frame = await locators.frame(page);
  const keyword = "food";
  
  await wordsBox.addWords([keyword]);
  await frame.getByRole("button", { name: "Search" }).click();
  await Common.waitLoading(frame);

  await frame.getByLabel("Count").press("ArrowLeft");
  
  await expect(frame.locator('span').filter({ hasText: /^10$/ })).toBeVisible();
  await Common.waitLoading(frame);
  await expect(await Table.rowCount(frame)).toEqual(10);
});

test("should be able to select a count option by using up and down keys (UI, Functionality)", async ({ page }) => {
  const wordsBox = new WordsBox(page, placeholder);
  const frame = await locators.frame(page);
  const keyword = "food";
  
  await wordsBox.addWords([keyword]);
  await frame.getByRole("button", { name: "Search" }).click();
  await Common.waitLoading(frame);

  await frame.getByLabel("Count").press("ArrowUp");
  
  await expect(frame.locator('span').filter({ hasText: /^10$/ })).toBeVisible();
  await Common.waitLoading(frame);
  await expect(await Table.rowCount(frame)).toEqual(10);
});
import { expect } from "@playwright/test";
import { test } from "../../../utils/test";
import * as locators from "../../../utils/locators";
import { WordsBox } from "../../../utils/automation/wordsBox";
import { Table } from "../../../utils/automation/table";
import "../setup";
import { Common } from "../../../utils/automation/common";

const placeholder = 'Keyword(s)';

test("Search button should be disabled when there are no keywords enabled otherwise", async ({ page }) => {
  const frame = await locators.frame(page);
  const wordsBox = new WordsBox(page, placeholder);

  await expect(frame.getByRole("button", { name: "Search" })).toBeDisabled();
  await wordsBox.addWords(["food"]);
  await expect(frame.getByRole("button", { name: "Search" })).toBeEnabled();
  await wordsBox.removeWords(["food"]);
  await expect(frame.getByRole("button", { name: "Search" })).toBeDisabled();
});

test.fixme("search should show results", async ({ page }) => {
  const frame = await locators.frame(page);
  const wordsBox = new WordsBox(page, placeholder);

  await wordsBox.addWords(["food"]);
  await frame.getByRole("button", { name: "Search" }).click();
  await Common.waitLoading(frame);
  await expect(frame.getByLabel('Keyword Research')).toBeVisible();
  await expect(await Table.rowCount(frame)).toBeGreaterThan(0);
});

test("search should send the correct request data", async ({ page }) => {
  const frame = await locators.frame(page);
  const wordsBox = new WordsBox(page, placeholder);
  const expectedKeywords = "food";
  const langTarget = "Dutch";
  const countryTarget = "Morocco";

  await frame.getByRole("combobox").nth(1).click();
  let options = await frame.getByRole("combobox").nth(1).locator("option");
  let optionsCount = await options.count();

  let expectedLanguageId;
  for (let i = 0; i < optionsCount; i++) {
    let option = options.nth(i);
    if (await option.textContent() === langTarget) {
      expectedLanguageId = await option.getAttribute("value");
      break;
    }
  }

  let expectedCountryId;
  options = await frame.getByRole("combobox").nth(0).locator("option");
  optionsCount = await options.count();
  for (let i = 0; i < optionsCount; i++) {
    let option = options.nth(i);
    if (await option.textContent() === countryTarget) {
      expectedCountryId = await option.getAttribute("value");
      break;
    }
  }

  let requestPayload;
  page.on('request', request => {
    if (request.url() === "https://staging-yozo.cortechs-ai.com/api/keywords?shop=rubixteststore.myshopify.com") {
      requestPayload = request.postDataJSON();
    }
  });

  await wordsBox.addWords([expectedKeywords]);
  await frame.getByRole("combobox").nth(1).selectOption(langTarget);
  await frame.getByRole("combobox").nth(0).selectOption(countryTarget);
  await frame.getByRole("button", { name: "Search" }).click();

  expect(requestPayload).toBeDefined();
  expect(requestPayload.keywords).toEqual([expectedKeywords]);
  expect(requestPayload.language_id.toString()).toEqual(expectedLanguageId);
  expect(requestPayload.location_ids.toString()).toEqual(expectedCountryId);
});

test.fixme("search should reset the page number", async ({ page }) => {
});
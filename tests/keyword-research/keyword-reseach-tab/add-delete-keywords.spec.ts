import { expect } from "@playwright/test";
import { test } from "../../../utils/test";
import { WordsBox } from "../../../utils/automation/wordsBox";
import * as locators from "../../../utils/locators";
import "../setup";

const placeholder = 'Keyword(s)';

test("should be able to add keyword (UI)", async ({ page }) => {
  const wordsBox = new WordsBox(page, placeholder);
  const keyword = "example";
  await wordsBox.addWords([keyword]);
  await expect(await wordsBox.checkIfWordsExist([keyword])).toEqual([true]);
});

test("should be able to add keyword (Request)", async ({ page }) => {
  const wordsBox = new WordsBox(page, placeholder);
  const keyword = "example";

  // Intercept the network request
  let requestPayload;
  page.on('request', request => {
    if (request.url() === "https://staging-yozo.cortechs-ai.com/api/keywords?shop=rubixteststore.myshopify.com") {
      requestPayload = request.postDataJSON();
    }
  });

  // Fill the form and submit
  await wordsBox.addWords([keyword]);
  await locators.frame(page).getByRole("button", { name: "Search" }).click();

  // Validate the request payload
  expect(requestPayload).toBeDefined();
  expect(requestPayload.keywords).toEqual([keyword]);
});

test("should be able to delete one keyword x button (UI)", async ({ page }) => {
  const wordsBox = new WordsBox(page, placeholder);
  const keyword = "example";
  await wordsBox.addWords([keyword]);
  await expect(await wordsBox.checkIfWordsExist([keyword])).toEqual([true]);
  await wordsBox.removeWords([keyword]);
  await expect(await wordsBox.checkIfWordsExist([keyword])).toEqual([false]);
});

test("should be able to delete one keyword using keyboard (UI)", async ({ page }) => {
  const wordsBox = new WordsBox(page, placeholder);
  const keyword = "example";
  await wordsBox.addWords([keyword]);
  await expect(await wordsBox.checkIfWordsExist([keyword])).toEqual([true]);
  await wordsBox.textAreaLocator().press('Backspace');
  await expect(await wordsBox.checkIfWordsExist([keyword])).toEqual([false]);
});

test("should be able to add and delete multiple keywords from start, middle, end (UI)", async ({ page }) => {
  const wordsBox = new WordsBox(page, placeholder);
  const keywords = ["example1", "example2", "example3", "example4", "example5", "example6", "example7"];
  
  await wordsBox.addWords(keywords);
  for (let i = 0; i < keywords.length; i++) {
    await expect(await wordsBox.checkIfWordsExist([keywords[i]])).toEqual([true]);
  }

  // Delete from start
  await wordsBox.removeWords([keywords[0]]);
  // Delete from middle
  await wordsBox.removeWords([keywords[2]]);
  // Delete from end
  await wordsBox.removeWords([keywords[keywords.length - 1]]);

  await expect(await wordsBox.checkIfWordsExist(keywords)).toEqual([false, true, false, true, true, true, false]);
});

test("should be able to add multiple keywords and delete multiple keywords using keyboard (Request)", async ({ page }) => {
  const frame = await locators.frame(page);
  const wordsBox = new WordsBox(page, placeholder);
  const keywords = ["example1", "example2", "example3", "example4", "example5", "example6", "example7"];
  
  await wordsBox.addWords(keywords);
  await wordsBox.textAreaLocator().press('Backspace');
  await wordsBox.textAreaLocator().press('Backspace');

  let requestPayload;
  page.on('request', request => {
    if (request.url() === "https://staging-yozo.cortechs-ai.com/api/keywords?shop=rubixteststore.myshopify.com") {
      requestPayload = request.postDataJSON();
    }
  });

  // Fill the form and submit
  await frame.getByRole("button", { name: "Search" }).click();

  // Validate the request payload
  expect(requestPayload).toBeDefined();
  expect(requestPayload.keywords).toEqual(keywords.slice(0, keywords.length - 2));
});

test("shouldn't add duplicate keywords (UI)", async ({ page }) => {
  const wordsBox = new WordsBox(page, placeholder);
  const keyword = "example";
  await wordsBox.addWords([keyword, keyword]);
  await expect(await wordsBox.keywordLocator(keyword)).toHaveCount(1);
});

test("shouldn't add duplicate keywords (Request)", async ({ page }) => {
  const frame = await locators.frame(page);
  const wordsBox = new WordsBox(page, placeholder);
  const keyword = "example";
  await wordsBox.addWords([keyword, keyword]);

  let requestPayload;
  page.on('request', request => {
    if (request.url() === "https://staging-yozo.cortechs-ai.com/api/keywords?shop=rubixteststore.myshopify.com") {
      requestPayload = request.postDataJSON();
    }
  });

  // Fill the form and submit
  await frame.getByRole("button", { name: "Search" }).click();

  // Validate the request payload
  expect(requestPayload).toBeDefined();
  expect(requestPayload.keywords).toEqual([keyword]);
});

test("there should be a message for duplicate keywords", async ({ page }) => {
  const frame = await locators.frame(page);
  const wordsBox = new WordsBox(page, placeholder);
  const keyword = "example";
  await wordsBox.addWords([keyword, keyword]);
  await expect(await frame.getByText("Keyword already exists")).toBeVisible();
});
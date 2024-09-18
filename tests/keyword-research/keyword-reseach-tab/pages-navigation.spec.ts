import { expect } from "@playwright/test";
import { test } from "../../../utils/test";
import * as locators from "../../../utils/locators";
import { Table } from "../../../utils/automation/table";
import { WordsBox } from "../../../utils/automation/wordsBox";
import { Common } from "../../../utils/automation/common";
import "../setup";

test("previous should be disabled initially and on researching (UI and request)", async ({ page }) => {
  // Get the frame
  const frame = await locators.frame(page);
  const wordsBox = new WordsBox(page, 'Keyword(s)');

  // listen on the network request to check the page number sent
  let requestPayload;
  page.on('request', async (request) => {
    if (request.url().includes('https://staging-yozo.cortechs-ai.com/api/generations/') && request.url().includes("content_per_page")) {
      requestPayload = JSON.parse(request.postData());
    }
  });

  // Perform actions
  await wordsBox.addWords(['keyboard']);
  await frame.getByRole('button', { name: 'Search' }).click();
  await Common.waitLoading(frame);

  expect(requestPayload).toBeDefined();
  expect(requestPayload.content_page).toBe(1);

  // Check if previous is disabled
  await expect(await Table.isFirstPage(frame)).toEqual(true);

  await Table.nextPage(frame);
  await Common.waitLoading(frame);

  expect(requestPayload).toBeDefined();
  expect(requestPayload.content_page).toBe(2);

  // Check if previous is disabled
  await expect(await Table.isFirstPage(frame)).toEqual(false);

  // research and the page should reset
  await wordsBox.removeWords(['keyboard']);
  await wordsBox.addWords(['food']);
  await frame.getByRole('button', { name: 'Search' }).click();
  await Common.waitLoading(frame);

  expect(requestPayload).toBeDefined();
  expect(requestPayload.content_page).toBe(1);

  // Check if previous is disabled
  await expect(await Table.isFirstPage(frame)).toEqual(false);
});

test("next should be disabled when there is no next page", async ({ page }) => {
  // Get the frame
  const frame = await locators.frame(page);
  const wordsBox = new WordsBox(page, 'Keyword(s)');

  // Perform actions
  await wordsBox.addWords(['High']);
  await frame.getByRole('button', { name: 'Search' }).click();
  await Common.waitLoading(frame);

  // Check if next is disabled
  await expect(await Table.isLastPage(frame)).toEqual(true);
});

test.only("should handle spamming of next and previous buttons", async ({ page }) => {
  // Get the frame
  const frame = await locators.frame(page);
  const wordsBox = new WordsBox(page, 'Keyword(s)');

  // Perform actions
  await wordsBox.addWords(['food']);
  await frame.getByRole('button', { name: 'Search' }).click();
  await Common.waitLoading(frame);

  // Slow down network
  await Common.slowNetwork(page);

  await Table.nextPage(frame);

  // Check if next button is hidden or disabled
  const isNextHidden = await Table.nextBtn(frame).isHidden();
  const isNextDisabled = await Table.nextBtn(frame).isDisabled();
  await expect(isNextHidden || isNextDisabled).toBe(true);

  // Reset the network speed
  await Common.resetNetworkSpeed(page);

  // Spam the next button 5 times
  for (let i = 0; i < 5; i++) {
    await Table.nextPage(frame);
    await Common.waitLoading(frame);
  }

  // Slow down network again
  await Common.slowNetwork(page);

  // Go back to previous page
  await Table.prevPage(frame);

  // Check if prev button is hidden or disabled
  const isPrevHidden = await Table.prevBtn(frame).isHidden();
  const isPrevDisabled = await Table.prevBtn(frame).isDisabled();
  await expect(isPrevHidden || isPrevDisabled).toBe(true);

  // Reset the network speed
  await Common.resetNetworkSpeed(page);
});


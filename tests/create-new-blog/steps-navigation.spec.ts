import { test } from "../../utils/test";
import { expect } from "@playwright/test";
import * as locators from "../../utils/locators";
import { Common } from "../../utils/automation/Common";
import { WordsBox } from "../../utils/automation/wordsBox";

async function checkStep1(frame) {
  await expect(await frame.getByLabel("Tone").count()).not.toBe(0);
  await expect(await frame.getByText('OutlinesRe-generate').count()).toBe(0);
  await expect(await frame.getByRole('heading', { name: 'Content' }).count()).toBe(0);
}

async function checkStep2(frame) {
  await expect(await frame.getByLabel("Tone").count()).toBe(0);
  await expect(await frame.getByText('OutlinesRe-generate').count()).not.toBe(0);
  await expect(await frame.getByRole('heading', { name: 'Content' }).count()).toBe(0);
}

async function checkStep3(frame) {
  await expect(await frame.getByLabel("Tone").count()).toBe(0);
  await expect(await frame.getByText('OutlinesRe-generate').count()).toBe(0);
  await expect(await frame.getByRole('heading', { name: 'Content' }).count()).not.toBe(0);
}

async function waitForContentGeneration(frame) {
  const buttonLocator = await frame.locator('div').filter({ hasText: /^Publish$/ }).nth(1).locator("button");
  const buttonHandle = await buttonLocator.elementHandle();
  await buttonHandle?.waitForElementState("enabled");
}

test.beforeEach(async ({ page }) => {
  await page.goto("/apps/yozo-ai-staging/blog_posts");
  await page.locator("a").filter({ hasText: /oscurit/ }).click();
});

test("shouldn't be able to navigate to next steps initially", async ({ page }) => {
  const frame = await locators.frame(page);
  await locators.step(frame, "1", "123").click();
  await checkStep1(frame);
  await locators.step(frame, "2", "123").click();
  await checkStep1(frame);
  await locators.step(frame, "3", "123").click();
  await checkStep1(frame);
});

test("should be able to navigate between 1,2,3 freely without any edits", async ({ page }) => {
  const frame = await locators.frame(page);

  // fill the required fields
  await frame.getByLabel('Topic Idea').fill('test');
  await frame.getByLabel('Title').fill('test');

  await frame.getByRole('button', { name: 'Start Generating Outline' }).click(); // go to step 2
  await Common.waitButtonLoading(frame);
  await checkStep2(frame);

  await locators.step(frame, "1", "123").click();
  await checkStep1(frame);
  await locators.step(frame, "2", "123").click();
  await checkStep2(frame);
  await locators.step(frame, "3", "123").click();
  await checkStep2(frame);

  await frame.getByRole('button', { name: 'Generate Article' }).click(); // go to step 3
  await Common.waitButtonLoading(frame);

  await checkStep3(frame);

  await waitForContentGeneration(frame);
  await locators.step(frame, "1", "123").click();
  await checkStep1(frame);
  await locators.step(frame, "2", "123").click();
  await checkStep2(frame);
  await locators.step(frame, "3", "123").click();
  await checkStep3(frame);
});

test("all data should be preserved during navigation between steps", async ({ page }) => {
});

test("editing in step 1 should disable step 2 and 3", async ({ page }) => {
  const frame = await locators.frame(page);

  // fill the required fields
  await frame.getByLabel('Topic Idea').fill('test');
  await frame.getByLabel('Title').fill('test');

  await frame.getByRole('button', { name: 'Start Generating Outline' }).click(); // go to step 2
  await frame.getByRole('button', { name: 'Generate Article' }).click(); // go to step 3
  await Common.waitButtonLoading(frame);
  await checkStep3(frame);
  await waitForContentGeneration(frame);

  await locators.step(frame, "1", "123").click();

  // edit should disable step 2 and 3
  await frame.getByLabel('Topic Idea').fill('test2');

  await locators.step(frame, "2", "123").click();
  await checkStep1(frame);
  await locators.step(frame, "3", "123").click();
  await checkStep1(frame);

  // repeat the same process for other edits
});

test("editing in step 2 should disable step 3", async ({ page }) => {
  const frame = await locators.frame(page);

  // fill the required fields
  await frame.getByLabel('Topic Idea').fill('test');
  await frame.getByLabel('Title').fill('test');

  await frame.getByRole('button', { name: 'Start Generating Outline' }).click(); // go to step 2
  await frame.getByRole('button', { name: 'Generate Article' }).click(); // go to step 3
  await Common.waitButtonLoading(frame);
  await checkStep3(frame);
  await waitForContentGeneration(frame);

  await locators.step(frame, "2", "123").click();
  await checkStep2(frame);

  // edit should disable step 3
  await frame.getByRole('button', { name: 'Re-generate Outlines' }).click();
  await Common.waitButtonLoading(frame);

  await locators.step(frame, "3", "123").click();
  await checkStep2(frame);
  await locators.step(frame, "1", "123").click();
  await checkStep1(frame);
});

test.only("should be able to navigate between 1,2,3 freely without losing data", async ({ page }) => {
  const frame = await locators.frame(page);

  // fill the required fields
  await frame.getByLabel('Topic Idea').fill('test');
  await frame.getByLabel('Title').fill('test');
  await frame.getByLabel('Select Output Language').selectOption("Arabic");
  await frame.getByLabel('Choose words count').selectOption("1000");
  // range input
  await frame.getByLabel('# of sections in the outline').fill('5');
  // search box
  await frame.getByPlaceholder("Search Related Products").click();
  let options: string[] = [];
  options.push(await frame.getByRole("listbox").getByRole("option").nth(0).textContent() || "");
  options.push(await frame.getByRole("listbox").getByRole("option").nth(1).textContent() || "");
  await frame.getByRole("listbox").getByRole("option").nth(0).click();
  await frame.getByRole("listbox").getByRole("option").nth(1).click();
  await frame.getByPlaceholder("Search Related Products").blur();
  // check that the options are selected
  await frame.getByText(options[0]).isVisible();
  await frame.getByText(options[1]).isVisible();

  await frame.getByLabel("Blog Posts").selectOption("News");
  // another search box
  await frame.getByPlaceholder("Select Related Articles").click();
  let options2: string[] = [];
  options2.push(await frame.getByRole("listbox").getByRole("option").nth(0).textContent() || "");
  options2.push(await frame.getByRole("listbox").getByRole("option").nth(1).textContent() || "");
  await frame.getByRole("listbox").getByRole("option").nth(0).click();
  await frame.getByRole("listbox").getByRole("option").nth(1).click();
  await frame.getByPlaceholder("Select Related Articles").blur();
  // check that the options are selected
  await frame.getByText(options2[0]).isVisible();
  await frame.getByText(options2[1]).isVisible();

  await frame.getByRole('button', { name: 'View advanced settings' }).click();
  let wordsBox = new WordsBox(page, 'Press "Enter" to add');
  await wordsBox.addWords(["test1", "test2", "test3"]);
  await wordsBox.checkIfWordsExist(["test1", "test2", "test3"]);

  await frame.getByRole('button', { name: 'Start Generating Outline' }).click(); // go to step 2

  await Common.waitLoading(frame);

  await checkStep2(frame);
  
  await frame.locator('.Polaris-BlockStack').nth(2).locator(' > div').first().locator('button').nth(2).click();
  await frame.getByRole("button", {name: "Add Section"}).click();
  await frame.getByPlaceholder('Add Title').fill('test');
  await frame.locator('button').filter({hasText:"Save"}).click();

  let step2Data: string[] = [];
  let sections = await frame.locator(".Polaris-BlockStack").nth(2).locator(" > div").all();
  for (const section of sections) {
    const text = await section.textContent();
    if (text !== null) {
      step2Data.push(text);
    }
  }

  await frame.getByRole('button', { name: 'Generate Article' }).click(); // go to step 3
  await Common.waitLoading(frame);
  await checkStep3(frame);
  await waitForContentGeneration(frame);

  // now can get back to step 1,2 and check if the data is still there
  await locators.step(frame, "2", "123").click();
  await checkStep2(frame);

  // check the data
   let step2DataAfter: string[] = [];
  sections = await frame.locator(".Polaris-BlockStack").nth(2).locator(" > div").all();
  for (const section of sections) {
    const text = await section.textContent();
    if (text !== null) {
      step2DataAfter.push(text);
    }
  }

  await expect(step2Data).toEqual(step2DataAfter);

  await locators.step(frame, "1", "123").click();
  await checkStep1(frame);
  // check the data
  await expect(await frame.getByLabel('Topic Idea')).toHaveValue('test');
  await expect(await frame.getByLabel('Title')).toHaveValue('test');
  await expect(await frame.getByLabel('Select Output Language')).toHaveValue('arabic');
  await expect(await frame.getByLabel('Choose words count')).toHaveValue("9500");
  await expect(await frame.getByLabel('# of sections in the outline')).toHaveValue('5');
  await expect(await frame.getByText(options[0])).toBeVisible();
  await expect(await frame.getByText(options[1])).toBeVisible();
  await expect(await frame.getByText(options2[0])).toBeVisible();
  await expect(await frame.getByText(options2[1])).toBeVisible();
  await expect(await frame.getByLabel("Blog Posts")).toHaveValue('92024078631');
  wordsBox = new WordsBox(page, 'Press "Enter" to add');
  await expect(await wordsBox.checkIfWordsExist(["test1", "test2", "test3"])).toEqual([true, true, true]);
});
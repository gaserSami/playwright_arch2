import { test } from "../../utils/test";
import { expect } from "@playwright/test";
import * as locators from "../../utils/locators";
import { Common } from "../../utils/automation/Common";

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

async function waitForContentGeneration(frame){
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
import { expect } from "@playwright/test";
import { test } from "../../../utils/test";
import * as locators from "../../../utils/locators";
import "../setup";

test("Search button should be disabled when there are no keywords enabled otherwise", async ({ page }) => {
  const frame = await locators.frame(page);
  await expect(frame.getByRole("button", { name: "Search" })).toBeDisabled();
  await frame.getByPlaceholder('Keyword(s)').fill("food");
  await frame.getByPlaceholder('Keyword(s)').press("Enter");
  await expect(frame.getByRole("button", { name: "Search" })).toBeEnabled();
  await frame.getByPlaceholder('Keyword(s)').press("Backspace");
  await expect(frame.getByRole("button", { name: "Search" })).toBeDisabled();
});

test.fixme("search should show results", async ({ page }) => {
  const frame = await locators.frame(page);
  await frame.getByPlaceholder('Keyword(s)').fill("food");
  await frame.getByPlaceholder('Keyword(s)').press("Enter");
  await frame.getByRole("button", { name: "Search" }).click();
  await expect(frame.getByLabel('Keyword Research')).toBeVisible();
  await frame.getByLabel("Count").waitFor({ state: "visible", timeout: 20000 });
  if (await frame.getByRole("row").count() > 0) {
    expect(true).toBe(true);
  } else {
    expect(true).toBe(false);
  }
});

test("search should send the correct request data", async ({ page }) => {
  // Get the frame and the expected data
  const frame = await locators.frame(page);
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
  // Intercept the network request
  page.on('request', request => {
    if (request.url() === "https://staging-yozo.cortechs-ai.com/api/keywords?shop=rubixteststore.myshopify.com") {
      requestPayload = request.postDataJSON();
    }
  });

  // Fill the form and submit
  await frame.getByPlaceholder('Keyword(s)').fill(expectedKeywords);
  await frame.getByPlaceholder('Keyword(s)').press("Enter");
  await frame.getByRole("combobox").nth(1).selectOption(langTarget);
  await frame.getByRole("combobox").nth(0).selectOption(countryTarget);
  await frame.getByRole("button", { name: "Search" }).click();

  // Validate the request payload
  expect(requestPayload).toBeDefined();
  expect(requestPayload.keywords).toEqual([expectedKeywords]);
  expect(requestPayload.language_id.toString()).toEqual(expectedLanguageId);
  expect(requestPayload.location_ids.toString()).toEqual(expectedCountryId);
});

test.fixme("search should reset the page number", async ({ page }) => {
});
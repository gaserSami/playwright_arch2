import { test, expect, Page } from '@playwright/test';
import {setup} from './setup.ts';
import * as locators from "./locators.ts";
import {loadGeoTargets, GeoTarget, loadLangTargets, langTarget} from '../../utils/utils.ts';

test.describe("Keyword Research page", () => {
  test.describe("Keywords Research Tab", () => {
    test.beforeEach(async ({ page }) => {
      await setup(page);
      const frame = await locators.frame(page);
      await locators.tab(frame, "Keyword Research").click();
    });

    test("should see tab basic elements", async ({ page }) => {
      const frame = await locators.frame(page);
      await expect(locators.keywordsBox(frame)).toBeVisible();
      await expect(locators.countryBox(frame)).toBeVisible();
      await expect(locators.langBox(frame)).toBeVisible();
      await expect(locators.searchBtn(frame)).toBeVisible();
    });

    test.describe("Keywords Box", () => {

      test("should be able to add keyword", async ({ page }) => {
        const frame = await locators.frame(page);
        await locators.keywordsBox(frame).fill("example");
        await locators.keywordsBox(frame).press("Enter");
        await expect(locators.keyword(frame, "example")).toBeVisible();
      });

      test("should be able to delete keyword x button", async ({ page }) => {
        const frame = await locators.frame(page);
        await locators.keywordsBox(frame).fill("example");
        await locators.keywordsBox(frame).press("Enter");
        await expect(locators.keyword(frame, "example")).toBeVisible();
        await locators.removeBtn(frame, "example").click();
        await expect(locators.keyword(frame, "example")).not.toBeVisible();
      });

      test("should be able to delete keyword using keyboard", async ({ page }) => {
        const frame = await locators.frame(page);
        await locators.keywordsBox(frame).fill("example");
        await locators.keywordsBox(frame).press("Enter");
        await expect(locators.keyword(frame, "example")).toBeVisible();
        await locators.keywordsBox(frame).press("Backspace");
        await expect(locators.keyword(frame, "example")).not.toBeVisible();
      });

      test("should be able to add and delete multiple keywords", async ({ page }) => {
        const frame = await locators.frame(page);
        await locators.keywordsBox(frame).fill("example1");
        await locators.keywordsBox(frame).press("Enter");
        await locators.keywordsBox(frame).fill("example2");
        await locators.keywordsBox(frame).press("Enter");
        await expect(locators.keyword(frame, "example1")).toBeVisible();
        await expect(locators.keyword(frame, "example2")).toBeVisible();
        await locators.removeBtn(frame, "example1").click();
        await expect(locators.keyword(frame, "example1")).not.toBeVisible();
        await locators.removeBtn(frame, "example2").click();
        await expect(locators.keyword(frame, "example2")).not.toBeVisible();
      });

      test("shouldn't add duplicate keywords", async ({ page }) => {
        const frame = await locators.frame(page);
        await locators.keywordsBox(frame).fill("example");
        await locators.keywordsBox(frame).press("Enter");
        await locators.keywordsBox(frame).fill("example");
        await locators.keywordsBox(frame).press("Enter");
        await expect(locators.keyword(frame, "example")).toHaveCount(1);
      });

      test.fixme("there should be a message for duplicate keywords", async ({ page }) => {
        const frame = await locators.frame(page);
        await locators.keywordsBox(frame).fill("example");
        await locators.keywordsBox(frame).press("Enter");
        await locators.keywordsBox(frame).fill("example");
        await locators.keywordsBox(frame).press("Enter");
        await expect(page.getByText("Keyword already exists")).toBeVisible();
      });

      test.describe('Manual Tests', () => {
        test.skip('Handle many keywords in good UI and performance', () => {
          console.log("many keywords should be handled in good UI, performance");
        });

        test.skip('Handle very long keywords in good UI and performance', () => {
          console.log("very long keywords should be handled in good UI, performance");
        });

        test.skip('Handle spamming with adding and deleting in good UI and performance', () => {
          console.log("spamming with adding and deleting should be handled in good UI, performance");
        });
      });
    });

    test.describe("Country Box", () => {
      test("should be able to select country with mouse", async ({ page }) => {
        const frame = await locators.frame(page);
        await locators.countryBox(frame).click();
        await locators.countryBox(frame).selectOption("American Samoa");
        await expect(frame.locator("span").getByText(/American Samoa/)).toBeVisible();
      });

      test("should check if each dropdown option has the correct value", async ({ page }) => {
        // Load the geo targets from the CSV file
        const geoTargets = await loadGeoTargets('resources/geotargets-2024-08-13.csv');

        // Get the frame and dropdown
        const frame = await locators.frame(page);
        const countryBox = await locators.countryBox(frame);

        // Click on the dropdown to display all options
        await countryBox.click();

        // Get all options from the dropdown
        const options = await countryBox.locator('option');
        const optionCount = await options.count();

        // Loop through each option in the dropdown
        for (let i = 0; i < optionCount; i++) {
          const optionText = await options.nth(i).textContent();
          const optionValue = await options.nth(i).getAttribute('value');

          // Find the corresponding target from the CSV file
          const matchingTarget = geoTargets.find(target => target["Name"] === optionText);

          // If the option exists in the CSV file, validate its value
          if (matchingTarget) {
            expect(optionValue).toEqual(matchingTarget["Criteria ID"]);
          } else {
            console.warn(`Option ${optionText} not found in the CSV file`);
          }
        }
      });

      test("should be able to select an option using keyboard", async ({ page }) => {
        const frame = await locators.frame(page);
        await locators.countryBox(frame).click();
        await locators.countryBox(frame).press("ArrowUp");
        await locators.countryBox(frame).press("ArrowUp");
        await locators.countryBox(frame).press("Enter");
        await expect(frame.locator("span").getByText(/United Arab Emirates/)).toBeVisible();
        await locators.countryBox(frame).click();
        await locators.countryBox(frame).press("ArrowDown");
        await locators.countryBox(frame).press("Enter");
        await expect(frame.locator("span").getByText(/United Kingdom/)).toBeVisible();
      });
      
      test("should be able to select an option using search", async ({ page }) => {
        const frame = await locators.frame(page);
        await locators.countryBox(frame).click();
        await locators.countryBox(frame).press("u");
        await locators.countryBox(frame).press("n");
        await locators.countryBox(frame).press("a");
        await locators.countryBox(frame).press("b");
        await locators.countryBox(frame).press("Enter");
        await expect(frame.locator("span").getByText(/Bahrain/)).toBeVisible();
      });
      
      test("should be able to select an option by using left and right keys", async ({ page }) => {
        const frame = await locators.frame(page);
        await locators.countryBox(frame).press("ArrowRight");
        await locators.countryBox(frame).press("ArrowRight");
        await locators.countryBox(frame).press("ArrowLeft");
        await locators.countryBox(frame).press("ArrowLeft");
        await locators.countryBox(frame).press("ArrowLeft");
        await expect(frame.locator("span").getByText(/United Kingdom/)).toBeVisible();
      });

      test("should be able to select an option by using up and down keys", async ({ page }) => {
        const frame = await locators.frame(page);
        await locators.countryBox(frame).press("ArrowDown");
        await locators.countryBox(frame).press("ArrowDown");
        await locators.countryBox(frame).press("ArrowUp");
        await locators.countryBox(frame).press("ArrowUp");
        await locators.countryBox(frame).press("ArrowUp");
        await expect(frame.locator("span").getByText(/United Kingdom/)).toBeVisible();
      });
    });

    test.describe("Language Box", () => {
      test("should be able to select language with mouse", async ({ page }) => {
        const frame = await locators.frame(page);
        await locators.langBox(frame).click();
        await locators.langBox(frame).selectOption("Arabic");
        await expect(frame.locator("span").getByText(/Arabic/)).toBeVisible();
      });

      test("should check if each dropdown option has the correct value", async ({ page }) => {
        // Load the lang targets from the CSV file
        const langTargets = await loadLangTargets('resources/languagecodes.csv');

        // Get the frame and dropdown
        const frame = await locators.frame(page);
        const langBox = await locators.langBox(frame);

        // Click on the dropdown to display all options
        await langBox.click();

        // Get all options from the dropdown
        const options = await langBox.locator('option');
        const optionCount = await options.count();

        // Loop through each option in the dropdown
        for (let i = 0; i < optionCount; i++) {
          const optionText = await options.nth(i).textContent();
          const optionValue = await options.nth(i).getAttribute('value');

          // Find the corresponding target from the CSV file
          const matchingTarget = langTargets.find(target => target["Language name"] === optionText);

          // If the option exists in the CSV file, validate its value
          if (matchingTarget) {
            expect(optionValue).toEqual(matchingTarget["Criterion ID"]);
          } else {
            console.warn(`Option ${optionText} not found in the CSV file`);
          }
        }
      });

      test("should be able to select an option using keyboard", async ({ page }) => {
        const frame = await locators.frame(page);
        await locators.langBox(frame).click();
        await locators.langBox(frame).press("ArrowUp");
        await locators.langBox(frame).press("ArrowUp");
        await locators.langBox(frame).press("Enter");
        await expect(frame.locator("span").getByText(/Danish/)).toBeVisible();
        await locators.langBox(frame).click();
        await locators.langBox(frame).press("ArrowDown");
        await locators.langBox(frame).press("Enter");
        await expect(frame.locator("span").getByText(/Dutch/)).toBeVisible();
      });
      
      test("should be able to select an option using search", async ({ page }) => {
        const frame = await locators.frame(page);
        await locators.langBox(frame).click();
        await locators.langBox(frame).press("e");
        await locators.langBox(frame).press("a");
        await locators.langBox(frame).press("r");
        await locators.langBox(frame).press("s");
        await locators.langBox(frame).press("Enter");
        await expect(frame.locator("span").getByText(/serbian/)).toBeVisible();
      });

      test("should be able to change an option by using left and right keys", async ({ page }) => {
        const frame = await locators.frame(page);
        await locators.langBox(frame).press("ArrowRight");
        await locators.langBox(frame).press("ArrowRight");
        await locators.langBox(frame).press("ArrowLeft");
        await locators.langBox(frame).press("ArrowLeft");
        await locators.langBox(frame).press("ArrowLeft");
        await expect(frame.locator("span").getByText(/Dutch/)).toBeVisible();
      });

      test("should be able to change an option by using up and down keys", async ({ page }) => {
        const frame = await locators.frame(page);
        await locators.langBox(frame).press("ArrowDown");
        await locators.langBox(frame).press("ArrowDown");
        await locators.langBox(frame).press("ArrowUp");
        await locators.langBox(frame).press("ArrowUp");
        await locators.langBox(frame).press("ArrowUp");
        await expect(frame.locator("span").getByText(/Dutch/)).toBeVisible();
      });
    });

    test.describe("Search functionality", () => {
      test("Search button should be disabled when there are no keywords enabled otherwise", async ({ page }) => {
        const frame = await locators.frame(page);
        await expect(locators.searchBtn(frame)).toBeDisabled();
        await locators.keywordsBox(frame).fill("food");
        await locators.keywordsBox(frame).press("Enter");
        await expect(locators.searchBtn(frame)).toBeEnabled();
        await locators.keywordsBox(frame).press("Backspace");
        await expect(locators.searchBtn(frame)).toBeDisabled();
      });

      test("search should show results", async ({ page }) => {
        const frame = await locators.frame(page);
        await locators.keywordsBox(frame).fill("food");
        await locators.keywordsBox(frame).press("Enter");
        await locators.searchBtn(frame).click();
        await expect(locators.monthlyVolume(frame)).toBeVisible();
        await expect(locators.relatedKeywords(frame)).toBeVisible();
      });

      test("search should send the correct request data", async ({ page }) => {
        // Get the frame and the expected data
        const frame = await locators.frame(page);
        const expectedKeywords = "food";
        const langTarget = "Dutch";
        const countryTarget = "Morocco";

        let options = await locators.langBox(frame).locator("option");
        let optionsCount = await options.count();

        let expectedLanguageId;
        for(let i =0; i < optionsCount; i++){
          let option = options.nth(i);
          if(await option.textContent() === langTarget){
            expectedLanguageId = await option.getAttribute("value");
            break;
          }
        }

        let expectedCountryId;
        options = await locators.countryBox(frame).locator("option");
        optionsCount = await options.count();
        for(let i =0; i < optionsCount; i++){
          let option = options.nth(i);
          if(await option.textContent() === countryTarget){
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
        await locators.keywordsBox(frame).fill(expectedKeywords);
        await locators.keywordsBox(frame).press("Enter");
        await locators.langBox(frame).selectOption(langTarget);
        await locators.countryBox(frame).selectOption(countryTarget);
        await locators.searchBtn(frame).click();

        // Validate the request payload
        expect(requestPayload).toBeDefined();
        expect(requestPayload.keywords).toEqual([expectedKeywords]);
        expect(requestPayload.language_id.toString()).toEqual(expectedLanguageId);
        expect(requestPayload.location_ids.toString()).toEqual(expectedCountryId);
      });

      test("search should sent the correct request data with multiple keywords and the deleted keyword should not be sent", async ({ page }) => {
        // Get the frame and the expected data
        const frame = await locators.frame(page);
        let expectedKeywords = ["food", "drink", "toDelete"];

        let requestPayload;
         // Intercept the network request
        page.on('request', request => {
          if (request.url() === "https://staging-yozo.cortechs-ai.com/api/keywords?shop=rubixteststore.myshopify.com") {
            requestPayload = request.postDataJSON();
          }
        });

        // Fill the form and submit
        for (const keyword of expectedKeywords) {
          await locators.keywordsBox(frame).fill(keyword);
          await locators.keywordsBox(frame).press("Enter");
        }
        await locators.keywordsBox(frame).press("Backspace");
        await locators.searchBtn(frame).click();
        expectedKeywords = expectedKeywords.filter(keyword => keyword !== "toDelete");

        // Validate the request payload
        expect(requestPayload).toBeDefined();
        expect(requestPayload.keywords).toEqual(expectedKeywords);
      });

      test("Monthly volume should be 0 initially", async ({ page }) => {
        const frame = await locators.frame(page);
        await locators.keywordsBox(frame).fill("food");
        await locators.keywordsBox(frame).press("Enter");
        await locators.searchBtn(frame).click();
        await expect(locators.monthlyVolume(frame)).toContainText("0.00");
      });

      test.only("should be able to select results row", async ({ page }) => {
        const frame = await locators.frame(page);
        await locators.keywordsBox(frame).fill("food");
        await locators.keywordsBox(frame).press("Enter");
        await locators.searchBtn(frame).click();
        await locators.resultsRowByIndex(frame, 0).click();
        // await locators.rowCheckBoxByIndex(frame, 0).click();
        await expect(locators.rowCheckBoxByIndex(frame, 0)).toHaveCSS('background-color', 'rgba(241, 241, 241, 1)');
      });

      // manual tests
      // the results should be expected based on the data sent
      // good UI
      // good performance normally
      // good performance with spaming
    });
      

  });
});
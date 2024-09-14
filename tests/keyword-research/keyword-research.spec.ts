import { test } from '../../utils/test';
import { expect } from '@playwright/test';
import * as locators from "./locators";
import { loadGeoTargets, loadLangTargets } from '../../utils/utils';

// =======================================================================================
// =======================================================================================
// =================== Keyword Research Tab Test Cases ===================================
test.describe("Keyword Research page", () => {
  test.describe("Keywords Research Tab", () => {
    test.beforeEach(async ({ page }) => {
      await page.goto("/apps/yozo-ai-staging/keyword-research");
    });

    test.describe("adding and deleting keywords", () => {
      test("should be able to add keyword (UI)", async ({ page }) => {
        const frame = await locators.frame(page);
        const keyword = "example";
        await frame.getByPlaceholder('Keyword(s)').fill(keyword);
        await frame.getByPlaceholder('Keyword(s)').press("Enter");
        await expect(frame.locator('span').filter({ hasText: keyword }).first()).toBeVisible();
      });

      test("should be able to add keyword (Request)", async ({ page }) => {
        const frame = await locators.frame(page);
        const keyword = "example";

        // Intercept the network request
        let requestPayload;
        page.on('request', request => {
          if (request.url() === "https://staging-yozo.cortechs-ai.com/api/keywords?shop=rubixteststore.myshopify.com") {
            requestPayload = request.postDataJSON();
          }
        });

        // Fill the form and submit
        await frame.getByPlaceholder('Keyword(s)').fill(keyword);
        await frame.getByPlaceholder('Keyword(s)').press("Enter");
        await frame.getByRole("button", { name: "Search" }).click();

        // Validate the request payload
        expect(requestPayload).toBeDefined();
        expect(requestPayload.keywords).toEqual([keyword]);
      });

      test("should be able to delete one keyword x button (UI)", async ({ page }) => {
        const frame = await locators.frame(page);
        const keyword = "example";
        await frame.getByPlaceholder('Keyword(s)').fill(keyword);
        await frame.getByPlaceholder('Keyword(s)').press("Enter");
        await expect(frame.locator('span').filter({ hasText: keyword }).first()).toBeVisible();
        await frame.getByLabel("Remove " + keyword).click();
        await expect(frame.locator('span').filter({ hasText: keyword }).first()).not.toBeVisible();
      });

      test("should be able to delete one keyword using keyboard (UI)", async ({ page }) => {
        const frame = await locators.frame(page);
        const keyword = "example";
        await frame.getByPlaceholder('Keyword(s)').fill(keyword);
        await frame.getByPlaceholder('Keyword(s)').press("Enter");
        await expect(frame.locator('span').filter({ hasText: keyword }).first()).toBeVisible();
        await frame.getByPlaceholder('Keyword(s)').press("Backspace");
        await expect(frame.locator('span').filter({ hasText: keyword }).first()).not.toBeVisible();
      });

      test("should be able to add and delete multiple keywords from start, middle, end (UI)", async ({ page }) => {
        const frame = await locators.frame(page);
        const keywords = ["example1", "example2", "example3", "example4", "example5", "example6", "example7"];
        for (let i = 0; i < keywords.length; i++) {
          await frame.getByPlaceholder('Keyword(s)').fill(keywords[i]);
          await frame.getByPlaceholder('Keyword(s)').press("Enter");
        }
        for (let i = 0; i < keywords.length; i++) {
          await expect(frame.locator('span').filter({ hasText: keywords[i] }).first()).toBeVisible();
        }
        // Delete from start
        await frame.getByLabel("Remove " + keywords[0]).click();
        await expect(frame.locator('span').filter({ hasText: keywords[0] }).first()).not.toBeVisible();
        // Delete from middle
        await frame.getByLabel("Remove " + keywords[2]).click();
        await expect(frame.locator('span').filter({ hasText: keywords[2] }).first()).not.toBeVisible();
        // Delete from end
        await frame.getByLabel("Remove " + keywords[keywords.length - 1]).click();
        await expect(frame.locator('span').filter({ hasText: keywords[keywords.length - 1] }).first()).not.toBeVisible();

        // others should be visible
        for (let i = 1; i < keywords.length - 1; i++) {
          if (i === 2) continue;
          await expect(frame.locator('span').filter({ hasText: keywords[i] }).first()).toBeVisible();
        }
      });

      test("should be able to add multiple keywords and delete multiple keywords using keyboard  (Request)", async ({ page }) => {
        const frame = await locators.frame(page);
        const keywords = ["example1", "example2", "example3", "example4", "example5", "example6", "example7"];
        for (let i = 0; i < keywords.length; i++) {
          await frame.getByPlaceholder('Keyword(s)').fill(keywords[i]);
          await frame.getByPlaceholder('Keyword(s)').press("Enter");
        }
        // Delete using keyboard
        await frame.getByPlaceholder('Keyword(s)').press("Backspace");
        await frame.getByPlaceholder('Keyword(s)').press("Backspace");

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
        const frame = await locators.frame(page);
        const keyword = "example";
        await frame.getByPlaceholder('Keyword(s)').fill(keyword);
        await frame.getByPlaceholder('Keyword(s)').press("Enter");
        await frame.getByPlaceholder('Keyword(s)').fill(keyword);
        await frame.getByPlaceholder('Keyword(s)').press("Enter");
        await expect(frame.locator('span').filter({ hasText: keyword }).first()).toHaveCount(1);
      });

      test("shouldn't add duplicate keywords (Request)", async ({ page }) => {
        const frame = await locators.frame(page);
        const keyword = "example";
        await frame.getByPlaceholder('Keyword(s)').fill(keyword);
        await frame.getByPlaceholder('Keyword(s)').press("Enter");
        await frame.getByPlaceholder('Keyword(s)').fill(keyword);
        await frame.getByPlaceholder('Keyword(s)').press("Enter");

        // Intercept the network request
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
        await frame.getByPlaceholder('Keyword(s)').fill("example");
        await frame.getByPlaceholder('Keyword(s)').press("Enter");
        await frame.getByPlaceholder('Keyword(s)').fill("example");
        await frame.getByPlaceholder('Keyword(s)').press("Enter");
        await expect(page.getByText("Keyword already exists")).toBeVisible();
      });
    });

    test.describe("Geo Target Dropdown", () => {
      test("should be able to select country with mouse", async ({ page }) => {
        const frame = await locators.frame(page);
        await frame.getByRole("combobox").nth(0).click();
        await frame.getByRole("combobox").nth(0).selectOption("American Samoa");
        await expect(frame.locator("span").getByText(/American Samoa/)).toBeVisible();
      });

      test("should check if each dropdown option has the correct value", async ({ page }) => {
        // Load the geo targets from the CSV file
        const geoTargets = await loadGeoTargets('resources/geotargets-2024-08-13.csv');

        // Get the frame and dropdown
        const frame = await locators.frame(page);
        const countryBox = await frame.getByRole("combobox").nth(0);

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
        await frame.getByRole("combobox").nth(0).click();
        await frame.getByRole("combobox").nth(0).press("ArrowUp");
        await frame.getByRole("combobox").nth(0).press("ArrowUp");
        await frame.getByRole("combobox").nth(0).press("Enter");
        await expect(frame.locator("span").getByText(/United Arab Emirates/)).toBeVisible();
        await frame.getByRole("combobox").nth(0).click();
        await frame.getByRole("combobox").nth(0).press("ArrowDown");
        await frame.getByRole("combobox").nth(0).press("Enter");
        await expect(frame.locator("span").getByText(/United Kingdom/)).toBeVisible();
      });

      test("should be able to select an option using search", async ({ page }) => {
        const frame = await locators.frame(page);
        await frame.getByRole("combobox").nth(0).click();
        await frame.getByRole("combobox").nth(0).press("u");
        await frame.getByRole("combobox").nth(0).press("n");
        await frame.getByRole("combobox").nth(0).press("a");
        await frame.getByRole("combobox").nth(0).press("b");
        await frame.getByRole("combobox").nth(0).press("Enter");
        await expect(frame.locator("span").getByText(/Bahrain/)).toBeVisible();
      });

      test("should be able to select an option by using left and right keys", async ({ page }) => {
        const frame = await locators.frame(page);
        await frame.getByRole("combobox").nth(0).press("ArrowRight");
        await frame.getByRole("combobox").nth(0).press("ArrowRight");
        await frame.getByRole("combobox").nth(0).press("ArrowLeft");
        await frame.getByRole("combobox").nth(0).press("ArrowLeft");
        await frame.getByRole("combobox").nth(0).press("ArrowLeft");
        await expect(frame.locator("span").getByText(/United Kingdom/)).toBeVisible();
      });

      test("should be able to select an option by using up and down keys", async ({ page }) => {
        const frame = await locators.frame(page);
        await frame.getByRole("combobox").nth(0).press("ArrowDown");
        await frame.getByRole("combobox").nth(0).press("ArrowDown");
        await frame.getByRole("combobox").nth(0).press("ArrowUp");
        await frame.getByRole("combobox").nth(0).press("ArrowUp");
        await frame.getByRole("combobox").nth(0).press("ArrowUp");
        await expect(frame.locator("span").getByText(/United Kingdom/)).toBeVisible();
      });

      test("should be able to select language with mouse", async ({ page }) => {
        const frame = await locators.frame(page);
        await frame.getByRole("combobox").nth(1).click();
        await frame.getByRole("combobox").nth(1).selectOption("Arabic");
        await expect(frame.locator("span").getByText(/Arabic/)).toBeVisible();
      });
    });

    test.describe("Lang Target Dropdown", () => {

      test("should check if each dropdown option has the correct value", async ({ page }) => {
        // Load the lang targets from the CSV file
        const langTargets = await loadLangTargets('resources/languagecodes.csv');

        // Get the frame and dropdown
        const frame = await locators.frame(page);
        const langBox = await frame.getByRole("combobox").nth(1);

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
        await frame.getByRole("combobox").nth(1).click();
        await frame.getByRole("combobox").nth(1).press("ArrowUp");
        await frame.getByRole("combobox").nth(1).press("ArrowUp");
        await frame.getByRole("combobox").nth(1).press("Enter");
        await expect(frame.locator("span").getByText(/Danish/)).toBeVisible();
        await frame.getByRole("combobox").nth(1).click();
        await frame.getByRole("combobox").nth(1).press("ArrowDown");
        await frame.getByRole("combobox").nth(1).press("Enter");
        await expect(frame.locator("span").getByText(/Dutch/)).toBeVisible();
      });

      test("should be able to select an option using search", async ({ page }) => {
        const frame = await locators.frame(page);
        await frame.getByRole("combobox").nth(1).click();
        await frame.getByRole("combobox").nth(1).press("e");
        await frame.getByRole("combobox").nth(1).press("a");
        await frame.getByRole("combobox").nth(1).press("r");
        await frame.getByRole("combobox").nth(1).press("s");
        await frame.getByRole("combobox").nth(1).press("Enter");
        await expect(frame.locator("span").getByText(/serbian/)).toBeVisible();
      });

      test("should be able to change an option by using left and right keys", async ({ page }) => {
        const frame = await locators.frame(page);
        await frame.getByRole("combobox").nth(1).press("ArrowRight");
        await frame.getByRole("combobox").nth(1).press("ArrowRight");
        await frame.getByRole("combobox").nth(1).press("ArrowLeft");
        await frame.getByRole("combobox").nth(1).press("ArrowLeft");
        await frame.getByRole("combobox").nth(1).press("ArrowLeft");
        await expect(frame.locator("span").getByText(/Dutch/)).toBeVisible();
      });

      test("should be able to change an option by using up and down keys", async ({ page }) => {
        const frame = await locators.frame(page);
        await frame.getByRole("combobox").nth(1).press("ArrowDown");
        await frame.getByRole("combobox").nth(1).press("ArrowDown");
        await frame.getByRole("combobox").nth(1).press("ArrowUp");
        await frame.getByRole("combobox").nth(1).press("ArrowUp");
        await frame.getByRole("combobox").nth(1).press("ArrowUp");
        await expect(frame.locator("span").getByText(/Dutch/)).toBeVisible();
      });
    });

    test.describe("Searching for keywords", () => {
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
    });

    test.describe("Monthly Volume", () => {

      test("Monthly volume should be 0 initially", async ({ page }) => {
        // Get the frame
        const frame = await locators.frame(page);

        // Perform actions
        await frame.getByPlaceholder('Keyword(s)').fill('food');
        await frame.getByPlaceholder('Keyword(s)').press('Enter');
        await frame.getByRole('button', { name: 'Search' }).click();
        await expect(frame.getByLabel('Keyword Research')).toContainText("0.00");
      });

      test("Monthly volume should be updated correctly on selecting/deselecting keywords", async ({ page }) => {
        // Get the frame
        const frame = await locators.frame(page);

        // Perform actions
        await frame.getByPlaceholder('Keyword(s)').fill('food');
        await frame.getByPlaceholder('Keyword(s)').press('Enter');
        await frame.getByRole('button', { name: 'Search' }).click();

        // Wait for rows to be present
        await frame.getByRole("row").nth(0).waitFor({ state: "visible" });

        // Function to get the total volume from selected rows
        const getTotalVolume = async () => {
          const rowCount = await frame.getByRole('row').count();
          let totalVolume = 0;
          for (let i = 0; i < rowCount; i++) {
            const volumeText = await frame.getByRole('row').nth(i).getByRole('cell').nth(2).textContent();
            const volume = parseInt(volumeText.replace(/,/g, ''));
            totalVolume += volume;
          }
          return totalVolume;
        };

        // Select all rows and check the total volume
        await frame.locator('thead').locator('tr').locator('th').nth(0).click();
        let expectedTotalVolume = await getTotalVolume();
        let displayedTotalVolume = await frame.getByLabel('Keyword Research').textContent();
        await expect(parseInt(displayedTotalVolume.replace(/,/g, ''))).toEqual(expectedTotalVolume);

        // Deselect all rows and check the total volume
        await frame.getByText('Deselect all 20 keywords20').click();
        await expect(frame.getByLabel('Keyword Research')).toContainText("0.00");

        // Select the first row and check the total volume
        await frame.getByRole('row').nth(1).click();
        const firstRowVolume = await frame.getByRole('row').nth(1).getByRole('cell').nth(2).textContent();
        await expect(frame.getByLabel('Keyword Research')).toContainText(firstRowVolume);

        // Deselect the first row and check the total volume
        await frame.getByRole('row').nth(1).click();
        await expect(frame.getByLabel('Keyword Research')).toContainText("0.00");
      });

      test("should reset on search", async ({ page }) => {
        // Get the frame
        const frame = await locators.frame(page);

        // Perform actions
        await frame.getByPlaceholder('Keyword(s)').fill('food');
        await frame.getByPlaceholder('Keyword(s)').press('Enter');
        await frame.getByRole('button', { name: 'Search' }).click();
        await expect(frame.getByLabel('Keyword Research')).toContainText("0.00");

        // Select a row
        await frame.getByRole('row').nth(1).click();
        const firstRowVolume = await frame.getByRole('row').nth(1).getByRole('cell').nth(2).textContent();
        await expect(frame.getByLabel('Keyword Research')).toContainText(firstRowVolume);

        // Perform new search
        await frame.getByLabel("Remove " + "food").click();
        await frame.getByPlaceholder('Keyword(s)').fill('shrimp');
        await frame.getByPlaceholder('Keyword(s)').press('Enter');
        await frame.getByRole('button', { name: 'Search' }).click();
        await expect(frame.getByLabel('Keyword Research')).toContainText("0.00");
      });
    });

    test.describe("liking keywords", () => {
      test("should be able to select results row and like it from floating like", async ({ page }) => {
        // Get the frame
        const frame = await locators.frame(page);

        // if there is any keyword in the my keywords tab, delete it
        await frame.getByRole('tab', { name: 'My Keywords' }).click();
        await frame.getByLabel("Count").waitFor({ state: "visible" });
        if (await frame.getByRole("row").count() > 0) {
          await frame.locator('thead').locator('tr').locator('th').nth(0).click();
          await frame.locator('.Polaris-BulkActions__ButtonGroupWrapper').locator("button").nth(1).click();
          await expect(frame.getByRole("row")).toHaveCount(0);
        }
        await frame.getByRole('tab', { name: 'Keyword Research' }).click();

        // Perform actions
        await frame.getByPlaceholder('Keyword(s)').fill('food');
        await frame.getByPlaceholder('Keyword(s)').press('Enter');
        await frame.getByRole('button', { name: 'Search' }).click();
        await expect(frame.locator('.Polaris-BulkActions__ButtonGroupWrapper')).not.toBeVisible();
        await frame.getByRole('row').nth(1).click();
        await expect(frame.locator('.Polaris-BulkActions__ButtonGroupWrapper')).toBeVisible();

        // selecting and deselecting should have no effect
        await frame.getByRole("row").nth(2).click();
        await frame.getByRole("row").nth(2).click();

        // like the keyword
        await frame.locator('.Polaris-BulkActions__ButtonGroupWrapper').locator("button").nth(1).click();
        const expectedKeyword = await frame.getByRole('row').nth(1).getByRole('cell').nth(1).textContent() || '2124';
        await frame.getByRole('tab', { name: 'My Keywords' }).click();
        await expect(frame.getByRole("row")).toHaveCount(2);
        await expect(await frame.getByRole('row').nth(1).getByRole('cell').nth(1).textContent()).toEqual(expectedKeyword);
      });

      test("should be able to like keyword row like", async ({ page }) => {
        // Get the frame
        const frame = await locators.frame(page);

        // Navigate to "My Keywords" tab and delete any existing keywords
        await frame.getByRole('tab', { name: 'My Keywords' }).click();
        await frame.getByLabel("Count").waitFor({ state: "visible" });
        if (await frame.getByRole("row").count() > 0) {
          await frame.locator('thead').locator('tr').locator('th').nth(0).click();
          await frame.locator('.Polaris-BulkActions__ButtonGroupWrapper').locator("button").nth(1).click();
          await expect(frame.getByRole("row")).toHaveCount(0);
        }

        // Navigate to "Keyword Research" tab
        await frame.getByRole('tab', { name: 'Keyword Research' }).click();

        // Perform keyword search and like the first keyword
        await frame.getByPlaceholder('Keyword(s)').fill('food');
        await frame.getByPlaceholder('Keyword(s)').press('Enter');
        await frame.getByRole('button', { name: 'Search' }).click();
        await frame.getByRole("row").nth(0).getByRole("cell").nth(0).click();
        await frame.getByRole('row').nth(1).getByRole('button').nth(1).click();
        const expectedKeyword = await frame.getByRole('row').nth(1).getByRole('cell').nth(1).textContent() || '2124';

        // Verify the keyword is added to "My Keywords" tab
        await frame.getByRole('tab', { name: 'My Keywords' }).click();
        await expect(frame.getByRole("row")).toHaveCount(2);
        await expect(await frame.getByRole('row').nth(1).getByRole('cell').nth(1).textContent()).toEqual(expectedKeyword);
      });
    });

    test.describe("writing with keywords", () => {
      test("should be able to write with row write", async ({ page }) => {
        // Get the frame
        const frame = await locators.frame(page);

        // Perform keyword search and like the first keyword
        await frame.getByPlaceholder('Keyword(s)').fill('food');
        await frame.getByPlaceholder('Keyword(s)').press('Enter');
        await frame.getByRole('button', { name: 'Search' }).click();
        // selecting all should have no effect
        await frame.getByRole("row").nth(0).getByRole("cell").nth(0).click();
        const expectedKeyword = await frame.getByRole('row').nth(1).getByRole('cell').nth(1).textContent() || '2124';
        await frame.getByRole('row').nth(1).getByRole('button').nth(0).click();

        await frame.getByRole("button", { name: "View advanced settings" }).click();

        // Verify the keyword is added to "My Keywords" tab
        await expect(frame.locator('span').filter({ hasText: expectedKeyword }).first()).toBeVisible();
        await expect(frame.locator('span').first()).toHaveCount(1);
      });

      test("should be able to select rows and write using floating write", async ({ page }) => {
        // Get the frame
        const frame = await locators.frame(page);

        // Perform keyword search
        await frame.getByPlaceholder('Keyword(s)').fill('food');
        await frame.getByPlaceholder('Keyword(s)').press('Enter');
        await frame.getByRole('button', { name: 'Search' }).click();

        // Select the first cell of the first row (select all)
        await frame.getByRole("row").nth(0).getByRole("cell").nth(0).click();
        // deselecting one should work correctly that it should not be included in the write
        await frame.getByRole("row").nth(1).getByRole("cell").nth(0).click();

        // Create an array of expected keywords from all rows starting from index 1
        const rowCount = await frame.getByRole('row').count();
        const expectedKeywords = [];
        for (let i = 2; i < rowCount; i++) {
          const keyword = await frame.getByRole('row').nth(i).getByRole('cell').nth(1).textContent();
          if (keyword) {
            expectedKeywords.push(keyword);
          }
        }

        // Click the button in the first row
        await frame.locator('.Polaris-BulkActions__ButtonGroupWrapper').locator("button").nth(0).click();

        // Click on "View advanced settings"
        await frame.getByRole("button", { name: "View advanced settings" }).click();

        // Verify the keywords are added to "My Keywords" tab
        await expect(frame.locator('.Polaris-TextField').locator("span").locator("button")).toHaveCount(expectedKeywords.length);
        for (const keyword of expectedKeywords) {
          await expect(frame.locator('span').filter({ hasText: keyword }).first()).toBeVisible();
        }
      });
    });
  });
});
// =======================================================================================
// =======================================================================================
// =============================== My Keywords Tab Test Cases =============================
import { test } from '../../utils/test';
import { expect } from '@playwright/test';
import * as locators from "./locators";
import { loadGeoTargets, loadLangTargets } from '../../utils/utils';

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

      test.only("search should show results", async ({ page }) => {
        const frame = await locators.frame(page);
        await frame.getByPlaceholder('Keyword(s)').fill("food");
        await frame.getByPlaceholder('Keyword(s)').press("Enter");
        await frame.getByRole("button", { name: "Search" }).click();
        await expect(frame.getByLabel('Keyword Research')).toBeVisible();
        await frame.getByLabel("Count").waitFor({ state: "visible" });
        await expect(frame.getByRole("row").count()).toBeGreaterThan(0);
      });

      test.only("search should send the correct request data", async ({ page }) => {
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

        // Locate elements once and reuse them
        const keywordSearchBox = () => frame.getByPlaceholder('Keyword(s)');
        const searchButton = () => frame.getByRole('button', { name: 'Search' });
        const MonthlyVolume = () => frame.getByLabel('Keyword Research');

        // Perform actions
        await keywordSearchBox().fill('food');
        await keywordSearchBox().press('Enter');
        await searchButton().click();
        await expect(MonthlyVolume()).toContainText("0.00");
      });

      test("Monthly volume should be updated correctly on selecting/deselecting keywords", async ({ page }) => {
        // Get the frame
        const frame = await locators.frame(page);

        // Define locators as functions to ensure they are evaluated at the time of the call
        const keywordSearchBox = () => frame.getByPlaceholder('Keyword(s)');
        const searchButton = () => frame.getByRole('button', { name: 'Search' });
        const MonthlyVolume = () => frame.getByLabel('Keyword Research');
        const firstHeaderCell = () => frame.locator('thead').locator('tr').locator('th').nth(0);
        const rows = () => frame.getByRole('row');
        const volumeCell = (rowIndex: number) => rows().nth(rowIndex).getByRole('cell').nth(2);

        // Perform actions
        await keywordSearchBox().fill('food');
        await keywordSearchBox().press('Enter');
        await searchButton().click();

        // Wait for rows to be present
        await frame.getByRole("row").waitFor({ state: "visible" });

        // Function to get the total volume from selected rows
        const getTotalVolume = async () => {
          const rowCount = await rows().count();
          let totalVolume = 0;
          for (let i = 0; i < rowCount; i++) {
            const volumeText = await volumeCell(i).textContent();
            const volume = parseInt(volumeText.replace(/,/g, ''));
            totalVolume += volume;
          }
          return totalVolume;
        };

        // Select all rows and check the total volume
        await firstHeaderCell().click();
        let expectedTotalVolume = await getTotalVolume();
        let displayedTotalVolume = await MonthlyVolume().textContent();
        expect(parseInt(displayedTotalVolume.replace(/,/g, ''))).toEqual(expectedTotalVolume);

        // Deselect all rows and check the total volume
        await firstHeaderCell().click();
        expectedTotalVolume = 0;
        displayedTotalVolume = await MonthlyVolume().textContent();
        expect(parseInt(displayedTotalVolume.replace(/,/g, ''))).toEqual(expectedTotalVolume);

        // Select the first row and check the total volume
        await rows().nth(0).click();
        const firstRowVolume = parseInt((await volumeCell(0).textContent()).replace(/,/g, ''));
        displayedTotalVolume = await MonthlyVolume().textContent();
        expect(parseInt(displayedTotalVolume.replace(/,/g, ''))).toEqual(firstRowVolume);

        // Deselect the first row and check the total volume
        await rows().nth(0).click();
        expectedTotalVolume = 0;
        displayedTotalVolume = await MonthlyVolume().textContent();
        expect(parseInt(displayedTotalVolume.replace(/,/g, ''))).toEqual(expectedTotalVolume);
      });

      test.describe("it should reset on research", () => {
        test("should reset on search", async ({ page }) => {
          // Get the frame
          const frame = await locators.frame(page);

          // Define locators as functions to ensure they are evaluated at the time of the call
          const keywordSearchBox = () => frame.getByPlaceholder('Keyword(s)');
          const searchButton = () => frame.getByRole('button', { name: 'Search' });
          const MonthlyVolume = () => frame.getByLabel('Keyword Research');

          // Perform actions
          await keywordSearchBox().fill('food');
          await keywordSearchBox().press('Enter');
          await searchButton().click();
          await expect(MonthlyVolume()).toContainText("0.00");
          // select a row
          const firstRow = await frame.getByRole('row').nth(1);
          await firstRow.click();
          await expect(MonthlyVolume()).not.toContainText("0.00");
          await frame.getByLabel("Remove " + "food").click();
          await keywordSearchBox().fill('shrimp');
          await keywordSearchBox().press('Enter');
          await searchButton().click();
          await expect(MonthlyVolume()).toContainText("0.00");
        });
      });
    });

    test("should be able to select results row and like it from floating like", async ({ page }) => {
      // Get the frame
      const frame = await locators.frame(page);

      // Define locators as functions to ensure they are evaluated at the time of the call
      const keywordSearchBox = () => frame.getByPlaceholder('Keyword(s)');
      const searchButton = () => frame.getByRole('button', { name: 'Search' });
      const firstRow = () => frame.getByRole('row').nth(1);
      const keyword = async () => await firstRow().getByRole('cell').nth(1).textContent() || '2124';
      const myKeywordsTab = () => frame.getByRole('tab', { name: 'My Keywords' });
      const keywordResearchTab = () => frame.getByRole('tab', { name: 'Keyword Research' });
      const bulkActionsButtons = () => frame.locator('.Polaris-BulkActions__ButtonGroupWrapper').locator("button");
      const firstHeaderCell = () => frame.locator('thead').locator('tr').locator('th').nth(0);

      // if there is any keyword in the my keywords tab, delete it
      await myKeywordsTab().click();
      await frame.getByLabel("Count").waitFor({ state: "visible" });
      if (await frame.getByRole("row").count() > 0) {
        await firstHeaderCell().click();
        await bulkActionsButtons().nth(1).click();
        await expect(frame.getByRole("row")).toHaveCount(0);
      }
      await keywordResearchTab().click();

      // Perform actions
      await keywordSearchBox().fill('food');
      await keywordSearchBox().press('Enter');
      await searchButton().click();
      await firstRow().click();
      await bulkActionsButtons().nth(1).click();
      const expectedKeyword = await keyword();
      await myKeywordsTab().click();
      await expect(frame.getByRole("row")).toHaveCount(2);
      await expect(await keyword()).toEqual(expectedKeyword);
    });

    test("keyword research and My Keywords tabs switching, add keyword, row like button, select all my keywords, delete all my keywords", async ({ page }) => {
      // Get the frame
      const frame = await locators.frame(page);

      // Define locators as functions to ensure they are evaluated at the time of the call
      const keywordSearchBox = () => frame.getByPlaceholder('Keyword(s)');
      const searchButton = () => frame.getByRole('button', { name: 'Search' });
      const firstRow = () => frame.getByRole('row').nth(1);
      const likeButton = () => firstRow().getByRole('button').nth(1);
      const keyword = async () => await firstRow().getByRole('cell').nth(1).textContent() || '2124';
      const myKeywordsTab = () => frame.getByRole('tab', { name: 'My Keywords' });
      const keywordResearchTab = () => frame.getByRole('tab', { name: 'Keyword Research' });
      const bulkActionsButtons = () => frame.locator('.Polaris-BulkActions__ButtonGroupWrapper').locator("button");
      const firstHeaderCell = () => frame.locator('thead').locator('tr').locator('th').nth(0);

      // if there is any keyword in the my keywords tab, delete it
      await myKeywordsTab().click();
      await frame.getByLabel("Count").waitFor({ state: "visible" });
      if (await frame.getByRole("row").count() > 0) {
        await firstHeaderCell().click();
        await bulkActionsButtons().nth(1).click();
        await expect(frame.getByRole("row")).toHaveCount(0);
      }
      await keywordResearchTab().click();

      // Perform actions
      await keywordSearchBox().fill('food');
      await keywordSearchBox().press('Enter');
      await searchButton().click();
      await likeButton().click();
      const expectedKeyword = await keyword();
      await myKeywordsTab().click();
      await expect(frame.getByRole("row")).toHaveCount(2);
      await expect(await keyword()).toEqual(expectedKeyword);
    });

  });
});
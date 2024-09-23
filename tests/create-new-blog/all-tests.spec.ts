import { test } from "../../utils/test";
import { expect } from "@playwright/test";
import * as locators from "../../utils/locators";
import { Common } from "../../utils/automation/Common";
import { WordsBox } from "../../utils/automation/wordsBox";
import { count } from "console";

test.beforeEach(async ({ page }) => {
  await page.goto("/apps/yozo-ai-staging/blog_posts");
  await page.locator("a").filter({ hasText: /oscurit/ }).click();
});


test("title regeneration and the data sent in the request", async ({ page }) => {
  const frame = await locators.frame(page);

  let requestPayload;
  page.on('request', async (request) => {
    if (request.url().includes('https://staging-yozo.cortechs-ai.com/api/open_ai?shop=rubixteststore.myshopify.com') && JSON.parse(request.postData()).klass == "BlogPosts::GenerateTitle") {
      requestPayload = JSON.parse(request.postData());
    }
  });

  await frame.getByLabel('Topic Idea').fill('test');
  // expect the title to be empty initially
  await expect(await frame.getByLabel('Title')).toHaveText('');
  await frame.getByRole('button', { name: 'Generate' }).click();
  await Common.waitButtonLoading(frame);
  await expect(await frame.getByLabel('Title')).not.toHaveText('');

  await expect(requestPayload).not.toBe(undefined);
  await expect(requestPayload.language).toBe("english");
  await expect(requestPayload.topic).toBe("test");
});

test("output language dropdown text should match the value", async ({ page }) => {
  const frame = await locators.frame(page);

  if (!frame) {
    console.error("Frame not found");
    return;
  }

  const dropdown = await frame.getByLabel('Select Output Language');
  await dropdown.waitFor(); // Ensure the dropdown is available

  const options = await dropdown.locator('option');
  const optionsCount = await options.count();

  if (optionsCount === 0) {
    console.error("No options found in the dropdown");
    return;
  }

  await dropdown.click();

  for (let i = 0; i < optionsCount; i++) {
    const optionText = await options.nth(i).textContent();
    const optionValue = await options.nth(i).getAttribute('value');

    await expect(optionText?.toLowerCase()).toBe(optionValue?.toLowerCase());
  }
});

test("tone dropdown text should match the value", async ({ page }) => {
  const frame = await locators.frame(page);

  if (!frame) {
    console.error("Frame not found");
    return;
  }

  const dropdown = await frame.getByLabel('Tone');
  await dropdown.waitFor(); // Ensure the dropdown is available

  const options = await dropdown.locator('option');
  const optionsCount = await options.count();

  if (optionsCount === 0) {
    console.error("No options found in the dropdown");
    return;
  }

  await dropdown.click();

  for (let i = 0; i < optionsCount; i++) {
    const optionText = await options.nth(i).textContent();
    const optionValue = await options.nth(i).getAttribute('value');

    console.log(`Comparing option ${i + 1}: text="${optionText}", value="${optionValue}"`);

    await expect(optionText?.toLowerCase()).toBe(optionValue?.toLowerCase());
  }
});

test("should be able to select all the number from min to max range", async ({ page }) => {
  const frame = await locators.frame(page);

  const dropdown = await frame.getByLabel('Choose words count');
  await dropdown.waitFor(); // Ensure the dropdown is available

  const options = await dropdown.locator('option');
  const optionsCount = await options.count();

  if (optionsCount === 0) {
    console.error("No options found in the dropdown");
    return;
  }

  await dropdown.click();

  for (let i = 0; i < optionsCount; i++) {
    const optionText = await options.nth(i).textContent();
    const min_outlines = await options.nth(i).getAttribute('min_outlines');
    const max_outlines = await options.nth(i).getAttribute('max_outlines');
    const optionValue = await options.nth(i).getAttribute('value');

    await dropdown.selectOption({ index: i });
    await expect(await frame.getByLabel('Choose words count')).toHaveValue(optionValue);
    for (let j = parseInt(min_outlines); j <= parseInt(max_outlines); j++) {
      await frame.getByLabel('# of sections in the outline').fill(j.toString());
      const currentValue = await frame.getByLabel('# of sections in the outline').getAttribute('aria-valuenow');
      await expect(currentValue).toEqual(j.toString());
    }
  }
}
);

test.fixme("Add related products view more button should be working correctly", async ({ page }) => {
  const frame = await locators.frame(page);

  await frame.getByPlaceholder("Search Related Products").click();
  const resultsCount = await await frame.locator("li").filter({
    hasNot: frame.getByRole("button", { name: "View More" })
  }).count();
  await frame.getByRole("button", { name: "View More" }).click();
  Common.waitLoading(frame);

  // Exclude "View More" button from the new results count
  const newResultsCount = await frame.locator("li").filter({
    hasNot: frame.getByRole("button", { name: "View More" })
  }).count();

  await expect(newResultsCount).toBeGreaterThan(resultsCount);
});

test("add related products should be able to add (select) / deselect and remove from the choosen related products", async ({ page }) => {
  const frame = await locators.frame(page);

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

  await frame.getByLabel('Remove ' + options[0]).click();
  await frame.getByText(options[0]).isHidden();
  await frame.getByText(options[1]).isVisible();
  // remove the second by deselecting it
  await frame.getByPlaceholder("Search Related Products").click();
  await frame.getByRole("listbox").getByRole("option").nth(1).click();
  await frame.getByPlaceholder("Search Related Products").blur();
  await frame.getByText(options[1]).isHidden();
  await frame.getByText(options[0]).isHidden();
}); 

test("add related articles should be able to add (select) / deselect and remove from the choosen related products", async ({ page }) => {
  const frame = await locators.frame(page);

  // search box
  await frame.getByPlaceholder("Select Related Articles").click();
  let options: string[] = [];
  options.push(await frame.getByRole("listbox").getByRole("option").nth(0).textContent() || "");
  options.push(await frame.getByRole("listbox").getByRole("option").nth(1).textContent() || "");
  await frame.getByRole("listbox").getByRole("option").nth(0).click();
  await frame.getByRole("listbox").getByRole("option").nth(1).click();
  await frame.getByPlaceholder("Select Related Articles").blur();
  // check that the options are selected
  await frame.getByText(options[0]).isVisible();
  await frame.getByText(options[1]).isVisible();

  await frame.getByLabel('Remove ' + options[0]).click();
  await frame.getByText(options[0]).isHidden();
  await frame.getByText(options[1]).isVisible();
  // remove the second by deselecting it
  await frame.getByPlaceholder("Select Related Articles").click();
  await frame.getByRole("listbox").getByRole("option").nth(1).click();
  await frame.getByPlaceholder("Select Related Articles").blur();
  await frame.getByText(options[1]).isHidden();
  await frame.getByText(options[0]).isHidden();
}); 

test("Blog Posts should change related articles to the correct articles", async ({ page }) => {
  const titles_locator = async () => {
    const elements = await page.locator("article-list a:not([class])").all();
    return Promise.all(elements.map(async (element) => await element.innerText()));
  };

  // Scrape the titles
  console.log("Navigating to new blog page...");
  await page.goto("https://rubixteststore.myshopify.com/blogs/new-blog");
  await page.locator("input#password.form-input").fill("123");
  await page.getByRole("button", { name: "Enter" }).click();
  await page.goto("https://rubixteststore.myshopify.com/blogs/new-blog");
  let newBlogTitles = await titles_locator();
  console.log("New blog titles:", newBlogTitles);

  console.log("Navigating to news blog page...");
  await page.goto("https://rubixteststore.myshopify.com/blogs/news");
  let newsBlogTitles = await titles_locator();
  console.log("News blog titles:", newsBlogTitles);

  console.log("Navigating to Yozo AI staging blog posts page...");
  await page.goto("/apps/yozo-ai-staging/blog_posts");
  const frame = await locators.frame(page);


  console.log("Selecting 'News' blog posts...");
  await frame.getByLabel("Blog Posts").selectOption("News");
  await frame.getByPlaceholder("Select Related Articles").click();
  
  let trues: boolean[] = [];
  await frame.getByRole("listbox").getByRole("option").allInnerTexts().then((options) => {
    trues = options
      .filter((option) => !option.toLowerCase().includes("view more"))
      .map((option) => 
        newsBlogTitles.some((title) => title.toLowerCase() === option.toLowerCase())
      );
    console.log("Options in listbox:", options);
    console.log("Matching options:", trues);
  });

   let trueCount = trues.filter(Boolean).length;
  let majority = trues.length / 2;
  
  await expect(trueCount).toBeGreaterThan(majority);

  // again but with 'New Blog' selected
  console.log("Selecting 'New Blog' blog posts...");
  await frame.getByLabel("Blog Posts").selectOption("new blog");
  await frame.getByPlaceholder("Select Related Articles").click();

  trues = [];
  await frame.getByRole("listbox").getByRole("option").allInnerTexts().then((options) => {
    trues = options
      .filter((option) => !option.toLowerCase().includes("view more"))
      .map((option) => 
        newBlogTitles.some((title) => title.toLowerCase() === option.toLowerCase())
      );
    console.log("Options in listbox:", options);
    console.log("Matching options:", trues);
  });

  trueCount = trues.filter(Boolean).length;
  majority = trues.length / 2;

  await expect(trueCount).toBeGreaterThan(majority);
});

test("shouldn't be able to generate without the required fields", async ({ page }) => {
  const frame = await locators.frame(page);

  // initial state
  await expect(await frame.getByRole('button').filter({hasText:"Start Generating Outline"})).toBeDisabled();
  await frame.getByLabel('Topic Idea').fill('test');
  await expect(await frame.getByRole('button').filter({hasText:"Start Generating Outline"})).toBeDisabled();
  await frame.getByLabel('Title').fill('test');
  await expect(await frame.getByRole('button').filter({hasText:"Start Generating Outline"})).toBeEnabled();
  await frame.getByLabel("Tone").selectOption("Other"); // now the button should be disabled
  await expect(await frame.getByRole('button').filter({hasText:"Start Generating Outline"})).toBeDisabled();
  await frame.getByLabel('Other Tone').fill("test tone");
  await expect(await frame.getByRole('button').filter({hasText:"Start Generating Outline"})).toBeEnabled();

  // clearing any of them should disable the button again
  await frame.getByLabel('Topic Idea').fill('');
  await expect(await frame.getByRole('button').filter({hasText:"Start Generating Outline"})).toBeDisabled();
  await frame.getByLabel('Topic Idea').fill('test');
  await expect(await frame.getByRole('button').filter({hasText:"Start Generating Outline"})).toBeEnabled();
  await frame.getByLabel('Title').fill('');
  await expect(await frame.getByRole('button').filter({hasText:"Start Generating Outline"})).toBeDisabled();
  await frame.getByLabel('Title').fill('test');
  await expect(await frame.getByRole('button').filter({hasText:"Start Generating Outline"})).toBeEnabled();
  await frame.getByLabel('Other Tone').fill("");
  await expect(await frame.getByRole('button').filter({hasText:"Start Generating Outline"})).toBeDisabled();
});

test("correct data should be sent in the request", async ({ page }) => {
  const frame = await locators.frame(page);
  await frame.getByLabel("Topic Idea").fill("test topic");
  await frame.getByLabel("Title").fill("test title");

  await frame.getByLabel("Select Output Language").selectOption("Spanish");
  await frame.getByLabel("Tone").selectOption("Upbeat");

  await frame.getByLabel("Choose words count").selectOption("1000");
  await frame.getByLabel("# of sections in the outline").fill("4");

  await frame.getByPlaceholder("Search Related Products").click();
  await frame.getByRole("listbox").getByRole("option").nth(0).click();
  await frame.getByRole("listbox").getByRole("option").nth(1).click();
  let internal_links = [
    await frame.getByRole("listbox").getByRole("option").nth(0).textContent(),
    await frame.getByRole("listbox").getByRole("option").nth(1).textContent()
  ];
  await frame.getByPlaceholder("Search Related Products").blur();

  await frame.getByPlaceholder("Select Related Articles").click();
  await frame.getByRole("listbox").getByRole("option").nth(0).click();
  await frame.getByRole("listbox").getByRole("option").nth(1).click();
  internal_links.push(
    await frame.getByRole("listbox").getByRole("option").nth(0).textContent(),
    await frame.getByRole("listbox").getByRole("option").nth(1).textContent()
  );
  await frame.getByPlaceholder("Select Related Articles").blur();

  await frame.getByRole("button", { name: "View advanced settings" }).click();
  const wordsBox = new WordsBox(page, 'Press "Enter" to add');
  await wordsBox.addWords(["test1", "test2", "test3"]);

  let requestPayload;
  page.on('request', async (request) => {
    if (request.method() === 'POST' && (request.url().includes('https://staging-yozo.cortechs-ai.com/api/open_ai?shop=rubixteststore.myshopify.com') || 
      request.url().includes('https://staging-yozo.cortechs-ai.com/api/open_ai/generate_background?shop=rubixteststore.myshopify.com'))) {
      requestPayload = JSON.parse(request.postData());
    }
  });

  await frame.getByRole('button', { name: 'Start Generating Outline' }).click();

  await Common.waitLoading(frame);
  
  let step2Data: string[] = [];
  let sections = await frame.locator(".Polaris-BlockStack").nth(2).locator(" > div").all();
  for (const section of sections) {
    const text = await section.textContent();
    if (text !== null) {
      step2Data.push(text);
    }
  }

  console.log("Step 2 data:", step2Data);

  await expect(requestPayload).not.toBe(undefined);
  await expect(requestPayload.characters_count).toBe(9500);
  await expect(requestPayload.include_keywords).toStrictEqual(["test1", "test2", "test3"]);
  await expect(requestPayload.klass).toBe("BlogPosts::GenerateOutline");
  await expect(requestPayload.language).toBe("spanish");
  await expect(requestPayload.outline_number).toBe(4);
  await expect(requestPayload.title).toBe("test title");
  await expect(requestPayload.tone.toLowerCase()).toBe("upbeat");
  await expect(requestPayload.topic).toBe("test topic");
  
  await frame.getByRole('button', { name: 'Generate Article' }).click();

  await expect(requestPayload).not.toBe(undefined);
  await expect(requestPayload.characters_count).toBe(9500);
  await expect(requestPayload.classes).toStrictEqual(["BlogPosts::GenerateContent"]);
  await expect(requestPayload.generation_type).toBe("article");
  await expect(requestPayload.include_keywords).toStrictEqual("test1, test2, test3");
  // Extract titles from the internal_links array in the requestPayload
  const requestPayloadInternalLinksTitles = requestPayload.internal_links.map(link => link.title);
  console.log("Internal links:", requestPayloadInternalLinksTitles);
  
  // Assert that the titles match the expected internal_links titles
  await expect(requestPayloadInternalLinksTitles).toStrictEqual(internal_links);
  await expect(requestPayload.language).toBe("spanish");
  await expect(requestPayload.outline_number).toBe(4);
  await expect(requestPayload.title).toBe("test title");
  await expect(requestPayload.tone.toLowerCase()).toBe("upbeat");
  await expect(requestPayload.topic).toBe("test topic");
  await expect(requestPayload.outline).toStrictEqual(step2Data);
});

test("correct data should be sent in the request other options", async ({ page }) => {
  const frame = await locators.frame(page);
  await frame.getByLabel("Topic Idea").fill("test topic");
  await frame.getByLabel("Title").fill("test title");

  await frame.getByLabel("Select Output Language").selectOption("Spanish");
  await frame.getByLabel("Tone").selectOption("Other");
  await frame.getByLabel("Other Tone").fill("test tone");

  await frame.getByLabel("Choose words count").selectOption("1000");
  await frame.getByLabel("# of sections in the outline").fill("4");

  await frame.getByPlaceholder("Search Related Products").click();
  await frame.getByRole("listbox").getByRole("option").nth(0).click();
  await frame.getByRole("listbox").getByRole("option").nth(1).click();
  let internal_links = [
    await frame.getByRole("listbox").getByRole("option").nth(0).textContent(),
    await frame.getByRole("listbox").getByRole("option").nth(1).textContent()
  ];
  await frame.getByPlaceholder("Search Related Products").blur();

  await frame.getByPlaceholder("Select Related Articles").click();
  await frame.getByRole("listbox").getByRole("option").nth(0).click();
  await frame.getByRole("listbox").getByRole("option").nth(1).click();
  internal_links.push(
    await frame.getByRole("listbox").getByRole("option").nth(0).textContent(),
    await frame.getByRole("listbox").getByRole("option").nth(1).textContent()
  );
  await frame.getByPlaceholder("Select Related Articles").blur();

  await frame.getByRole("button", { name: "View advanced settings" }).click();
  const wordsBox = new WordsBox(page, 'Press "Enter" to add');
  await wordsBox.addWords(["test1", "test2", "test3"]);

  let requestPayload;
  page.on('request', async (request) => {
    if (request.method() === 'POST' && (request.url().includes('https://staging-yozo.cortechs-ai.com/api/open_ai?shop=rubixteststore.myshopify.com') || 
      request.url().includes('https://staging-yozo.cortechs-ai.com/api/open_ai/generate_background?shop=rubixteststore.myshopify.com'))) {
      requestPayload = JSON.parse(request.postData());
    }
  });

  await frame.getByRole('button', { name: 'Start Generating Outline' }).click();

  await Common.waitLoading(frame);
  
  let step2Data: string[] = [];
  let sections = await frame.locator(".Polaris-BlockStack").nth(2).locator(" > div").all();
  for (const section of sections) {
    const text = await section.textContent();
    if (text !== null) {
      step2Data.push(text);
    }
  }

  console.log("Step 2 data:", step2Data);

  await expect(requestPayload).not.toBe(undefined);
  await expect(requestPayload.characters_count).toBe(9500);
  await expect(requestPayload.include_keywords).toStrictEqual(["test1", "test2", "test3"]);
  await expect(requestPayload.klass).toBe("BlogPosts::GenerateOutline");
  await expect(requestPayload.language).toBe("spanish");
  await expect(requestPayload.outline_number).toBe(4);
  await expect(requestPayload.title).toBe("test title");
  await expect(requestPayload.tone.toLowerCase()).toBe("test tone");
  await expect(requestPayload.topic).toBe("test topic");
  
  await frame.getByRole('button', { name: 'Generate Article' }).click();

  await expect(requestPayload).not.toBe(undefined);
  await expect(requestPayload.characters_count).toBe(9500);
  await expect(requestPayload.classes).toStrictEqual(["BlogPosts::GenerateContent"]);
  await expect(requestPayload.generation_type).toBe("article");
  await expect(requestPayload.include_keywords).toStrictEqual("test1, test2, test3");
  // Extract titles from the internal_links array in the requestPayload
  const requestPayloadInternalLinksTitles = requestPayload.internal_links.map(link => link.title);
  console.log("Internal links:", requestPayloadInternalLinksTitles);
  
  // Assert that the titles match the expected internal_links titles
  await expect(requestPayloadInternalLinksTitles).toStrictEqual(internal_links);
  await expect(requestPayload.language).toBe("spanish");
  await expect(requestPayload.outline_number).toBe(4);
  await expect(requestPayload.title).toBe("test title");
  await expect(requestPayload.tone.toLowerCase()).toBe("test tone");
  await expect(requestPayload.topic).toBe("test topic");
  await expect(requestPayload.outline).toStrictEqual(step2Data);
});

test("correct number of outlines should be present in the second step", async ({ page }) => {
  const frame = await locators.frame(page);
  await frame.getByLabel("Topic Idea").fill("test topic");
  await frame.getByLabel("Title").fill("test title");

  const dropdown = await frame.getByLabel('Choose words count');
  await dropdown.waitFor(); // Ensure the dropdown is available

  const options = await dropdown.locator('option');
  const optionsCount = await options.count();

  if (optionsCount === 0) {
    console.error("No options found in the dropdown");
    return;
  }

  await dropdown.click();

  for (let i = 0; i < optionsCount; i++) {
    const optionText = await options.nth(i).textContent();
    const min_outlines = await options.nth(i).getAttribute('min_outlines');
    const max_outlines = await options.nth(i).getAttribute('max_outlines');
    const optionValue = await options.nth(i).getAttribute('value');

    await dropdown.selectOption({ index: i });
    await expect(await frame.getByLabel('Choose words count')).toHaveValue(optionValue);
    for (let j = parseInt(min_outlines); j <= parseInt(max_outlines); j++) {
      await frame.getByLabel('# of sections in the outline').fill(j.toString());
      const currentValue = await frame.getByLabel('# of sections in the outline').getAttribute('aria-valuenow');
      await expect(currentValue).toEqual(j.toString());

      await frame.getByRole('button', { name: 'Start Generating Outline' }).click();
      await Common.waitButtonLoading(frame);

      let step2Data: string[] = [];
      let sections = await frame.locator(".Polaris-BlockStack").nth(2).locator(" > div").all();
      for (const section of sections) {
        const text = await section.textContent();
        if (text !== null) {
          step2Data.push(text);
        }
      }
      console.log("Step 2 data:", step2Data);
      await expect(step2Data.length).toEqual(j);
      // get back to step 1 for next iteration
      await locators.step(frame, "1", "123").click();
    }
  }
}
);

test("step 2 regenerate outlines should generate the same number and related and the same request", async ({ page }) => {
  const frame = await locators.frame(page);

  await frame.getByLabel("Topic Idea").fill("test topic");
  await frame.getByLabel("Title").fill("test title");

  let requestPayload;
  page.on('request', async (request) => {
    if (request.method() === 'POST' && request.url().includes('https://staging-yozo.cortechs-ai.com/api/open_ai?shop=rubixteststore.myshopify.com')) {
      requestPayload = JSON.parse(request.postData());
    }
  });

  await frame.getByRole('button', { name: 'Start Generating Outline' }).click();

  await Common.waitLoading(frame);

  let oldRequestPayload = requestPayload;

  await frame.getByRole('button', { name: 'Re-generate Outlines' }).click();

  await Common.waitLoading(frame);

  let newRequestPayload = requestPayload;

  await expect(oldRequestPayload).toStrictEqual(newRequestPayload);
});

test("step 2 shouldn’t be able to go to step 3 with 0 sections (button needs to be disabled)", async ({ page }) => {
  const frame = await locators.frame(page);

  await frame.getByLabel("Topic Idea").fill("test topic");
  await frame.getByLabel("Title").fill("test title");

  await frame.getByRole('button', { name: 'Start Generating Outline' }).click();

  await Common.waitLoading(frame);
  
  await frame.locator('.Polaris-BlockStack').nth(2).locator('> div').first().locator('button').nth(2).click(); // delete section 1
  await expect(await frame.getByRole('button', { name: 'Generate Article' })).toBeEnabled();
  await frame.locator('.Polaris-BlockStack').nth(2).locator('> div').first().locator('button').nth(2).click(); // delete section 1
  await expect(await frame.getByRole('button', { name: 'Generate Article' })).toBeDisabled();
  await frame.locator('.Polaris-BlockStack').last().locator('> div').first().locator('button').nth(2).click(); // delete section 1
  await expect(await frame.getByRole('button', { name: 'Generate Article' })).toBeDisabled();
});

test("should be able to reorder sections in step 2", async ({ page }) => {
  const frame = await locators.frame(page);

  await frame.getByLabel("Topic Idea").fill("test topic");
  await frame.getByLabel("Title").fill("test title");

  await frame.getByRole('button', { name: 'Start Generating Outline' }).click();

  await Common.waitLoading(frame);

  let sections = await frame.locator(".Polaris-BlockStack").nth(2).locator(" > div").all();
  
  // Locate the section to be dragged and the target position
  const sectionToDrag = sections[0].locator("button").first();
  const oldSection0Text = await sections[0].textContent();
  const targetPosition = sections[1].locator("button").first();
  const oldSection1Text = await sections[1].textContent();

  // Perform the drag-and-drop action
  await sectionToDrag.dragTo(targetPosition);

  // Verify the new order of sections
  let newSections = await frame.locator(".Polaris-BlockStack").nth(2).locator(" > div").all();
  await expect(await newSections[0].textContent()).toEqual(oldSection1Text); 
  await expect(await newSections[1].textContent()).toEqual(oldSection0Text);

  let step2Data: string[] = [];
  for (const section of newSections) {
    const text = await section.textContent();
    if (text !== null) {
      step2Data.push(text);
    }
  }

  let requestPayload;
  page.on('request', async (request) => {
    if (request.method() === 'POST' && request.url().includes('https://staging-yozo.cortechs-ai.com/api/open_ai/generate_background?shop=rubixteststore.myshopify.com')) {
      requestPayload = JSON.parse(request.postData());
    }
  });

  await frame.getByRole('button', { name: 'Generate Article' }).click();

  await expect(requestPayload).not.toBe(undefined);
  await expect(requestPayload.outline).toStrictEqual(step2Data);
});

test("step 3 should have the title from step 1", async ({ page }) => {
  const frame = await locators.frame(page);

  await frame.getByLabel("Topic Idea").fill("test topic");
  await frame.getByLabel("Title").fill("test title");

  await frame.getByRole('button', { name: 'Start Generating Outline' }).click();

  await Common.waitLoading(frame);

  await frame.getByRole('button', { name: 'Generate Article' }).click();

  await Common.waitLoading(frame);

  await expect(await frame.locator("input#\\:r13\\:")).toHaveValue("test title");
});

test("Choose words count text should match the text", async ({ page }) => {
  const frame = await locators.frame(page);

  const dropdown = await frame.getByLabel('Choose words count');
  await dropdown.waitFor(); // Ensure the dropdown is available

  const options = await dropdown.locator('option');
  const optionsCount = await options.count();

  if (optionsCount === 0) {
    console.error("No options found in the dropdown");
    return;
  }

  // Dictionary of expected text-value pairs (text, value)
  const expectedValues: { [key: string]: string } = {
    "500": "3000",
    "1000": "9500",
    "1500": "10000",
    "2000": "20000",
  };

  await dropdown.click();

  for (let i = 0; i < optionsCount; i++) {
    const optionText = await options.nth(i).textContent();
    const optionValue = await options.nth(i).getAttribute('value');

    if (optionText && expectedValues[optionText]) {
      console.log(`Comparing option text: ${optionText} with value: ${optionValue}`);
      await expect(optionValue).toEqual(expectedValues[optionText]);
    } else {
      console.error(`Unexpected option text: ${optionText}`);
    }
  }
});

test("step 2 should be able to delete any section", async ({ page }) => {
  const frame = await locators.frame(page);

  await frame.getByLabel("Topic Idea").fill("test topic");
  await frame.getByLabel("Title").fill("test title");
  await frame.getByLabel("Choose words count").selectOption("1500");
  await frame.getByLabel("# of sections in the outline").fill("8");

  await frame.getByRole('button', { name: 'Start Generating Outline' }).click();

  await Common.waitLoading(frame);

  let sections = await frame.locator(".Polaris-BlockStack").nth(2).locator(" > div").all();
  let step2DataBefore: string[] = [];
  for (const section of sections) {
    const text = await section.textContent();
    if (text !== null) {
      step2DataBefore.push(text);
    }
  }

  // delete the first section
  await frame.locator('.Polaris-BlockStack').nth(2).locator('> div').first().locator('button').nth(2).click();
  // delete the last section
  await frame.locator('.Polaris-BlockStack').nth(2).locator('> div').nth(3).locator('button').nth(2).click();
  // delete the middle section
  await frame.locator('.Polaris-BlockStack').nth(2).locator('> div').last().locator('button').nth(2).click();

  // Verify the new order of sections
  let newSections = await frame.locator(".Polaris-BlockStack").nth(2).locator(" > div").all();

  let step2DataAfter: string[] = [];
  for (const section of newSections) {
    const text = await section.textContent();
    if (text !== null) {
      step2DataAfter.push(text);
    }
  }

  // check that the sections are deleted not only with length but the first element should be deleted and the last...
  // check the first element not in the new array
  await expect(step2DataAfter).not.toContain(step2DataBefore[0]);
  await expect(step2DataAfter).toContain(step2DataBefore[1]);
  await expect(step2DataAfter).toContain(step2DataBefore[2]);
  await expect(step2DataAfter).toContain(step2DataBefore[3]);
  await expect(step2DataAfter).not.toContain(step2DataBefore[4]);
  await expect(step2DataAfter).toContain(step2DataBefore[5]);
  await expect(step2DataAfter).toContain(step2DataBefore[6]);
  await expect(step2DataAfter).not.toContain(step2DataBefore[7]);

  let requestPayload;
  page.on('request', async (request) => {
    if (request.method() === 'POST' && request.url().includes('https://staging-yozo.cortechs-ai.com/api/open_ai/generate_background?shop=rubixteststore.myshopify.com')) {
      requestPayload = JSON.parse(request.postData());
    }
  });

  await frame.getByRole('button', { name: 'Generate Article' }).click();

  await expect(requestPayload).not.toBe(undefined);
  await expect(requestPayload.outline).toStrictEqual(step2DataAfter);
});

test("step 2 should be able to edit any section", async ({ page }) => {
  const frame = await locators.frame(page);

  await frame.getByLabel("Topic Idea").fill("test topic");
  await frame.getByLabel("Title").fill("test title");
  await frame.getByLabel("Choose words count").selectOption("1500");
  await frame.getByLabel("# of sections in the outline").fill("8");

  await frame.getByRole('button', { name: 'Start Generating Outline' }).click();

  await Common.waitLoading(frame);

  let sections = await frame.locator(".Polaris-BlockStack").nth(2).locator(" > div").all();
  let step2DataBefore: string[] = [];
  for (const section of sections) {
    const text = await section.textContent();
    if (text !== null) {
      step2DataBefore.push(text);
    }
  }

  // delete the first section
  await frame.locator('.Polaris-BlockStack').nth(2).locator('> div').first().locator('button').nth(1).click();
  await frame.getByPlaceholder('Add Title').fill('new title1');
  await frame.getByPlaceholder('Add Title').press('Enter');
  // delete the last section
  await frame.locator('.Polaris-BlockStack').nth(2).locator('> div').nth(3).locator('p').click();
  await frame.getByPlaceholder('Add Title').fill('new title2');
  await frame.getByPlaceholder('Add Title').press('Enter');
  // delete the middle section
  await frame.locator('.Polaris-BlockStack').nth(2).locator('> div').last().locator('button').nth(1).click();
  await frame.getByPlaceholder('Add Title').fill('new title3');
  await frame.locator('button').filter({hasText:"Save"}).click();

  // Verify the new order of sections
  let newSections = await frame.locator(".Polaris-BlockStack").nth(2).locator(" > div").all();

  let step2DataAfter: string[] = [];
  for (const section of newSections) {
    const text = await section.textContent();
    if (text !== null) {
      step2DataAfter.push(text);
    }
  }

  // check that the sections are deleted not only with length but the first element should be deleted and the last...
  // check the first element not in the new array
  await expect(step2DataAfter).not.toContain(step2DataBefore[0]);
  await expect(step2DataAfter).toContain(step2DataBefore[1]);
  await expect(step2DataAfter).toContain(step2DataBefore[2]);
  await expect(step2DataAfter).not.toContain(step2DataBefore[3]);
  await expect(step2DataAfter).toContain(step2DataBefore[4]);
  await expect(step2DataAfter).toContain(step2DataBefore[5]);
  await expect(step2DataAfter).toContain(step2DataBefore[6]);
  await expect(step2DataAfter).not.toContain(step2DataBefore[7]);
  await expect(step2DataAfter).toContain("new title1");
  await expect(step2DataAfter).toContain("new title2");
  await expect(step2DataAfter).toContain("new title3");

  let requestPayload;
  page.on('request', async (request) => {
    if (request.method() === 'POST' && request.url().includes('https://staging-yozo.cortechs-ai.com/api/open_ai/generate_background?shop=rubixteststore.myshopify.com')) {
      requestPayload = JSON.parse(request.postData());
    }
  });

  await frame.getByRole('button', { name: 'Generate Article' }).click();

  await expect(requestPayload).not.toBe(undefined);
  await expect(requestPayload.outline).toStrictEqual(step2DataAfter);
});

test("step 2 should be able to add any section", async ({ page }) => {
  const frame = await locators.frame(page);

  await frame.getByLabel("Topic Idea").fill("test topic");
  await frame.getByLabel("Title").fill("test title");
  await frame.getByLabel("Choose words count").selectOption("1500");
  await frame.getByLabel("# of sections in the outline").fill("7");

  await frame.getByRole('button', { name: 'Start Generating Outline' }).click();

  await Common.waitLoading(frame);

  let sections = await frame.locator(".Polaris-BlockStack").nth(2).locator(" > div").all();
  let step2DataBefore: string[] = [];
  for (const section of sections) {
    const text = await section.textContent();
    if (text !== null) {
      step2DataBefore.push(text);
    }
  }

  // add
  await frame.getByRole('button', { name: 'Add Section' }).click();
  await frame.getByPlaceholder('Add Title').fill('new title1');
  await frame.getByPlaceholder('Add Title').press('Enter');
  // add
  await frame.getByRole('button', { name: 'Add Section' }).click();
  await frame.getByPlaceholder('Add Title').fill('new title2');
  await frame.locator('button').filter({hasText:"Save"}).click();

  // Verify the new order of sections
  let newSections = await frame.locator(".Polaris-BlockStack").nth(2).locator(" > div").all();

  let step2DataAfter: string[] = [];
  for (const section of newSections) {
    const text = await section.textContent();
    if (text !== null) {
      step2DataAfter.push(text);
    }
  }

  // check that the sections are deleted not only with length but the first element should be deleted and the last...
  // check the first element not in the new array
  await expect(step2DataAfter).toContain(step2DataBefore[0]);
  await expect(step2DataAfter).toContain(step2DataBefore[1]);
  await expect(step2DataAfter).toContain(step2DataBefore[2]);
  await expect(step2DataAfter).toContain(step2DataBefore[3]);
  await expect(step2DataAfter).toContain(step2DataBefore[4]);
  await expect(step2DataAfter).toContain(step2DataBefore[5]);
  await expect(step2DataAfter).toContain(step2DataBefore[6]);
  await expect(step2DataAfter).toContain("new title1");
  await expect(step2DataAfter).toContain("new title2");

  let requestPayload;
  page.on('request', async (request) => {
    if (request.method() === 'POST' && request.url().includes('https://staging-yozo.cortechs-ai.com/api/open_ai/generate_background?shop=rubixteststore.myshopify.com')) {
      requestPayload = JSON.parse(request.postData());
    }
  });

  await frame.getByRole('button', { name: 'Generate Article' }).click();

  await expect(requestPayload).not.toBe(undefined);
  await expect(requestPayload.outline).toStrictEqual(step2DataAfter);
});


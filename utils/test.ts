import { test as base } from '@playwright/test';

// Extend the base test to include storage state
const test = base.extend({
  context: async ({ browser }, use) => {
    // Create a new browser context with storage state
    const context = await browser.newContext({ storageState: 'storageState.json' });
    
    // Provide the context to the test
    await use(context);
    
    // Close the context after the test finishes
    await context.close();
  },
  page: async ({ context }, use) => {
    // Create a new page in the context
    const page = await context.newPage();
    
    // Provide the page to the test
    await use(page);
    
    // Close the page after the test finishes
    await page.close();
  },
});

export { test };

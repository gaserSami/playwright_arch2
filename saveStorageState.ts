import { chromium } from '@playwright/test';
import { login } from './utils/login';
import * as dotenv from 'dotenv';
// import * as readline from 'readline';

// function waitForManualInput(): Promise<void> {
//   return new Promise<void>(resolve => {
//     const rl = readline.createInterface({
//       input: process.stdin,
//       output: process.stdout,
//     });
//     rl.question('Please solve the CAPTCHA and press Enter to continue...', () => {
//       rl.close();
//       resolve();
//     });
//   });
// }

dotenv.config();

(async () => {
  const browser = await chromium.launch({headless: false});
  const page = await browser.newPage();
  try {
    // Navigate to the login page
    await page.goto('https://admin.shopify.com/store/rubixteststore/apps/yozo-ai-staging');

    // Perform login actions
    await login(page);

    await page.goto('https://admin.shopify.com/store/rubixteststore/apps/yozo-ai-staging'); 

    // Save the storage state to a file
    await page.context().storageState({ path: 'storageState.json' });

    console.log('Storage state saved successfully.');
  } catch (error) {
    console.error('An error occurred:', error);
  } finally {
    await browser.close();
  }
})();

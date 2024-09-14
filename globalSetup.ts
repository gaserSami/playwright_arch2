import { chromium } from '@playwright/test';
import { login } from './utils/login';

import * as dotenv from 'dotenv';

dotenv.config();

async function globalSetup() {
  const browser = await chromium.launch();
  const page = await browser.newPage();

  await page.goto("/");
  await login(page);

  // Save storage state to a file
  await page.context().storageState({ path: 'storageState.json' });

  await browser.close();
}

export default globalSetup;
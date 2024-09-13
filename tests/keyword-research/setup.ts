import { Page } from '@playwright/test';
import { login } from "../../utils/login.ts";
import * as dotenv from 'dotenv';

dotenv.config();

export const setup = async (page: Page) => {
  await page.goto("/");
  await login(page);
  await page.goto("/apps/yozo-ai-staging/keyword-research");
};
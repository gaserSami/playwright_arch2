import { test } from "../../utils/test";

test.beforeEach(async ({ page }) => {
  await page.goto("/apps/yozo-ai-staging/keyword-research");
});
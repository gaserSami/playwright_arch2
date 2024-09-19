import { FrameLocator, Page } from '@playwright/test';

export const frame = (page: Page) => page.frameLocator('iframe[name="app-iframe"]');

// Results Locators
export const floatingBtns = (frame: FrameLocator) => frame.locator('.Polaris-BulkActions__ButtonGroupWrapper').locator("button");
export const step = (frame: FrameLocator, number: string, totalSteps: string) => frame.getByText(totalSteps).locator("span").filter({ hasText: number });
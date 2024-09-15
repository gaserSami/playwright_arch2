import { FrameLocator, Page } from '@playwright/test';

export const frame = (page: Page) => page.frameLocator('iframe[name="app-iframe"]');

// Results Locators
export const floatingBtns = (frame: FrameLocator) => frame.locator('.Polaris-BulkActions__ButtonGroupWrapper').locator("button");
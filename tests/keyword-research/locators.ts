import { FrameLocator, Page } from '@playwright/test';

export const frame = (page: Page) => page.frameLocator('iframe[name="app-iframe"]');

// General Locators
export const tab = (frame: FrameLocator, tabName: string) => frame.getByRole('tab', { name: tabName });
export const sideTab = (page: Page) => page.getByRole('link', { name: 'Keyword Research' });

// Input Locators
export const keywordsBox = (frame: FrameLocator) => frame.getByPlaceholder('Keyword(s)');
export const countryBox = (frame: FrameLocator) => frame.getByRole("combobox").first();
export const langBox = (frame: FrameLocator) => frame.getByRole("combobox").nth(1);
export const searchBtn = (frame: FrameLocator) => frame.getByRole("button", { name: "Search" });
export const keyword = (frame: FrameLocator, keyword: string) => frame.locator('span').filter({ hasText: keyword }).first();
export const removeBtn = (frame: FrameLocator, keywordName: string) => keyword(frame, keywordName).getByLabel("Remove " + keyword);

// Results Locators
export const monthlyVolume = (frame: FrameLocator) => frame.getByLabel('Keyword Research');
export const relatedKeywords = (frame: FrameLocator) => frame.locator('#keyword-research-1 > div > div > div > div:nth-child(2) > div');
export const keywordSortBtn = (frame: FrameLocator) => frame.getByRole('button', { name: 'Keyword' });
export const volumeSortBtn = (frame: FrameLocator) => frame.getByRole('button', { name: 'Volume' });
export const compSortBtn = (frame: FrameLocator) => frame.getByRole('button', { name: 'Competition' });
export const resultsRowByKeyword = (frame: FrameLocator, keyword: string) => frame.getByRole('row').filter({ hasText: keyword });
export const resultsRowByIndex = (frame: FrameLocator, index: number) => frame.getByRole('row').nth(index);
export const rowCheckBoxByKeyword = (frame: FrameLocator, keyword: string) => resultsRowByKeyword(frame, keyword).getByRole('cell', { name: 'Select keyword' });
export const rowWriteBtnByKeyword = (frame: FrameLocator, keyword: string) => resultsRowByKeyword(frame, keyword).getByRole('button', { name: 'Write' });
export const rowLikeBtnByKeyword = (frame: FrameLocator, keyword: string) => resultsRowByKeyword(frame, keyword).getByRole('button').nth(1);
export const rowVolumeByKeyword = (frame: FrameLocator, keyword: string) => resultsRowByKeyword(frame, keyword).getByRole('cell').nth(1);
export const rowCompByKeyword = (frame: FrameLocator, keyword: string) => resultsRowByKeyword(frame, keyword).getByRole('cell').nth(2);
export const rowCheckBoxByIndex = (frame: FrameLocator, index: number) => resultsRowByIndex(frame, index).getByRole('cell', { name: 'Select keyword' });
export const rowWriteBtnByIndex = (frame: FrameLocator, index: number) => resultsRowByIndex(frame, index).getByRole('button', { name: 'Write' });
export const rowLikeBtnByIndex = (frame: FrameLocator, index: number) => resultsRowByIndex(frame, index).getByRole('button').nth(1);
export const rowVolumeByIndex = (frame: FrameLocator, index: number) => resultsRowByIndex(frame, index).getByRole('cell').nth(1);
export const rowCompByIndex = (frame: FrameLocator, index: number) => resultsRowByIndex(frame, index).getByRole('cell').nth(2);

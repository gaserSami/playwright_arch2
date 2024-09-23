import { Page, FrameLocator } from '@playwright/test';

class SearchBox {
  private frame: () => FrameLocator;
  public placeholder: string;

  /**
   * Creates an instance of WordsBox.
   * @param {Page} page - The Playwright Page object.
   * @param {string} placeholder - The placeholder text of the text area.
   */
  public constructor(page: Page, placeholder: string) {
    this.frame = () => page.frameLocator('iframe[name="app-iframe"]');
    this.placeholder = placeholder;
  }
}
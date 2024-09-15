import { Page, FrameLocator } from '@playwright/test';

/**
 * Class representing a WordsBox component.
 */
class WordsBox {
  private frame: () => FrameLocator;
  public placeholder: string;
  public textAreaLocator = () => this.frame().getByPlaceholder(this.placeholder); // Locator for the text area
  public containerLocator = () => this.textAreaLocator().locator(".."); // Locator for the container of the text area
  public keywordLocator = (keyword: string) => this.containerLocator().locator('span').filter({ hasText: keyword }).first(); // Locator for a keyword span
  public removeKeywordLocator = (keyword: string) => this.keywordLocator(keyword).locator("button"); // Locator for the remove button of a keyword

  /**
   * Creates an instance of WordsBox.
   * @param {Page} page - The Playwright Page object.
   * @param {string} placeholder - The placeholder text of the text area.
   */
  public constructor(page: Page, placeholder: string) {
    this.frame = () => page.frameLocator('iframe[name="app-iframe"]');
    this.placeholder = placeholder;
  }

  /**
   * Adds words to the WordsBox.
   * @param {string[]} words - An array of words to add.
   * @returns {Promise<void>}
   */
  async addWords(words: string[]): Promise<void> {
    for (const word of words) {
      await this.textAreaLocator().fill(word);
      await this.textAreaLocator().press('Enter');
    }
  }

  /**
   * Checks if words exist in the WordsBox.
   * @param {string[]} words - An array of words to check.
   * @returns {Promise<boolean[]>} - A promise that resolves to an array of booleans indicating the presence of each word.
   */
  async checkIfWordsExist(words: string[]): Promise<boolean[]> {
    const results: boolean[] = [];
    for (const word of words) {
      const exists = await this.keywordLocator(word).isVisible();
      results.push(exists);
    }
    return results;
  }

  /**
   * Removes words from the WordsBox.
   * @param {string[]} words - An array of words to remove.
   * @returns {Promise<void>}
   */
  async removeWords(words: string[]): Promise<void> {
    for (const word of words) {
      await this.removeKeywordLocator(word).click();
    }
  }

  /**
   * Gets the count of words in the WordsBox.
   * @returns {Promise<number>} - A promise that resolves to the count of words.
   */
  async count(): Promise<number> {
    return await this.containerLocator().locator('button').count();
  }
  
}

export { WordsBox };
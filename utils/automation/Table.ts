import { FrameLocator } from "@playwright/test";

/**
 * Class representing a table.
 */
export class Table {
  private frame: FrameLocator;

  /**
   * Create a Table.
   * @param {FrameLocator} frame - The frame locator.
   */
  constructor(frame: FrameLocator) {
    this.frame = frame;
  }

  /**
   * Wait for the table to load.
   * @returns {Promise<void>}
   */
  async waitForTableToLoad(): Promise<void> {
    await this.frame.getByRole("row").waitFor({ state: "hidden" });
    await this.frame.getByRole("row").waitFor({ state: "visible" });
  }

  /**
   * Return the row count excluding the header.
   * @returns {Promise<number>}
   */
  async getRowCount(): Promise<number> {
    return (await this.frame.getByRole('row').count()) - 1;
  }

  /**
   * Get the text of a specific cell.
   * @param {Object} params - The parameters.
   * @param {number} [params.rowIndex] - The row index.
   * @param {number} [params.cellNumber] - The cell number.
   * @param {number} [params.col] - The column index.
   * @param {string} [params.colVal] - The column value.
   * @returns {Promise<string>}
   * @throws {Error} If the input format is invalid.
   */
  async getCellText(params: { rowIndex: number, cellNumber: number } | { col: number, colVal: string, cellNumber: number }): Promise<string> {
    if ('rowIndex' in params) {
      const { rowIndex, cellNumber } = params;
      return await this.frame.getByRole('row').nth(rowIndex).getByRole('cell').nth(cellNumber).innerText();
    } else if ('col' in params && 'colVal' in params) {
      const { col, colVal, cellNumber } = params;
      const rowIndex = await this.findRowByColumnValue(col, colVal);
      return await this.frame.getByRole('row').nth(rowIndex).getByRole('cell').nth(cellNumber).innerText();
    } else {
      throw new Error('Invalid input format for getCellText');
    }
  }

  /**
   * Find the row index by column value.
   * @param {number} col - The column index.
   * @param {string} colVal - The column value.
   * @returns {Promise<number>}
   * @throws {Error} If no matching row is found.
   */
  private async findRowByColumnValue(col: number, colVal: string): Promise<number> {
    const rowCount = await this.getRowCount();
    for (let i = 1; i <= rowCount; i++) {
      const currentKeyword = await this.getCellText({rowIndex: i, cellNumber: col});
      if (currentKeyword === colVal) {
        return i;
      }
    }
    throw new Error(`No matching row found for column ${col} with value "${colVal}"`);
  }

  /**
   * Click on a column header.
   * @param {number} column - The column index.
   * @returns {Promise<void>}
   */
  async clickOnColumnHeader(column: number): Promise<void> {
    await this.frame.getByRole('row').nth(0).getByRole('cell').nth(column).locator("button").click();
  }

  /**
   * Select all rows.
   * @returns {Promise<void>}
   */
  async selectAllRows(): Promise<void> {
    await this.clickOnColumnHeader(0);
  }

  /**
   * Deselect all rows.
   * @returns {Promise<void>}
   */
  async deselectAllRows(): Promise<void> {
    await this.frame.getByText('Deselect all 20 keywords20').click();
  }

  /**
   * Click on rows based on row indices or column values.
   * @param {number[] | { col: number, colVal: string }[]} rows - The rows to click on.
   * @returns {Promise<void>}
   * @throws {Error} If the input format is invalid.
   */
  async clickOnRows(rows: number[] | { col: number, colVal: string }[]): Promise<void> {
    if (Array.isArray(rows)) {
      for (const row of rows) {
        if (typeof row === 'number') {
          await this.frame.getByRole('row').nth(row).click();
        } else if (typeof row === 'object') {
          const { col, colVal } = row;
          const rowIndex = await this.findRowByColumnValue(col, colVal);
          await this.frame.getByRole('row').nth(rowIndex).click();
        }
      }
    } else {
      throw new Error('Invalid input format for clickOnRows');
    }
  }

  /**
   * Navigate to the next page.
   * @returns {Promise<void>}
   */
  async nextPage(): Promise<void> {
    await this.frame.getByLabel("Next").click();
  }

  /**
   * Navigate to the previous page.
   * @returns {Promise<void>}
   */
  async prevPage(): Promise<void> {
    await this.frame.getByLabel("Previous").click();
  }

  /**
   * Check if it's the last page.
   * @returns {Promise<boolean>}
   */
  async isLastPage(): Promise<boolean> {
    return await this.frame.getByLabel("Next").isDisabled();
  }

  /**
   * Check if it's the first page.
   * @returns {Promise<boolean>}
   */
  async isFirstPage(): Promise<boolean> {
    return await this.frame.getByLabel("Previous").isDisabled();
  }

    /**
   * Check if the table is sorted.
   * @param {boolean} currentPageOnly - Whether to check only the current page.
   * @param {number} columnIndex - The index of the column to check.
   * @param {(a: string, b: string) => number} compareFn - The comparison function.
   * @returns {Promise<boolean>}
   */
  async checkSorting(currentPageOnly: boolean, columnIndex: number, compareFn: (a: string, b: string) => number): Promise<boolean> {
    let data: string[] = [];
  
    if (currentPageOnly) {
      data = await this.collectDataFromCurrentPage(columnIndex);
    } else {
      data = await this.collectDataFromAllPages(columnIndex);
    }
  
    return this.isDataSorted(data, compareFn);
  }
  
  /**
   * Collect data from the current page.
   * @param {number} columnIndex - The index of the column to collect data from.
   * @returns {Promise<string[]>}
   */
  private async collectDataFromCurrentPage(columnIndex: number): Promise<string[]> {
    const data: string[] = [];
    const rowCount = await this.getRowCount();
    for (let i = 1; i <= rowCount; i++) {
      data.push(await this.getCellText({rowIndex: i, cellNumber: columnIndex}));
    }
    return data;
  }
  
  /**
   * Collect data from all pages.
   * @param {number} columnIndex - The index of the column to collect data from.
   * @returns {Promise<string[]>}
   */
  private async collectDataFromAllPages(columnIndex: number): Promise<string[]> {
    let data: string[] = [];
    while (true) {
      data = [...data, ...await this.collectDataFromCurrentPage(columnIndex)];
      if (await this.isLastPage()) break;
      await this.nextPage();
    }
    return data;
  }
  
  /**
   * Check if the data is sorted based on the comparison function.
   * @param {string[]} data - The data to check.
   * @param {(a: string, b: string) => number} compareFn - The comparison function.
   * @returns {boolean}
   */
  private isDataSorted(data: string[], compareFn: (a: string, b: string) => number): boolean {
    for (let i = 1; i < data.length; i++) {
      if (compareFn(data[i - 1], data[i]) > 0) {
        return false;
      }
    }
    return true;
  }
}
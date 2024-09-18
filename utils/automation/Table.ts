import { FrameLocator, Locator } from "@playwright/test";
import { Common } from "./Common";
import { frame } from "../locators";

/**
 * Class representing a table.
 */
class Table {
  public static nextBtn = (frame : FrameLocator) => frame.getByRole('button', { name: 'Next' });
  public static prevBtn = (frame : FrameLocator) => frame.getByRole('button', { name: 'Previous' });

  /**
   * Return the row count excluding the header.
   * @param {FrameLocator} frame - The frame locator.
   * @returns {Promise<number>}
   */
  static async rowCount(frame: FrameLocator): Promise<number> {
    const rowCount = (await frame.getByRole('row').count()) - 1;
    return rowCount < 0 ? 0 : rowCount;
  }

  /**
   * Get a specific cell element and use it anyway you want.
   * @param {FrameLocator} frame - The frame locator.
   * @param {Object} params - The parameters.
   * @param {number} [params.rowIndex] - The row index.
   * @param {number} params.cellNumber - The cell number.
   * @param {number} [params.col] - The column index.
   * @param {string} [params.colVal] - The column value.
   * @returns {Promise<Locator>}
   * @throws {Error} If the input format is invalid.
   * @example
   * getCell(frame, { rowIndex: 1, cellNumber: 1 }).click();
   * getCell(frame, { col: 0, colVal: 'keyword', cellNumber: 1 }).textContent();
   */
  static async getCell(frame: FrameLocator, params: { rowIndex: number, cellNumber: number } | { col: number, colVal: string, cellNumber: number }): Promise<Locator> {
    if ('rowIndex' in params) {
      const { rowIndex, cellNumber } = params;
      return frame.getByRole('row').nth(rowIndex).getByRole('cell').nth(cellNumber);
    } else if ('col' in params && 'colVal' in params) {
      const { col, colVal, cellNumber } = params;
      const rowIndex = await Table.findRowByColumnValue(frame, col, colVal);
      return frame.getByRole('row').nth(rowIndex).getByRole('cell').nth(cellNumber);
    } else {
      throw new Error('Invalid input format for getCell');
    }
  }

  /**
* Get locators to all the actions (buttons) in the row.
* @param {FrameLocator} frame - The frame locator.
* @param {Object} params - The parameters.
* @param {number} [params.rowIndex] - The row index.
* @param {number} [params.col] - The column index.
* @param {string} [params.colVal] - The column value.
* @returns {Promise<Locator[]>}
* @throws {Error} If the input format is invalid.
*/
  static async getRowActions(frame: FrameLocator, params: { rowIndex: number } | { col: number, colVal: string }): Promise<Locator[]> {
    let rowIndex: number;

    if ('rowIndex' in params) {
      rowIndex = params.rowIndex;
    } else if ('col' in params && 'colVal' in params) {
      rowIndex = await Table.findRowByColumnValue(frame, params.col, params.colVal);
    } else {
      throw new Error('Invalid input format for getRowActions');
    }

    return frame.getByRole('row').nth(rowIndex).locator('button').all();
  }

  /**
 * Get locator to a specific row.
 * @param {FrameLocator} frame - The frame locator.
 * @param {Object} params - The parameters.
 * @param {number} [params.rowIndex] - The row index.
 * @param {number} [params.col] - The column index.
 * @param {string} [params.colVal] - The column value.
 * @returns {Promise<Locator>}
 * @throws {Error} If the input format is invalid.
 */
  static async getRow(frame: FrameLocator, params: { rowIndex: number } | { col: number, colVal: string }): Promise<Locator> {
    let rowIndex: number;

    if ('rowIndex' in params) {
      rowIndex = params.rowIndex;
    } else if ('col' in params && 'colVal' in params) {
      rowIndex = await Table.findRowByColumnValue(frame, params.col, params.colVal);
    } else {
      throw new Error('Invalid input format for getRow');
    }

    return frame.getByRole('row').nth(rowIndex);
  }

  /**
   * Click on a column header.
   * @param {FrameLocator} frame - The frame locator.
   * @param {number} column - The column index.
   * @returns {Promise<void>}
   */
  static async clickOnHeaderCell(frame: FrameLocator, cell: number): Promise<void> {
    if (cell === 0) {
      await frame.getByRole('row').nth(0).getByRole('cell').nth(cell).click();
    } else {
      await frame.getByRole('row').nth(0).getByRole('cell').nth(cell).locator("button").click();
    }
  }

  /**
  * Deselect or select all rows based on the number of rows.
  * @param {FrameLocator} frame - The frame locator.
  * @returns {Promise<void>}
  */
  static async deselectAllRows(frame: FrameLocator): Promise<void> {
    await frame.locator("span").filter({ hasText: /\d+ selected/ }).locator("..").click();
  }

  /**
   * Click on rows based on row indices or column values.
   * @param {FrameLocator} frame - The frame locator.
   * @param {number[] | { col: number, colVal: string }[]} rows - The rows to click on.
   * @returns {Promise<void>}
   * @throws {Error} If the input format is invalid.
   */
  static async clickOnRows(frame: FrameLocator, rows: number[] | { col: number, colVal: string }[]): Promise<void> {
    if (Array.isArray(rows)) {
      for (const row of rows) {
        if (typeof row === 'number') {
          await frame.getByRole('row').nth(row).click();
        } else if (typeof row === 'object') {
          const { col, colVal } = row;
          const rowIndex = await Table.findRowByColumnValue(frame, col, colVal);
          await frame.getByRole('row').nth(rowIndex).click();
        }
      }
    } else {
      throw new Error('Invalid input format for clickOnRows');
    }
  }

  /**
   * Navigate to the next page.
   * @param {FrameLocator} frame - The frame locator.
   * @returns {Promise<void>}
   */
  static async nextPage(frame: FrameLocator): Promise<void> {
    await this.nextBtn(frame).click();
  }

  /**
   * Navigate to the previous page.
   * @param {FrameLocator} frame - The frame locator.
   * @returns {Promise<void>}
   */
  static async prevPage(frame: FrameLocator): Promise<void> {
    await this.prevBtn(frame).click();
  }

  /**
   * Check if it's the last page.
   * @param {FrameLocator} frame - The frame locator.
   * @returns {Promise<boolean>}
   */
  static async isLastPage(frame: FrameLocator): Promise<boolean> {
    return await frame.getByLabel("Next").isDisabled();
  }

  /**
   * Check if it's the first page.
   * @param {FrameLocator} frame - The frame locator.
   * @returns {Promise<boolean>}
   */
  static async isFirstPage(frame: FrameLocator): Promise<boolean> {
    return await frame.getByLabel("Previous").isDisabled();
  }

  /**
  * Check if the table is sorted.
  * @param {FrameLocator} frame - The frame locator.
  * @param {boolean} currentPageOnly - Whether to check only the current page.
  * @param {number} columnIndex - The index of the column to check.
  * @param {(a: string, b: string) => number} compareFn - The comparison function.
  * @param {number} [limit] - The limit of the pages to check.
  * @param {boolean} [printSteps] - Whether to print each comparison and its result.
  * @returns {Promise<boolean>}
  */
  static async checkSorting(frame: FrameLocator, columnIndex: number, compareFn: (a: string, b: string) => number, limit?: number, printSteps?: boolean): Promise<boolean> {
    let data: string[] = [];
    data = await Table.collectDataFromPages(frame, columnIndex, limit);
    return Table.isDataSorted(data, compareFn, printSteps);
  }

  /**
   * Collect data from the current page.
   * @param {FrameLocator} frame - The frame locator.
   * @param {number} columnIndex - The index of the column to collect data from.
   * @returns {Promise<string[]>}
   */
  private static async collectDataFromCurrentPage(frame: FrameLocator, columnIndex: number): Promise<string[]> {
    const data: string[] = [];
    const rowCount = await Table.rowCount(frame);
    for (let i = 1; i <= rowCount; i++) {
      data.push(await (await Table.getCell(frame, { rowIndex: i, cellNumber: columnIndex })).innerText());
    }
    return data;
  }

  /**
 * Collect data from all pages.
 * @param {FrameLocator} frame - The frame locator.
 * @param {number} columnIndex - The index of the column to collect data from.
 * @param {number} [limit] - The limit of the pages to check.
 * @returns {Promise<string[]>}
 */
  private static async collectDataFromPages(frame: FrameLocator, columnIndex: number, limit?: number): Promise<string[]> {
    let data: string[] = [];
    let pageCount = 0;
    while (true) {
      data = [...data, ...await Table.collectDataFromCurrentPage(frame, columnIndex)];
      pageCount++;
      if (limit && pageCount >= limit) break;
      if (await Table.isLastPage(frame)) break;
      await Table.nextPage(frame);
      await Common.waitLoading(frame);
    }
    return data;
  }

  /**
 * Check if the data is sorted based on the comparison function.
 * @param {string[]} data - The data to check.
 * @param {(a: string, b: string) => number} compareFn - The comparison function.
 * @param {boolean} [printSteps] - Whether to print each comparison and its result.
 * @returns {boolean}
 */
  private static isDataSorted(data: string[], compareFn: (a: string, b: string) => number, printSteps?: boolean): boolean {
    for (let i = 1; i < data.length; i++) {
      const result = compareFn(data[i - 1], data[i]);
      if (printSteps) {
        console.log(`Comparing "${data[i - 1]}" and "${data[i]}" : "${result}"`);
      }
      if (result > 0) {
        return false;
      }
    }
    return true;
  }

  /**
  * Find the row index by column value.
  * @param {FrameLocator} frame - The frame locator.
  * @param {number} col - The column index.
  * @param {string} colVal - The column value.
  * @returns {Promise<number>}
  * @throws {Error} If no matching row is found.
  */
  private static async findRowByColumnValue(frame: FrameLocator, col: number, colVal: string): Promise<number> {
    const rowCount = await Table.rowCount(frame);
    for (let i = 1; i <= rowCount; i++) {
      const currentKeyword = await (await Table.getCell(frame, { rowIndex: i, cellNumber: col })).innerText();
      if (currentKeyword === colVal) {
        return i;
      }
    }
    throw new Error(`No matching row found for column ${col} with value "${colVal}"`);
  }

}

export { Table };
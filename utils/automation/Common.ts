import { FrameLocator, Page } from "@playwright/test";

class Common {
    /**
    * Wait for the visible loading spinner to vanish.
    * @param {FrameLocator} frame - The frame locator.
    * @returns {Promise<void>}
    */
    static async waitLoading(frame: FrameLocator): Promise<void> {
      const loadingSelectors = [
        ".Polaris-Button--loading",
        ".Polaris-Button__Spinner",
        ".Polaris-Spinner"
        // Add any other loading selectors you have
      ];
    
      // Double-check if any loader is still visible
      for (const selector of loadingSelectors) {
        const isVisible = await frame.locator(selector).isVisible();
        if (isVisible) {
          await frame.locator(selector).waitFor({ state: "hidden", timeout: 30000 });
          break; // Exit the loop once we've waited for a visible loader
        }
      }
    }

  static async waitButtonLoading(frame: FrameLocator): Promise<void> {
    await frame.locator(".Polaris-Button--loading").waitFor({ state: "hidden" });
    await frame.locator(".Polaris-Button__Spinner").waitFor({ state: "hidden" });
  }

  /**
   * Simulate a slow network by adding a delay to all network requests.
   * @param {Page} page - The Playwright page object.
   * @param {number} delay - The delay in milliseconds.
   */
  static async slowNetwork(page: Page, delay: number = 2000): Promise<void> {
    const slowNetworkRoute = async (route) => {
      await new Promise(resolve => setTimeout(resolve, delay)); // Simulate slow network
      route.continue({
        headers: { ...route.request().headers() }
      });
    };
    await page.route('**/*', slowNetworkRoute);
  }

  /**
   * Reset the network speed by removing the slow network route.
   * @param {Page} page - The Playwright page object.
   */
  static async resetNetworkSpeed(page: Page): Promise<void> {
    await page.unroute('**/*');
  }

   /**
   * Listen on network request and capture the response payload.
   * @param {Page} page - The Playwright page object.
   * @param {string} contains - The URL to listen on.
   * @returns {Promise<string>} - The response payload.
   * @example
   * const responsePayload = await Common.listenOnRequest(page, 'https://example.com');
   */
   static async listenOnRequest(page: Page, contains: string): Promise<string> {
    return new Promise((resolve) => {
      page.on('response', async (response) => {
        if (response.url().includes(contains)) {
          const responseBody = await response.text();
          resolve(responseBody);
        }
      });
    });
  }
}

export { Common };
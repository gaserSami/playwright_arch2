import { FrameLocator } from "@playwright/test";

class Common {
   /**
   * Wait for to load spinner to vanish.
   * @param {FrameLocator} frame - The frame locator.
   * @returns {Promise<void>}
   */
   static async waitLoading(frame: FrameLocator): Promise<void> {
    await frame.locator(".Polaris-Spinner").waitFor({ state: "hidden" });
  }
}

export { Common };
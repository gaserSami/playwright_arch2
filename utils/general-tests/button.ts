import { FrameLocator, Locator, expect } from '@playwright/test';

const buttonTest = async (
  frame: FrameLocator, 
  button: Locator, 
  expectedLabel: string, 
  disabled: boolean = false, 
  buttonType: string = 'button', 
  loading: boolean = false
) => {
  // Verify the button is visible
  await expect(button).toBeVisible();

  // Verify if the button is enabled or disabled
  if (disabled) {
    await expect(button).toBeDisabled();
  } else {
    await expect(button).toBeEnabled();
  }

  // Verify the button label/text
  await expect(button).toHaveText(expectedLabel);

  // Verify the button type (submit, reset, button, etc.)
  await expect(button).toHaveAttribute('type', buttonType);

  // Verify focus and blur events
  await button.focus();
  await expect(button).toBeFocused();
  await button.blur();
  await expect(button).not.toBeFocused();

  // If there's a loading state, verify that
  if (loading) {
    const loadingLocator = button.locator('.loading-indicator'); // TODO: Adjust
    await expect(loadingLocator).toBeVisible();
  }

  // Simulate a click on the button and verify it is clickable
  if (!disabled) {
    await button.click();
  }
};

export { buttonTest };

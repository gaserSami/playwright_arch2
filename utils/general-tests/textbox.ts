import { FrameLocator, Locator, expect, test } from '@playwright/test';

const testTextbox = async (
  frame: FrameLocator, 
  textbox: Locator, 
  value: string = 'example', 
  placeholder: string, 
  maxLength?: number, 
  readOnly: boolean = false, 
  required: boolean = false,
  errorMessage?: string
) => {
  test.describe('Automated Tests', () => {
    test('Verify the textbox is visible', async () => {
      await expect(textbox).toBeVisible();
    });

    test('Verify the textbox is enabled', async () => {
      await expect(textbox).toBeEnabled();
    });

    test('Verify the placeholder text', async () => {
      await expect(textbox).toHaveAttribute('placeholder', placeholder);
    });

    test('Verify the textbox is editable or read-only', async () => {
      if (readOnly) {
        await expect(textbox).toHaveAttribute('readonly', '');
      } else {
        await expect(textbox).not.toHaveAttribute('readonly', '');
      }
    });

    test('Verify required field', async () => {
      if (required) {
        await expect(textbox).toHaveAttribute('required', '');
      }
    });

    test('Fill the textbox with a value and verify it', async () => {
      await textbox.fill(value);
      await expect(textbox).toHaveValue(value);
    });

    test('Verify maxLength if provided', async () => {
      if (maxLength) {
        const longValue = 'a'.repeat(maxLength + 10);
        const truncatedValue = longValue.substring(0, maxLength);
        await textbox.fill(longValue);
        await expect(textbox).toHaveValue(truncatedValue);
      }
    });

    test('Verify focus and blur events', async () => {
      await textbox.focus();
      await expect(textbox).toBeFocused();
      await textbox.blur();
      await expect(textbox).not.toBeFocused();
    });

    test('Remove characters with backspace', async () => {
      await textbox.press('Backspace');
      await expect(textbox).toHaveValue(value.slice(0, -1));
    });

    test('Remove with delete', async () => {
      await textbox.press('ArrowLeft');
      await textbox.press('Delete');
      await expect(textbox).toHaveValue(value);
    });

    test('Copy and paste', async () => {
      await textbox.press('Control+a');
      await textbox.press('Control+c');
      await textbox.press('Control+v');
      await expect(textbox).toHaveValue(value + value);
    });

    test('Cut and paste', async () => {
      await textbox.press('Control+a');
      await textbox.press('Control+x');
      await expect(textbox).toHaveValue('');
      await textbox.press('Control+v');
      await expect(textbox).toHaveValue(value);
    });

    test('Clear the textbox and verify it\'s empty', async () => {
      await textbox.clear();
      await expect(textbox).toHaveValue('');
    });

    test('Verify any error message handling (if applicable)', async () => {
      if (errorMessage) {
        const errorLocator = frame.locator('text=' + errorMessage); // Example, adjust to your error element structure
        await expect(errorLocator).toBeVisible();
      }
    });

    test('Verify ARIA labels (optional for accessibility)', async () => {
      const ariaLabel = await textbox.getAttribute('aria-label');
      if (ariaLabel) {
        await expect(textbox).toHaveAttribute('aria-label', ariaLabel);
      }
    });
  });

  test.skip('Manual Tests', () => {
    console.log("Manual tests");
    console.log('Verify text spam handling in UI');
    console.log('Verify text spam handling in performance');
    console.log('Verify indicative placeholder is present');
    console.log('Verify correct grammar in placeholder');
    console.log('Verify indicative label');
    console.log('Verify correct grammar in label');
  });
};

export { testTextbox };
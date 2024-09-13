import { FrameLocator, Locator, expect } from '@playwright/test';

const dropdownTest = async (
  frame: FrameLocator, 
  dropdown: Locator, 
  defaultValue: string, 
  options: string[], 
  selectValue: string, 
  disabled: boolean = false, 
  required: boolean = false
) => {
  // Verify the dropdown is visible
  await expect(dropdown).toBeVisible();

  // Verify if the dropdown is enabled or disabled
  if (disabled) {
    await expect(dropdown).toBeDisabled();
  } else {
    await expect(dropdown).toBeEnabled();
  }

  // Verify the dropdown has a required attribute if applicable
  if (required) {
    await expect(dropdown).toHaveAttribute('required', '');
  }

  // Verify the default selected value
  await expect(dropdown).toHaveValue(defaultValue);

  // Verify the dropdown contains the correct options
  for (const option of options) {
    const optionLocator = dropdown.locator(`option[value="${option}"]`);
    await expect(optionLocator).toBeVisible();
  }

  // Select a new value and verify it
  await dropdown.selectOption(selectValue);
  await expect(dropdown).toHaveValue(selectValue);

  // Verify focus and blur events
  await dropdown.focus();
  await expect(dropdown).toBeFocused();
  await dropdown.blur();
  await expect(dropdown).not.toBeFocused();
};

export { dropdownTest };

import { test, expect } from '@playwright/test';

test.describe('Word Bank - Builder CRUD', () => {
  test('should allow adding a new word with phonemes and see it appear in the list', async ({ page }) => {
    await page.goto('/word-bank');

        // Dismiss the cookie consent overlay if it appears
    try {
      await page.getByRole('button', { name: 'Accept' }).click({ timeout: 5000 });
    } catch {
      // overlay didn't appear — nothing to dismiss
    }

    // Fill in the word spelling and hint
    await page.getByPlaceholder('Word spelling (e.g. SHIP)').fill('TESTWORD');
    await page.getByPlaceholder("Optional hint (e.g. 'a boat')").fill('a test entry');

    // Build the phoneme sequence by clicking phoneme tiles (using known AU-locale tokens)
    await page.getByRole('button', { name: 'k', exact: true }).click();
    await page.getByRole('button', { name: 'æ', exact: true }).click();
    await page.getByRole('button', { name: 't', exact: true }).click();

    // Submit via the Enter button
    await page.getByRole('button', { name: 'Enter' }).click();

    // Confirm success message appears
    await expect(page.getByText('Word added!')).toBeVisible();

    // Confirm the new word appears in the word list
    await expect(page.getByText('TESTWORD')).toBeVisible();
  });
});
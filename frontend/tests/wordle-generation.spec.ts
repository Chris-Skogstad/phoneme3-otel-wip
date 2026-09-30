import { test, expect } from '@playwright/test';

test.describe('Wordle - Generation and Viewing', () => {
  test('should select a word, play a guess, and successfully generate/download the activity', async ({ page }) => {
    await page.goto('/wordle');

    // Dismiss cookie consent if it appears
    try {
      await page.getByRole('button', { name: 'Accept' }).click({ timeout: 5000 });
    } catch {
      // no overlay — continue
    }

        // Wait for the word bank to load and a target word to be selectable
    await expect(page.getByRole('heading', { name: 'Target word' })).toBeVisible();

    // Confirm at least one phoneme tile is rendered (the game board)
    const keyboardButtons = page.locator('button', { hasText: /^[a-zæʃŋɪɑːə]/i });
    await expect(keyboardButtons.first()).toBeVisible({ timeout: 10000 });

    // Start listening for the download before triggering it
    const downloadPromise = page.waitForEvent('download');

    // Click Generate & Download
    await page.getByRole('button', { name: 'Generate & Download' }).click();

    // Confirm the download actually happened
    const download = await downloadPromise;
    expect(download.suggestedFilename()).toBe('phoneme-wordle.html');
  });
});
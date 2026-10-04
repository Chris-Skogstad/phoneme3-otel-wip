import { test, expect } from '@playwright/test';
import path from 'path';
import fs from 'fs';
import os from 'os';

test.describe('Wordle - Generation and Viewing', () => {
  test('should select a word, generate/download the activity, then open and play the downloaded game', async ({ page, context }) => {
    await page.goto('/wordle');

    // Dismiss cookie consent if it appears
    try {
      await page.getByRole('button', { name: 'Accept' }).click({ timeout: 5000 });
    } catch {
      // no overlay — continue
    }

    // Wait for the word bank to load and a target word to be selectable
    await expect(page.getByRole('heading', { name: 'Target word' })).toBeVisible();

    // Confirm the game board renders
    const keyboardButtons = page.locator('button', { hasText: /^[a-zæʃŋɪɑːə]/i });
    await expect(keyboardButtons.first()).toBeVisible({ timeout: 10000 });

    // Trigger and capture the download
    const downloadPromise = page.waitForEvent('download');
    await page.getByRole('button', { name: 'Generate & Download' }).click();
    const download = await downloadPromise;

    expect(download.suggestedFilename()).toBe('phoneme-wordle.html');

    // Save the downloaded file to a temp location on disk
    const downloadPath = path.join(os.tmpdir(), `playwright-${Date.now()}-${download.suggestedFilename()}`);
    await download.saveAs(downloadPath);
    expect(fs.existsSync(downloadPath)).toBe(true);

    // Open the downloaded standalone HTML file directly in a new page
    const gamePage = await context.newPage();
    await gamePage.goto(`file://${downloadPath}`);

    // Confirm the standalone game rendered correctly
    await expect(gamePage.getByRole('heading', { name: 'Phoneme Wordle' })).toBeVisible();

    // Play the downloaded game: click a few phoneme keys and submit a guess
    const gameKeys = gamePage.locator('#keyboard .key');
    const keyCount = await gameKeys.count();
    expect(keyCount).toBeGreaterThan(0);

    // Click the first key a few times to fill a guess row (doesn't need to be correct, just needs to submit)
    const boardTiles = gamePage.locator('#board .row').first().locator('.tile');
    const tileCount = await boardTiles.count();
    for (let i = 0; i < tileCount; i++) {
      await gameKeys.first().click();
    }

    // Submit the guess
    await gamePage.locator('#submit').click();

    // Confirm the board updated with an evaluated guess (tile should now have a state class)
    const firstTile = gamePage.locator('#board .row').first().locator('.tile').first();
    await expect(firstTile).toHaveClass(/correct|wrong-position|absent/);

    await gamePage.close();
  });
});
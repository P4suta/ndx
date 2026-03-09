import { expect, test } from '@playwright/test';

test.describe('ndx-calc', () => {
	test.beforeEach(async ({ page }) => {
		await page.goto('/');
		await page.waitForSelector('ndx-calc');
	});

	test('initial render shows default values', async ({ page }) => {
		const shadow = page.locator('ndx-calc');
		const resultSS = shadow.locator('[data-bind="resultSS"]');
		await expect(resultSS).not.toHaveText('--');

		const evBefore = shadow.locator('[data-bind="evBefore"]');
		await expect(evBefore).not.toHaveText('--');
	});

	test('changing SS select updates result', async ({ page }) => {
		const shadow = page.locator('ndx-calc');
		const ssSelect = shadow.locator('[data-action="ss"]');
		const resultSS = shadow.locator('[data-bind="resultSS"]');

		const before = await resultSS.textContent();
		await ssSelect.selectOption('0'); // 1/8000
		const after = await resultSS.textContent();
		expect(before).not.toBe(after);
	});

	test('changing aperture select updates result', async ({ page }) => {
		const shadow = page.locator('ndx-calc');
		const apSelect = shadow.locator('[data-action="aperture"]');
		const evBefore = shadow.locator('[data-bind="evBefore"]');

		const before = await evBefore.textContent();
		await apSelect.selectOption('18'); // f/8
		const after = await evBefore.textContent();
		expect(before).not.toBe(after);
	});

	test('preset click updates slider and result', async ({ page }) => {
		const shadow = page.locator('ndx-calc');

		// Click ND1000 preset
		await shadow.locator('[data-stops="10"]').click();

		// Slider should sync
		const slider = shadow.locator('#ndx-stops');
		await expect(slider).toHaveValue('10');

		// Output should show stops
		const output = shadow.locator('.ndx__slider-output');
		await expect(output).toHaveText('10 stops');

		// Preset should be active
		const preset = shadow.locator('[data-stops="10"]');
		await expect(preset).toHaveAttribute('aria-checked', 'true');
	});

	test('ND1000 on 1/125 shows BULB badge', async ({ page }) => {
		const shadow = page.locator('ndx-calc');

		// Ensure SS is 1/125 (default)
		await shadow.locator('[data-stops="10"]').click(); // ND1000

		const badge = shadow.locator('[data-bind="bulbBadge"]');
		await expect(badge).toBeVisible();
	});

	test('slider changes update filter info', async ({ page }) => {
		const shadow = page.locator('ndx-calc');
		const slider = shadow.locator('#ndx-stops');

		await slider.fill('10');
		await slider.dispatchEvent('input');

		const filterName = shadow.locator('[data-bind="filterName"]');
		await expect(filterName).toHaveText('ND1024');
	});

	test('keyboard navigation on presets', async ({ page }) => {
		const shadow = page.locator('ndx-calc');

		// Focus first preset (ND4)
		const firstPreset = shadow.locator('[data-stops="2"]');
		await firstPreset.focus();

		// Arrow right to ND8
		await page.keyboard.press('ArrowRight');
		const activePreset = shadow.locator('[data-stops="3"]');
		await expect(activePreset).toHaveAttribute('aria-checked', 'true');

		// Arrow right to ND16
		await page.keyboard.press('ArrowRight');
		const nd16 = shadow.locator('[data-stops="4"]');
		await expect(nd16).toHaveAttribute('aria-checked', 'true');

		// Home key
		await page.keyboard.press('Home');
		await expect(firstPreset).toHaveAttribute('aria-checked', 'true');

		// End key
		await page.keyboard.press('End');
		const lastPreset = shadow.locator('[data-stops="10"]');
		await expect(lastPreset).toHaveAttribute('aria-checked', 'true');
	});

	test('details expands to show alternative compensation', async ({ page }) => {
		const shadow = page.locator('ndx-calc');
		const details = shadow.locator('.ndx__alternatives');
		const summary = details.locator('summary');

		await summary.click();
		const altAperture = shadow.locator('[data-bind="altAperture"]');
		await expect(altAperture).toBeVisible();
		await expect(altAperture).not.toHaveText('--');
	});

	test('clamp warning shows for aperture at limit', async ({ page }) => {
		const shadow = page.locator('ndx-calc');

		// Set aperture to f/1.0 (index 0) and strong ND
		await shadow.locator('[data-action="aperture"]').selectOption('0');
		await shadow.locator('[data-stops="10"]').click();

		// Open alternatives
		await shadow.locator('.ndx__alternatives summary').click();

		const apWarning = shadow.locator('[data-bind="apWarning"]');
		await expect(apWarning).toBeVisible();
	});

	test('responsive layout', async ({ page }) => {
		const shadow = page.locator('ndx-calc');

		// Mobile
		await page.setViewportSize({ width: 375, height: 667 });
		const body = shadow.locator('.ndx__body');
		await expect(body).toBeVisible();

		// Desktop
		await page.setViewportSize({ width: 1024, height: 768 });
		await expect(body).toBeVisible();
	});
});

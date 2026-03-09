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

	test('clicking preset adds chip and updates result', async ({ page }) => {
		const shadow = page.locator('ndx-calc');

		// Click ND1000 preset — adds to default ND8 stack
		await shadow.locator('[data-stops="10"]').click();

		// Should have 2 chips now (ND8 default + ND1024)
		const chips = shadow.locator('.ndx__stack-chip');
		await expect(chips).toHaveCount(2);

		// Result should show BULB (3 + 10 = 13 stops on 1/125)
		const badge = shadow.locator('[data-bind="bulbBadge"]');
		await expect(badge).toBeVisible();
	});

	test('adding two filters shows combined result and clear button', async ({ page }) => {
		const shadow = page.locator('ndx-calc');

		// Add ND1000
		await shadow.locator('[data-stops="10"]').click();

		// Should have 2 chips
		const chips = shadow.locator('.ndx__stack-chip');
		await expect(chips).toHaveCount(2);

		// Clear button should be visible
		const clearBtn = shadow.locator('[data-action="clear-stack"]');
		await expect(clearBtn).toBeVisible();

		// Filter name should show combined
		const filterName = shadow.locator('[data-bind="filterName"]');
		await expect(filterName).toHaveText('ND8 + ND1024');
	});

	test('removing filter from stack updates result', async ({ page }) => {
		const shadow = page.locator('ndx-calc');

		// Add ND1000 to make stack [ND8, ND1024]
		await shadow.locator('[data-stops="10"]').click();
		const resultBefore = await shadow.locator('[data-bind="resultSS"]').textContent();

		// Remove first filter (ND8)
		await shadow.locator('.ndx__stack-chip-remove').first().click();
		const resultAfter = await shadow.locator('[data-bind="resultSS"]').textContent();

		expect(resultBefore).not.toBe(resultAfter);
		const chips = shadow.locator('.ndx__stack-chip');
		await expect(chips).toHaveCount(1);
	});

	test('clear all empties stack', async ({ page }) => {
		const shadow = page.locator('ndx-calc');

		// Add a second filter
		await shadow.locator('[data-stops="10"]').click();

		// Click clear
		await shadow.locator('[data-action="clear-stack"]').click();

		// Stack should be empty
		const chips = shadow.locator('.ndx__stack-chip');
		await expect(chips).toHaveCount(0);

		// Shift info should show "No ND filter"
		const shiftInfo = shadow.locator('[data-bind="shiftInfo"]');
		await expect(shiftInfo).toHaveText('No ND filter');
	});

	test('ND1000 on 1/125 shows BULB badge', async ({ page }) => {
		const shadow = page.locator('ndx-calc');

		// Clear default, add ND1000 alone
		// Default has ND8, already shows bulb at 1/125
		// Just verify bulb is visible with the default ND8
		const badge = shadow.locator('[data-bind="bulbBadge"]');
		// ND8 (3 stops) on 1/125 = 1/15, not bulb
		// Need ND1000: click preset to add, then check
		await shadow.locator('[data-stops="10"]').click(); // adds ND1000, total 13 stops
		await expect(badge).toBeVisible();
	});

	test('slider add button adds custom filter', async ({ page }) => {
		const shadow = page.locator('ndx-calc');
		const slider = shadow.locator('#ndx-stops');

		await slider.fill('6');
		await slider.dispatchEvent('input');

		// Click Add button
		await shadow.locator('[data-action="add-custom"]').click();

		// Should have 2 chips (default ND8 + custom ND64)
		const chips = shadow.locator('.ndx__stack-chip');
		await expect(chips).toHaveCount(2);
	});

	test('changing ISO after ND adjusts compensated SS', async ({ page }) => {
		const shadow = page.locator('ndx-calc');
		const resultSS = shadow.locator('[data-bind="resultSS"]');

		// Add ND1000
		await shadow.locator('[data-stops="10"]').click();
		const ssBefore = await resultSS.textContent();

		// Raise ISO
		const isoSelect = shadow.locator('[data-action="iso"]');
		await isoSelect.selectOption('9'); // ISO 400
		const ssAfter = await resultSS.textContent();

		expect(ssBefore).not.toBe(ssAfter);
	});

	test('±1EV button changes SS select value', async ({ page }) => {
		const shadow = page.locator('ndx-calc');
		const ssSelect = shadow.locator('[data-action="ss"]');
		const before = await ssSelect.inputValue();

		// Click +1 EV button for SS
		await shadow.locator('[data-action="ev-step"][data-target="ss"][data-delta="3"]').click();
		const after = await ssSelect.inputValue();
		expect(Number(after)).toBe(Number(before) + 3);
	});

	test('−1EV button changes SS select value', async ({ page }) => {
		const shadow = page.locator('ndx-calc');
		const ssSelect = shadow.locator('[data-action="ss"]');
		const before = await ssSelect.inputValue();

		// Click −1 EV button for SS
		await shadow.locator('[data-action="ev-step"][data-target="ss"][data-delta="-3"]').click();
		const after = await ssSelect.inputValue();
		expect(Number(after)).toBe(Number(before) - 3);
	});

	test('exact SS display is shown', async ({ page }) => {
		const shadow = page.locator('ndx-calc');
		const exact = shadow.locator('[data-bind="resultSSExact"]');
		await expect(exact).toContainText('s');
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

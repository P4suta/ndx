import { describe, expect, it } from 'vitest';
import { ISO } from '../../src/domain/iso.js';

describe('ISO', () => {
	const expectedDisplay = [
		'ISO 50',
		'ISO 64',
		'ISO 80',
		'ISO 100',
		'ISO 125',
		'ISO 160',
		'ISO 200',
		'ISO 250',
		'ISO 320',
		'ISO 400',
		'ISO 500',
		'ISO 640',
		'ISO 800',
		'ISO 1000',
		'ISO 1250',
		'ISO 1600',
		'ISO 2000',
		'ISO 2500',
		'ISO 3200',
		'ISO 4000',
		'ISO 5000',
		'ISO 6400',
		'ISO 8000',
		'ISO 10000',
		'ISO 12800',
		'ISO 16000',
		'ISO 20000',
		'ISO 25600',
		'ISO 32000',
		'ISO 40000',
		'ISO 51200',
	];

	const expectedValues = [
		50, 64, 80, 100, 125, 160, 200, 250, 320, 400, 500, 640, 800, 1000, 1250, 1600, 2000, 2500,
		3200, 4000, 5000, 6400, 8000, 10000, 12800, 16000, 20000, 25600, 32000, 40000, 51200,
	];

	it('has 31 standard values', () => {
		expect(ISO.scaleLength).toBe(31);
	});

	it.each(expectedDisplay.map((d, i) => [i, d]))('index %i displays as %s', (index, display) => {
		expect(ISO.fromIndex(index).display).toBe(display);
	});

	it.each(expectedValues.map((v, i) => [i, v]))('index %i has value %s', (index, value) => {
		expect(ISO.fromIndex(index).value).toBe(value);
	});

	describe('clamping', () => {
		it('clamps negative index to 0', () => {
			const iso = ISO.fromIndex(-5);
			expect(iso.index).toBe(0);
			expect(iso.value).toBe(50);
		});

		it('clamps excessive index to 30', () => {
			const iso = ISO.fromIndex(50);
			expect(iso.index).toBe(30);
			expect(iso.value).toBe(51200);
		});
	});

	describe('shift + isClamped', () => {
		it('shifts within range', () => {
			const iso = ISO.fromIndex(3); // ISO 100
			const shifted = iso.shift(9); // +3 stops → ISO 800
			expect(shifted.display).toBe('ISO 800');
			expect(shifted.isClamped).toBe(false);
		});

		it('clamps when shifting below 0', () => {
			const iso = ISO.fromIndex(1);
			const shifted = iso.shift(-9);
			expect(shifted.index).toBe(0);
			expect(shifted.isClamped).toBe(true);
		});

		it('clamps when shifting above max', () => {
			const iso = ISO.fromIndex(28);
			const shifted = iso.shift(9);
			expect(shifted.index).toBe(30);
			expect(shifted.isClamped).toBe(true);
		});
	});

	describe('defaultIndex', () => {
		it('returns 3 (ISO 100)', () => {
			expect(ISO.defaultIndex()).toBe(3);
			expect(ISO.fromIndex(3).display).toBe('ISO 100');
		});
	});

	describe('displayAt', () => {
		it('returns display with ISO prefix', () => {
			expect(ISO.displayAt(0)).toBe('ISO 50');
			expect(ISO.displayAt(3)).toBe('ISO 100');
		});
	});
});

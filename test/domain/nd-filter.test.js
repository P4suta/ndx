import { describe, expect, it } from 'vitest';
import { formatTransmission, NDFilter, toSuperscript } from '../../src/domain/nd-filter.js';

describe('NDFilter', () => {
	describe('constructor validation', () => {
		it('accepts valid stops (1)', () => {
			expect(() => new NDFilter(1)).not.toThrow();
		});

		it('accepts valid stops (20)', () => {
			expect(() => new NDFilter(20)).not.toThrow();
		});

		it('rejects stops < 1', () => {
			expect(() => new NDFilter(0)).toThrow(RangeError);
		});

		it('rejects stops > 20', () => {
			expect(() => new NDFilter(21)).toThrow(RangeError);
		});

		it('rejects non-integer', () => {
			expect(() => new NDFilter(1.5)).toThrow(RangeError);
		});

		it('rejects NaN', () => {
			expect(() => new NDFilter(Number.NaN)).toThrow(RangeError);
		});

		it('rejects Infinity', () => {
			expect(() => new NDFilter(Number.POSITIVE_INFINITY)).toThrow(RangeError);
		});
	});

	describe('thirdStops', () => {
		it.each(
			Array.from({ length: 20 }, (_, i) => [i + 1, (i + 1) * 3]),
		)('%i stops = %i third-stops', (stops, expected) => {
			expect(new NDFilter(stops).thirdStops).toBe(expected);
		});
	});

	describe('filterFactor', () => {
		it.each(
			Array.from({ length: 20 }, (_, i) => [i + 1, 2 ** (i + 1)]),
		)('%i stops → filterFactor = %i', (stops, expected) => {
			expect(new NDFilter(stops).filterFactor).toBe(expected);
		});
	});

	describe('opticalDensity', () => {
		it.each([
			[1, 0.3],
			[2, 0.6],
			[3, 0.9],
			[6, 1.81],
			[10, 3.01],
		])('%i stops → OD ≈ %s', (stops, expected) => {
			expect(new NDFilter(stops).opticalDensity).toBeCloseTo(expected, 2);
		});
	});

	describe('transmission', () => {
		it('1 stop → "50"', () => {
			expect(new NDFilter(1).transmission).toBe('50');
		});

		it('3 stops → "12.5"', () => {
			expect(new NDFilter(3).transmission).toBe('12.5');
		});

		it('10 stops → "0.098"', () => {
			expect(new NDFilter(10).transmission).toBe('0.098');
		});

		it('20 stops → scientific notation', () => {
			const t = new NDFilter(20).transmission;
			expect(t).toMatch(/×10/);
		});

		it('returns a string', () => {
			expect(typeof new NDFilter(3).transmission).toBe('string');
		});
	});

	describe('display', () => {
		it('ND8 for 3 stops', () => {
			expect(new NDFilter(3).display).toBe('ND8');
		});

		it('ND1024 for 10 stops', () => {
			expect(new NDFilter(10).display).toBe('ND1024');
		});
	});

	describe('PRESETS', () => {
		it('has 5 presets', () => {
			expect(NDFilter.PRESETS).toHaveLength(5);
		});

		it('is frozen', () => {
			expect(Object.isFrozen(NDFilter.PRESETS)).toBe(true);
		});

		it('has correct stops and labels', () => {
			const expected = [
				{ stops: 2, label: 'ND4' },
				{ stops: 3, label: 'ND8' },
				{ stops: 4, label: 'ND16' },
				{ stops: 6, label: 'ND64' },
				{ stops: 10, label: 'ND1000' },
			];
			expect(NDFilter.PRESETS).toEqual(expected);
		});
	});
});

describe('toSuperscript', () => {
	it('converts positive integer', () => {
		expect(toSuperscript(5)).toBe('\u2075');
	});

	it('converts negative integer', () => {
		expect(toSuperscript(-5)).toBe('\u207b\u2075');
	});

	it('converts multi-digit', () => {
		expect(toSuperscript(12)).toBe('\u00b9\u00b2');
	});

	it('converts zero', () => {
		expect(toSuperscript(0)).toBe('\u2070');
	});
});

describe('formatTransmission', () => {
	it('large value (≥1)', () => {
		expect(formatTransmission(12.5)).toBe('12.5');
	});

	it('medium value (0.01–1)', () => {
		expect(formatTransmission(0.098)).toBe('0.098');
	});

	it('tiny value (<0.01) uses scientific notation', () => {
		const result = formatTransmission(0.0000954);
		expect(result).toMatch(/×10/);
		expect(result).toContain('\u207b');
	});

	it('formats 100 / 2^20 correctly', () => {
		const t = 100 / 2 ** 20;
		const result = formatTransmission(t);
		expect(result).toMatch(/^9\.54×10\u207b\u2075$/);
	});
});

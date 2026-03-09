import { describe, expect, it } from 'vitest';
import { NDFilter } from '../../src/domain/nd-filter.js';

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
		it('1 stop → 50%', () => {
			expect(new NDFilter(1).transmission).toBe(50);
		});

		it('3 stops → 12.5%', () => {
			expect(new NDFilter(3).transmission).toBe(12.5);
		});

		it('10 stops → 0.098%', () => {
			const t = new NDFilter(10).transmission;
			expect(t).toBeCloseTo(0.098, 3);
		});

		it('formats ≥1 with 1 decimal', () => {
			const t = new NDFilter(2).transmission; // 25
			expect(Number.isInteger(t) || String(t).split('.')[1]?.length <= 1).toBe(true);
		});

		it('formats <1 with 3 decimals', () => {
			const t = new NDFilter(10).transmission;
			expect(String(t).split('.')[1]?.length).toBeLessThanOrEqual(3);
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

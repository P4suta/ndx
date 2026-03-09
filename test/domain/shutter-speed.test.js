import { describe, expect, it } from 'vitest';
import { ShutterSpeed } from '../../src/domain/shutter-speed.js';

describe('ShutterSpeed', () => {
	describe('standard scale', () => {
		const expectedDisplay = [
			'1/8000',
			'1/6400',
			'1/5000',
			'1/4000',
			'1/3200',
			'1/2500',
			'1/2000',
			'1/1600',
			'1/1250',
			'1/1000',
			'1/800',
			'1/640',
			'1/500',
			'1/400',
			'1/320',
			'1/250',
			'1/200',
			'1/160',
			'1/125',
			'1/100',
			'1/80',
			'1/60',
			'1/50',
			'1/40',
			'1/30',
			'1/25',
			'1/20',
			'1/15',
			'1/13',
			'1/10',
			'1/8',
			'1/6',
			'1/5',
			'1/4',
			'0.3"',
			'0.4"',
			'0.5"',
			'0.6"',
			'0.8"',
			'1"',
			'1.3"',
			'1.6"',
			'2"',
			'2.5"',
			'3.2"',
			'4"',
			'5"',
			'6"',
			'8"',
			'10"',
			'13"',
			'15"',
			'20"',
			'25"',
			'30"',
		];

		const expectedSeconds = [
			1 / 8000,
			1 / 6400,
			1 / 5000,
			1 / 4000,
			1 / 3200,
			1 / 2500,
			1 / 2000,
			1 / 1600,
			1 / 1250,
			1 / 1000,
			1 / 800,
			1 / 640,
			1 / 500,
			1 / 400,
			1 / 320,
			1 / 250,
			1 / 200,
			1 / 160,
			1 / 125,
			1 / 100,
			1 / 80,
			1 / 60,
			1 / 50,
			1 / 40,
			1 / 30,
			1 / 25,
			1 / 20,
			1 / 15,
			1 / 13,
			1 / 10,
			1 / 8,
			1 / 6,
			1 / 5,
			1 / 4,
			0.3,
			0.4,
			0.5,
			0.6,
			0.8,
			1,
			1.3,
			1.6,
			2,
			2.5,
			3.2,
			4,
			5,
			6,
			8,
			10,
			13,
			15,
			20,
			25,
			30,
		];

		it('has 55 standard values', () => {
			expect(ShutterSpeed.scaleLength).toBe(55);
		});

		it.each(expectedDisplay.map((d, i) => [i, d]))('index %i displays as %s', (index, display) => {
			const ss = ShutterSpeed.fromIndex(index);
			expect(ss.display).toBe(display);
		});

		it.each(
			expectedSeconds.map((s, i) => [i, s]),
		)('index %i has correct seconds value', (index, seconds) => {
			const ss = ShutterSpeed.fromIndex(index);
			expect(ss.seconds).toBeCloseTo(seconds, 10);
		});
	});

	describe('displayAt static method', () => {
		it('returns display string for given index', () => {
			expect(ShutterSpeed.displayAt(0)).toBe('1/8000');
			expect(ShutterSpeed.displayAt(18)).toBe('1/125');
			expect(ShutterSpeed.displayAt(54)).toBe('30"');
		});
	});

	describe('defaultIndex', () => {
		it('returns 18 (1/125)', () => {
			expect(ShutterSpeed.defaultIndex()).toBe(18);
			const ss = ShutterSpeed.fromIndex(ShutterSpeed.defaultIndex());
			expect(ss.display).toBe('1/125');
		});
	});

	describe('shift', () => {
		it('returns a new instance (immutability)', () => {
			const ss = ShutterSpeed.fromIndex(18);
			const shifted = ss.shift(3);
			expect(shifted).not.toBe(ss);
			expect(ss.index).toBe(18);
			expect(shifted.index).toBe(21);
		});

		it('shifts positive (slower)', () => {
			const ss = ShutterSpeed.fromIndex(18); // 1/125
			const shifted = ss.shift(9); // +3 stops → 1/15
			expect(shifted.display).toBe('1/15');
		});

		it('shifts negative (faster)', () => {
			const ss = ShutterSpeed.fromIndex(18); // 1/125
			const shifted = ss.shift(-9); // -3 stops → 1/1000
			expect(shifted.display).toBe('1/1000');
		});
	});

	describe('bulb range', () => {
		it('index 54 (30") is not bulb', () => {
			const ss = ShutterSpeed.fromIndex(54);
			expect(ss.isBulb).toBe(false);
			expect(ss.display).toBe('30"');
		});

		it('index 55 is bulb', () => {
			const ss = ShutterSpeed.fromIndex(55);
			expect(ss.isBulb).toBe(true);
		});

		it('extrapolates seconds mathematically', () => {
			// index 55 = 30 * 2^(1/3) ≈ 37.8
			const ss = ShutterSpeed.fromIndex(55);
			const expected = 30 * 2 ** (1 / 3);
			expect(ss.seconds).toBeCloseTo(expected, 5);
		});

		it('formats seconds < 60 as N"', () => {
			const ss = ShutterSpeed.fromIndex(55);
			expect(ss.display).toMatch(/^\d+"/);
		});

		it('formats minutes correctly', () => {
			// index 57 = bulb territory, 30 * 2^(3/3) = 60s → should show minutes
			const ss = ShutterSpeed.fromIndex(57);
			const secs = ss.seconds;
			expect(secs).toBeGreaterThanOrEqual(60);
			expect(ss.display).toMatch(/m/);
		});

		it('formats hours correctly', () => {
			// 30" + 20 stops = index 54 + 60 = index 114
			const ss = ShutterSpeed.fromIndex(114);
			const secs = ss.seconds;
			expect(secs).toBeGreaterThan(3600);
			expect(ss.display).toMatch(/h/);
		});
	});

	describe('negative index', () => {
		it('displays as "<1/8000"', () => {
			const ss = ShutterSpeed.fromIndex(-1);
			expect(ss.display).toBe('<1/8000');
		});

		it('extrapolates seconds for negative index', () => {
			const ss = ShutterSpeed.fromIndex(-3);
			// -3 = 1 full stop faster than 1/8000 → 1/16000
			const expected = (1 / 8000) * 2 ** (3 / 3);
			expect(ss.seconds).toBeCloseTo(expected, 10);
		});
	});
});

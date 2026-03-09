import { describe, expect, it } from 'vitest';
import { Aperture } from '../../src/domain/aperture.js';

describe('Aperture', () => {
	const expectedDisplay = [
		'f/1.0',
		'f/1.1',
		'f/1.2',
		'f/1.4',
		'f/1.6',
		'f/1.8',
		'f/2',
		'f/2.2',
		'f/2.5',
		'f/2.8',
		'f/3.2',
		'f/3.5',
		'f/4',
		'f/4.5',
		'f/5',
		'f/5.6',
		'f/6.3',
		'f/7.1',
		'f/8',
		'f/9',
		'f/10',
		'f/11',
		'f/13',
		'f/14',
		'f/16',
		'f/18',
		'f/20',
		'f/22',
		'f/25',
		'f/29',
		'f/32',
	];

	const expectedFNumbers = [
		1.0, 1.1, 1.2, 1.4, 1.6, 1.8, 2.0, 2.2, 2.5, 2.8, 3.2, 3.5, 4.0, 4.5, 5.0, 5.6, 6.3, 7.1, 8, 9,
		10, 11, 13, 14, 16, 18, 20, 22, 25, 29, 32,
	];

	it('has 31 standard values', () => {
		expect(Aperture.scaleLength).toBe(31);
	});

	it.each(expectedDisplay.map((d, i) => [i, d]))('index %i displays as %s', (index, display) => {
		expect(Aperture.fromIndex(index).display).toBe(display);
	});

	it.each(expectedFNumbers.map((f, i) => [i, f]))('index %i has fNumber %s', (index, fNumber) => {
		expect(Aperture.fromIndex(index).fNumber).toBe(fNumber);
	});

	describe('clamping', () => {
		it('clamps negative index to 0', () => {
			const ap = Aperture.fromIndex(-5);
			expect(ap.index).toBe(0);
			expect(ap.display).toBe('f/1.0');
		});

		it('clamps excessive index to 30', () => {
			const ap = Aperture.fromIndex(50);
			expect(ap.index).toBe(30);
			expect(ap.display).toBe('f/32');
		});
	});

	describe('shift + isClamped', () => {
		it('shifts within range', () => {
			const ap = Aperture.fromIndex(9); // f/2.8
			const shifted = ap.shift(6); // +2 stops → f/5.6
			expect(shifted.display).toBe('f/5.6');
			expect(shifted.isClamped).toBe(false);
		});

		it('clamps when shifting below 0', () => {
			const ap = Aperture.fromIndex(3); // f/1.4
			const shifted = ap.shift(-9); // open 3 stops → clamped to f/1.0
			expect(shifted.index).toBe(0);
			expect(shifted.display).toBe('f/1.0');
			expect(shifted.isClamped).toBe(true);
		});

		it('clamps when shifting above max', () => {
			const ap = Aperture.fromIndex(27); // f/22
			const shifted = ap.shift(9); // +3 stops → clamped to f/32
			expect(shifted.index).toBe(30);
			expect(shifted.display).toBe('f/32');
			expect(shifted.isClamped).toBe(true);
		});
	});

	describe('defaultIndex', () => {
		it('returns 5 (f/1.8)', () => {
			expect(Aperture.defaultIndex()).toBe(5);
			expect(Aperture.fromIndex(5).display).toBe('f/1.8');
		});
	});

	describe('isClamped at boundaries', () => {
		it('is clamped at index 0', () => {
			expect(Aperture.fromIndex(0).isClamped).toBe(true);
		});

		it('is clamped at index 30', () => {
			expect(Aperture.fromIndex(30).isClamped).toBe(true);
		});

		it('is not clamped in middle', () => {
			expect(Aperture.fromIndex(15).isClamped).toBe(false);
		});
	});
});

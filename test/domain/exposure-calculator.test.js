import { describe, expect, it } from 'vitest';
import { Aperture } from '../../src/domain/aperture.js';
import { ExposureCalculator } from '../../src/domain/exposure-calculator.js';
import { ISO } from '../../src/domain/iso.js';
import { NDFilter } from '../../src/domain/nd-filter.js';
import { NDFilterStack } from '../../src/domain/nd-filter-stack.js';
import { ShutterSpeed } from '../../src/domain/shutter-speed.js';

describe('ExposureCalculator', () => {
	const calc = new ExposureCalculator();

	describe('compensate - shutter speed', () => {
		it('ND8 (3 stops) on 1/125 → 1/15', () => {
			const ss = ShutterSpeed.fromIndex(18); // 1/125
			const ap = Aperture.fromIndex(18); // f/8
			const iso = ISO.fromIndex(3); // ISO 100
			const nd = new NDFilter(3); // ND8

			const result = calc.compensate(ss, ap, iso, nd, ap.index, iso.index);
			// 3 stops = 9 third-stops → index 18 + 9 = 27
			expect(result.shutterSpeed.display).toBe('1/15');
		});
	});

	describe('Av/ISO delta compensation', () => {
		it('raising ISO reduces compensated SS', () => {
			const ss = ShutterSpeed.fromIndex(18); // 1/125
			const ap = Aperture.fromIndex(18); // f/8
			const refAp = 18;
			const refISO = 3; // ISO 100
			const nd = new NDFilter(10); // ND1000

			// Default: ISO 100 → 18 + 30 + 0 - 0 = 48 → 8"
			const r1 = calc.compensate(ss, ap, ISO.fromIndex(3), nd, refAp, refISO);
			expect(r1.shutterSpeed.display).toBe('8"');

			// ISO 400 (index 9): 18 + 30 + 0 - 6 = 42 → 2"
			const r2 = calc.compensate(ss, ap, ISO.fromIndex(9), nd, refAp, refISO);
			expect(r2.shutterSpeed.display).toBe('2"');
		});

		it('opening aperture reduces compensated SS', () => {
			const ss = ShutterSpeed.fromIndex(18); // 1/125
			const iso = ISO.fromIndex(3); // ISO 100
			const refAp = 18; // f/8
			const refISO = 3;
			const nd = new NDFilter(10);

			// f/4 (index 12): 18 + 30 + (12-18) - 0 = 42 → 2"
			const r = calc.compensate(ss, Aperture.fromIndex(12), iso, nd, refAp, refISO);
			expect(r.shutterSpeed.display).toBe('2"');
		});

		it('combined aperture and ISO adjustment', () => {
			const ss = ShutterSpeed.fromIndex(18); // 1/125
			const refAp = 18; // f/8
			const refISO = 3; // ISO 100
			const nd = new NDFilter(10);

			// f/4 (12) + ISO 400 (9): 18 + 30 + (12-18) - (9-3) = 36 → 0.5"
			const r = calc.compensate(ss, Aperture.fromIndex(12), ISO.fromIndex(9), nd, refAp, refISO);
			expect(r.shutterSpeed.display).toBe('0.5"');
		});

		it('ref == current gives same result as old behavior', () => {
			const ss = ShutterSpeed.fromIndex(18);
			const ap = Aperture.fromIndex(18);
			const iso = ISO.fromIndex(3);
			const nd = new NDFilter(3);

			const result = calc.compensate(ss, ap, iso, nd, ap.index, iso.index);
			// totalShift = 9 + 0 - 0 = 9, same as old ND-only shift
			expect(result.shutterSpeed.display).toBe('1/15');
		});
	});

	describe('exposureValue', () => {
		it('calculates EV = log2(N²/t) + log2(S/100)', () => {
			const ss = ShutterSpeed.fromIndex(18); // 1/125
			const ap = Aperture.fromIndex(18); // f/8
			const iso = ISO.fromIndex(3); // ISO 100

			const ev = calc.exposureValue(ss, ap, iso);
			// EV = log2(64 / (1/125)) + log2(100/100) = log2(8000) ≈ 12.97
			const expected = Math.log2((8 * 8) / (1 / 125)) + Math.log2(100 / 100);
			expect(ev).toBeCloseTo(expected, 5);
		});
	});

	describe('EV conservation', () => {
		it('ND n stops → evBefore - evAfter ≈ n', () => {
			const ss = ShutterSpeed.fromIndex(18);
			const ap = Aperture.fromIndex(18);
			const iso = ISO.fromIndex(3);

			for (let stops = 1; stops <= 10; stops++) {
				const nd = new NDFilter(stops);
				const result = calc.compensate(ss, ap, iso, nd, ap.index, iso.index);
				expect(result.evBefore - result.evAfter).toBeCloseTo(stops, 0);
			}
		});
	});

	describe('extreme case', () => {
		it('ND20 on 30" → ~364 days', () => {
			const ss = ShutterSpeed.fromIndex(54); // 30"
			const ap = Aperture.fromIndex(18);
			const iso = ISO.fromIndex(3);
			const nd = new NDFilter(20);

			const result = calc.compensate(ss, ap, iso, nd, ap.index, iso.index);
			const days = result.shutterSpeed.seconds / 86400;
			expect(days).toBeCloseTo((30 * 2 ** 20) / 86400, 0);
			expect(result.shutterSpeed.isBulb).toBe(true);
		});
	});

	describe('smoke test: all presets with defaults', () => {
		it.each(
			NDFilter.PRESETS.map((p) => [p.label, p.stops]),
		)('%s (%i stops) produces valid result', (_label, stops) => {
			const nd = new NDFilter(stops);
			const result = calc.compensate(
				ShutterSpeed.fromIndex(ShutterSpeed.defaultIndex()),
				Aperture.fromIndex(Aperture.defaultIndex()),
				ISO.fromIndex(ISO.defaultIndex()),
				nd,
				Aperture.defaultIndex(),
				ISO.defaultIndex(),
			);
			expect(result.shutterSpeed).toBeDefined();
			expect(typeof result.evBefore).toBe('number');
			expect(typeof result.evAfter).toBe('number');
		});
	});

	describe('NDFilterStack compatibility', () => {
		it('single-filter stack produces same result as raw NDFilter', () => {
			const ss = ShutterSpeed.fromIndex(18);
			const ap = Aperture.fromIndex(18);
			const iso = ISO.fromIndex(3);
			const nd = new NDFilter(3);
			const stack = NDFilterStack.of(nd);

			const r1 = calc.compensate(ss, ap, iso, nd, ap.index, iso.index);
			const r2 = calc.compensate(ss, ap, iso, stack, ap.index, iso.index);
			expect(r1.shutterSpeed.display).toBe(r2.shutterSpeed.display);
			expect(r1.evBefore).toBe(r2.evBefore);
			expect(r1.evAfter).toBe(r2.evAfter);
		});

		it('two-filter stack (ND8+ND8 = 6 stops) matches NDFilter(6)', () => {
			const ss = ShutterSpeed.fromIndex(18);
			const ap = Aperture.fromIndex(18);
			const iso = ISO.fromIndex(3);
			const stack = NDFilterStack.of(new NDFilter(3), new NDFilter(3));
			const nd6 = new NDFilter(6);

			const r1 = calc.compensate(ss, ap, iso, stack, ap.index, iso.index);
			const r2 = calc.compensate(ss, ap, iso, nd6, ap.index, iso.index);
			expect(r1.shutterSpeed.display).toBe(r2.shutterSpeed.display);
		});

		it('stacked ND1000+ND1000 (20 stops) produces valid bulb result', () => {
			const ss = ShutterSpeed.fromIndex(18); // 1/125
			const ap = Aperture.fromIndex(18);
			const iso = ISO.fromIndex(3);
			const stack = NDFilterStack.of(new NDFilter(10), new NDFilter(10));

			const result = calc.compensate(ss, ap, iso, stack, ap.index, iso.index);
			expect(result.shutterSpeed.isBulb).toBe(true);
			expect(result.shutterSpeed.seconds).toBeGreaterThan(0);
		});
	});

	describe('statelessness', () => {
		it('calling compensate twice with same inputs returns same results', () => {
			const ss = ShutterSpeed.fromIndex(18);
			const ap = Aperture.fromIndex(18);
			const iso = ISO.fromIndex(3);
			const nd = new NDFilter(3);

			const r1 = calc.compensate(ss, ap, iso, nd, ap.index, iso.index);
			const r2 = calc.compensate(ss, ap, iso, nd, ap.index, iso.index);
			expect(r1.shutterSpeed.display).toBe(r2.shutterSpeed.display);
			expect(r1.evBefore).toBe(r2.evBefore);
			expect(r1.evAfter).toBe(r2.evAfter);
		});
	});
});

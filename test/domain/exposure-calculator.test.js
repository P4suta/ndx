import { describe, expect, it } from 'vitest';
import { Aperture } from '../../src/domain/aperture.js';
import { ExposureCalculator } from '../../src/domain/exposure-calculator.js';
import { ISO } from '../../src/domain/iso.js';
import { NDFilter } from '../../src/domain/nd-filter.js';
import { ShutterSpeed } from '../../src/domain/shutter-speed.js';

describe('ExposureCalculator', () => {
	const calc = new ExposureCalculator();

	describe('compensate - shutter speed', () => {
		it('ND8 (3 stops) on 1/125 → 1/15', () => {
			const ss = ShutterSpeed.fromIndex(18); // 1/125
			const ap = Aperture.fromIndex(18); // f/8
			const iso = ISO.fromIndex(3); // ISO 100
			const nd = new NDFilter(3); // ND8

			const result = calc.compensate(ss, ap, iso, nd);
			// 3 stops = 9 third-stops → index 18 + 9 = 27
			expect(result.shutterSpeed.display).toBe('1/15');
		});
	});

	describe('compensate - aperture', () => {
		it('3 stops opens f/8 to f/2.8', () => {
			const ss = ShutterSpeed.fromIndex(18);
			const ap = Aperture.fromIndex(18); // f/8
			const iso = ISO.fromIndex(3);
			const nd = new NDFilter(3);

			const result = calc.compensate(ss, ap, iso, nd);
			// aperture shift -9 → index 18 - 9 = 9 → f/2.8
			expect(result.apertureComp.display).toBe('f/2.8');
		});

		it('clamps when aperture hits limit', () => {
			const ap = Aperture.fromIndex(0); // f/1.0 (already at limit)
			const nd = new NDFilter(3);

			const result = calc.compensate(ShutterSpeed.fromIndex(18), ap, ISO.fromIndex(3), nd);
			expect(result.apertureComp.index).toBe(0);
			expect(result.apertureComp.isClamped).toBe(true);
		});
	});

	describe('compensate - ISO', () => {
		it('3 stops raises ISO 100 to ISO 800', () => {
			const iso = ISO.fromIndex(3); // ISO 100
			const nd = new NDFilter(3);

			const result = calc.compensate(ShutterSpeed.fromIndex(18), Aperture.fromIndex(18), iso, nd);
			// +9 third-stops → index 3 + 9 = 12 → ISO 800
			expect(result.isoComp.display).toBe('ISO 800');
		});

		it('clamps when ISO hits upper limit', () => {
			const iso = ISO.fromIndex(30); // ISO 51200
			const nd = new NDFilter(3);

			const result = calc.compensate(ShutterSpeed.fromIndex(18), Aperture.fromIndex(18), iso, nd);
			expect(result.isoComp.index).toBe(30);
			expect(result.isoComp.isClamped).toBe(true);
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
				const result = calc.compensate(ss, ap, iso, nd);
				expect(result.evBefore - result.evAfter).toBeCloseTo(stops, 0);
			}
		});
	});

	describe('extreme case', () => {
		it('ND20 on 30" → ~364 days', () => {
			const ss = ShutterSpeed.fromIndex(54); // 30"
			const nd = new NDFilter(20);

			const result = calc.compensate(ss, Aperture.fromIndex(18), ISO.fromIndex(3), nd);
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
			);
			expect(result.shutterSpeed).toBeDefined();
			expect(result.apertureComp).toBeDefined();
			expect(result.isoComp).toBeDefined();
			expect(typeof result.evBefore).toBe('number');
			expect(typeof result.evAfter).toBe('number');
		});
	});

	describe('statelessness', () => {
		it('calling compensate twice with same inputs returns same results', () => {
			const ss = ShutterSpeed.fromIndex(18);
			const ap = Aperture.fromIndex(18);
			const iso = ISO.fromIndex(3);
			const nd = new NDFilter(3);

			const r1 = calc.compensate(ss, ap, iso, nd);
			const r2 = calc.compensate(ss, ap, iso, nd);
			expect(r1.shutterSpeed.display).toBe(r2.shutterSpeed.display);
			expect(r1.evBefore).toBe(r2.evBefore);
			expect(r1.evAfter).toBe(r2.evAfter);
		});
	});
});

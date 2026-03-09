import { ExposureResult } from './exposure-result.js';

/**
 * Stateless domain service for exposure compensation calculation.
 * All methods are pure functions with no side effects.
 */
export class ExposureCalculator {
	/**
	 * Calculate all compensation results for an ND filter.
	 *
	 * @param {import('./shutter-speed.js').ShutterSpeed} shutterSpeed
	 * @param {import('./aperture.js').Aperture} aperture
	 * @param {import('./iso.js').ISO} iso
	 * @param {import('./nd-filter.js').NDFilter} ndFilter
	 * @returns {ExposureResult}
	 */
	compensate(shutterSpeed, aperture, iso, ndFilter) {
		const thirdStops = ndFilter.thirdStops;

		// Primary: compensate via shutter speed (positive = slower)
		const ssCompensated = shutterSpeed.shift(thirdStops);

		// Alternative: compensate via aperture (negative = open up)
		const apCompensated = aperture.shift(-thirdStops);

		// Alternative: compensate via ISO (positive = higher sensitivity)
		const isoCompensated = iso.shift(thirdStops);

		// EV calculation
		const evBefore = this.exposureValue(shutterSpeed, aperture, iso);
		const evAfter = this.exposureValue(ssCompensated, aperture, iso);

		return new ExposureResult({
			shutterSpeed: ssCompensated,
			apertureComp: apCompensated,
			isoComp: isoCompensated,
			evBefore,
			evAfter,
			ndStops: ndFilter.stops,
		});
	}

	/**
	 * Calculate Exposure Value.
	 * EV = log2(N² / t) + log2(S / 100)
	 *
	 * @param {import('./shutter-speed.js').ShutterSpeed} ss
	 * @param {import('./aperture.js').Aperture} ap
	 * @param {import('./iso.js').ISO} iso
	 * @returns {number}
	 */
	exposureValue(ss, ap, iso) {
		const n = ap.fNumber;
		const t = ss.seconds;
		const s = iso.value;
		return Math.log2((n * n) / t) + Math.log2(s / 100);
	}
}

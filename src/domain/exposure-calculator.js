import { ExposureResult } from './exposure-result.js';

/**
 * Stateless domain service for exposure compensation calculation.
 * All methods are pure functions with no side effects.
 */
export class ExposureCalculator {
	/**
	 * Calculate all compensation results for an ND filter.
	 * When aperture/ISO differ from their reference values (at the time base SS was set),
	 * the compensated SS is adjusted to maintain the same scene exposure.
	 *
	 * @param {import('./shutter-speed.js').ShutterSpeed} shutterSpeed
	 * @param {import('./aperture.js').Aperture} aperture
	 * @param {import('./iso.js').ISO} iso
	 * @param {import('./nd-filter.js').NDFilter | import('./nd-filter-stack.js').NDFilterStack} ndFilter
	 * @param {number} refApertureIndex - Aperture index when base SS was set
	 * @param {number} refISOIndex - ISO index when base SS was set
	 * @returns {ExposureResult}
	 */
	compensate(shutterSpeed, aperture, iso, ndFilter, refApertureIndex, refISOIndex) {
		const avDelta = aperture.index - refApertureIndex;
		const isoDelta = iso.index - refISOIndex;
		const totalShift = ndFilter.thirdStops + avDelta - isoDelta;

		const ssCompensated = shutterSpeed.shift(totalShift);

		// EV calculation
		const evBefore = this.exposureValue(shutterSpeed, aperture, iso);
		const evAfter = this.exposureValue(ssCompensated, aperture, iso);

		return new ExposureResult({
			shutterSpeed: ssCompensated,
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

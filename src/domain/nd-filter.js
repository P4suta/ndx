/** Unicode superscript digits */
const SUPERSCRIPT = '\u2070\u00b9\u00b2\u00b3\u2074\u2075\u2076\u2077\u2078\u2079';

/**
 * Convert an integer to Unicode superscript (e.g. -5 → "⁻⁵").
 * @param {number} n
 * @returns {string}
 */
export function toSuperscript(n) {
	const sign = n < 0 ? '\u207b' : '';
	const digits = String(Math.abs(n))
		.split('')
		.map((d) => SUPERSCRIPT[+d])
		.join('');
	return `${sign}${digits}`;
}

/**
 * Format a transmission percentage for display.
 * Uses scientific notation for very small values (< 0.01%).
 * @param {number} t - transmission percentage
 * @returns {string}
 */
export function formatTransmission(t) {
	if (t >= 1) return `${+t.toFixed(1)}`;
	if (t >= 0.01) return `${+t.toFixed(3)}`;
	const exp = Math.floor(Math.log10(t));
	const mantissa = +(t / 10 ** exp).toFixed(2);
	return `${mantissa}\u00d710${toSuperscript(exp)}`;
}

/**
 * ND filter value object. Immutable.
 * Represents an ND filter by its full-stop reduction.
 */
export class NDFilter {
	/** @type {number} Full-stop count */
	#stops;

	/**
	 * @param {number} stops Full-stop count (integer 1–20)
	 */
	constructor(stops) {
		if (stops < 1 || stops > 20 || !Number.isInteger(stops)) {
			throw new RangeError(`stops must be integer 1-20, got: ${stops}`);
		}
		this.#stops = stops;
	}

	get stops() {
		return this.#stops;
	}

	/** 1/3-stop index offset */
	get thirdStops() {
		return this.#stops * 3;
	}

	/** Filter factor (ND number): 2^stops */
	get filterFactor() {
		return 2 ** this.#stops;
	}

	/** Optical density: log10(filterFactor) ≈ stops × 0.301 */
	get opticalDensity() {
		return +(this.#stops * Math.log10(2)).toFixed(2);
	}

	/** Transmission percentage (formatted string): 100 / filterFactor */
	get transmission() {
		return formatTransmission(100 / this.filterFactor);
	}

	/** Display string (e.g. "ND8") */
	get display() {
		return `ND${this.filterFactor}`;
	}

	/** Common ND filter presets */
	static PRESETS = Object.freeze([
		{ stops: 2, label: 'ND4' },
		{ stops: 3, label: 'ND8' },
		{ stops: 4, label: 'ND16' },
		{ stops: 6, label: 'ND64' },
		{ stops: 10, label: 'ND1000' },
	]);
}

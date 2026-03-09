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

	/** Transmission percentage: 100 / filterFactor */
	get transmission() {
		const t = 100 / this.filterFactor;
		return t >= 1 ? +t.toFixed(1) : +t.toFixed(3);
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

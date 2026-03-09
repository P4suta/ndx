import { formatTransmission, NDFilter } from './nd-filter.js';

/**
 * Immutable stack of ND filters. Duck-types with NDFilter
 * (same property names) so ExposureCalculator works without changes.
 *
 * @example
 * const stack = NDFilterStack.of(new NDFilter(3), new NDFilter(10));
 * stack.stops   // 13
 * stack.display // "ND8 + ND1024"
 */
export class NDFilterStack {
	static #MAX = 5;

	/** @type {readonly NDFilter[]} */
	#filters;

	/** @param {NDFilter[]} filters */
	constructor(filters) {
		if (filters.length > NDFilterStack.#MAX) {
			throw new RangeError(`Stack allows max ${NDFilterStack.#MAX} filters, got ${filters.length}`);
		}
		this.#filters = Object.freeze([...filters]);
	}

	/** @returns {readonly NDFilter[]} */
	get filters() {
		return this.#filters;
	}

	get count() {
		return this.#filters.length;
	}

	get isEmpty() {
		return this.#filters.length === 0;
	}

	get stops() {
		let sum = 0;
		for (const f of this.#filters) sum += f.stops;
		return sum;
	}

	/** 1/3-stop index offset (stops × 3) */
	get thirdStops() {
		return this.stops * 3;
	}

	/** Combined filter factor: 2^totalStops */
	get filterFactor() {
		return 2 ** this.stops;
	}

	/** Combined optical density (additive) */
	get opticalDensity() {
		let sum = 0;
		for (const f of this.#filters) sum += f.opticalDensity;
		return +sum.toFixed(2);
	}

	/** Combined transmission percentage (formatted string): 100 / filterFactor */
	get transmission() {
		if (this.isEmpty) return '100';
		return formatTransmission(100 / this.filterFactor);
	}

	/** Display string, e.g. "ND8 + ND1024" or "\u2014" if empty */
	get display() {
		if (this.isEmpty) return '\u2014';
		return this.#filters.map((f) => f.display).join(' + ');
	}

	/**
	 * Add a filter to the stack.
	 * @param {NDFilter} filter
	 * @returns {NDFilterStack} new stack
	 * @throws {RangeError} if stack is full
	 */
	add(filter) {
		return new NDFilterStack([...this.#filters, filter]);
	}

	/**
	 * Remove a filter at the given index.
	 * @param {number} index
	 * @returns {NDFilterStack} new stack
	 */
	removeAt(index) {
		const next = this.#filters.filter((_, i) => i !== index);
		return new NDFilterStack(next);
	}

	/** @returns {NDFilterStack} empty stack */
	clear() {
		return NDFilterStack.empty();
	}

	/** @returns {NDFilterStack} */
	static empty() {
		return new NDFilterStack([]);
	}

	/** @param {...NDFilter} filters */
	static of(...filters) {
		return new NDFilterStack(filters);
	}
}

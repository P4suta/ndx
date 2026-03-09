import { Aperture } from '../domain/aperture.js';
import { ISO } from '../domain/iso.js';
import { NDFilter } from '../domain/nd-filter.js';
import { ShutterSpeed } from '../domain/shutter-speed.js';
import { ExposureState } from './exposure-state.js';

/**
 * Manages application state transitions and observer notifications.
 */
export class StateManager {
	/** @type {ExposureState} */
	#state;
	/** @type {import('../domain/exposure-calculator.js').ExposureCalculator} */
	#calculator;
	/** @type {Set<function(ExposureState): void>} */
	#listeners = new Set();

	/** @param {import('../domain/exposure-calculator.js').ExposureCalculator} calculator */
	constructor(calculator) {
		this.#calculator = calculator;
		this.#state = ExposureState.default();
	}

	get state() {
		return this.#state;
	}

	/** Subscribe to state changes. Returns unsubscribe function. */
	subscribe(listener) {
		this.#listeners.add(listener);
		return () => this.#listeners.delete(listener);
	}

	/** Run initial calculation and notify observers. */
	initialize() {
		this.#recalculate();
	}

	setShutterSpeed(index) {
		this.#state = this.#state.with({
			shutterSpeed: ShutterSpeed.fromIndex(index),
			refApertureIndex: this.#state.aperture.index,
			refISOIndex: this.#state.iso.index,
		});
		this.#recalculate();
	}

	setAperture(index) {
		this.#state = this.#state.with({
			aperture: Aperture.fromIndex(index),
		});
		this.#recalculate();
	}

	setISO(index) {
		this.#state = this.#state.with({
			iso: ISO.fromIndex(index),
		});
		this.#recalculate();
	}

	addNDFilter(stops) {
		try {
			const filter = new NDFilter(stops);
			this.#state = this.#state.with({
				ndFilter: this.#state.ndFilter.add(filter),
			});
			this.#recalculate();
		} catch (e) {
			if (e instanceof RangeError) return;
			throw e;
		}
	}

	removeNDFilter(index) {
		this.#state = this.#state.with({
			ndFilter: this.#state.ndFilter.removeAt(index),
		});
		this.#recalculate();
	}

	clearNDFilters() {
		this.#state = this.#state.with({
			ndFilter: this.#state.ndFilter.clear(),
		});
		this.#recalculate();
	}

	#recalculate() {
		const { shutterSpeed, aperture, iso, ndFilter } = this.#state;
		const { refApertureIndex, refISOIndex } = this.#state;
		const result = this.#calculator.compensate(
			shutterSpeed,
			aperture,
			iso,
			ndFilter,
			refApertureIndex,
			refISOIndex,
		);
		this.#state = this.#state.with({ result });
		this.#notify();
	}

	#notify() {
		for (const listener of this.#listeners) {
			listener(this.#state);
		}
	}
}

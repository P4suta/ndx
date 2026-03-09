import { Aperture } from '../domain/aperture.js';
import { ISO } from '../domain/iso.js';
import { NDFilter } from '../domain/nd-filter.js';
import { ShutterSpeed } from '../domain/shutter-speed.js';

/**
 * Immutable application state object.
 * Updates via with() return new instances.
 */
export class ExposureState {
	/** @type {ShutterSpeed} */
	shutterSpeed;
	/** @type {Aperture} */
	aperture;
	/** @type {ISO} */
	iso;
	/** @type {NDFilter} */
	ndFilter;
	/** @type {import('../domain/exposure-result.js').ExposureResult|null} */
	result;

	constructor({ shutterSpeed, aperture, iso, ndFilter, result }) {
		this.shutterSpeed = shutterSpeed;
		this.aperture = aperture;
		this.iso = iso;
		this.ndFilter = ndFilter;
		this.result = result;
		Object.freeze(this);
	}

	/** Default state: 1/125, f/1.8, ISO 100, ND8 */
	static default() {
		return new ExposureState({
			shutterSpeed: ShutterSpeed.fromIndex(ShutterSpeed.defaultIndex()),
			aperture: Aperture.fromIndex(Aperture.defaultIndex()),
			iso: ISO.fromIndex(ISO.defaultIndex()),
			ndFilter: new NDFilter(3),
			result: null,
		});
	}

	/**
	 * Return a new state with partial updates.
	 * @param {Partial<ExposureState>} updates
	 * @returns {ExposureState}
	 */
	with(updates) {
		return new ExposureState({ ...this, ...updates });
	}
}

import { Aperture } from '../domain/aperture.js';
import { ISO } from '../domain/iso.js';
import { NDFilter } from '../domain/nd-filter.js';
import { NDFilterStack } from '../domain/nd-filter-stack.js';
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
	/** @type {NDFilterStack} */
	ndFilter;
	/** @type {import('../domain/exposure-result.js').ExposureResult|null} */
	result;
	/** @type {number} Aperture index when base SS was set */
	refApertureIndex;
	/** @type {number} ISO index when base SS was set */
	refISOIndex;

	constructor({ shutterSpeed, aperture, iso, ndFilter, result, refApertureIndex, refISOIndex }) {
		this.shutterSpeed = shutterSpeed;
		this.aperture = aperture;
		this.iso = iso;
		this.ndFilter = ndFilter;
		this.result = result;
		this.refApertureIndex = refApertureIndex;
		this.refISOIndex = refISOIndex;
		Object.freeze(this);
	}

	/** Default state: 1/125, f/1.8, ISO 100, ND8 */
	static default() {
		return new ExposureState({
			shutterSpeed: ShutterSpeed.fromIndex(ShutterSpeed.defaultIndex()),
			aperture: Aperture.fromIndex(Aperture.defaultIndex()),
			iso: ISO.fromIndex(ISO.defaultIndex()),
			ndFilter: NDFilterStack.of(new NDFilter(3)),
			result: null,
			refApertureIndex: Aperture.defaultIndex(),
			refISOIndex: ISO.defaultIndex(),
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

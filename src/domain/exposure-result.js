/**
 * Immutable result of exposure compensation calculation.
 * Aggregates all information needed for UI rendering.
 */
export class ExposureResult {
	/** @type {import('./shutter-speed.js').ShutterSpeed} Compensated shutter speed */
	shutterSpeed;
	/** @type {import('./aperture.js').Aperture} Aperture compensation alternative (clamped) */
	apertureComp;
	/** @type {import('./iso.js').ISO} ISO compensation alternative (clamped) */
	isoComp;
	/** @type {number} EV before ND filter */
	evBefore;
	/** @type {number} EV after ND filter */
	evAfter;
	/** @type {number} ND filter stops */
	ndStops;

	constructor({ shutterSpeed, apertureComp, isoComp, evBefore, evAfter, ndStops }) {
		this.shutterSpeed = shutterSpeed;
		this.apertureComp = apertureComp;
		this.isoComp = isoComp;
		this.evBefore = evBefore;
		this.evAfter = evAfter;
		this.ndStops = ndStops;
		Object.freeze(this);
	}
}

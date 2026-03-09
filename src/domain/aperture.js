/**
 * Aperture value object represented as a 1/3-stop index.
 * Immutable — shift() returns a new instance. Clamps at physical limits.
 */
export class Aperture {
	/** @type {number} 1/3-stop index (0 = f/1.0, increasing = stopped down) */
	#index;

	/** Standard aperture display values (1/3-stop increments, wide → narrow) */
	static #DISPLAY = Object.freeze([
		'f/1.0',
		'f/1.1',
		'f/1.2',
		'f/1.4',
		'f/1.6',
		'f/1.8',
		'f/2',
		'f/2.2',
		'f/2.5',
		'f/2.8',
		'f/3.2',
		'f/3.5',
		'f/4',
		'f/4.5',
		'f/5',
		'f/5.6',
		'f/6.3',
		'f/7.1',
		'f/8',
		'f/9',
		'f/10',
		'f/11',
		'f/13',
		'f/14',
		'f/16',
		'f/18',
		'f/20',
		'f/22',
		'f/25',
		'f/29',
		'f/32',
	]);

	/** f-numbers corresponding to each index */
	static #F_NUMBERS = Object.freeze([
		1.0, 1.1, 1.2, 1.4, 1.6, 1.8, 2.0, 2.2, 2.5, 2.8, 3.2, 3.5, 4.0, 4.5, 5.0, 5.6, 6.3, 7.1, 8, 9,
		10, 11, 13, 14, 16, 18, 20, 22, 25, 29, 32,
	]);

	constructor(index) {
		this.#index = Math.max(0, Math.min(index, Aperture.#DISPLAY.length - 1));
	}

	get index() {
		return this.#index;
	}
	get fNumber() {
		return Aperture.#F_NUMBERS[this.#index];
	}
	get display() {
		return Aperture.#DISPLAY[this.#index];
	}

	/**
	 * Shift by given 1/3-stop amount. Positive = stop down, negative = open up.
	 * Clamps at array bounds.
	 * @param {number} thirdStops
	 * @returns {Aperture}
	 */
	shift(thirdStops) {
		return new Aperture(this.#index + thirdStops);
	}

	/** Whether at physical limit (fully open or fully stopped down) */
	get isClamped() {
		return this.#index <= 0 || this.#index >= Aperture.#DISPLAY.length - 1;
	}

	static fromIndex(index) {
		return new Aperture(index);
	}

	/** Default index (f/1.8) */
	static defaultIndex() {
		return 5;
	}

	static get scaleLength() {
		return Aperture.#DISPLAY.length;
	}
	static displayAt(index) {
		return Aperture.#DISPLAY[index];
	}
}

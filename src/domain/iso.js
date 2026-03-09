/**
 * ISO sensitivity value object represented as a 1/3-stop index.
 * Immutable — shift() returns a new instance. Clamps at limits.
 */
export class ISO {
	/** @type {number} */
	#index;

	static #DISPLAY = Object.freeze([
		'50',
		'64',
		'80',
		'100',
		'125',
		'160',
		'200',
		'250',
		'320',
		'400',
		'500',
		'640',
		'800',
		'1000',
		'1250',
		'1600',
		'2000',
		'2500',
		'3200',
		'4000',
		'5000',
		'6400',
		'8000',
		'10000',
		'12800',
		'16000',
		'20000',
		'25600',
		'32000',
		'40000',
		'51200',
	]);

	static #VALUES = Object.freeze([
		50, 64, 80, 100, 125, 160, 200, 250, 320, 400, 500, 640, 800, 1000, 1250, 1600, 2000, 2500,
		3200, 4000, 5000, 6400, 8000, 10000, 12800, 16000, 20000, 25600, 32000, 40000, 51200,
	]);

	constructor(index) {
		this.#index = Math.max(0, Math.min(index, ISO.#DISPLAY.length - 1));
	}

	get index() {
		return this.#index;
	}
	get value() {
		return ISO.#VALUES[this.#index];
	}
	get display() {
		return `ISO ${ISO.#DISPLAY[this.#index]}`;
	}

	/**
	 * Shift by given 1/3-stop amount. Positive = higher ISO, negative = lower.
	 * Clamps at array bounds.
	 * @param {number} thirdStops
	 * @returns {ISO}
	 */
	shift(thirdStops) {
		return new ISO(this.#index + thirdStops);
	}

	get isClamped() {
		return this.#index <= 0 || this.#index >= ISO.#DISPLAY.length - 1;
	}

	static fromIndex(index) {
		return new ISO(index);
	}

	/** Default index (ISO 100) */
	static defaultIndex() {
		return 3;
	}

	static get scaleLength() {
		return ISO.#DISPLAY.length;
	}
	static displayAt(index) {
		return `ISO ${ISO.#DISPLAY[index]}`;
	}
}

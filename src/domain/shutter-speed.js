import { toSuperscript } from './nd-filter.js';

/**
 * Format an integer with comma separators (locale-independent).
 * @param {number} n
 * @returns {string}
 */
function formatWithCommas(n) {
	const s = String(n);
	const result = [];
	for (let i = s.length - 1, c = 0; i >= 0; i--, c++) {
		if (c > 0 && c % 3 === 0) result.push(',');
		result.push(s[i]);
	}
	return result.reverse().join('');
}

/**
 * Shutter speed value object represented as a 1/3-stop index.
 * Immutable — shift() returns a new instance.
 */
export class ShutterSpeed {
	/** @type {number} 1/3-stop index (0 = 1/8000, increasing = slower) */
	#index;

	/** Standard shutter speed display values (1/3-stop increments, fast → slow) */
	static #DISPLAY = Object.freeze([
		'1/8000',
		'1/6400',
		'1/5000',
		'1/4000',
		'1/3200',
		'1/2500',
		'1/2000',
		'1/1600',
		'1/1250',
		'1/1000',
		'1/800',
		'1/640',
		'1/500',
		'1/400',
		'1/320',
		'1/250',
		'1/200',
		'1/160',
		'1/125',
		'1/100',
		'1/80',
		'1/60',
		'1/50',
		'1/40',
		'1/30',
		'1/25',
		'1/20',
		'1/15',
		'1/13',
		'1/10',
		'1/8',
		'1/6',
		'1/5',
		'1/4',
		'0.3"',
		'0.4"',
		'0.5"',
		'0.6"',
		'0.8"',
		'1"',
		'1.3"',
		'1.6"',
		'2"',
		'2.5"',
		'3.2"',
		'4"',
		'5"',
		'6"',
		'8"',
		'10"',
		'13"',
		'15"',
		'20"',
		'25"',
		'30"',
	]);

	/** Seconds corresponding to each index */
	static #SECONDS = Object.freeze([
		1 / 8000,
		1 / 6400,
		1 / 5000,
		1 / 4000,
		1 / 3200,
		1 / 2500,
		1 / 2000,
		1 / 1600,
		1 / 1250,
		1 / 1000,
		1 / 800,
		1 / 640,
		1 / 500,
		1 / 400,
		1 / 320,
		1 / 250,
		1 / 200,
		1 / 160,
		1 / 125,
		1 / 100,
		1 / 80,
		1 / 60,
		1 / 50,
		1 / 40,
		1 / 30,
		1 / 25,
		1 / 20,
		1 / 15,
		1 / 13,
		1 / 10,
		1 / 8,
		1 / 6,
		1 / 5,
		1 / 4,
		0.3,
		0.4,
		0.5,
		0.6,
		0.8,
		1,
		1.3,
		1.6,
		2,
		2.5,
		3.2,
		4,
		5,
		6,
		8,
		10,
		13,
		15,
		20,
		25,
		30,
	]);

	/** @param {number} index 1/3-stop index */
	constructor(index) {
		this.#index = index;
	}

	get index() {
		return this.#index;
	}

	/** Exposure time in seconds. Extrapolates beyond standard range. */
	get seconds() {
		if (this.#index >= 0 && this.#index < ShutterSpeed.#SECONDS.length) {
			return ShutterSpeed.#SECONDS[this.#index];
		}
		if (this.#index < 0) {
			return ShutterSpeed.#SECONDS[0] * 2 ** (-this.#index / 3);
		}
		const lastIdx = ShutterSpeed.#SECONDS.length - 1;
		return ShutterSpeed.#SECONDS[lastIdx] * 2 ** ((this.#index - lastIdx) / 3);
	}

	/** Display string. Bulb range formats as human-readable time. */
	get display() {
		if (this.#index >= 0 && this.#index < ShutterSpeed.#DISPLAY.length) {
			return ShutterSpeed.#DISPLAY[this.#index];
		}
		if (this.#index < 0) return '<1/8000';
		return ShutterSpeed.#formatBulb(this.seconds);
	}

	/** Whether this is in bulb territory (beyond 30s standard range) */
	get isBulb() {
		return this.#index >= ShutterSpeed.#DISPLAY.length;
	}

	/** Exact seconds display for the result sub-line. */
	get exactDisplay() {
		const s = this.seconds;
		if (s < 0.001) {
			const exp = Math.floor(Math.log10(s));
			const mantissa = +(s / 10 ** exp).toFixed(2);
			return `${mantissa}\u00d710${toSuperscript(exp)}s`;
		}
		if (s < 1) return `${+s.toPrecision(3)}s`;
		if (s < 60) return `${+s.toFixed(1)}s`;
		return `${formatWithCommas(Math.round(s))}s`;
	}

	/**
	 * Shift by given 1/3-stop amount. Positive = slower, negative = faster.
	 * @param {number} thirdStops
	 * @returns {ShutterSpeed}
	 */
	shift(thirdStops) {
		return new ShutterSpeed(this.#index + thirdStops);
	}

	/** @param {number} index */
	static fromIndex(index) {
		return new ShutterSpeed(index);
	}

	/** Default index (1/125) */
	static defaultIndex() {
		return 18;
	}

	/** Length of the standard scale */
	static get scaleLength() {
		return ShutterSpeed.#DISPLAY.length;
	}

	/** Display string at given index (for select generation) */
	static displayAt(index) {
		return ShutterSpeed.#DISPLAY[index];
	}

	/**
	 * Format bulb seconds as human-readable time.
	 * @param {number} totalSeconds
	 * @returns {string}
	 */
	static #formatBulb(totalSeconds) {
		if (totalSeconds < 60) {
			return `${Math.round(totalSeconds)}"`;
		}
		const minutes = Math.floor(totalSeconds / 60);
		const seconds = Math.round(totalSeconds % 60);
		if (totalSeconds < 3600) {
			return seconds > 0 ? `${minutes}m ${seconds}s` : `${minutes}m`;
		}
		const hours = Math.floor(totalSeconds / 3600);
		const remainMin = Math.round((totalSeconds % 3600) / 60);
		return remainMin > 0 ? `${hours}h ${remainMin}m` : `${hours}h`;
	}
}

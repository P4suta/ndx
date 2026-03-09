/**
 * Differential renderer that updates only changed DOM elements.
 * Uses data-bind attributes to target elements by key.
 */
export class DiffRenderer {
	/** @type {ShadowRoot} */
	#root;
	/** @type {Map<string, Element>} */
	#bindCache = new Map();

	/** @param {ShadowRoot} shadowRoot */
	constructor(shadowRoot) {
		this.#root = shadowRoot;
		this.#buildCache();
	}

	#buildCache() {
		const elements = this.#root.querySelectorAll('[data-bind]');
		for (const el of elements) {
			this.#bindCache.set(el.dataset.bind, el);
		}
	}

	/**
	 * Render state changes to the DOM.
	 * @param {import('../state/exposure-state.js').ExposureState} state
	 */
	render(state) {
		const { result, ndFilter } = state;
		if (!result) return;

		// Filter info
		this.#setText('filterName', ndFilter.display);
		this.#setText('opticalDensity', ndFilter.opticalDensity.toFixed(2));
		this.#setText('transmission', `${ndFilter.transmission}%`);

		// Slider sync
		const slider = this.#root.querySelector('#ndx-stops');
		if (slider && +slider.value !== ndFilter.stops) {
			slider.value = String(ndFilter.stops);
		}
		const output = this.#root.querySelector('.ndx__slider-output');
		if (output) {
			output.textContent = `${ndFilter.stops} stop${ndFilter.stops > 1 ? 's' : ''}`;
		}

		// Preset buttons sync
		const presets = this.#root.querySelectorAll('.ndx__preset');
		for (const btn of presets) {
			const isActive = +btn.dataset.stops === ndFilter.stops;
			btn.setAttribute('aria-checked', String(isActive));
			btn.classList.toggle('ndx__preset--active', isActive);
		}

		// Main result
		this.#setText('resultSS', result.shutterSpeed.display);
		this.#setHidden('bulbBadge', !result.shutterSpeed.isBulb);
		this.#setText(
			'shiftInfo',
			`\u2190 ${ndFilter.stops} stop${ndFilter.stops > 1 ? 's' : ''} slower`,
		);

		// EV
		this.#setText('evBefore', result.evBefore.toFixed(1));
		this.#setText('evAfter', result.evAfter.toFixed(1));

		// Alternative compensations
		this.#setText('altAperture', result.apertureComp.display);
		this.#setHidden('apWarning', !result.apertureComp.isClamped);
		this.#setText('altISO', result.isoComp.display);
		this.#setHidden('isoWarning', !result.isoComp.isClamped);
	}

	/**
	 * @param {string} key
	 * @param {string} text
	 */
	#setText(key, text) {
		const el = this.#bindCache.get(key);
		if (el && el.textContent !== text) {
			el.textContent = text;
		}
	}

	/**
	 * @param {string} key
	 * @param {boolean} hidden
	 */
	#setHidden(key, hidden) {
		const el = this.#bindCache.get(key);
		if (el) el.hidden = hidden;
	}
}

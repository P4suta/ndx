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
		this.#setText('opticalDensity', ndFilter.isEmpty ? '0' : ndFilter.opticalDensity.toFixed(2));
		this.#setText('transmission', `${ndFilter.transmission}%`);

		// Stack chips
		const stackContainer = this.#bindCache.get('stackChips');
		if (stackContainer) {
			stackContainer.innerHTML = ndFilter.filters
				.map(
					(f, i) =>
						`<span class="ndx__stack-chip" role="listitem">${f.display} <button class="ndx__stack-chip-remove" data-action="remove-filter" data-filter-index="${i}" aria-label="Remove ${f.display}">\u00d7</button></span>`,
				)
				.join('');
		}

		// Clear button visibility
		this.#setHidden('clearButton', ndFilter.count < 2);

		// Preset buttons: disable when stack is full
		const isFull = ndFilter.count >= 5;
		const presets = this.#root.querySelectorAll('.ndx__preset');
		for (const btn of presets) {
			/** @type {HTMLButtonElement} */ (btn).disabled = isFull;
		}

		// Add button: disable when stack is full
		const addBtn = this.#root.querySelector('.ndx__stack-add');
		if (addBtn) /** @type {HTMLButtonElement} */ (addBtn).disabled = isFull;

		// Main result
		const totalStops = ndFilter.stops;
		this.#setText('resultSS', result.shutterSpeed.display);
		this.#setText('resultSSExact', result.shutterSpeed.exactDisplay);
		this.#setHidden('bulbBadge', !result.shutterSpeed.isBulb);
		this.#setText(
			'shiftInfo',
			totalStops === 0
				? 'No ND filter'
				: `\u2190 ${totalStops} stop${totalStops > 1 ? 's' : ''} slower`,
		);

		// EV
		this.#setText('evBefore', result.evBefore.toFixed(1));
		this.#setText('evAfter', result.evAfter.toFixed(1));

		// Sync select elements (for ±1EV button changes)
		this.#syncSelect('ss', state.shutterSpeed.index);
		this.#syncSelect('aperture', state.aperture.index);
		this.#syncSelect('iso', state.iso.index);
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

	/**
	 * Sync a select element's value with state index.
	 * @param {string} action - data-action value
	 * @param {number} index
	 */
	#syncSelect(action, index) {
		const select = /** @type {HTMLSelectElement|null} */ (
			this.#root.querySelector(`[data-action="${action}"]`)
		);
		if (select && +select.value !== index) {
			select.value = String(index);
		}
	}
}

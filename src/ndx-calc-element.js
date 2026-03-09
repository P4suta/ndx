import { ExposureCalculator } from './domain/exposure-calculator.js';
import { ShutterSpeed } from './domain/shutter-speed.js';
import { StateManager } from './state/state-manager.js';
import { DiffRenderer } from './ui/diff-renderer.js';
import { buildTemplate } from './ui/template.js';

/**
 * <ndx-calc> custom element.
 * Wires domain, state, renderer, and event layers together.
 */
class NDXCalcElement extends HTMLElement {
	/** @type {ShadowRoot} */
	#shadow;
	/** @type {StateManager} */
	#stateManager;
	/** @type {AbortController} */
	#abortController;

	constructor() {
		super();
		this.#shadow = this.attachShadow({ mode: 'open' });
	}

	connectedCallback() {
		const calculator = new ExposureCalculator();
		this.#stateManager = new StateManager(calculator);
		this.#abortController = new AbortController();

		this.#shadow.innerHTML = buildTemplate();

		const renderer = new DiffRenderer(this.#shadow);
		this.#stateManager.subscribe((state) => renderer.render(state));

		this.#bindEvents();
		this.#stateManager.initialize();
	}

	disconnectedCallback() {
		this.#abortController.abort();
	}

	#bindEvents() {
		const signal = this.#abortController.signal;
		const root = this.#shadow;
		const sm = this.#stateManager;

		// Select changes (SS, Aperture, ISO)
		root.addEventListener(
			'change',
			(e) => {
				const target = /** @type {HTMLSelectElement} */ (e.target);
				const action = target.dataset?.action;
				if (!action) return;
				const value = Number.parseInt(target.value, 10);
				if (Number.isNaN(value)) return;
				switch (action) {
					case 'ss':
						sm.setShutterSpeed(value);
						break;
					case 'aperture':
						sm.setAperture(value);
						break;
					case 'iso':
						sm.setISO(value);
						break;
				}
			},
			{ signal },
		);

		// Slider input → update output text only (visual preview)
		root.addEventListener(
			'input',
			(e) => {
				const target = /** @type {HTMLInputElement} */ (e.target);
				if (target.id === 'ndx-stops') {
					const val = target.value;
					const output = root.querySelector('.ndx__slider-output');
					if (output) {
						output.textContent = `${val} stop${val === '1' ? '' : 's'}`;
					}
				}
			},
			{ signal },
		);

		// Click handler for data-action buttons
		root.addEventListener(
			'click',
			(e) => {
				const target = /** @type {HTMLElement} */ (e.target);

				// EV step buttons (±1 EV)
				const evBtn = target.closest('[data-action="ev-step"]');
				if (evBtn) {
					const t = /** @type {HTMLElement} */ (evBtn).dataset.target;
					const delta = Number.parseInt(/** @type {HTMLElement} */ (evBtn).dataset.delta, 10);
					switch (t) {
						case 'ss': {
							const idx = sm.state.shutterSpeed.index + delta;
							sm.setShutterSpeed(Math.max(0, Math.min(idx, ShutterSpeed.scaleLength - 1)));
							break;
						}
						case 'aperture':
							sm.setAperture(sm.state.aperture.index + delta);
							break;
						case 'iso':
							sm.setISO(sm.state.iso.index + delta);
							break;
					}
					return;
				}

				// Add preset
				const preset = target.closest('[data-action="add-preset"]');
				if (preset) {
					sm.addNDFilter(Number.parseInt(/** @type {HTMLElement} */ (preset).dataset.stops, 10));
					return;
				}

				// Add custom from slider
				if (target.closest('[data-action="add-custom"]')) {
					const slider = root.querySelector('#ndx-stops');
					if (slider) {
						sm.addNDFilter(Number.parseInt(/** @type {HTMLInputElement} */ (slider).value, 10));
					}
					return;
				}

				// Remove filter from stack
				const removeBtn = target.closest('[data-action="remove-filter"]');
				if (removeBtn) {
					sm.removeNDFilter(
						Number.parseInt(/** @type {HTMLElement} */ (removeBtn).dataset.filterIndex, 10),
					);
					return;
				}

				// Clear stack
				if (target.closest('[data-action="clear-stack"]')) {
					sm.clearNDFilters();
				}
			},
			{ signal },
		);
	}
}

customElements.define('ndx-calc', NDXCalcElement);

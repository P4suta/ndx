import { ExposureCalculator } from './domain/exposure-calculator.js';
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

		// Slider input (ND stops)
		root.addEventListener(
			'input',
			(e) => {
				const target = /** @type {HTMLInputElement} */ (e.target);
				if (target.dataset?.action === 'stops') {
					sm.setNDStops(Number.parseInt(target.value, 10));
				}
			},
			{ signal },
		);

		// Preset button clicks
		root.addEventListener(
			'click',
			(e) => {
				const target = /** @type {HTMLElement} */ (e.target).closest('[data-action="preset"]');
				if (!target) return;
				sm.setNDStops(Number.parseInt(target.dataset.stops, 10));
			},
			{ signal },
		);

		// Keyboard navigation for preset radiogroup
		root.addEventListener(
			'keydown',
			(e) => {
				const target = /** @type {HTMLElement} */ (e.target);
				if (target.getAttribute('role') !== 'radio') return;
				const group = [...target.parentElement.children].filter(
					(el) => el.getAttribute('role') === 'radio',
				);
				const idx = group.indexOf(target);
				let next = -1;
				switch (e.key) {
					case 'ArrowRight':
					case 'ArrowDown':
						next = (idx + 1) % group.length;
						break;
					case 'ArrowLeft':
					case 'ArrowUp':
						next = (idx - 1 + group.length) % group.length;
						break;
					case 'Home':
						next = 0;
						break;
					case 'End':
						next = group.length - 1;
						break;
					default:
						return;
				}
				e.preventDefault();
				group[next].focus();
				group[next].click();
			},
			{ signal },
		);
	}
}

customElements.define('ndx-calc', NDXCalcElement);

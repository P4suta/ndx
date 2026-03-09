// @vitest-environment happy-dom
import { beforeEach, describe, expect, it } from 'vitest';
import { ExposureCalculator } from '../../src/domain/exposure-calculator.js';
import { NDFilter } from '../../src/domain/nd-filter.js';
import { ShutterSpeed } from '../../src/domain/shutter-speed.js';
import { ExposureState } from '../../src/state/exposure-state.js';
import { DiffRenderer } from '../../src/ui/diff-renderer.js';
import { buildTemplate } from '../../src/ui/template.js';

describe('DiffRenderer', () => {
	/** @type {ShadowRoot} */
	let shadowRoot;
	/** @type {DiffRenderer} */
	let renderer;

	function createStateWithResult(ndStops = 3) {
		const state = ExposureState.default().with({
			ndFilter: new NDFilter(ndStops),
		});
		const calc = new ExposureCalculator();
		const result = calc.compensate(state.shutterSpeed, state.aperture, state.iso, state.ndFilter);
		return state.with({ result });
	}

	beforeEach(() => {
		const host = document.createElement('div');
		// Use a real element to simulate shadow root behavior
		host.innerHTML = buildTemplate();
		// Use host as a mock shadow root (has getElementById and querySelectorAll)
		shadowRoot = host;
		renderer = new DiffRenderer(/** @type {any} */ (shadowRoot));
	});

	describe('setText', () => {
		it('updates textContent for bound elements', () => {
			const state = createStateWithResult();
			renderer.render(state);
			const el = shadowRoot.querySelector('[data-bind="resultSS"]');
			expect(el.textContent).not.toBe('--');
		});

		it('skips update when text is the same', () => {
			const state = createStateWithResult();
			renderer.render(state);
			const el = shadowRoot.querySelector('[data-bind="resultSS"]');
			const text = el.textContent;
			renderer.render(state);
			expect(el.textContent).toBe(text);
		});
	});

	describe('setHidden', () => {
		it('hides bulb badge when not in bulb range', () => {
			const state = createStateWithResult(1); // ND2, won't be bulb at 1/125
			renderer.render(state);
			const el = shadowRoot.querySelector('[data-bind="bulbBadge"]');
			expect(el.hidden).toBe(true);
		});

		it('shows bulb badge when in bulb range', () => {
			const stateBase = ExposureState.default();
			const state = stateBase.with({
				shutterSpeed: ShutterSpeed.fromIndex(54), // 30"
				ndFilter: new NDFilter(10),
			});
			const calc = new ExposureCalculator();
			const result = calc.compensate(state.shutterSpeed, state.aperture, state.iso, state.ndFilter);
			renderer.render(state.with({ result }));
			const el = shadowRoot.querySelector('[data-bind="bulbBadge"]');
			expect(el.hidden).toBe(false);
		});
	});

	describe('filter info', () => {
		it('updates filterName', () => {
			const state = createStateWithResult(10);
			renderer.render(state);
			expect(shadowRoot.querySelector('[data-bind="filterName"]').textContent).toBe('ND1024');
		});

		it('updates opticalDensity', () => {
			const state = createStateWithResult(3);
			renderer.render(state);
			expect(shadowRoot.querySelector('[data-bind="opticalDensity"]').textContent).toBe('0.90');
		});

		it('updates transmission', () => {
			const state = createStateWithResult(3);
			renderer.render(state);
			expect(shadowRoot.querySelector('[data-bind="transmission"]').textContent).toBe('12.5%');
		});
	});

	describe('slider sync', () => {
		it('updates slider value', () => {
			const state = createStateWithResult(10);
			renderer.render(state);
			const slider = shadowRoot.querySelector('#ndx-stops');
			expect(slider.value).toBe('10');
		});

		it('updates output text', () => {
			const state = createStateWithResult(10);
			renderer.render(state);
			const output = shadowRoot.querySelector('.ndx__slider-output');
			expect(output.textContent).toBe('10 stops');
		});

		it('shows "1 stop" singular', () => {
			const state = createStateWithResult(1);
			renderer.render(state);
			const output = shadowRoot.querySelector('.ndx__slider-output');
			expect(output.textContent).toBe('1 stop');
		});
	});

	describe('preset button sync', () => {
		it('sets aria-checked on matching preset', () => {
			const state = createStateWithResult(10);
			renderer.render(state);
			const btn = shadowRoot.querySelector('[data-stops="10"]');
			expect(btn.getAttribute('aria-checked')).toBe('true');
		});

		it('toggles active class', () => {
			const state = createStateWithResult(10);
			renderer.render(state);
			const btn = shadowRoot.querySelector('[data-stops="10"]');
			expect(btn.classList.contains('ndx__preset--active')).toBe(true);
			const btn3 = shadowRoot.querySelector('[data-stops="3"]');
			expect(btn3.classList.contains('ndx__preset--active')).toBe(false);
		});
	});

	describe('null result', () => {
		it('early returns without error', () => {
			const state = ExposureState.default(); // result is null
			expect(() => renderer.render(state)).not.toThrow();
		});
	});
});

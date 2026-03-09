// @vitest-environment happy-dom
import { beforeEach, describe, expect, it } from 'vitest';
import { ExposureCalculator } from '../../src/domain/exposure-calculator.js';
import { NDFilter } from '../../src/domain/nd-filter.js';
import { NDFilterStack } from '../../src/domain/nd-filter-stack.js';
import { ShutterSpeed } from '../../src/domain/shutter-speed.js';
import { ExposureState } from '../../src/state/exposure-state.js';
import { DiffRenderer } from '../../src/ui/diff-renderer.js';
import { buildTemplate } from '../../src/ui/template.js';

describe('DiffRenderer', () => {
	/** @type {HTMLElement} */
	let shadowRoot;
	/** @type {DiffRenderer} */
	let renderer;

	function createStateWithStack(...stopValues) {
		const filters = stopValues.map((s) => new NDFilter(s));
		const stack = new NDFilterStack(filters);
		const state = ExposureState.default().with({ ndFilter: stack });
		const calc = new ExposureCalculator();
		const result = calc.compensate(
			state.shutterSpeed,
			state.aperture,
			state.iso,
			state.ndFilter,
			state.refApertureIndex,
			state.refISOIndex,
		);
		return state.with({ result });
	}

	function createStateWithResult(ndStops = 3) {
		return createStateWithStack(ndStops);
	}

	beforeEach(() => {
		const host = document.createElement('div');
		host.innerHTML = buildTemplate();
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
			const state = createStateWithResult(1);
			renderer.render(state);
			const el = shadowRoot.querySelector('[data-bind="bulbBadge"]');
			expect(el.hidden).toBe(true);
		});

		it('shows bulb badge when in bulb range', () => {
			const stateBase = ExposureState.default();
			const state = stateBase.with({
				shutterSpeed: ShutterSpeed.fromIndex(54), // 30"
				ndFilter: NDFilterStack.of(new NDFilter(10)),
			});
			const calc = new ExposureCalculator();
			const result = calc.compensate(
				state.shutterSpeed,
				state.aperture,
				state.iso,
				state.ndFilter,
				state.refApertureIndex,
				state.refISOIndex,
			);
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

	describe('stack chip rendering', () => {
		it('renders 0 chips for empty stack', () => {
			const state = createStateWithStack();
			renderer.render(state);
			const chips = shadowRoot.querySelectorAll('.ndx__stack-chip');
			expect(chips.length).toBe(0);
		});

		it('renders 1 chip for single filter', () => {
			const state = createStateWithStack(3);
			renderer.render(state);
			const chips = shadowRoot.querySelectorAll('.ndx__stack-chip');
			expect(chips.length).toBe(1);
			expect(chips[0].textContent).toContain('ND8');
		});

		it('renders 3 chips for three filters', () => {
			const state = createStateWithStack(3, 10, 6);
			renderer.render(state);
			const chips = shadowRoot.querySelectorAll('.ndx__stack-chip');
			expect(chips.length).toBe(3);
		});

		it('renders 5 chips for max filters', () => {
			const state = createStateWithStack(1, 2, 3, 4, 6);
			renderer.render(state);
			const chips = shadowRoot.querySelectorAll('.ndx__stack-chip');
			expect(chips.length).toBe(5);
		});

		it('each chip has remove button with data-filter-index', () => {
			const state = createStateWithStack(3, 10);
			renderer.render(state);
			const buttons = shadowRoot.querySelectorAll('.ndx__stack-chip-remove');
			expect(buttons.length).toBe(2);
			expect(buttons[0].dataset.filterIndex).toBe('0');
			expect(buttons[1].dataset.filterIndex).toBe('1');
		});
	});

	describe('combined info display', () => {
		it('shows combined filter name for stacked filters', () => {
			const state = createStateWithStack(3, 10);
			renderer.render(state);
			expect(shadowRoot.querySelector('[data-bind="filterName"]').textContent).toBe('ND8 + ND1024');
		});

		it('shows dash for empty stack', () => {
			const state = createStateWithStack();
			renderer.render(state);
			expect(shadowRoot.querySelector('[data-bind="filterName"]').textContent).toBe('\u2014');
		});

		it('shows 0 OD for empty stack', () => {
			const state = createStateWithStack();
			renderer.render(state);
			expect(shadowRoot.querySelector('[data-bind="opticalDensity"]').textContent).toBe('0');
		});

		it('shows 100% transmission for empty stack', () => {
			const state = createStateWithStack();
			renderer.render(state);
			expect(shadowRoot.querySelector('[data-bind="transmission"]').textContent).toBe('100%');
		});

		it('shows scientific notation for extreme transmission', () => {
			const state = createStateWithStack(4, 4, 4, 4, 4); // 20 stops
			renderer.render(state);
			const text = shadowRoot.querySelector('[data-bind="transmission"]').textContent;
			expect(text).toMatch(/×10/);
			expect(text).toMatch(/%$/);
		});
	});

	describe('clear button visibility', () => {
		it('hidden when 0 filters', () => {
			const state = createStateWithStack();
			renderer.render(state);
			expect(shadowRoot.querySelector('[data-bind="clearButton"]').hidden).toBe(true);
		});

		it('hidden when 1 filter', () => {
			const state = createStateWithStack(3);
			renderer.render(state);
			expect(shadowRoot.querySelector('[data-bind="clearButton"]').hidden).toBe(true);
		});

		it('visible when 2+ filters', () => {
			const state = createStateWithStack(3, 10);
			renderer.render(state);
			expect(shadowRoot.querySelector('[data-bind="clearButton"]').hidden).toBe(false);
		});
	});

	describe('preset disabled state at max', () => {
		it('presets enabled when stack has room', () => {
			const state = createStateWithStack(3);
			renderer.render(state);
			const presets = shadowRoot.querySelectorAll('.ndx__preset');
			for (const btn of presets) {
				expect(btn.disabled).toBe(false);
			}
		});

		it('presets disabled when stack is full (5)', () => {
			const state = createStateWithStack(1, 2, 3, 4, 6);
			renderer.render(state);
			const presets = shadowRoot.querySelectorAll('.ndx__preset');
			for (const btn of presets) {
				expect(btn.disabled).toBe(true);
			}
		});

		it('add button disabled when stack is full', () => {
			const state = createStateWithStack(1, 2, 3, 4, 6);
			renderer.render(state);
			const addBtn = shadowRoot.querySelector('.ndx__stack-add');
			expect(addBtn.disabled).toBe(true);
		});
	});

	describe('exact SS display', () => {
		it('renders exactDisplay in resultSSExact', () => {
			const state = createStateWithResult(3);
			renderer.render(state);
			const el = shadowRoot.querySelector('[data-bind="resultSSExact"]');
			expect(el.textContent).toMatch(/s$/);
		});
	});

	describe('shift info', () => {
		it('shows "No ND filter" for empty stack', () => {
			const state = createStateWithStack();
			renderer.render(state);
			expect(shadowRoot.querySelector('[data-bind="shiftInfo"]').textContent).toBe('No ND filter');
		});

		it('shows total stops for stacked filters', () => {
			const state = createStateWithStack(3, 10);
			renderer.render(state);
			expect(shadowRoot.querySelector('[data-bind="shiftInfo"]').textContent).toContain('13 stops');
		});
	});

	describe('null result', () => {
		it('early returns without error', () => {
			const state = ExposureState.default();
			expect(() => renderer.render(state)).not.toThrow();
		});
	});
});

// @vitest-environment happy-dom
import { beforeAll, describe, expect, it } from 'vitest';
import { buildTemplate } from '../../src/ui/template.js';

describe('template', () => {
	/** @type {Document} */
	let doc;
	/** @type {HTMLElement} */
	let root;

	beforeAll(() => {
		doc = document;
		root = doc.createElement('div');
		root.innerHTML = buildTemplate();
	});

	describe('select options', () => {
		it('SS select has 55 options', () => {
			const select = root.querySelector('[data-action="ss"]');
			expect(select.options.length).toBe(55);
		});

		it('Aperture select has 31 options', () => {
			const select = root.querySelector('[data-action="aperture"]');
			expect(select.options.length).toBe(31);
		});

		it('ISO select has 31 options', () => {
			const select = root.querySelector('[data-action="iso"]');
			expect(select.options.length).toBe(31);
		});
	});

	describe('default selected values', () => {
		it('SS defaults to index 18 (1/125)', () => {
			const select = root.querySelector('[data-action="ss"]');
			const selected = select.querySelector('option[selected]');
			expect(selected.value).toBe('18');
			expect(selected.textContent).toBe('1/125');
		});

		it('Aperture defaults to index 5 (f/1.8)', () => {
			const select = root.querySelector('[data-action="aperture"]');
			const selected = select.querySelector('option[selected]');
			expect(selected.value).toBe('5');
		});

		it('ISO defaults to index 3 (ISO 100)', () => {
			const select = root.querySelector('[data-action="iso"]');
			const selected = select.querySelector('option[selected]');
			expect(selected.value).toBe('3');
		});
	});

	describe('data-bind attributes', () => {
		const expectedBindings = [
			'filterName',
			'opticalDensity',
			'transmission',
			'resultSS',
			'resultSSExact',
			'bulbBadge',
			'shiftInfo',
			'evBefore',
			'evAfter',
			'stackChips',
			'clearButton',
		];

		it.each(expectedBindings)('has data-bind="%s"', (key) => {
			const el = root.querySelector(`[data-bind="${key}"]`);
			expect(el).not.toBeNull();
		});
	});

	describe('ev-step buttons', () => {
		it('has 6 ev-step buttons (2 per param)', () => {
			const buttons = root.querySelectorAll('[data-action="ev-step"]');
			expect(buttons.length).toBe(6);
		});

		it('each param has −1 and +1 buttons', () => {
			for (const target of ['ss', 'aperture', 'iso']) {
				const minus = root.querySelector(
					`[data-action="ev-step"][data-target="${target}"][data-delta="-3"]`,
				);
				const plus = root.querySelector(
					`[data-action="ev-step"][data-target="${target}"][data-delta="3"]`,
				);
				expect(minus).not.toBeNull();
				expect(plus).not.toBeNull();
			}
		});
	});

	describe('data-action attributes', () => {
		it('has ss, aperture, iso selects', () => {
			expect(root.querySelector('[data-action="ss"]')).not.toBeNull();
			expect(root.querySelector('[data-action="aperture"]')).not.toBeNull();
			expect(root.querySelector('[data-action="iso"]')).not.toBeNull();
		});

		it('has add-preset buttons', () => {
			const presets = root.querySelectorAll('[data-action="add-preset"]');
			expect(presets.length).toBe(5);
		});

		it('presets do not have role="radio"', () => {
			const presets = root.querySelectorAll('[data-action="add-preset"]');
			for (const btn of presets) {
				expect(btn.getAttribute('role')).toBeNull();
			}
		});

		it('has add-custom button', () => {
			expect(root.querySelector('[data-action="add-custom"]')).not.toBeNull();
		});

		it('has clear-stack button', () => {
			expect(root.querySelector('[data-action="clear-stack"]')).not.toBeNull();
		});
	});

	describe('stack UI elements', () => {
		it('has stackChips container with role="list"', () => {
			const container = root.querySelector('[data-bind="stackChips"]');
			expect(container).not.toBeNull();
			expect(container.getAttribute('role')).toBe('list');
		});

		it('has clear button hidden by default', () => {
			const btn = root.querySelector('[data-bind="clearButton"]');
			expect(btn).not.toBeNull();
			expect(btn.hidden).toBe(true);
		});
	});

	describe('ARIA attributes', () => {
		it('has group for presets (not radiogroup)', () => {
			const group = root.querySelector('.ndx__presets');
			expect(group.getAttribute('role')).toBe('group');
		});

		it('result section has aria-live=polite', () => {
			const result = root.querySelector('[aria-live="polite"]');
			expect(result).not.toBeNull();
		});

		it('slider has aria-label', () => {
			const slider = root.querySelector('#ndx-stops');
			expect(slider.getAttribute('aria-label')).toBe('Custom ND stops');
		});
	});
});

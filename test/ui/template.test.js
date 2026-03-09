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
			'bulbBadge',
			'shiftInfo',
			'evBefore',
			'evAfter',
			'altAperture',
			'apWarning',
			'altISO',
			'isoWarning',
		];

		it.each(expectedBindings)('has data-bind="%s"', (key) => {
			const el = root.querySelector(`[data-bind="${key}"]`);
			expect(el).not.toBeNull();
		});
	});

	describe('data-action attributes', () => {
		it('has ss, aperture, iso selects', () => {
			expect(root.querySelector('[data-action="ss"]')).not.toBeNull();
			expect(root.querySelector('[data-action="aperture"]')).not.toBeNull();
			expect(root.querySelector('[data-action="iso"]')).not.toBeNull();
		});

		it('has preset buttons', () => {
			const presets = root.querySelectorAll('[data-action="preset"]');
			expect(presets.length).toBe(5);
		});

		it('has stops slider', () => {
			expect(root.querySelector('[data-action="stops"]')).not.toBeNull();
		});
	});

	describe('ARIA attributes', () => {
		it('has radiogroup for presets', () => {
			expect(root.querySelector('[role="radiogroup"]')).not.toBeNull();
		});

		it('preset buttons have role=radio', () => {
			const buttons = root.querySelectorAll('[data-action="preset"]');
			for (const btn of buttons) {
				expect(btn.getAttribute('role')).toBe('radio');
			}
		});

		it('ND8 preset is aria-checked by default', () => {
			const nd8 = root.querySelector('[data-stops="3"]');
			expect(nd8.getAttribute('aria-checked')).toBe('true');
		});

		it('result section has aria-live=polite', () => {
			const result = root.querySelector('[aria-live="polite"]');
			expect(result).not.toBeNull();
		});

		it('slider has aria-label', () => {
			const slider = root.querySelector('#ndx-stops');
			expect(slider.getAttribute('aria-label')).toBe('ND stops');
		});
	});
});

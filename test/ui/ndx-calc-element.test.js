// @vitest-environment happy-dom
import { beforeAll, describe, expect, it } from 'vitest';

describe('NDXCalcElement', () => {
	beforeAll(async () => {
		await import('../../src/ndx-calc-element.js');
	});

	it('is registered as custom element', () => {
		expect(customElements.get('ndx-calc')).toBeDefined();
	});

	it('creates shadow DOM with mode open', () => {
		const el = document.createElement('ndx-calc');
		expect(el.shadowRoot).not.toBeNull();
		expect(el.shadowRoot.mode).toBe('open');
	});

	it('builds DOM on connectedCallback', () => {
		const el = document.createElement('ndx-calc');
		document.body.appendChild(el);
		expect(el.shadowRoot.querySelector('.ndx')).not.toBeNull();
		expect(el.shadowRoot.querySelector('[data-action="ss"]')).not.toBeNull();
		document.body.removeChild(el);
	});

	it('populates result on connectedCallback', () => {
		const el = document.createElement('ndx-calc');
		document.body.appendChild(el);
		const resultSS = el.shadowRoot.querySelector('[data-bind="resultSS"]');
		expect(resultSS.textContent).not.toBe('--');
		document.body.removeChild(el);
	});

	it('cleans up on disconnectedCallback', () => {
		const el = document.createElement('ndx-calc');
		document.body.appendChild(el);
		// disconnectedCallback should not throw
		expect(() => document.body.removeChild(el)).not.toThrow();
	});
});

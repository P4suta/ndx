import { describe, expect, it } from 'vitest';
import { NDFilter } from '../../src/domain/nd-filter.js';
import { NDFilterStack } from '../../src/domain/nd-filter-stack.js';

describe('NDFilterStack', () => {
	describe('constructor', () => {
		it('accepts an array of filters', () => {
			const stack = new NDFilterStack([new NDFilter(3), new NDFilter(10)]);
			expect(stack.count).toBe(2);
		});

		it('freezes internal array', () => {
			const stack = new NDFilterStack([new NDFilter(3)]);
			expect(Object.isFrozen(stack.filters)).toBe(true);
		});

		it('throws RangeError when exceeding max 5 filters', () => {
			const filters = Array.from({ length: 6 }, () => new NDFilter(1));
			expect(() => new NDFilterStack(filters)).toThrow(RangeError);
		});

		it('accepts exactly 5 filters', () => {
			const filters = Array.from({ length: 5 }, () => new NDFilter(1));
			expect(() => new NDFilterStack(filters)).not.toThrow();
		});

		it('accepts empty array', () => {
			const stack = new NDFilterStack([]);
			expect(stack.count).toBe(0);
		});
	});

	describe('static factories', () => {
		it('empty() creates stack with no filters', () => {
			const stack = NDFilterStack.empty();
			expect(stack.isEmpty).toBe(true);
			expect(stack.count).toBe(0);
		});

		it('of() creates stack from varargs', () => {
			const stack = NDFilterStack.of(new NDFilter(3), new NDFilter(10));
			expect(stack.count).toBe(2);
		});
	});

	describe('single-filter stack matches NDFilter values', () => {
		const nd = new NDFilter(3);
		const stack = NDFilterStack.of(nd);

		it('stops', () => expect(stack.stops).toBe(nd.stops));
		it('thirdStops', () => expect(stack.thirdStops).toBe(nd.thirdStops));
		it('filterFactor', () => expect(stack.filterFactor).toBe(nd.filterFactor));
		it('opticalDensity', () => expect(stack.opticalDensity).toBe(nd.opticalDensity));
		it('transmission', () => expect(stack.transmission).toBe(nd.transmission));
		it('display', () => expect(stack.display).toBe(nd.display));
	});

	describe('multi-filter arithmetic', () => {
		it('ND8 + ND1024 = 13 stops, 39 thirdStops', () => {
			const stack = NDFilterStack.of(new NDFilter(3), new NDFilter(10));
			expect(stack.stops).toBe(13);
			expect(stack.thirdStops).toBe(39);
		});

		it('filterFactor = 2^totalStops', () => {
			const stack = NDFilterStack.of(new NDFilter(3), new NDFilter(10));
			expect(stack.filterFactor).toBe(2 ** 13);
		});

		it('opticalDensity is sum of individual ODs', () => {
			const nd3 = new NDFilter(3);
			const nd10 = new NDFilter(10);
			const stack = NDFilterStack.of(nd3, nd10);
			expect(stack.opticalDensity).toBeCloseTo(nd3.opticalDensity + nd10.opticalDensity, 2);
		});

		it('transmission is formatted string', () => {
			const stack = NDFilterStack.of(new NDFilter(3), new NDFilter(10));
			expect(typeof stack.transmission).toBe('string');
			expect(stack.transmission).toBe('0.012');
		});

		it('display joins filter names', () => {
			const stack = NDFilterStack.of(new NDFilter(3), new NDFilter(10));
			expect(stack.display).toBe('ND8 + ND1024');
		});
	});

	describe('empty stack', () => {
		const stack = NDFilterStack.empty();

		it('stops = 0', () => expect(stack.stops).toBe(0));
		it('thirdStops = 0', () => expect(stack.thirdStops).toBe(0));
		it('filterFactor = 1', () => expect(stack.filterFactor).toBe(1));
		it('opticalDensity = 0', () => expect(stack.opticalDensity).toBe(0));
		it('transmission = "100"', () => expect(stack.transmission).toBe('100'));
		it('display = "\u2014"', () => expect(stack.display).toBe('\u2014'));
		it('isEmpty = true', () => expect(stack.isEmpty).toBe(true));
	});

	describe('add()', () => {
		it('returns a new stack with the filter appended', () => {
			const stack = NDFilterStack.of(new NDFilter(3));
			const next = stack.add(new NDFilter(10));
			expect(next.count).toBe(2);
			expect(next.stops).toBe(13);
		});

		it('does not mutate original', () => {
			const stack = NDFilterStack.of(new NDFilter(3));
			stack.add(new NDFilter(10));
			expect(stack.count).toBe(1);
		});

		it('throws RangeError when stack is full (5 filters)', () => {
			let stack = NDFilterStack.empty();
			for (let i = 0; i < 5; i++) {
				stack = stack.add(new NDFilter(1));
			}
			expect(() => stack.add(new NDFilter(1))).toThrow(RangeError);
		});
	});

	describe('removeAt()', () => {
		it('removes filter at given index', () => {
			const stack = NDFilterStack.of(new NDFilter(3), new NDFilter(10), new NDFilter(6));
			const next = stack.removeAt(1);
			expect(next.count).toBe(2);
			expect(next.stops).toBe(9); // 3 + 6
		});

		it('returns new instance', () => {
			const stack = NDFilterStack.of(new NDFilter(3), new NDFilter(10));
			const next = stack.removeAt(0);
			expect(next).not.toBe(stack);
			expect(stack.count).toBe(2);
		});
	});

	describe('clear()', () => {
		it('returns empty stack', () => {
			const stack = NDFilterStack.of(new NDFilter(3), new NDFilter(10));
			const next = stack.clear();
			expect(next.isEmpty).toBe(true);
		});

		it('returns new instance', () => {
			const stack = NDFilterStack.of(new NDFilter(3));
			expect(stack.clear()).not.toBe(stack);
		});
	});

	describe('extreme stacks', () => {
		it('20-stop stack uses scientific notation for transmission', () => {
			// 4+4+4+4+4 = 20 stops
			const stack = NDFilterStack.of(
				new NDFilter(4),
				new NDFilter(4),
				new NDFilter(4),
				new NDFilter(4),
				new NDFilter(4),
			);
			expect(stack.stops).toBe(20);
			expect(stack.transmission).toMatch(/×10/);
		});
	});
});

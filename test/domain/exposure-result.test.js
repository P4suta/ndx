import { describe, expect, it } from 'vitest';
import { ExposureResult } from '../../src/domain/exposure-result.js';
import { ShutterSpeed } from '../../src/domain/shutter-speed.js';

describe('ExposureResult', () => {
	function createResult() {
		return new ExposureResult({
			shutterSpeed: ShutterSpeed.fromIndex(39),
			evBefore: 10.0,
			evAfter: 7.0,
			ndStops: 3,
		});
	}

	it('is frozen', () => {
		const result = createResult();
		expect(Object.isFrozen(result)).toBe(true);
	});

	it('exposes all properties', () => {
		const result = createResult();
		expect(result.shutterSpeed.display).toBe('1"');
		expect(result.evBefore).toBe(10.0);
		expect(result.evAfter).toBe(7.0);
		expect(result.ndStops).toBe(3);
	});

	it('is not writable', () => {
		const result = createResult();
		expect(() => {
			result.evBefore = 99;
		}).toThrow();
		expect(() => {
			result.ndStops = 99;
		}).toThrow();
	});
});

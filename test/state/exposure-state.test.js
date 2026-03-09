import { describe, expect, it } from 'vitest';
import { Aperture } from '../../src/domain/aperture.js';
import { ShutterSpeed } from '../../src/domain/shutter-speed.js';
import { ExposureState } from '../../src/state/exposure-state.js';

describe('ExposureState', () => {
	describe('default()', () => {
		const state = ExposureState.default();

		it('has shutterSpeed at 1/125', () => {
			expect(state.shutterSpeed.display).toBe('1/125');
		});

		it('has aperture at f/1.8', () => {
			expect(state.aperture.display).toBe('f/1.8');
		});

		it('has iso at ISO 100', () => {
			expect(state.iso.display).toBe('ISO 100');
		});

		it('has ndFilter at ND8 (3 stops)', () => {
			expect(state.ndFilter.stops).toBe(3);
		});

		it('has null result', () => {
			expect(state.result).toBeNull();
		});

		it('is frozen', () => {
			expect(Object.isFrozen(state)).toBe(true);
		});
	});

	describe('with()', () => {
		it('creates new state with partial updates', () => {
			const state = ExposureState.default();
			const updated = state.with({ shutterSpeed: ShutterSpeed.fromIndex(0) });
			expect(updated.shutterSpeed.display).toBe('1/8000');
			expect(updated.aperture.display).toBe('f/1.8');
		});

		it('does not modify original state', () => {
			const state = ExposureState.default();
			state.with({ shutterSpeed: ShutterSpeed.fromIndex(0) });
			expect(state.shutterSpeed.display).toBe('1/125');
		});

		it('supports chaining', () => {
			const state = ExposureState.default();
			const updated = state
				.with({ shutterSpeed: ShutterSpeed.fromIndex(0) })
				.with({ aperture: Aperture.fromIndex(0) });
			expect(updated.shutterSpeed.display).toBe('1/8000');
			expect(updated.aperture.display).toBe('f/1.0');
		});

		it('returns frozen state', () => {
			const updated = ExposureState.default().with({});
			expect(Object.isFrozen(updated)).toBe(true);
		});
	});
});

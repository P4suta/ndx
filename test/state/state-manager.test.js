import { describe, expect, it, vi } from 'vitest';
import { ExposureCalculator } from '../../src/domain/exposure-calculator.js';
import { StateManager } from '../../src/state/state-manager.js';

describe('StateManager', () => {
	function createManager() {
		return new StateManager(new ExposureCalculator());
	}

	describe('initialize', () => {
		it('notifies subscriber with result', () => {
			const sm = createManager();
			const fn = vi.fn();
			sm.subscribe(fn);
			sm.initialize();
			expect(fn).toHaveBeenCalledOnce();
			expect(sm.state.result).not.toBeNull();
		});
	});

	describe('setShutterSpeed', () => {
		it('updates state and recalculates', () => {
			const sm = createManager();
			sm.initialize();
			sm.setShutterSpeed(0); // 1/8000
			expect(sm.state.shutterSpeed.display).toBe('1/8000');
			expect(sm.state.result).not.toBeNull();
		});

		it('notifies subscriber', () => {
			const sm = createManager();
			const fn = vi.fn();
			sm.subscribe(fn);
			sm.initialize();
			fn.mockClear();
			sm.setShutterSpeed(0);
			expect(fn).toHaveBeenCalledOnce();
		});
	});

	describe('setAperture', () => {
		it('updates state and recalculates', () => {
			const sm = createManager();
			sm.initialize();
			sm.setAperture(18); // f/8
			expect(sm.state.aperture.display).toBe('f/8');
			expect(sm.state.result).not.toBeNull();
		});
	});

	describe('setISO', () => {
		it('updates state and recalculates', () => {
			const sm = createManager();
			sm.initialize();
			sm.setISO(12); // ISO 800
			expect(sm.state.iso.display).toBe('ISO 800');
			expect(sm.state.result).not.toBeNull();
		});
	});

	describe('setNDStops', () => {
		it('updates with valid stops', () => {
			const sm = createManager();
			sm.initialize();
			sm.setNDStops(10);
			expect(sm.state.ndFilter.stops).toBe(10);
		});

		it('ignores invalid stops (0)', () => {
			const sm = createManager();
			sm.initialize();
			const prev = sm.state.ndFilter.stops;
			sm.setNDStops(0);
			expect(sm.state.ndFilter.stops).toBe(prev);
		});

		it('ignores invalid stops (21)', () => {
			const sm = createManager();
			sm.initialize();
			const prev = sm.state.ndFilter.stops;
			sm.setNDStops(21);
			expect(sm.state.ndFilter.stops).toBe(prev);
		});

		it('ignores invalid stops (1.5)', () => {
			const sm = createManager();
			sm.initialize();
			const prev = sm.state.ndFilter.stops;
			sm.setNDStops(1.5);
			expect(sm.state.ndFilter.stops).toBe(prev);
		});
	});

	describe('subscribe/unsubscribe', () => {
		it('returns unsubscribe function', () => {
			const sm = createManager();
			const fn = vi.fn();
			const unsub = sm.subscribe(fn);
			sm.initialize();
			expect(fn).toHaveBeenCalledOnce();
			fn.mockClear();
			unsub();
			sm.setShutterSpeed(0);
			expect(fn).not.toHaveBeenCalled();
		});

		it('supports multiple subscribers', () => {
			const sm = createManager();
			const fn1 = vi.fn();
			const fn2 = vi.fn();
			sm.subscribe(fn1);
			sm.subscribe(fn2);
			sm.initialize();
			expect(fn1).toHaveBeenCalledOnce();
			expect(fn2).toHaveBeenCalledOnce();
		});
	});
});

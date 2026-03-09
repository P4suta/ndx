import { describe, expect, it, vi } from 'vitest';
import { ExposureCalculator } from '../../src/domain/exposure-calculator.js';
import { ShutterSpeed } from '../../src/domain/shutter-speed.js';
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

	describe('addNDFilter', () => {
		it('adds filter to stack', () => {
			const sm = createManager();
			sm.initialize();
			// Default has 1 filter (ND8), add ND1024
			sm.addNDFilter(10);
			expect(sm.state.ndFilter.count).toBe(2);
			expect(sm.state.ndFilter.stops).toBe(13); // 3 + 10
		});

		it('ignores invalid stops (0)', () => {
			const sm = createManager();
			sm.initialize();
			const prevCount = sm.state.ndFilter.count;
			sm.addNDFilter(0);
			expect(sm.state.ndFilter.count).toBe(prevCount);
		});

		it('ignores invalid stops (21)', () => {
			const sm = createManager();
			sm.initialize();
			const prevCount = sm.state.ndFilter.count;
			sm.addNDFilter(21);
			expect(sm.state.ndFilter.count).toBe(prevCount);
		});

		it('silently fails when stack is full (5 filters)', () => {
			const sm = createManager();
			sm.initialize();
			// Default has 1, add 4 more
			for (let i = 0; i < 4; i++) sm.addNDFilter(1);
			expect(sm.state.ndFilter.count).toBe(5);
			// 6th should silently fail
			sm.addNDFilter(1);
			expect(sm.state.ndFilter.count).toBe(5);
		});

		it('recalculates after adding', () => {
			const sm = createManager();
			sm.initialize();
			const ssBefore = sm.state.result.shutterSpeed.display;
			sm.addNDFilter(10);
			expect(sm.state.result.shutterSpeed.display).not.toBe(ssBefore);
		});
	});

	describe('removeNDFilter', () => {
		it('removes filter at index', () => {
			const sm = createManager();
			sm.initialize();
			sm.addNDFilter(10); // stack: [ND8, ND1024]
			sm.removeNDFilter(0); // remove ND8
			expect(sm.state.ndFilter.count).toBe(1);
			expect(sm.state.ndFilter.stops).toBe(10);
		});

		it('recalculates after removing', () => {
			const sm = createManager();
			sm.initialize();
			sm.addNDFilter(10);
			const ssBefore = sm.state.result.shutterSpeed.display;
			sm.removeNDFilter(1);
			expect(sm.state.result.shutterSpeed.display).not.toBe(ssBefore);
		});
	});

	describe('clearNDFilters', () => {
		it('empties the stack', () => {
			const sm = createManager();
			sm.initialize();
			sm.addNDFilter(10);
			sm.clearNDFilters();
			expect(sm.state.ndFilter.isEmpty).toBe(true);
			expect(sm.state.ndFilter.stops).toBe(0);
		});

		it('recalculates after clearing', () => {
			const sm = createManager();
			sm.initialize();
			sm.clearNDFilters();
			expect(sm.state.result).not.toBeNull();
		});
	});

	describe('integration: two filters combined result', () => {
		it('ND8 + ND1024 (13 stops) produces correct compensated SS', () => {
			const sm = createManager();
			sm.initialize();
			sm.addNDFilter(10); // + ND1024 on top of default ND8
			expect(sm.state.ndFilter.stops).toBe(13);
			expect(sm.state.result.shutterSpeed.isBulb).toBe(true);
		});
	});

	describe('reference indices', () => {
		it('setShutterSpeed snapshots current Av/ISO as references', () => {
			const sm = createManager();
			sm.initialize();
			sm.setAperture(18); // f/8
			sm.setISO(9); // ISO 400
			sm.setShutterSpeed(18); // 1/125
			expect(sm.state.refApertureIndex).toBe(18);
			expect(sm.state.refISOIndex).toBe(9);
		});

		it('setAperture does not change references', () => {
			const sm = createManager();
			sm.initialize();
			const refAp = sm.state.refApertureIndex;
			const refISO = sm.state.refISOIndex;
			sm.setAperture(18);
			expect(sm.state.refApertureIndex).toBe(refAp);
			expect(sm.state.refISOIndex).toBe(refISO);
		});

		it('setISO does not change references', () => {
			const sm = createManager();
			sm.initialize();
			const refAp = sm.state.refApertureIndex;
			const refISO = sm.state.refISOIndex;
			sm.setISO(9);
			expect(sm.state.refApertureIndex).toBe(refAp);
			expect(sm.state.refISOIndex).toBe(refISO);
		});

		it('raising ISO after ND reduces compensated SS', () => {
			const sm = createManager();
			sm.initialize();
			// Default: SS=1/125(18), f/1.8(5), ISO 100(3), stack=[ND8(3)]
			sm.clearNDFilters();
			sm.addNDFilter(10); // ND1000
			const ssBefore = sm.state.result.shutterSpeed.display;

			sm.setISO(9); // ISO 400 (+6 third-stops)
			const ssAfter = sm.state.result.shutterSpeed.display;

			expect(ssBefore).not.toBe(ssAfter);
			// Higher ISO → faster (shorter) compensated SS
			expect(sm.state.result.shutterSpeed.seconds).toBeLessThan(
				ShutterSpeed.fromIndex(18).shift(30).seconds,
			);
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

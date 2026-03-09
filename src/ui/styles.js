/** Returns the full CSS stylesheet for the ndx-calc component. */
export function getStyles() {
	return `
:host {
  --ndx-bg: #fafafa;
  --ndx-surface: #ffffff;
  --ndx-surface-alt: #f0f0f2;
  --ndx-text: #1a1a1a;
  --ndx-text-secondary: #6b6b6b;
  --ndx-accent: #2563eb;
  --ndx-accent-hover: #1d4ed8;
  --ndx-accent-text: #ffffff;
  --ndx-border: #e0e0e0;
  --ndx-result-bg: #eff6ff;
  --ndx-warning: #dc2626;

  --ndx-space-xs: 4px;
  --ndx-space-sm: 8px;
  --ndx-space-md: 16px;
  --ndx-space-lg: 24px;
  --ndx-space-xl: 32px;

  --ndx-font-family: system-ui, -apple-system, sans-serif;
  --ndx-font-mono: ui-monospace, 'SF Mono', monospace;
  --ndx-font-size-sm: 0.8125rem;
  --ndx-font-size-base: 0.9375rem;
  --ndx-font-size-lg: 1.125rem;
  --ndx-font-size-xl: 1.75rem;
  --ndx-font-size-2xl: 2.5rem;

  --ndx-radius-sm: 6px;
  --ndx-radius-md: 10px;
  --ndx-radius-lg: 14px;

  --ndx-transition: 150ms ease;

  display: block;
  font-family: var(--ndx-font-family);
  color: var(--ndx-text);
}

@media (prefers-color-scheme: dark) {
  :host {
    --ndx-bg: #1a1a1e;
    --ndx-surface: #242428;
    --ndx-surface-alt: #2e2e34;
    --ndx-text: #e8e8ed;
    --ndx-text-secondary: #9a9aa0;
    --ndx-accent: #60a5fa;
    --ndx-accent-hover: #93bbfd;
    --ndx-accent-text: #1a1a1e;
    --ndx-border: #3a3a40;
    --ndx-result-bg: #1e293b;
    --ndx-warning: #f87171;
  }
}

@media (prefers-reduced-motion: reduce) {
  *, *::before, *::after {
    transition-duration: 0.01ms !important;
    animation-duration: 0.01ms !important;
  }
}

* { box-sizing: border-box; margin: 0; padding: 0; }

.ndx {
  background: var(--ndx-bg);
  border: 1px solid var(--ndx-border);
  border-radius: var(--ndx-radius-lg);
  padding: var(--ndx-space-lg);
  max-width: 640px;
  margin: 0 auto;
}

.ndx__header {
  margin-bottom: var(--ndx-space-lg);
}

.ndx__title {
  font-size: var(--ndx-font-size-lg);
  font-weight: 600;
  margin: 0;
}

.ndx__body {
  display: grid;
  gap: var(--ndx-space-lg);
}

@media (min-width: 576px) {
  .ndx__body {
    grid-template-columns: 1fr 1fr;
    grid-template-rows: auto auto;
  }
  .ndx__input { grid-column: 1; grid-row: 1; }
  .ndx__filter { grid-column: 1; grid-row: 2; }
  .ndx__result { grid-column: 2; grid-row: 1 / 3; }
}

.ndx__section-title {
  font-size: var(--ndx-font-size-sm);
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  color: var(--ndx-text-secondary);
  margin-bottom: var(--ndx-space-md);
}

.ndx__param {
  margin-bottom: var(--ndx-space-md);
}

.ndx__label {
  display: block;
  font-size: var(--ndx-font-size-sm);
  color: var(--ndx-text-secondary);
  margin-bottom: var(--ndx-space-xs);
}

.ndx__param-controls {
  display: flex;
  align-items: center;
  gap: var(--ndx-space-xs);
}

.ndx__param-controls .ndx__select { flex: 1; }

.ndx__ev-step {
  padding: var(--ndx-space-xs) var(--ndx-space-sm);
  font-size: var(--ndx-font-size-sm);
  font-family: var(--ndx-font-mono);
  font-weight: 600;
  color: var(--ndx-text);
  background: var(--ndx-surface);
  border: 1px solid var(--ndx-border);
  border-radius: var(--ndx-radius-sm);
  cursor: pointer;
  min-width: 32px;
  text-align: center;
}

.ndx__ev-step:hover { border-color: var(--ndx-accent); }
.ndx__ev-step:active { background: var(--ndx-surface-alt); }

.ndx__select {
  width: 100%;
  padding: var(--ndx-space-sm) var(--ndx-space-md);
  font-size: var(--ndx-font-size-base);
  font-family: var(--ndx-font-family);
  color: var(--ndx-text);
  background: var(--ndx-surface);
  border: 1px solid var(--ndx-border);
  border-radius: var(--ndx-radius-sm);
  cursor: pointer;
  transition: border-color var(--ndx-transition);
}

.ndx__select:focus {
  outline: 2px solid var(--ndx-accent);
  outline-offset: 1px;
}

.ndx__presets {
  display: flex;
  gap: var(--ndx-space-sm);
  flex-wrap: wrap;
  margin-bottom: var(--ndx-space-md);
}

.ndx__preset {
  padding: var(--ndx-space-xs) var(--ndx-space-md);
  font-size: var(--ndx-font-size-sm);
  font-family: var(--ndx-font-family);
  font-weight: 500;
  color: var(--ndx-text);
  background: var(--ndx-surface);
  border: 1px solid var(--ndx-border);
  border-radius: var(--ndx-radius-sm);
  cursor: pointer;
  transition: all var(--ndx-transition);
}

.ndx__preset:hover {
  border-color: var(--ndx-accent);
}

.ndx__preset:focus-visible {
  outline: 2px solid var(--ndx-accent);
  outline-offset: 1px;
}

.ndx__preset:disabled,
.ndx__stack-add:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.ndx__slider-group {
  display: flex;
  align-items: center;
  gap: var(--ndx-space-md);
  margin-bottom: var(--ndx-space-md);
}

.ndx__slider {
  flex: 1;
  accent-color: var(--ndx-accent);
}

.ndx__slider-output {
  font-size: var(--ndx-font-size-sm);
  font-family: var(--ndx-font-mono);
  color: var(--ndx-text-secondary);
  min-width: 5em;
  text-align: right;
}

.ndx__stack {
  display: flex;
  flex-wrap: wrap;
  gap: var(--ndx-space-xs);
  min-height: 28px;
  margin-bottom: var(--ndx-space-md);
}

.ndx__stack-chip {
  display: inline-flex;
  align-items: center;
  gap: var(--ndx-space-xs);
  padding: 2px var(--ndx-space-sm);
  font-size: var(--ndx-font-size-sm);
  font-family: var(--ndx-font-mono);
  background: var(--ndx-surface-alt);
  border: 1px solid var(--ndx-border);
  border-radius: var(--ndx-radius-sm);
}

.ndx__stack-chip-remove {
  background: none;
  border: none;
  cursor: pointer;
  color: var(--ndx-text-secondary);
  padding: 0 2px;
  font-size: 0.75rem;
  line-height: 1;
}

.ndx__stack-chip-remove:hover {
  color: var(--ndx-warning);
}

.ndx__stack-add {
  padding: var(--ndx-space-xs) var(--ndx-space-md);
  font-size: var(--ndx-font-size-sm);
  font-family: var(--ndx-font-family);
  background: var(--ndx-accent);
  color: var(--ndx-accent-text);
  border: none;
  border-radius: var(--ndx-radius-sm);
  cursor: pointer;
}

.ndx__stack-clear {
  font-size: var(--ndx-font-size-sm);
  color: var(--ndx-text-secondary);
  background: none;
  border: 1px solid var(--ndx-border);
  border-radius: var(--ndx-radius-sm);
  padding: var(--ndx-space-xs) var(--ndx-space-md);
  cursor: pointer;
  margin-bottom: var(--ndx-space-md);
}

.ndx__filter-info {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: var(--ndx-space-sm);
  background: var(--ndx-surface-alt);
  border-radius: var(--ndx-radius-sm);
  padding: var(--ndx-space-sm) var(--ndx-space-md);
}

.ndx__filter-info-item dt {
  font-size: 0.6875rem;
  color: var(--ndx-text-secondary);
  text-transform: uppercase;
  letter-spacing: 0.05em;
}

.ndx__filter-info-item dd {
  font-size: var(--ndx-font-size-sm);
  font-family: var(--ndx-font-mono);
  font-weight: 600;
}

.ndx__result {
  background: var(--ndx-result-bg);
  border-radius: var(--ndx-radius-md);
  padding: var(--ndx-space-lg);
}

.ndx__result-main {
  text-align: center;
  margin-bottom: var(--ndx-space-md);
}

.ndx__result-label {
  display: block;
  font-size: var(--ndx-font-size-sm);
  color: var(--ndx-text-secondary);
  margin-bottom: var(--ndx-space-xs);
}

.ndx__result-value {
  display: block;
  font-size: var(--ndx-font-size-2xl);
  font-family: var(--ndx-font-mono);
  font-weight: 700;
  line-height: 1.1;
}

.ndx__result-badge {
  display: inline-block;
  font-size: 0.6875rem;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.08em;
  color: var(--ndx-accent-text);
  background: var(--ndx-accent);
  border-radius: var(--ndx-radius-sm);
  padding: 2px var(--ndx-space-sm);
  margin-top: var(--ndx-space-xs);
}

.ndx__result-exact {
  display: block;
  text-align: center;
  font-size: var(--ndx-font-size-sm);
  font-family: var(--ndx-font-mono);
  color: var(--ndx-text-secondary);
}

.ndx__result-shift {
  text-align: center;
  font-size: var(--ndx-font-size-sm);
  color: var(--ndx-text-secondary);
  margin-bottom: var(--ndx-space-md);
}

.ndx__result-ev {
  display: flex;
  justify-content: center;
  align-items: center;
  gap: var(--ndx-space-sm);
  font-size: var(--ndx-font-size-sm);
  font-family: var(--ndx-font-mono);
  color: var(--ndx-text-secondary);
  margin-bottom: var(--ndx-space-md);
}

.ndx__result-ev-arrow {
  color: var(--ndx-accent);
}
`;
}

import { Aperture } from '../domain/aperture.js';
import { ISO } from '../domain/iso.js';
import { NDFilter } from '../domain/nd-filter.js';
import { ShutterSpeed } from '../domain/shutter-speed.js';
import { getStyles } from './styles.js';

/**
 * Generates the full HTML template for the ndx-calc shadow DOM.
 * @returns {string}
 */
export function buildTemplate() {
	return `
<style>${getStyles()}</style>
<div class="ndx">
  <header class="ndx__header">
    <h2 class="ndx__title">ND Filter Calculator</h2>
  </header>
  <div class="ndx__body">
    <section class="ndx__input" aria-label="Current Exposure">
      <h3 class="ndx__section-title">Current Exposure</h3>
      ${paramSelect('Shutter Speed', 'ss', ShutterSpeed.scaleLength, (i) => ShutterSpeed.displayAt(i), ShutterSpeed.defaultIndex())}
      ${paramSelect('Aperture', 'aperture', Aperture.scaleLength, (i) => Aperture.displayAt(i), Aperture.defaultIndex())}
      ${paramSelect('ISO', 'iso', ISO.scaleLength, (i) => ISO.displayAt(i), ISO.defaultIndex())}
    </section>
    <section class="ndx__filter" aria-label="ND Filter">
      <h3 class="ndx__section-title">ND Filter</h3>
      <div class="ndx__presets" role="radiogroup" aria-label="ND presets">
        ${NDFilter.PRESETS.map((p) => `<button class="ndx__preset" role="radio" aria-checked="${p.stops === 3}" data-action="preset" data-stops="${p.stops}">${p.label}</button>`).join('')}
      </div>
      <div class="ndx__slider-group">
        <input type="range" id="ndx-stops" class="ndx__slider"
               min="1" max="20" value="3" step="1"
               data-action="stops"
               aria-label="ND stops" />
        <output class="ndx__slider-output" for="ndx-stops">3 stops</output>
      </div>
      <dl class="ndx__filter-info">
        ${filterInfoItem('Filter', 'filterName', 'ND8')}
        ${filterInfoItem('Optical Density', 'opticalDensity', '0.90')}
        ${filterInfoItem('Transmission', 'transmission', '12.5%')}
      </dl>
    </section>
    <section class="ndx__result" aria-live="polite" aria-label="Result">
      <h3 class="ndx__section-title">Compensated Exposure</h3>
      <div class="ndx__result-main">
        <span class="ndx__result-label">Shutter Speed</span>
        <span class="ndx__result-value" data-bind="resultSS">--</span>
        <span class="ndx__result-badge" data-bind="bulbBadge" hidden>BULB</span>
      </div>
      <div class="ndx__result-shift" data-bind="shiftInfo"></div>
      <div class="ndx__result-ev">
        <span>EV <span data-bind="evBefore">--</span></span>
        <span class="ndx__result-ev-arrow">\u2192</span>
        <span>EV <span data-bind="evAfter">--</span></span>
      </div>
      <details class="ndx__alternatives">
        <summary>Alternative Compensation</summary>
        <div class="ndx__alt-item">
          <span class="ndx__alt-label">Aperture</span>
          <span class="ndx__alt-value" data-bind="altAperture">--</span>
          <span class="ndx__alt-warning" data-bind="apWarning" hidden>\u26A0 Limit</span>
        </div>
        <div class="ndx__alt-item">
          <span class="ndx__alt-label">ISO</span>
          <span class="ndx__alt-value" data-bind="altISO">--</span>
          <span class="ndx__alt-warning" data-bind="isoWarning" hidden>\u26A0 Limit</span>
        </div>
      </details>
    </section>
  </div>
</div>
`;
}

/**
 * @param {string} label
 * @param {string} action
 * @param {number} length
 * @param {function(number): string} displayAt
 * @param {number} defaultIdx
 * @returns {string}
 */
function paramSelect(label, action, length, displayAt, defaultIdx) {
	const id = `ndx-${action}`;
	let options = '';
	for (let i = 0; i < length; i++) {
		const selected = i === defaultIdx ? ' selected' : '';
		options += `<option value="${i}"${selected}>${displayAt(i)}</option>`;
	}
	return `
    <div class="ndx__param">
      <label class="ndx__label" for="${id}">${label}</label>
      <select id="${id}" class="ndx__select" data-action="${action}">${options}</select>
    </div>
  `;
}

/**
 * @param {string} label
 * @param {string} bindKey
 * @param {string} defaultValue
 * @returns {string}
 */
function filterInfoItem(label, bindKey, defaultValue) {
	return `
    <div class="ndx__filter-info-item">
      <dt>${label}</dt>
      <dd data-bind="${bindKey}">${defaultValue}</dd>
    </div>
  `;
}

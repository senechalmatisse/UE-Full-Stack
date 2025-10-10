import { describe, it, expect } from 'vitest';
import { datesConfig, type DatesConfig } from './dates.config';

describe('datesConfig', () => {
	it('should define the default locale as "fr-FR"', () => {
		// GIVEN the date configuration object
		const config = datesConfig;

		// WHEN accessing the locale property
		const locale = config.locale;

		// THEN it should equal "fr-FR"
		expect(locale).toBe('fr-FR');
	});

	it('should provide valid default date format options', () => {
		// GIVEN the default date format configuration
		const formatOptions = datesConfig.format;

		// WHEN inspecting the keys
		const keys = Object.keys(formatOptions);

		// THEN it should include "year", "month", and "day"
		expect(keys).toContain('year');
		expect(keys).toContain('month');
		expect(keys).toContain('day');

		// AND the values should match expected defaults
		expect(formatOptions.year).toBe('numeric');
		expect(formatOptions.month).toBe('long');
		expect(formatOptions.day).toBe('numeric');
	});

	it('should format a date correctly using the default config', () => {
		// GIVEN a known date and the configuration
		const date = new Date('2025-10-10');
		const formatter = new Intl.DateTimeFormat(datesConfig.locale, datesConfig.format);

		// WHEN formatting the date
		const formattedDate = formatter.format(date);

		// THEN it should produce a string consistent with the French locale
		// Example: "10 octobre 2025" (depending on system locale)
		expect(formattedDate).toMatch(/2025/);
		expect(formattedDate).toMatch(/10/);
	});

	it('should match the DatesConfig type structure', () => {
		// GIVEN the configuration object
		const config: DatesConfig = datesConfig;

		// WHEN checking its structure
		const hasLocale = typeof config.locale === 'string';
		const hasFormat = typeof config.format === 'object';

		// THEN both should be true
		expect(hasLocale).toBe(true);
		expect(hasFormat).toBe(true);
	});
});
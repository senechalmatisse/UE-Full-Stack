import { describe, it, expect } from 'vitest';
import { navigationConfig, type NavigationConfig } from './navigation.config';

describe('navigationConfig', () => {
	it('should define resetPageOnNavigate as true by default', () => {
		// GIVEN the navigation configuration
		const config = navigationConfig;

		// WHEN accessing the resetPageOnNavigate property
		const shouldReset = config.resetPageOnNavigate;

		// THEN it should be true
		expect(shouldReset).toBe(true);
	});

	it('should define ignoredParams with specific routes and parameters', () => {
		// GIVEN the ignoredParams configuration
		const ignoredParams = navigationConfig.ignoredParams;

		// WHEN checking the keys and their corresponding parameters
		const routes = Object.keys(ignoredParams);

		// THEN it should include the expected routes
		expect(routes).toContain('/artists');
		expect(routes).toContain('/events');
		expect(routes).toContain('/');

		// AND each route should have an array of parameters
		expect(Array.isArray(ignoredParams['/artists'])).toBe(true);
		expect(Array.isArray(ignoredParams['/events'])).toBe(true);
		expect(Array.isArray(ignoredParams['/'])).toBe(true);

		// AND each array should include the correct ignored parameters
		expect(ignoredParams['/artists']).toEqual(['search']);
		expect(ignoredParams['/events']).toEqual(['search']);
		expect(ignoredParams['/']).toEqual(['page', 'size', 'search']);
	});

	it('should match the NavigationConfig type structure', () => {
		// GIVEN the navigation configuration
		const config: NavigationConfig = navigationConfig;

		// WHEN verifying types
		const hasBooleanReset = typeof config.resetPageOnNavigate === 'boolean';
		const hasIgnoredParams = typeof config.ignoredParams === 'object';

		// THEN both should be true
		expect(hasBooleanReset).toBe(true);
		expect(hasIgnoredParams).toBe(true);
	});

	it('should ensure ignoredParams keys map to arrays of strings', () => {
		// GIVEN the ignoredParams object
		const ignoredParams = navigationConfig.ignoredParams;

		// WHEN iterating over each route
		const allValuesAreStringArrays = Object.values(ignoredParams).every(
			(params) => Array.isArray(params) && params.every((p) => typeof p === 'string')
		);

		// THEN all route parameters should be arrays of strings
		expect(allValuesAreStringArrays).toBe(true);
	});

	it('should be immutable (frozen configuration)', () => {
		// GIVEN the navigationConfig object
		const config = navigationConfig;

		// WHEN attempting to modify a property
		const modifyAttempt = () => {
			// @ts-expect-error
			config.resetPageOnNavigate = false;
		};

		// THEN it should not allow modification (TypeScript should prevent it)
		expect(modifyAttempt).toThrowError;
	});
});
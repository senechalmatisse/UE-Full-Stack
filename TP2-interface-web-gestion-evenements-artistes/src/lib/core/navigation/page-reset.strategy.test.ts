import { describe, it, expect } from 'vitest';
import type { NavigationConfig } from '../config/navigation.config';
import type { INavigationStrategy } from './navigation.strategy.interface';
import { PageResetStrategy } from './page-reset.strategy';

describe('PageResetStrategy', () => {
	const mockConfig: NavigationConfig = {
		resetPageOnNavigate: true,
		ignoredParams: {
			'/artists': ['search'],
			'/events': ['search'],
			'/': ['page', 'size', 'search'],
		},
	};

	it('should implement the INavigationStrategy interface', () => {
		// GIVEN an instance of PageResetStrategy
		const strategy: INavigationStrategy = new PageResetStrategy();

		// WHEN checking if the applyTo method exists
		const hasApplyTo = typeof strategy.applyTo === 'function';

		// THEN it should implement the interface contract
		expect(hasApplyTo).toBe(true);
	});

	it('should reset page parameter to 1 when navigating to a different route', () => {
		// GIVEN initial search parameters and different current/target paths
		const searchParams = new URLSearchParams({ page: '3', search: 'rock' });
		const currentPath = '/artists';
		const targetPath = '/events';
		const strategy = new PageResetStrategy();

		// WHEN applying the strategy
		const result = strategy.applyTo(searchParams, currentPath, targetPath, mockConfig);

		// THEN the "page" parameter should be reset to "1"
		expect(result.get('page')).toBe('1');
	});

	it('should not modify the page parameter when navigating to the same route', () => {
		// GIVEN identical current and target paths
		const searchParams = new URLSearchParams({ page: '2' });
		const strategy = new PageResetStrategy();

		// WHEN applying the strategy with same path
		const result = strategy.applyTo(searchParams, '/artists', '/artists', mockConfig);

		// THEN the "page" parameter should remain unchanged
		expect(result.get('page')).toBe('2');
	});

	it('should respect config when resetPageOnNavigate is disabled', () => {
		// GIVEN a configuration with resetPageOnNavigate = false
		const customConfig: NavigationConfig = {
			...mockConfig,
			resetPageOnNavigate: false,
		};
		const searchParams = new URLSearchParams({ page: '5' });
		const strategy = new PageResetStrategy();

		// WHEN applying the strategy
		const result = strategy.applyTo(searchParams, '/artists', '/events', customConfig);

		// THEN the "page" parameter should not be reset
		expect(result.get('page')).toBe('5');
	});
});
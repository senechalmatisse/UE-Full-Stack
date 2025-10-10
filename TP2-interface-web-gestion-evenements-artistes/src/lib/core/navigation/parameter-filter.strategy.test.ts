import { describe, it, expect } from 'vitest';
import type { INavigationStrategy } from './navigation.strategy.interface';
import type { NavigationConfig } from '../config/navigation.config';
import { ParameterFilterStrategy } from './parameter-filter.strategy';

describe('ParameterFilterStrategy', () => {
	const mockConfig: NavigationConfig = {
		resetPageOnNavigate: true,
		ignoredParams: {
			'/artists': ['search'],
			'/events': ['search'],
			'/': ['page', 'size', 'search'],
		},
	};

	it('should implement the INavigationStrategy interface', () => {
		// GIVEN an instance of ParameterFilterStrategy
		const strategy: INavigationStrategy = new ParameterFilterStrategy();

		// WHEN checking if the applyTo method exists
		const hasApplyTo = typeof strategy.applyTo === 'function';

		// THEN it should implement the interface contract
		expect(hasApplyTo).toBe(true);
	});

	it('should remove ignored parameters for a target route', () => {
		// GIVEN search parameters containing ignored and non-ignored params
		const searchParams = new URLSearchParams({
			search: 'jazz',
			page: '2',
			sort: 'asc',
		});
		const strategy = new ParameterFilterStrategy();

		// WHEN applying to the "/artists" route
		const result = strategy.applyTo(searchParams, '/events', '/artists', mockConfig);

		// THEN it should remove "search" and keep other parameters
		expect(result.get('search')).toBeNull();
		expect(result.get('page')).toBe('2');
		expect(result.get('sort')).toBe('asc');
	});

	it('should remove all configured ignored parameters for the root route "/"', () => {
		// GIVEN parameters that match ignored ones for "/"
		const searchParams = new URLSearchParams({
			page: '3',
			size: '10',
			search: 'rock',
			sort: 'asc',
		});
		const strategy = new ParameterFilterStrategy();

		// WHEN applying the strategy for "/"
		const result = strategy.applyTo(searchParams, '/artists', '/', mockConfig);

		// THEN all ignored parameters should be removed
		expect(result.get('page')).toBeNull();
		expect(result.get('size')).toBeNull();
		expect(result.get('search')).toBeNull();
		expect(result.get('sort')).toBe('asc');
	});

    it('should not remove any parameters if the route is not defined in ignoredParams (testing ?? [])', () => {
    	// GIVEN a NavigationConfig that does not include the target route
        const searchParams = new URLSearchParams({
            category: 'music',
            search: 'rock',
            page: '2',
        });
        const strategy = new ParameterFilterStrategy();

	    // WHEN applying the strategy for an unknown route
        const result = strategy.applyTo(
            searchParams,
            '/artists',
            '/no-ignore' as unknown as keyof NavigationConfig['ignoredParams'],
            mockConfig
        );

    	// THEN since ignoredParams['/no-ignore'] is undefined,
        expect(result.get('category')).toBe('music');
        expect(result.get('search')).toBe('rock');
        expect(result.get('page')).toBe('2');
    });
});
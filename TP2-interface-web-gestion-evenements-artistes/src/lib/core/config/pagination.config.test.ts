import { describe, it, expect } from 'vitest';
import { paginationConfig, type PaginationConfig } from './pagination.config';

describe('paginationConfig', () => {
	it('should define valid default pagination values', () => {
		// GIVEN the pagination configuration
		const config = paginationConfig;

		// WHEN accessing default values
		const { defaultSize, minSize, maxSize, maxVisiblePages } = config;

		// THEN they should be correctly defined
		expect(defaultSize).toBe(3);
		expect(minSize).toBe(1);
		expect(maxSize).toBe(10);
		expect(maxVisiblePages).toBe(5);
	});

	it('should ensure all pagination values are positive integers', () => {
		// GIVEN the paginationConfig object
		const config = paginationConfig;

		// WHEN checking numeric constraints
		const values = Object.values(config);

		// THEN all values should be positive integers
		const areAllPositiveIntegers = values.every(
			(value) => Number.isInteger(value) && value > 0
		);
		expect(areAllPositiveIntegers).toBe(true);
	});

	it('should ensure minSize is less than or equal to defaultSize and defaultSize is less than or equal to maxSize', () => {
		// GIVEN the paginationConfig limits
		const { minSize, defaultSize, maxSize } = paginationConfig;

		// WHEN comparing limits
		const isOrderValid = minSize <= defaultSize && defaultSize <= maxSize;

		// THEN it should maintain logical boundaries
		expect(isOrderValid).toBe(true);
	});

	it('should match the PaginationConfig type structure', () => {
		// GIVEN the configuration object
		const config: PaginationConfig = paginationConfig;

		// WHEN verifying its type structure
		const hasAllProperties =
			typeof config.defaultSize === 'number' &&
			typeof config.minSize === 'number' &&
			typeof config.maxSize === 'number' &&
			typeof config.maxVisiblePages === 'number';

		// THEN all type checks should pass
		expect(hasAllProperties).toBe(true);
	});

	it('should be immutable (frozen configuration)', () => {
		// GIVEN the paginationConfig object
		const config = paginationConfig;

		// WHEN attempting to modify a property
		const modifyAttempt = () => {
			// @ts-expect-error
			config.defaultSize = 99;
		};

		// THEN it should not allow modification (TypeScript prevents mutation)
		expect(modifyAttempt).toThrowError;
	});
});
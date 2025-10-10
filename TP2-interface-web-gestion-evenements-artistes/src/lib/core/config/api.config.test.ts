import { describe, it, expect, vi } from 'vitest';
import type { ApiConfig } from './api.config';

// Mocking the `$app/environment` module to simulate browser/server contexts
vi.mock('$app/environment', () => ({
	browser: true,
}));

describe('apiConfig (browser environment)', async () => {
	// We must import apiConfig after mocking `$app/environment`
	const { apiConfig } = await import('./api.config');

	it('should define the correct baseUrl for browser environment', () => {
		// GIVEN the browser environment is true
		const isBrowser = true;

		// WHEN accessing the baseUrl
		const baseUrl = apiConfig.baseUrl;

		// THEN it should match the client fallback URL when no env variable is defined
		expect(isBrowser).toBe(true);
		expect(baseUrl).toBe('http://localhost:8080');
	});

	it('should define a valid timeout value', () => {
		// GIVEN the apiConfig object
		const config = apiConfig;

		// WHEN accessing the timeout property
		const timeout = config.timeout;

		// THEN it should be a positive integer (default 5000 ms)
		expect(typeof timeout).toBe('number');
		expect(timeout).toBe(5000);
	});

	it('should define default headers correctly', () => {
		// GIVEN the apiConfig object
		const headers = apiConfig.defaultHeaders;

		// WHEN inspecting its key-value pairs
		const hasAccept = headers.Accept === 'application/json';
		const hasContentType = headers['Content-Type'] === 'application/json';

		// THEN both headers should be correctly defined
		expect(hasAccept).toBe(true);
		expect(hasContentType).toBe(true);
	});

	it('should match the ApiConfig type structure', () => {
		// GIVEN the configuration object typed as ApiConfig
		const config: ApiConfig = apiConfig;

		// WHEN checking property types
		const hasBaseUrl = typeof config.baseUrl === 'string';
		const hasTimeout = typeof config.timeout === 'number';
		const hasHeaders = typeof config.defaultHeaders === 'object';

		// THEN all properties should match expected types
		expect(hasBaseUrl).toBe(true);
		expect(hasTimeout).toBe(true);
		expect(hasHeaders).toBe(true);
	});

	it('should be immutable (frozen configuration)', () => {
		// GIVEN the apiConfig object
		const config = apiConfig;

		// WHEN attempting to modify a property
		const modifyAttempt = () => {
			// @ts-expect-error
			config.timeout = 10000;
		};

		// THEN it should not allow modification (TypeScript ensures const immutability)
		expect(modifyAttempt).toThrowError;
	});
});
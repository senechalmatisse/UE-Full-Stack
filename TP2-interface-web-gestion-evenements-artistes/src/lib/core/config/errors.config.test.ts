import { describe, it, expect } from 'vitest';
import { errorsConfig, type ErrorsConfig } from './errors.config';

describe('errorsConfig', () => {
	it('should define all expected error messages', () => {
		// GIVEN the error configuration object
		const { messages } = errorsConfig;

		// WHEN checking the available message keys
		const messageKeys = Object.keys(messages);

		// THEN it should include all expected error message identifiers
		expect(messageKeys).toEqual([
			'network',
			'timeout',
			'server',
			'notFound',
			'generic'
		]);

		// AND each message should be a non-empty string
		for (const key of messageKeys) {
			expect(messages[key as keyof typeof messages]).toBeTypeOf('string');
			expect(messages[key as keyof typeof messages].length).toBeGreaterThan(0);
		}
	});

	it('should map HTTP codes to their correct colors', () => {
		// GIVEN the error color configuration
		const { colors } = errorsConfig;

		// WHEN inspecting the mapping
		const knownCodes = [404, 500, 401, 403, 503];

		// THEN each known code should have a defined color
		for (const code of knownCodes) {
			expect(colors[code]).toBeDefined();
			expect(typeof colors[code]).toBe('string');
		}

		// AND specific color expectations
		expect(colors[404]).toBe('darkorange');
		expect(colors[500]).toBe('crimson');
		expect(colors[401]).toBe('royalblue');
		expect(colors[403]).toBe('darkred');
		expect(colors[503]).toBe('darkviolet');
	});

	it('should map HTTP codes to correct message keys', () => {
		// GIVEN the error mapping configuration
		const { map, messages } = errorsConfig;

		// WHEN checking known mappings
		const httpToMessage = {
			404: 'notFound',
			500: 'server',
			408: 'timeout',
			503: 'network'
		};

		// THEN the mapping should match the expected structure
		expect(map).toEqual(httpToMessage);

		// AND all mapped keys should exist in messages
		for (const key of Object.values(map)) {
			expect(messages[key]).toBeDefined();
		}
	});

	it('should conform to the ErrorsConfig type structure', () => {
		// GIVEN the configuration object
		const config: ErrorsConfig = errorsConfig;

		// WHEN checking the presence of required properties
		const hasMessages = typeof config.messages === 'object';
		const hasColors = typeof config.colors === 'object';
		const hasMap = typeof config.map === 'object';

		// THEN all should be true
		expect(hasMessages).toBe(true);
		expect(hasColors).toBe(true);
		expect(hasMap).toBe(true);
	});

	it('should return the correct message key for a given HTTP code', () => {
		// GIVEN a known HTTP code
		const code = 500;

		// WHEN retrieving the message key
		const key = errorsConfig.map[code];

		// THEN the key should correspond to "server"
		expect(key).toBe('server');

		// AND the associated message should be valid
		expect(errorsConfig.messages[key]).toBe('Erreur serveur. Veuillez réessayer plus tard.');
	});
});
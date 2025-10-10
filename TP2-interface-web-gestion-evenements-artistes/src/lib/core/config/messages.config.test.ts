import { describe, it, expect } from 'vitest';
import { messagesConfig, type MessagesConfig } from './messages.config';

describe('messagesConfig', () => {
	it('should define all top-level message properties', () => {
		// GIVEN the messages configuration
		const { loading, empty, defaults } = messagesConfig;

		// WHEN checking their types
		const areStrings = typeof loading === 'string' && typeof empty === 'string';

		// THEN they should be defined and of type string
		expect(areStrings).toBe(true);
		expect(loading).toBe('Chargement...');
		expect(empty).toBe('Aucun ressource trouvée.');
		expect(defaults).toBeDefined();
	});

	it('should define all default labels inside defaults object', () => {
		// GIVEN the defaults section of messagesConfig
		const { defaults } = messagesConfig;

		// WHEN checking each default label
		const { artistLabel, eventLabel } = defaults;

		// THEN they should match expected French messages
		expect(artistLabel).toBe('Artiste inconnu(e)');
		expect(eventLabel).toBe('Événement sans titre');

		// AND both should be strings
		expect(typeof artistLabel).toBe('string');
		expect(typeof eventLabel).toBe('string');
	});

	it('should conform to the MessagesConfig type structure', () => {
		// GIVEN the configuration object
		const config: MessagesConfig = messagesConfig;

		// WHEN checking the presence and types of fields
		const hasLoading = typeof config.loading === 'string';
		const hasEmpty = typeof config.empty === 'string';
		const hasDefaults = typeof config.defaults === 'object';

		// THEN all should be true
		expect(hasLoading).toBe(true);
		expect(hasEmpty).toBe(true);
		expect(hasDefaults).toBe(true);

		// AND defaults should contain expected keys
		expect(Object.keys(config.defaults)).toEqual(['artistLabel', 'eventLabel']);
	});

	it('should return valid messages when accessed dynamically', () => {
		// GIVEN a dynamic key access
		const key: keyof MessagesConfig = 'loading';

		// WHEN accessing the message using the key
		const message = messagesConfig[key];

		// THEN the returned value should match the expected message
		expect(message).toBe('Chargement...');
	});

	it('should be immutable (frozen configuration)', () => {
		// GIVEN the messagesConfig object
		const config = messagesConfig;

		// WHEN attempting to modify a property
		const modifyAttempt = () => {
			// @ts-expect-error
			config.loading = 'Modified';
		};

		// THEN it should not allow modification in TypeScript
		expect(modifyAttempt).toThrowError;
	});
});
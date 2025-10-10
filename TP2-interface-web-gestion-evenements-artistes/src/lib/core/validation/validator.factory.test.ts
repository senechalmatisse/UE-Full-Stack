import { getDataValidator, getPaginationValidator } from './validator.factory';
import { setAppConfig } from '../config';
import { defaultAppConfig } from '../config';

describe('ValidatorsSingletons', () => {
    beforeEach(() => {
        // GIVEN a default app configuration
        setAppConfig(defaultAppConfig);
    });

    describe('getPaginationValidator', () => {
        it('shouldReturnSingletonInstance', () => {
            // GIVEN two calls to getPaginationValidator
            const validator1 = getPaginationValidator();
            const validator2 = getPaginationValidator();

            // THEN both instances should be identical (singleton)
            expect(validator1).toBe(validator2);
            expect(typeof validator1.validate).toBe('function');
            expect(typeof validator1.toApiPage).toBe('function');
            expect(typeof validator1.fromApiPage).toBe('function');
        });

        it('shouldValidatePaginationParamsAccordingToConfig', () => {
            // GIVEN minSize=1, maxSize=100, defaultSize=10 from config
            const validator = getPaginationValidator();

            // WHEN validating null page and size
            const result = validator.validate(null, null);

            // THEN page should default to 1 and size to defaultSize
            expect(result.page).toBe(defaultAppConfig.pagination.defaultSize > 0 ? 1 : defaultAppConfig.pagination.defaultSize);
            expect(result.size).toBe(defaultAppConfig.pagination.defaultSize);
        });
    });

    describe('getDataValidator', () => {
        it('shouldReturnSingletonInstance', () => {
            // GIVEN two calls to getDataValidator
            const validator1 = getDataValidator();
            const validator2 = getDataValidator();

            // THEN both instances should be identical (singleton)
            expect(validator1).toBe(validator2);
            expect(typeof validator1.validatePaginatedResponse).toBe('function');
            expect(typeof validator1.sanitizeString).toBe('function');
            expect(typeof validator1.sanitizeNumber).toBe('function');
            expect(typeof validator1.sanitizeBoolean).toBe('function');
        });

        it('shouldSanitizeStringWithFallbackFromConfig', () => {
            // GIVEN a DataValidator instance
            const validator = getDataValidator();

            // WHEN sanitizing null value
            const result = validator.sanitizeString(null);

            // THEN the result should equal the fallback from config
            expect(result).toBe(defaultAppConfig.messages.empty);
        });

        it('shouldSanitizeNumberAndBooleanCorrectly', () => {
            // GIVEN a DataValidator instance
            const validator = getDataValidator();

            // WHEN sanitizing numeric and boolean values
            expect(validator.sanitizeNumber('42')).toBe(42);
            expect(validator.sanitizeNumber('invalid', 7)).toBe(7);
            expect(validator.sanitizeBoolean(0)).toBe(false);
            expect(validator.sanitizeBoolean(1)).toBe(true);
        });
    });
});
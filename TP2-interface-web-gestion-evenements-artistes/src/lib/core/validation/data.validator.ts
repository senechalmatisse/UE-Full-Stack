import type { IDataValidator } from "./data-validator.interface";

/**
 * Implementation of {@link IDataValidator}.
 *
 * Provides runtime validation for paginated API responses and
 * sanitization utilities for string, number, and boolean types.
 */
export class DataValidator implements IDataValidator {
    /**
     * Creates a new {@link DataValidator}.
     *
     * @param emptyFallback - Fallback string used when sanitizing empty or nullish values (default: `""`).
     */
    constructor(private readonly emptyFallback: string = '') {}

    /** @inheritdoc */
    validatePaginatedResponse<T>(data: any): data is {
        content: T[];
        totalElements: number;
        totalPages: number;
        number: number;
        size: number;
        first: boolean;
        last: boolean;
    } {
        return (
            data &&
            typeof data === 'object' &&
            Array.isArray(data.content) &&
            typeof data.totalElements === 'number' &&
            typeof data.totalPages === 'number' &&
            typeof data.number === 'number' &&
            typeof data.size === 'number' &&
            typeof data.first === 'boolean' &&
            typeof data.last === 'boolean'
        );
    }

    /** @inheritdoc */
    sanitizeString(value: any, fallback = this.emptyFallback): string {
        return String(value ?? fallback);
    }

    /** @inheritdoc */
    sanitizeNumber(value: any, fallback = 0): number {
        return Number.isFinite(Number(value)) ? Number(value) : fallback;
    }

    /** @inheritdoc */
    sanitizeBoolean(value: any): boolean {
        return Boolean(value);
    }
}
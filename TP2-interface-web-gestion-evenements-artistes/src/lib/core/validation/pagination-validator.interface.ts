import type { PaginationParams } from '../pagination';

/**
 * Interface defining validation and normalization rules
 * for pagination parameters.
 *
 * Provides methods for validating query parameters and
 * converting between client-side and API pagination indexes.
 */
export interface IPaginationValidator {
    /**
     * Validates and normalizes pagination parameters
     * from raw query string values.
     *
     * @param pageParam - The raw page parameter (string or null).
     * @param sizeParam - The raw size parameter (string or null).
     * @returns A normalized {@link PaginationParams} object.
     */
    validate(pageParam: string | null, sizeParam: string | null): PaginationParams;

    /**
     * Converts a client-side (1-indexed) page number
     * to an API-compatible (0-indexed) page number.
     *
     * @param page - The client page number (≥ 1).
     * @returns The API page number (≥ 0).
     */
    toApiPage(page: number): number;

    /**
     * Converts an API (0-indexed) page number
     * to a client-side (1-indexed) page number.
     *
     * @param apiPage - The API page number (≥ 0).
     * @returns The client page number (≥ 1).
     */
    fromApiPage(apiPage: number): number;
}
import type { PaginationParams } from '$lib/types/pagination';
import type { IPaginationValidator } from './interfaces';

/**
 * Validator for pagination parameters.
 *
 * Ensures that `page` and `size` parameters fall within valid ranges,
 * and provides conversion utilities between client (1-indexed) and
 * API (0-indexed) pagination systems.
 */
export class PaginationValidator implements IPaginationValidator {

	/**
	 * Creates a new PaginationValidator instance.
	 *
	 * @param minSize - Minimum allowed page size (default: 1).
	 * @param maxSize - Maximum allowed page size (default: 10).
	 * @param defaultSize - Default allowed page size (default: 3).
	 */
    constructor(
        private readonly minSize: number,
        private readonly maxSize: number,
        private readonly defaultSize: number
    ) {}

	/**
	 * Validates and normalizes pagination parameters.
	 *
	 * - Ensures the page number is at least 1.
	 * - Ensures the page size is between `minSize` and `maxSize`.
	 *
	 * @param pageParam - Raw page parameter (string or null).
	 * @param sizeParam - Raw size parameter (string or null).
	 * @returns Normalized pagination parameters.
	 */
    validate(
        pageParam: string | null,
        sizeParam: string | null
    ): PaginationParams {
        const page = Math.max(1, Number(pageParam) || 1);
        const size = Math.min(
            this.maxSize,
            Math.max(this.minSize, Number(sizeParam) || this.defaultSize)
        );

        return { page, size };
    }

	/**
	 * Converts a client-side page number (1-indexed)
	 * into an API-compatible page number (0-indexed).
	 *
	 * @param page - Client page number (>= 1).
	 * @returns API page number (>= 0).
	 */
    toApiPage(page: number): number {
        return Math.max(0, page - 1);
    }

	/**
	 * Converts an API page number (0-indexed)
	 * into a client-side page number (1-indexed).
	 *
	 * @param apiPage - API page number (>= 0).
	 * @returns Client page number (>= 1).
	 */
    fromApiPage(apiPage: number): number {
        return Math.max(1, apiPage + 1);
    }
}
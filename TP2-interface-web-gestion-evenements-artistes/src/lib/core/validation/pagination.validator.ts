import type { PaginationParams } from '../pagination';
import type { IPaginationValidator } from './pagination-validator.interface';

/**
 * Default implementation of {@link IPaginationValidator}.
 *
 * Enforces minimum and maximum page sizes and provides
 * utilities for index conversion between client and API layers.
 */
export class PaginationValidator implements IPaginationValidator {
    /**
     * Creates a new {@link PaginationValidator}.
     *
     * @param minSize - The minimum allowed page size.
     * @param maxSize - The maximum allowed page size.
     * @param defaultSize - The default page size used when none is specified.
     */
    constructor(
        private readonly minSize: number,
        private readonly maxSize: number,
        private readonly defaultSize: number
    ) {}

    /** @inheritdoc */
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

    /** @inheritdoc */
    toApiPage(page: number): number {
        return Math.max(0, page - 1);
    }

    /** @inheritdoc */
    fromApiPage(apiPage: number): number {
        return Math.max(1, apiPage + 1);
    }
}
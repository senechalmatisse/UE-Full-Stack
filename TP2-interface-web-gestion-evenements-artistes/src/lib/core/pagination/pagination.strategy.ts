import type { IPaginationStrategy } from "./pagination.strategy.interface";

/**
 * @displayName DefaultPaginationStrategy
 * @public
 *
 * Default implementation of the classic pagination strategy.
 *
 * Shows a balanced range of page numbers centered around the current page
 * (when possible), ensuring no overflow beyond total pages.
 */
export class DefaultPaginationStrategy implements IPaginationStrategy {
    getVisiblePages(currentPage: number, totalPages: number, maxVisible: number): number[] {
        if (totalPages <= maxVisible) {
            return Array.from({ length: totalPages }, (_, i) => i + 1);
        }

        const start = Math.max(1, currentPage - Math.floor(maxVisible / 2));
        const end = Math.min(totalPages, start + maxVisible - 1);
        const adjustedStart = Math.max(1, end - maxVisible + 1);

        return Array.from({ length: end - adjustedStart + 1 }, (_, i) => adjustedStart + i);
    }
}
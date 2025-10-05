import type { IPaginationConfigProvider } from "./pagination.config-provider.interface";
import type { IPaginationStrategy } from "./pagination.strategy.interface";
import { DefaultPaginationStrategy } from "./pagination.strategy";

/**
 * @displayName PaginationUtils
 * @public
 *
 * High-level utility for managing pagination display logic.
 *
 * Combines a configuration provider and a pagination strategy
 * to compute visible pages and generate display information.
 */
export class PaginationUtils {
    constructor(
        private configProvider: IPaginationConfigProvider,
        private strategy: IPaginationStrategy = new DefaultPaginationStrategy()
    ) {}

    /**
     * Computes which page numbers should be visible in pagination UI.
     *
     * @param currentPage - The currently selected page.
     * @param totalPages - Total number of pages.
     * @returns A list of page numbers to display.
     */
    getVisiblePages(currentPage: number, totalPages: number): number[] {
        const maxVisible = this.configProvider.getMaxVisiblePages();
        return this.strategy.getVisiblePages(currentPage, totalPages, maxVisible);
    }

    /**
     * Generates a human-readable pagination summary string.
     *
     * @param page - The current page number.
     * @param totalPages - Total number of pages.
     * @returns A formatted string, e.g., `"Page 2 sur 5"`.
     */
    getPaginationInfo(page: number, totalPages: number): string {
        return `Page ${page} sur ${totalPages}`;
    }
}
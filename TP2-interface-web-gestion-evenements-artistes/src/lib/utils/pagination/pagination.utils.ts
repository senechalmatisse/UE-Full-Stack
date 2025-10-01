import type { PaginationConfigProvider } from "./pagination.config-provider";
import {
    DefaultPaginationStrategy,
    type PaginationStrategy
} from "./pagination.strategy";

/**
 * Utilitaire de pagination 100% SOLID.
 * Dépend uniquement d’abstractions (provider + stratégie).
 */
export class PaginationUtils {
	constructor(
		private configProvider: PaginationConfigProvider,
		private strategy: PaginationStrategy = new DefaultPaginationStrategy()
	) {}

	getVisiblePages(currentPage: number, totalPages: number): number[] {
		const maxVisible = this.configProvider.getMaxVisiblePages();
		return this.strategy.getVisiblePages(currentPage, totalPages, maxVisible);
	}

	/**
	 * Generates a human-readable pagination info string.
	 *
	 * @param page - The current page number.
	 * @param totalPages - The total number of pages available.
	 * @returns A string in the format: `"Page X sur Y"`.
	 */
	getPaginationInfo(page: number, totalPages: number): string {
		return `Page ${page} sur ${totalPages}`;
	}
}
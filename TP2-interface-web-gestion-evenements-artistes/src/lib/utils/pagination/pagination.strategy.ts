/**
 * Stratégie d’affichage des pages visibles.
 * Permet de varier les algorithmes (ex: pagination classique, progressive, infinie...).
 */
export interface PaginationStrategy {
    getVisiblePages(currentPage: number, totalPages: number, maxVisible: number): number[];
}

/**
 * Implémentation par défaut de la stratégie classique.
 */
export class DefaultPaginationStrategy implements PaginationStrategy {
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
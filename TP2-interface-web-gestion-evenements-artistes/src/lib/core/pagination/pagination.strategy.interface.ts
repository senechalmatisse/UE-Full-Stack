/**
 * @displayName IPaginationStrategy
 * @public
 *
 * Abstraction for pagination visibility algorithms.
 *
 * Each strategy defines how visible page numbers are determined
 * (e.g., classic, progressive, infinite scroll, etc.).
 */
export interface IPaginationStrategy {
    /**
     * Calculates which page numbers should be visible in pagination controls.
     *
     * @param currentPage - The current page number.
     * @param totalPages - The total number of pages available.
     * @param maxVisible - The maximum number of visible pages allowed.
     * @returns An array of page numbers to display.
     */
    getVisiblePages(
        currentPage: number,
        totalPages: number,
        maxVisible: number
    ): number[];
}
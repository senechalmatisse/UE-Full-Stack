/**
 * @displayName IPaginationConfigProvider
 * @public
 *
 * Abstraction for retrieving pagination configuration values.
 *
 * Enables flexibility by decoupling pagination logic from the
 * configuration source (e.g., global config, API, environment variable).
 */
export interface IPaginationConfigProvider {
    /**
     * Returns the maximum number of visible pages allowed in pagination.
     *
     * @returns The maximum number of visible pages.
     */
    getMaxVisiblePages(): number;
}
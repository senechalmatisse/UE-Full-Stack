/**
 * @displayName IUrlBuilder
 * @public
 *
 * Defines the contract for URL builder classes.
 *
 * Implementations should take the current URL context and
 * return a new formatted navigation URL.
 */
export interface IUrlBuilder {
    /**
     * Builds a new navigable URL string based on the target path and current URL.
     *
     * @param targetPath - Destination route path.
     * @param currentUrl - Current full URL (including query parameters).
     * @returns The final formatted URL string.
     */
    build(targetPath: string, currentUrl: URL): string;
}
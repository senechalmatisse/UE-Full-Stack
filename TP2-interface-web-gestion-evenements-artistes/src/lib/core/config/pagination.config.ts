/**
 * Pagination configuration.
 *
 * Defines defaults and validation limits for paginated API requests.
 */
export const paginationConfig = {
	/** Default number of items per page. */
    defaultSize: 3,

	/** Minimum number of items per page. */
    minSize: 1,

	/** Maximum number of items per page. */
    maxSize: 10,

	/** Maximum number of visible pagination buttons. */
    maxVisiblePages: 5,
} as const;

/**
 * Type alias for the application configuration.
 *
 * Useful for dependency injection or typing configuration consumers.
 */
export type PaginationConfig = typeof paginationConfig;
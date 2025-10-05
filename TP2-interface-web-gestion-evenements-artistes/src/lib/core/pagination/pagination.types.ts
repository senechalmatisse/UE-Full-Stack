/** 
 * @displayName PaginationParams
 * @public
 *
 * Represents query parameters used in paginated API requests.
 */
export interface PaginationParams {
	/** The current page number (1-based). */
	page: number;

	/** The number of items per page. */
	size: number;

	/** Optional search query string to filter results. */
    search?: string;
}

/**
 * @displayName PaginatedResponse
 * @public
 *
 * Generic structure for paginated API responses.
 *
 * @template T The entity type being paginated.
 */
export interface PaginatedResponse<T> {
	/** The items of the current page. */
	content: T[];

	/** The total number of elements available across all pages. */
	totalElements: number;

	/** The total number of pages available. */
	totalPages: number;

    /** The current page index (0-based, from backend). */
	number: number;

	/** The requested page size. */
	size: number;

	/** Whether this is the first page. */
	first: boolean;

	/** Whether this is the last page. */
	last: boolean;
}

/**
 * @displayName PaginationState
 * @public
 *
 * Normalized client-side pagination state used by UI components.
 */
export interface PaginationState {
	/** The current page number (1-based). */
	page: number;

	/** The total number of pages available. */
	totalPages: number;

	/** Whether this is the first page. */
	first: boolean;

	/** Whether this is the last page. */
	last: boolean;

	/** The total number of elements available. */
	totalElements: number;

	/** The number of items per page. */
	size: number;
}
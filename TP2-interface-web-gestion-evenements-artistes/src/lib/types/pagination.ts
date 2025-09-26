/** Generic parameters for pagination requests. */
export interface PaginationParams {
	/** The current page number (1-based). */
	page: number;
	/** The number of items per page. */
	size: number;
	search?: string;
}

/**
 * Generic structure for paginated API responses.
 * 
 * @template T The type of content being paginated.
 */
export interface PaginatedResponse<T> {
	/** The items of the current page. */
	content: T[];
	/** The total number of elements available. */
	totalElements: number;
	/** The total number of pages available. */
	totalPages: number;
	/** The current page index (0-based, as usually returned by APIs). */
	number: number;
	/** The requested page size. */
	size: number;
	/** Whether this is the first page. */
	first: boolean;
	/** Whether this is the last page. */
	last: boolean;
}

/**
 * Normalized state for pagination in the client-side application.
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

/**
 * Represents an artist associated with an event.
 */
export interface Artist {
	/** Unique identifier of the artist. */
	id: string;
	/** Display name of the artist. */
	label: string;
}

/**
 * Represents a cultural or music event.
 */
export interface Event {
	/** Unique identifier of the event. */
	id: string;
	/** Display name of the event. */
	label: string;
	/** ISO-8601 string representing the start date of the event. */
	startDate: string;
	/** ISO-8601 string representing the end date of the event. */
	endDate: string;
	/** List of artists associated with the event. */
	artists: Artist[];
}

/**
 * Configuration options for API connections.
 */
export interface ApiConfig {
	/** Base URL of the API. */
	baseUrl: string;
	/** Optional request timeout in milliseconds. */
	timeout?: number;
	/** Default headers applied to all requests. */
	defaultHeaders?: Record<string, string>;
}

/**
 * Generic interface for services that fetch data from an API.
 *
 * @template T The type of entity managed by the service.
 */
export interface DataService<T> {
	/**
	 * Fetches a paginated set of resources from the given API endpoint.
	 *
	 * @param endpoint The API endpoint to fetch from.
	 * @param params Pagination parameters.
	 * @returns A promise resolving to a paginated response of type T.
	 */
	fetchPaginated(endpoint: string, params: PaginationParams): Promise<PaginatedResponse<T>>;
}

/**
 * Represents the loading and error state of a component.
 */
export interface LoadingState {
	/** Whether the component is currently loading. */
	isLoading: boolean;
	/** Error message if an error occurred, otherwise null. */
	error: string | null;
}

/**
 * Options for configuring a date formatter.
 */
export interface DateFormatterOptions {
	/** The locale used for formatting (e.g., "fr-FR"). */
	locale: string;
	/** Intl options for customizing date output. */
	options: Intl.DateTimeFormatOptions;
}
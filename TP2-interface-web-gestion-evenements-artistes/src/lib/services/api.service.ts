import { error } from '@sveltejs/kit';
import type { 
	ApiConfig, 
	DataService, 
	PaginatedResponse, 
	PaginationParams 
} from '../types/pagination';
import { DataValidator } from '../utils/validation';

/**
 * Generic API service implementing the Repository pattern.
 *
 * Provides an abstraction layer for fetching paginated data
 * from an external API with built-in validation, error handling,
 * and timeout management.
 *
 * @template T - The type of entity managed by the service.
 */
export class ApiService<T> implements DataService<T> {
	private config: ApiConfig;

	/**
	 * Creates a new ApiService instance.
	 *
	 * @param config - API configuration including base URL, headers, and timeout.
	 */
	constructor(config: ApiConfig) {
		this.config = {
			timeout: 5000,
			defaultHeaders: {
				'Accept': 'application/json',
				'Content-Type': 'application/json'
			},
			...config
		};
	}

	/**
	 * Fetches paginated data from the API.
	 *
	 * @param endpoint - The API endpoint (relative to the base URL).
	 * @param params - Pagination parameters (page and size).
	 * @returns A paginated response containing items of type T.
	 *
	 * @throws {Error} If the request fails or the response structure is invalid.
	 */
	async fetchPaginated(endpoint: string, params: PaginationParams): Promise<PaginatedResponse<T>> {
		const url = this.buildUrl(endpoint, params);
		
		try {
			const response = await this.makeRequest(url);
			const data = await response.json();
			
			this.validateResponse(data);
			return data as PaginatedResponse<T>;
			
		} catch (err) {
			this.handleError(err);
		}
	}

	/**
	 * Builds the full request URL with pagination parameters.
	 *
	 * @param endpoint - The API endpoint.
	 * @param params - Pagination parameters.
	 * @returns A fully constructed URL string.
	 */
	private buildUrl(endpoint: string, params: PaginationParams): string {
		const baseUrl = this.config.baseUrl.replace(/\/$/, '');
		const cleanEndpoint = endpoint.replace(/^\//, '');
		
		const searchParams = new URLSearchParams({
			page: params.page.toString(),
			size: params.size.toString()
		});

		return `${baseUrl}/${cleanEndpoint}?${searchParams}`;
	}

	/**
	 * Executes the HTTP request with timeout handling.
	 *
	 * @param url - The full request URL.
	 * @returns A Response object if successful.
	 *
	 * @throws {Error} If the request fails or times out.
	 */
	private async makeRequest(url: string): Promise<Response> {
		const controller = new AbortController();
		const timeoutId = setTimeout(() => controller.abort(), this.config.timeout);

		try {
			const response = await fetch(url, {
				headers: this.config.defaultHeaders,
				signal: controller.signal
			});

			clearTimeout(timeoutId);

			if (!response.ok) {
				throw new Error(`HTTP ${response.status}: ${response.statusText}`);
			}

			return response;
		} catch (err) {
			clearTimeout(timeoutId);
			throw err;
		}
	}

	/**
	 * Validates the API response structure.
	 *
	 * @param data - The raw response data.
	 * @throws {Error} If the response does not match the expected structure.
	 */
	private validateResponse(data: any): void {
		if (!DataValidator.validatePaginatedResponse(data)) {
			throw new Error('Invalid API response structure');
		}
	}

	/**
	 * Handles API errors and maps them to appropriate SvelteKit errors.
	 *
	 * @param err - The error to handle.
	 * @throws {import('@sveltejs/kit').HttpError} - Throws a mapped HTTP error.
	 */
	private handleError(err: any): never {
		if (err && typeof err === 'object' && 'status' in err) {
			throw err;
		}

		if (err instanceof Error) {
			const message = err.message;
			
			if (message.includes('HTTP 404')) {
				throw error(404, 'Resource not found');
			} else if (message.includes('HTTP 400')) {
				throw error(400, 'Invalid parameters');
			} else if (message.includes('HTTP 5')) {
				throw error(503, 'Service temporarily unavailable');
			} else if (message.includes('aborted')) {
				throw error(408, 'Request timeout');
			}
		}

		console.error('API Error:', err);
		throw error(503, 'Communication error with the server');
	}
}

/**
 * Factory for creating and reusing ApiService instances.
 *
 * Ensures that services are instantiated only once per unique key,
 * effectively implementing a singleton per service type.
 */
export class ApiServiceFactory {
	private static instances = new Map<string, ApiService<any>>();

	/**
	 * Creates or retrieves a cached ApiService instance.
	 *
	 * @template T - The type of entity managed by the service.
	 * @param key - A unique key identifying the service.
	 * @param config - API configuration.
	 * @returns An ApiService instance for the given type and config.
	 */
	static create<T>(key: string, config: ApiConfig): ApiService<T> {
		if (!this.instances.has(key)) {
			this.instances.set(key, new ApiService<T>(config));
		}
		return this.instances.get(key)!;
	}
}
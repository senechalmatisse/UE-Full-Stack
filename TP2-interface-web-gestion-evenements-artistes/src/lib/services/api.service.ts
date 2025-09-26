import { error } from '@sveltejs/kit';
import type { 
	ApiConfig, 
	DataService, 
	PaginatedResponse, 
	PaginationParams
} from '../types/pagination';
import { DataValidator } from '../utils/validation';
import { APP_CONFIG } from '../config/app.config';
import { AppError } from './api.error';

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
	private controllers: Map<string, AbortController> = new Map();

	/**
	 * Creates a new ApiService instance.
	 *
	 * @param config - API configuration including base URL, headers, and timeout.
	 */
	constructor(config: ApiConfig) {
		this.config = {
			...APP_CONFIG.api,
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
			const response = await this.makeRequest(url, endpoint);
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
        const url = new URL(`${baseUrl}/${cleanEndpoint}`);

        url.searchParams.set('page', String(params.page));
        url.searchParams.set('size', String(params.size));

        if (params.search) {
            url.searchParams.set('search', params.search);
        }

        return url.toString();
    }

	/**
	 * Executes the HTTP request with timeout handling.
	 *
	 * @param url - The full request URL.
	 * @returns A Response object if successful.
	 *
	 * @throws {Error} If the request fails or times out.
	 */
	private async makeRequest(url: string, endpoint: string): Promise<Response> {
		this.cancelRequest(endpoint);

        const controller = new AbortController();
		this.controllers.set(endpoint, controller);

		const timeoutId = setTimeout(() => controller.abort(), this.config.timeout);

		try {
			const response = await fetch(url, {
				headers: this.config.defaultHeaders,
				signal: controller.signal
			});

			clearTimeout(timeoutId);
			this.controllers.delete(endpoint);

			if (!response.ok) {
				throw new AppError(response.status, response.statusText || APP_CONFIG.messages.error.server);
			}

			return response;
		} catch (err) {
			clearTimeout(timeoutId);
			this.controllers.delete(endpoint);
			throw err;
		}
	}

    	/** Cancel request by endpoint */
	private cancelRequest(endpoint: string): void {
		const controller = this.controllers.get(endpoint);
		if (controller) {
			controller.abort();
			this.controllers.delete(endpoint);
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
			throw new AppError(500, 'Invalid API response structure');
		}
	}

	protected withJsonBody(payload: any, method: 'POST' | 'PUT'): RequestInit {
		return {
			method,
			body: JSON.stringify(payload),
			headers: { ...this.config.defaultHeaders }
		};
	}

	/**
	 * Handles API errors and maps them to appropriate SvelteKit errors.
	 *
	 * @param err - The error to handle.
	 * @throws {import('@sveltejs/kit').HttpError} - Throws a mapped HTTP error.
	 */
	private handleError(err: any): never {
		if (err instanceof AppError) {
			throw error(err.code, err.message);
		}

		if (err instanceof DOMException && err.name === 'AbortError') {
			throw error(408, APP_CONFIG.messages.error.timeout);
		}

		throw error(503, APP_CONFIG.messages.error.generic);
	}

	public async request<R>(endpoint: string, options: RequestInit = {}, validator?: (data: any) => data is R): Promise<R | null> {
        const baseUrl = this.config.baseUrl.replace(/\/$/, '');
        const cleanEndpoint = endpoint.replace(/^\//, '');
        const url = `${baseUrl}/${cleanEndpoint}`;

        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), this.config.timeout);

        try {
            const response = await fetch(url, {
                headers: this.config.defaultHeaders,
                signal: controller.signal,
                ...options
            });

            clearTimeout(timeoutId);

            if (!response.ok) {
				throw new AppError(response.status, response.statusText);
            }

    		// Pas de contenu (DELETE 204 par ex.)
            if (response.status === 204) {
				return null;
			}

			const text = await response.text();
			if (!text) return null;

			const json = JSON.parse(text);

			if (validator && !validator(json)) {
				throw new AppError(500, 'Invalid response structure');
			}

			return json as R;
        } catch (err) {
            clearTimeout(timeoutId);
            this.handleError(err);
        }
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
	static create<T>(key: string, config: ApiConfig = APP_CONFIG.api): ApiService<T> {
		if (!this.instances.has(key)) {
			this.instances.set(key, new ApiService<T>(config));
		}
		return this.instances.get(key)!;
	}
}
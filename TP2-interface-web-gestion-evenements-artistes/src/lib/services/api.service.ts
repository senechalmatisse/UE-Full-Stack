import { AppError } from './api.error';
import { getAppConfig, type AppConfig } from "$lib/config";
import { getDataValidator } from '$lib/utils/validation/factories';
import type { 
	ApiConfig, 
	DataService, 
	PaginatedResponse, 
	PaginationParams
} from '$lib/types/pagination';

/**
 * Generic API service implementing the Repository pattern.
 *
 * Provides a reusable abstraction layer for communicating with external APIs.
 * Supports pagination, validation, error handling, request cancellation,
 * and timeout management.
 *
 * @template T - The type of entity managed by the service.
 */
export class ApiService<T> implements DataService<T> {
	private config: ApiConfig;
	private controllers: Map<string, AbortController> = new Map();
	private dataValidator: ReturnType<typeof getDataValidator>;
	private messages: AppConfig["errors"]["messages"];

	/**
	 * Creates a new {@link ApiService} instance.
	 *
	 * @param config - API configuration including base URL, headers, and timeout.
	 */
	constructor(config: ApiConfig) {
		const appConfig = getAppConfig();
		this.config = {
			...appConfig.api,
			...config
		};
		this.dataValidator = getDataValidator();
		this.messages = appConfig.errors.messages;
	}

	/**
	 * Fetches paginated data from the API.
	 *
	 * @param endpoint - The API endpoint (relative to the base URL).
	 * @param params - Pagination parameters (page, size, and optional search).
	 * @returns A paginated response containing items of type {@link T}.
	 *
	 * @throws {AppError} If the request fails or the response structure is invalid.
	 */
	async fetchPaginated(
        endpoint: string,
        params: PaginationParams
    ): Promise<PaginatedResponse<T>> {
		const url = this.buildUrl(endpoint, params);

		try {
			const response = await this.makeRequest(url, endpoint);
			const data = await response.json();

            if (!this.dataValidator.validatePaginatedResponse(data)) {
                throw new AppError(500, this.messages.server);
            }

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
        const { defaultSize, minSize, maxSize } = getAppConfig().pagination;

        const page = params.page ?? 1;
        const size = Math.min(Math.max(params.size ?? defaultSize, minSize), maxSize);

        const baseUrl = this.config.baseUrl.replace(/\/$/, '');
        const cleanEndpoint = endpoint.replace(/^\//, '');
        const url = new URL(`${baseUrl}/${cleanEndpoint}`);

        url.searchParams.set('page', String(page));
        url.searchParams.set('size', String(size));

        if (params.search) {
            url.searchParams.set('label', params.search);
        }

        return url.toString();
    }

	/**
	 * Executes the HTTP request with timeout and cancellation handling.
	 *
	 * @param url - The full request URL.
	 * @param endpoint - The associated endpoint used for cancellation tracking.
	 * @returns A {@link Response} object if successful.
	 *
	 * @throws {AppError} If the request fails or times out.
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
				throw new AppError(
                    response.status,
					response.statusText || this.messages.server
                );
			}

			return response;
		} catch (err) {
			clearTimeout(timeoutId);
			this.controllers.delete(endpoint);
			throw err;
		}
	}

	/**
	 * Cancels any ongoing request for the given endpoint.
	 *
	 * @param endpoint - The API endpoint associated with the request.
	 */
	private cancelRequest(endpoint: string): void {
		const controller = this.controllers.get(endpoint);
		if (controller) {
			controller.abort();
			this.controllers.delete(endpoint);
		}
	}

	/**
	 * Builds request options for JSON-based requests (POST or PUT).
	 *
	 * @param payload - The body payload to send as JSON.
	 * @param method - The HTTP method (`POST` or `PUT`).
	 * @returns A {@link RequestInit} object.
	 */
	public withJsonBody(payload: any, method: 'POST' | 'PUT'): RequestInit {
		return {
			method,
			body: JSON.stringify(payload),
			headers: { ...this.config.defaultHeaders }
		};
	}

	/**
	 * Handles API errors and maps them to SvelteKit {@link error} responses.
	 *
	 * @param err - The error to handle.
	 * @throws {import('@sveltejs/kit').HttpError} A mapped HTTP error.
	 */
	private handleError(err: any): never {
        if (err instanceof AppError) {
            throw err;
        }

        if (err instanceof DOMException && err.name === 'AbortError') {
			throw new AppError(408, this.messages.timeout);
        }

		throw new AppError(503, this.messages.generic);
    }


	/**
	 * Sends a generic request to the API.
	 *
	 * @template R - The expected response type.
	 * @param endpoint - The API endpoint (relative to the base URL).
	 * @param options - Additional {@link RequestInit} options (e.g., method, headers).
	 * @param validator - Optional custom validator to check the response structure.
	 * @returns The parsed response of type {@link R}, or `null` if no content.
	 *
	 * @throws {AppError} If the request fails or the validation fails.
	 */
	public async request<R>(
		endpoint: string, 
		options: RequestInit = {}, 
		validator?: (data: any) => data is R
	): Promise<R | null> {
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
                throw new AppError(
                    response.status,
                    response.statusText || this.messages.server
                );
            }

			// No content (e.g., 204 DELETE respnse)
            if (response.status === 204) {
				return null;
			}

			const text = await response.text();
			if (!text) return null;

			const json = JSON.parse(text);

			if (validator && !validator(json)) {
                throw new AppError(500, this.messages.server);
			}

			return json as R;
        } catch (err) {
            clearTimeout(timeoutId);
            this.handleError(err);
        }
    }
}

/**
 * Factory for creating and caching {@link ApiService} instances.
 *
 * Ensures that services are instantiated only once per unique key,
 * effectively implementing a singleton pattern per service type.
 */
export class ApiServiceFactory {
	private static instances = new Map<string, ApiService<any>>();

	/**
	 * Creates or retrieves a cached {@link ApiService} instance.
	 *
	 * @template T - The type of entity managed by the service.
	 * @param key - A unique key identifying the service.
	 * @param config - API configuration (defaults to {@link getAppConfig().api}).
	 * @returns An {@link ApiService} instance for the given type and config.
	 */
	static create<T>(key: string, config: ApiConfig = getAppConfig().api): ApiService<T> {
		if (!this.instances.has(key)) {
			this.instances.set(key, new ApiService<T>(config));
		}
		return this.instances.get(key)!;
	}
}
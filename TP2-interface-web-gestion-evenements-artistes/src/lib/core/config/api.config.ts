import { browser } from "$app/environment";

/**
 * API configuration.
 *
 * Contains base URL, default timeout, and request headers.
 */
export const apiConfig = {
	/** Base URL of the API (client/server aware). */
    baseUrl: browser
        ? import.meta.env.VITE_API_BASE_URL_CLIENT || "http://localhost:8080"
        : import.meta.env.VITE_API_BASE_URL_SERVER || "http://backend:8080",

	/** Default timeout for API requests (in milliseconds). */
    timeout: 5000,

	/** Default headers applied to every API request. */
    defaultHeaders: {
        Accept: "application/json",
        "Content-Type": "application/json",
    },
} as const;

export type ApiConfig = typeof apiConfig;
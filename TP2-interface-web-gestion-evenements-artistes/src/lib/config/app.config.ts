import { browser } from '$app/environment';

/**
 * Centralized application configuration.
 *
 * This module follows the **"single source of truth"** principle by consolidating:
 * - API configuration (base URLs, headers, timeouts)
 * - Pagination defaults and limits
 * - Date/locale formatting rules
 * - Accessibility constants
 * - User-facing messages and error handling
 *
 * Keeping all configuration in one place ensures consistency
 * across the application and simplifies maintenance.
 */

/**
 * Externalized error messages.
 *
 * Provides user-facing text for common error cases.
 * Messages are intended to be reusable across components and services.
 */
export const errorMessages = {
	/** Network connectivity error. */
	network: 'Erreur de réseau. Veuillez vérifier votre connexion.',

    /** Timeout error. */
	timeout: 'Délai de connexion dépassé. Veuillez réessayer.',

	/** Server-side error. */
	server: 'Erreur serveur. Veuillez réessayer plus tard.',

	/** Resource not found error. */
	notFound: 'Ressource introuvable.',

	/** Generic fallback error (unexpected failure). */
	generic: 'Une erreur inattendue s’est produite.'
} as const;

/**
 * Centralized error colors.
 *
 * Associates HTTP status codes with semantic UI colors.
 * Can be used in notifications, alerts, or UI highlights.
 *
 * @example
 * ```ts
 * const color = errorColors[404]; // "darkorange"
 * ```
 */
export const errorColors: Record<number, string> = {
	404: 'darkorange',
	500: 'crimson',
	401: 'royalblue',
	403: 'darkred',
	503: 'darkviolet'
};

/**
 * Centralized application configuration object.
 *
 * Contains grouped configuration sections:
 * - `api`: Base API URL, timeouts, and default headers
 * - `pagination`: Defaults and boundaries for paginated requests
 * - `dates`: Locale and formatting options for dates
 * - `accessibility`: UI constants for accessibility compliance
 * - `messages`: Default loading, empty, and error messages
 */
export const APP_CONFIG = {
	/**
	 * API configuration.
	 *
	 * Contains base URL, default timeout, and request headers.
	 */
	api: {
		/** Base URL of the API (client/server aware). */
		baseUrl: browser 
            ? (import.meta.env.VITE_API_BASE_URL_CLIENT || 'http://localhost:8080')
            : (import.meta.env.VITE_API_BASE_URL_SERVER || 'http://backend:8080'),

		/** Default timeout for API requests (in milliseconds). */
		timeout: 5000,

		/** Default headers applied to every API request. */
		defaultHeaders: {
			Accept: 'application/json',
			'Content-Type': 'application/json'
		}
	},

	/**
	 * Pagination configuration.
	 *
	 * Defines defaults and validation limits for paginated API requests.
	 */
	pagination: {
		/** Default number of items per page. */
		defaultSize: 4,

		/** Minimum number of items per page. */
		minSize: 1,

		/** Maximum number of items per page. */
		maxSize: 20,

		/** Maximum number of visible pagination buttons. */
		maxVisiblePages: 7
	},

	/**
	 * Date formatting configuration.
	 *
	 * Provides consistent locale and formatting rules across the app.
	 */
	dates: {
		/** Default locale used for date formatting. */
		locale: 'fr-FR',

		/** Default date format options (based on `Intl.DateTimeFormat`). */
		format: {
			year: 'numeric' as const,
			month: 'long' as const,
			day: 'numeric' as const
		} satisfies Intl.DateTimeFormatOptions
	},

	/**
	 * Accessibility configuration.
	 *
	 * UI constants for touch targets and focus styles.
	 * Helps ensure compliance with accessibility guidelines (WCAG).
	 */
	accessibility: {
		/** Minimum recommended touch target size (in pixels). */
		minTouchTarget: 44,

		/** Default focus outline width (in pixels). */
		focusOutlineWidth: 2
	},

	/**
	 * Application messages.
	 *
	 * Centralized user-facing text for:
	 * - Loading states
	 * - Empty states
	 * - Error messages (mapped from HTTP codes)
	 */
	messages: {
		/** Message displayed while resources are loading. */
		loading: 'Chargement...',

		/** Message displayed when no resources are found. */
		empty: 'Aucun ressource trouvée.',

		/** Error messages mapped to different failure cases. */
		error: {
			/** Mapping between HTTP status codes and error message keys. */
			map: {
				404: 'notFound',
				500: 'server',
				408: 'timeout',
				503: 'network'
			} as Record<number, keyof typeof errorMessages>,

            ...errorMessages
		}
	}
} as const;

/**
 * Type alias for the application configuration.
 *
 * Useful for dependency injection or typing configuration consumers.
 */
export type AppConfig = typeof APP_CONFIG;
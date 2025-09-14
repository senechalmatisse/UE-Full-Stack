/**
 * Centralized application configuration.
 *
 * Follows the "single source of truth" principle by grouping
 * API, pagination, date, accessibility, and message settings
 * in one place.
 */
export const APP_CONFIG = {
	/**
	 * API configuration.
	 *
	 * Contains base URL, default timeout, and default request headers.
	 */
	api: {
		/** Base URL of the API (from environment variable or localhost fallback). */
		baseUrl: import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080',
		/** Default timeout for API requests (in milliseconds). */
		timeout: 5000,
		/** Default headers applied to every API request. */
		defaultHeaders: {
			'Accept': 'application/json',
			'Content-Type': 'application/json'
		}
	},

	/**
	 * Pagination configuration.
	 *
	 * Defines defaults and limits for paginated API requests.
	 */
	pagination: {
		/** Default number of items per page. */
		defaultSize: 4,
		/** Minimum number of items per page. */
		minSize: 1,
		/** Maximum number of items per page. */
		maxSize: 50,
		/** Maximum number of visible pagination buttons. */
		maxVisiblePages: 7
	},

	/**
	 * Date formatting configuration.
	 *
	 * Used for consistent locale and formatting across the app.
	 */
	dates: {
		/** Default locale used for date formatting. */
		locale: 'fr-FR',
		/** Default date format options (Intl.DateTimeFormat). */
		format: {
			year: 'numeric' as const,
			month: 'long' as const,
			day: 'numeric' as const
		}
	},

	/**
	 * Accessibility configuration.
	 *
	 * Provides UI constants for touch targets and focus outlines.
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
	 * Centralized user-facing text for loading, empty states,
	 * and error messages.
	 */
	messages: {
		/** Message displayed while loading events. */
		loading: 'Chargement des événements...',
		/** Message displayed when no events are found. */
		empty: 'Aucun événement trouvé.',
		/** Error messages mapped to different failure cases. */
		error: {
			/** Network connectivity error. */
			network: 'Erreur de réseau. Veuillez vérifier votre connexion.',
			/** Timeout error. */
			timeout: 'Délai de connexion dépassé. Veuillez réessayer.',
			/** Server-side error. */
			server: 'Erreur serveur. Veuillez réessayer plus tard.',
			/** Resource not found error. */
			notFound: 'Ressource introuvable.',
			/** Fallback generic error. */
			generic: 'Une erreur inattendue s\'est produite.'
		}
	}
} as const;

/**
 * Type alias for the application configuration.
 *
 * Useful for dependency injection or typing configuration consumers.
 */
export type AppConfig = typeof APP_CONFIG;
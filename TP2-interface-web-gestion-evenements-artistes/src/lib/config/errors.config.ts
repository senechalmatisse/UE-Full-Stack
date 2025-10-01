/**
 * Externalized error messages.
 *
 * Provides user-facing text for common error cases.
 * Messages are intended to be reusable across components and services.
 */
const ERROR_MESSAGES = {
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
 * Error handling configuration.
 *
 * Provides centralized error messages and colors mapped to HTTP codes.
 */
export const errorsConfig = {
	/** Externalized error messages. */
    messages: ERROR_MESSAGES,

    /** Error colors mapped to HTTP status codes. */
    colors: {
        404: "darkorange",
        500: "crimson",
        401: "royalblue",
        403: "darkred",
        503: "darkviolet",
    } as Record<number, string>,

	/** Mapping between HTTP status codes and error message keys. */
    map: {
        404: "notFound",
        500: "server",
        408: "timeout",
        503: "network",
    } as Record<number, keyof typeof ERROR_MESSAGES>,
} as const;

/**
 * Type alias for the application configuration.
 *
 * Useful for dependency injection or typing configuration consumers.
 */
export type ErrorsConfig = typeof errorsConfig;
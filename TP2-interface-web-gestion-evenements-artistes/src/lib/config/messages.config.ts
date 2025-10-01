/**
 * Application messages.
 *
 * Centralized user-facing text for:
 * - Loading states
 * - Empty states
 * - Default labels
 */
export const messagesConfig = {
	/** Message displayed while resources are loading. */
    loading: "Chargement..." as string,

    /** Message displayed when no resources are found. */
    empty: "Aucun ressource trouvée." as string,

    defaults: {
        /** Default label when artist is unknown. */
        artistLabel: "Artiste inconnu(e)" as string,

        /** Default label when event has no title. */
        eventLabel: "Événement sans titre" as string,
    },
} as const;

/**
 * Type alias for the application configuration.
 *
 * Useful for dependency injection or typing configuration consumers.
 */
export type MessagesConfig = typeof messagesConfig;
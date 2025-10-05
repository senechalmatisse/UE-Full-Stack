/**
 * Date formatting configuration.
 *
 * Provides consistent locale and formatting rules across the app.
 */
export const datesConfig = {
    /** Default locale used for date formatting. */
    locale: "fr-FR",

    /** Default date format options. */
    format: {
        year: "numeric" as const,
        month: "long" as const,
        day: "numeric" as const,
    } satisfies Intl.DateTimeFormatOptions,
} as const;

/**
 * Type alias for the application configuration.
 *
 * Useful for dependency injection or typing configuration consumers.
 */
export type DatesConfig = typeof datesConfig;
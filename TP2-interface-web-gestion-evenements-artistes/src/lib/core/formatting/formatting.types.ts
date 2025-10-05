/**
 * @fileoverview
 * Type definitions for configuring date formatting behavior.
 *
 * These options are used by {@link DateService} and {@link DateServiceFactory}
 * to ensure locale-aware and consistent date output throughout the application.
 */

/**
 * Options for configuring a date formatter.
 *
 * Defines the locale and formatting options used by
 * the `Intl.DateTimeFormat` API.
 */
export interface DateFormatterOptions {
    /**
     * The locale used for formatting.
     *
     * @example "fr-FR", "en-US"
     */
    locale: string;

    /**
     * Options passed to `Intl.DateTimeFormat` to customize output.
     *
     * @see https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Intl/DateTimeFormat
     */
    options: Intl.DateTimeFormatOptions;
}
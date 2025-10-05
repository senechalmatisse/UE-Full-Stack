import { DateService } from "./date.service";
import type { IDateFormatter } from "./date.formatter.interface";
import type { DateFormatterOptions } from "./formatting.types";

/**
 * @fileoverview
 * Factory responsible for creating and reusing instances of {@link DateService}.
 *
 * Implements a caching mechanism to avoid redundant creation of identical formatters.
 */

/**
 * Factory class for creating and caching {@link DateService} instances.
 *
 * Ensures efficient reuse of locale-specific formatters.
 */
export class DateServiceFactory {
    /** Internal cache for reusable formatters. */
    private static formatters = new Map<string, IDateFormatter>();

    /**
     * Returns a cached or new {@link DateService} instance for the given configuration.
     *
     * @param config - Date formatting configuration (locale + options).
     * @returns A reusable date formatter.
     */
    static getFormatter(config: DateFormatterOptions): IDateFormatter {
        const key = `${config.locale}-${JSON.stringify(config.options)}`;

        if (!this.formatters.has(key)) {
            this.formatters.set(key, new DateService(config));
        }

        return this.formatters.get(key)!;
    }
}
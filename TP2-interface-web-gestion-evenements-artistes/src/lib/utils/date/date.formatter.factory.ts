import type { IDateFormatter, IDateFormatterConfig } from "./date.formatter.interface";
import { DateFormatter } from "./date.formatter";

/**
 * Factory class for creating and reusing {@link DateFormatter} instances.
 *
 * Implements a simple caching mechanism for common formatters
 * (e.g., French long-date format).
 */
export class DateFormatterFactory {
    private static formatters = new Map<string, IDateFormatter>();

    /**
     * Returns a reusable French long-date formatter.
     *
     * Uses a singleton-like approach to avoid creating multiple
     * identical instances.
     *
     * @returns A {@link DateFormatter} configured for French locale.
     */
    static getFormatter(config: IDateFormatterConfig): IDateFormatter {
        const key = `${config.locale}-${JSON.stringify(config.options)}`;

        if (!this.formatters.has(key)) {
            this.formatters.set(key, new DateFormatter(config));
        }

        return this.formatters.get(key)!;
    }
}
import type { Event } from "$lib/types/pagination";
import type { IDateFormatter } from "$lib/utils/date/date.formatter.interface";
import { DateFormatterFactory } from "$lib/utils/date/date.formatter.factory";
import { getAppConfig } from '$lib/config';

/**
 * Composable for formatting event date ranges.
 * 
 * Provides utilities to format event start and end dates into
 * human-readable strings using the French locale formatter.
 * 
 * @returns An object containing date formatting utilities.
 * 
 * @example
 * ```svelte
 * <script lang="ts">
 *   import { useEventDates } from "$lib/composables/useEventDates";
 *   
 *   const { formatEventDates } = useEventDates();
 *   const formattedDate = formatEventDates(event);
 * </script>
 * ```
 */
export function useEventDates(formatter?: IDateFormatter) {
    const APP_CONFIG = getAppConfig();
    const dateFormatter: IDateFormatter =
        formatter ??
        DateFormatterFactory.getFormatter({
            locale: APP_CONFIG.dates.locale,
            options: APP_CONFIG.dates.format
        });

    /**
     * Formats an event's start and end dates into a human-readable string.
     * 
     * If start and end dates are identical, only one date is returned.
     * Otherwise, a range is displayed with an en dash separator.
     *
     * @param event - The event object containing startDate and endDate.
     * @returns A formatted string (e.g., "12 jan. 2024" or "12 jan. 2024 – 15 jan. 2024")
     *          or "Dates non disponibles" if formatting fails.
     */
    function formatEventDates(event: Event): string {
        try {
            const start = dateFormatter.format(event.startDate);
            const end = dateFormatter.format(event.endDate);
            return start === end ? start : `Du ${start} au ${end}`;
        } catch {
            return "Dates non disponibles";
        }
    }

    /**
     * Formats a single date string using the French locale formatter.
     * 
     * @param dateString - ISO date string to format.
     * @returns Formatted date string or "Date non disponible" on error.
     */
    function formatSingleDate(dateString: string): string {
        try {
            return dateFormatter.format(dateString);
        } catch {
            return "Date non disponible";
        }
    }

    return {
        formatEventDates,
        formatSingleDate,
        dateFormatter
    };
}
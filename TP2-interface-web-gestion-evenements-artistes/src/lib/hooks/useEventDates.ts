import type { Event, IDateFormatter } from "$lib/core";
import { getAppConfig, DateServiceFactory } from '$lib/core';

/**
 * Composable for formatting event date ranges.
 * 
 * Provides utilities to format event start and end dates into
 * human-readable strings using the French locale formatter.
 * 
 * @returns An object containing date formatting utilities.
 */
export function useEventDates(dateFormatter?: IDateFormatter) {
    const APP_CONFIG = getAppConfig();

    const formatter: IDateFormatter =
        dateFormatter ??
        DateServiceFactory.getFormatter({
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
        if (!event.startDate || !event.endDate) return "Dates non disponibles";
        try {
            const start = formatter.format(event.startDate);
            const end = formatter.format(event.endDate);
            return start === end ? start : `Du ${start} au ${end}`;
        } catch {
            return "Dates non disponibles";
        }
    }

    return {
        formatEventDates,
        dateFormatter: formatter
    };
}
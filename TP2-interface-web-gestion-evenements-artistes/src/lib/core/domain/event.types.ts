import type { Artist } from "./artist.types";

/**
 * Represents a cultural or music event.
 */
export interface Event {
    /** Unique identifier of the event. */
    id: string;

    /** Display name of the event. */
    label: string;

    /** ISO-8601 string representing the start date of the event. */
    startDate: string;

    /** ISO-8601 string representing the end date of the event. */
    endDate: string;

    /** List of artists associated with the event. */
    artists: Artist[];
}
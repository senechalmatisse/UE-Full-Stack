import { describe, it, expect } from "vitest";
import { messagesConfig } from "../config/messages.config";
import { getSanitizer } from "./sanitizer.factory";

describe("Sanitizer", () => {
    const sanitizer = getSanitizer();

    it("shouldSanitizeArtistWithDefaults", () => {
        // GIVEN a raw artist with missing label and id
        const raw = { id: null, label: null };

        // WHEN sanitizing the artist
        const result = sanitizer.artist(raw);

        // THEN it should fallback to default label and empty string for id
        expect(result.id).toBe("");
        expect(result.label).toBe(messagesConfig.defaults.artistLabel);
    });

    it("shouldSanitizeEventWithDefaults", () => {
        // GIVEN a raw event with missing fields
        const raw = { id: null, label: null, startDate: null, endDate: null, artists: null };

        // WHEN sanitizing the event
        const result = sanitizer.event(raw);

        // THEN all fields should be sanitized and artists array should be empty
        expect(result.id).toBe("");
        expect(result.label).toBe(messagesConfig.defaults.eventLabel);
        expect(result.startDate).toBe("");
        expect(result.endDate).toBe("");
        expect(result.artists).toEqual([]);
    });

    it("shouldSanitizeEventWithArtists", () => {
        // GIVEN a raw event with one raw artist
        const raw = {
            id: "1",
            label: "Event 1",
            startDate: "2025-01-01",
            endDate: "2025-01-02",
            artists: [{ id: null, label: null }]
        };

        // WHEN sanitizing the event
        const result = sanitizer.event(raw);

        // THEN the nested artist should also be sanitized
        expect(result.artists.length).toBe(1);
        expect(result.artists[0].id).toBe("");
        expect(result.artists[0].label).toBe(messagesConfig.defaults.artistLabel);
    });

    it("shouldSanitizePaginatedResponse", () => {
        // GIVEN a raw paginated response
        const rawResponse = {
            content: [{ id: null, label: null }],
            number: 1,            // <-- corrigé : 'number' au lieu de 'page'
            size: 10,
            totalPages: 1,
            totalElements: 1,
            first: true,
            last: true
        };

        // WHEN sanitizing with the artist function
        const result = sanitizer.paginated(rawResponse, (item) => sanitizer.artist(item));

        // THEN content should be sanitized
        expect(result.content[0].id).toBe("");
        expect(result.content[0].label).toBe(messagesConfig.defaults.artistLabel);
    });
});
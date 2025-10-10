import { describe, it, expect } from "vitest";
import type { MessagesConfig } from "../config/messages.config";
import { DefaultLabelProvider } from "./label-provider.default";
import { messagesConfig } from "../config/messages.config";

describe("DefaultLabelProvider", () => {
    it("shouldReturnDefaultArtistLabel", () => {
        // GIVEN a messages configuration
        const provider = new DefaultLabelProvider(messagesConfig as MessagesConfig);

        // WHEN calling getDefaultArtistLabel
        const label = provider.getDefaultArtistLabel();

        // THEN it should return the default artist label from the config
        expect(label).toBe("Artiste inconnu(e)");
    });

    it("shouldReturnDefaultEventLabel", () => {
        // GIVEN a messages configuration
        const provider = new DefaultLabelProvider(messagesConfig as MessagesConfig);

        // WHEN calling getDefaultEventLabel
        const label = provider.getDefaultEventLabel();

        // THEN it should return the default event label from the config
        expect(label).toBe("Événement sans titre");
    });

    it("shouldWorkWithCustomMessagesConfig", () => {
        // GIVEN a custom messages configuration
        const customConfig: MessagesConfig = {
            loading: "Loading..." as const,
            empty: "No items found." as const,
            defaults: {
                artistLabel: "Unknown artist" as const,
                eventLabel: "Untitled event" as const
            }
        };

        const provider = new DefaultLabelProvider(customConfig);

        // WHEN getting default labels
        const artistLabel = provider.getDefaultArtistLabel();
        const eventLabel = provider.getDefaultEventLabel();

        // THEN it should return the values from the custom config
        expect(artistLabel).toBe("Unknown artist");
        expect(eventLabel).toBe("Untitled event");
    });
});
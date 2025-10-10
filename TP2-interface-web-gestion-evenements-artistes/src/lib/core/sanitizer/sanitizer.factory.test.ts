import { describe, it, expect, beforeEach } from "vitest";
import { getAppConfig, setAppConfig } from "../config";
import { Sanitizer } from "./sanitizer";
import { messagesConfig } from "../config/messages.config";
import { getSanitizer } from "./sanitizer.factory";

describe("getSanitizer", () => {
    beforeEach(() => {
        // GIVEN a fresh app config before each test
        setAppConfig({
            ...getAppConfig(),
            messages: messagesConfig
        });
    });

    it("shouldReturnSingletonInstance", () => {
        // GIVEN nothing

        // WHEN calling getSanitizer multiple times
        const instance1 = getSanitizer();
        const instance2 = getSanitizer();

        // THEN it should return the same instance
        expect(instance1).toBe(instance2);
        expect(instance1).toBeInstanceOf(Sanitizer);
    });

    it("shouldContainDataValidatorAndLabelProvider", () => {
        // GIVEN a fresh sanitizer instance

        // WHEN getting the instance
        const sanitizer = getSanitizer();

        // THEN it should have methods defined
        expect(typeof sanitizer.artist).toBe("function");
        expect(typeof sanitizer.event).toBe("function");
        expect(typeof sanitizer.paginated).toBe("function");
    });
});
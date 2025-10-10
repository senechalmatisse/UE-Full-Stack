import { describe, it, expect, vi, beforeEach } from "vitest";
import { DateServiceFactory } from "./date.service.factory";
import { DateService } from "./date.service";
import type { IDateFormatter } from "./date.formatter.interface";
import type { DateFormatterOptions } from "./formatting.types";

// Mock DateService to isolate factory behavior
vi.mock("./date.service", () => {
    return {
        DateService: vi.fn().mockImplementation(() => ({
            format: vi.fn(() => "mock-formatted-date"),
            isValid: vi.fn(() => true),
            validateRange: vi.fn(),
            isValidRange: vi.fn(() => true),
        })),
    };
});

describe("DateServiceFactory", () => {
    beforeEach(() => {
        // GIVEN the formatter cache is reset and mocks are cleared
        (DateServiceFactory as any).formatters.clear();
        vi.clearAllMocks();
    });

    it("should create a new DateService instance when cache is empty", () => {
        // GIVEN a unique configuration for the date formatter
        const config: DateFormatterOptions = {
            locale: "fr-FR",
            options: { year: "numeric", month: "long", day: "numeric" },
        };

        // WHEN requesting a formatter from the factory
        const formatter = DateServiceFactory.getFormatter(config);

        // THEN a new DateService should be instantiated and cached
        expect(DateService).toHaveBeenCalledTimes(1);
        expect(formatter).toBeDefined();
    });

    it("should return the same instance for identical configuration", () => {
        // GIVEN a configuration used multiple times
        const config: DateFormatterOptions = {
            locale: "en-US",
            options: { year: "numeric", month: "short", day: "numeric" },
        };

        // WHEN requesting the same configuration twice
        const firstInstance = DateServiceFactory.getFormatter(config);
        const secondInstance = DateServiceFactory.getFormatter(config);

        // THEN the factory should return the same cached instance
        expect(firstInstance).toBe(secondInstance);
        expect(DateService).toHaveBeenCalledTimes(1);
    });

    it("should create a new instance for different configurations", () => {
        // GIVEN two distinct configurations
        const configA: DateFormatterOptions = {
            locale: "en-US",
            options: { year: "numeric" },
        };
        const configB: DateFormatterOptions = {
            locale: "fr-FR",
            options: { year: "numeric" },
        };

        // WHEN requesting formatters for each config
        const formatterA = DateServiceFactory.getFormatter(configA);
        const formatterB = DateServiceFactory.getFormatter(configB);

        // THEN each should be a different instance in the cache
        expect(formatterA).not.toBe(formatterB);
        expect(DateService).toHaveBeenCalledTimes(2);
    });

    it("should store and retrieve instances correctly from internal cache", () => {
        // GIVEN a specific configuration
        const config: DateFormatterOptions = {
            locale: "fr-FR",
            options: { day: "2-digit", month: "short" },
        };

        // WHEN requesting a formatter twice
        const first = DateServiceFactory.getFormatter(config);
        const second = DateServiceFactory.getFormatter(config);

        // THEN the internal cache should contain exactly one entry
        const cache = (DateServiceFactory as any).formatters;
        expect(cache.size).toBe(1);
        expect(first).toBe(second);
    });

    it("should produce formatter implementing IDateFormatter contract", () => {
        // GIVEN a valid date configuration
        const config: DateFormatterOptions = {
            locale: "en-US",
            options: { day: "numeric", month: "long", year: "numeric" },
        };

        // WHEN getting a formatter instance
        const formatter = DateServiceFactory.getFormatter(config) as IDateFormatter;

        // THEN the instance should implement all required methods
        expect(typeof formatter.format).toBe("function");
        expect(typeof formatter.isValid).toBe("function");
        expect(typeof formatter.validateRange).toBe("function");
        expect(typeof formatter.isValidRange).toBe("function");
    });
});
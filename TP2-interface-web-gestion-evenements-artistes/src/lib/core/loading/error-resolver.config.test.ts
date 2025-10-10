import { describe, it, expect, vi, beforeEach } from "vitest";
import { ConfigErrorResolver } from "./error-resolver.config";
import { getAppConfig } from "../config";

// Mock the getAppConfig function to control the configuration
vi.mock("../config", () => ({
	getAppConfig: vi.fn(),
}));

vi.mock("$app/environment", () => ({
	browser: true,
}));

describe("ConfigErrorResolver", () => {
	let resolver: ConfigErrorResolver;

	beforeEach(() => {
		// GIVEN a fresh instance before each test
		resolver = new ConfigErrorResolver();

		// Reset mocks between tests
		vi.clearAllMocks();
	});

	it("should return the correct message for a known error code", () => {
		// GIVEN an application config with a known mapping for error 404
		(getAppConfig as any).mockReturnValue({
			errors: {
				messages: {
					notFound: "Resource not found.",
					generic: "An unexpected error occurred.",
				},
				map: {
					404: "notFound",
				},
			},
		});

		// WHEN resolving error code 404
		const result = resolver.resolve(404);

		// THEN it should return the mapped 'not found' message
		expect(result).toBe("Resource not found.");
		expect(getAppConfig).toHaveBeenCalledTimes(1);
	});

	it("should return the generic message for an unmapped error code", () => {
		// GIVEN a configuration missing the requested error code mapping
		(getAppConfig as any).mockReturnValue({
			errors: {
				messages: {
					notFound: "Resource not found.",
					generic: "An unexpected error occurred.",
				},
				map: {
					404: "notFound",
				},
			},
		});

		// WHEN resolving error code 500 (not in map)
		const result = resolver.resolve(500);

		// THEN it should return the generic message
		expect(result).toBe("An unexpected error occurred.");
	});

	it("should return the generic message if map key points to undefined message", () => {
		// GIVEN a config with a map entry pointing to a missing message key
		(getAppConfig as any).mockReturnValue({
			errors: {
				messages: {
					generic: "An unexpected error occurred.",
				},
				map: {
					401: "unauthorized", // Missing message key
				},
			},
		});

		// WHEN resolving error code 401
		const result = resolver.resolve(401);

		// THEN it should fallback to the generic message
		expect(result).toBe("An unexpected error occurred.");
	});

	it("should handle configurations missing the map entirely", () => {
		// GIVEN a config without a map
		(getAppConfig as any).mockReturnValue({
			errors: {
				messages: {
					generic: "An unexpected error occurred.",
				},
				map: {},
			},
		});

		// WHEN resolving an arbitrary error code
		const result = resolver.resolve(123);

		// THEN it should return the generic message safely
		expect(result).toBe("An unexpected error occurred.");
	});

	it("should handle configurations missing the messages object", () => {
		// GIVEN an invalid config missing messages
		(getAppConfig as any).mockReturnValue({
			errors: {
				map: {
					404: "notFound",
				},
			},
		});

		// WHEN resolving an error code
		const result = resolver.resolve(404);

		// THEN it should return undefined since no messages exist
		// (We test that it doesn't crash)
		expect(result).toBeUndefined();
	});
});
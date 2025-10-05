import { getAppConfig } from "../config";
import type { IErrorResolver } from "./error-resolver.interface";

/**
 * @fileoverview
 * Default implementation of {@link IErrorResolver} based on the
 * application's centralized configuration.
 *
 * Uses the global `errorsConfig` mapping to resolve numeric error codes
 * into localized, user-friendly messages.
 */

/**
 * Resolves error messages using the application's configuration.
 *
 * This class implements a simple lookup strategy that maps error codes
 * (e.g., 404, 500) to predefined messages defined in `errorsConfig`.
 */
export class ConfigErrorResolver implements IErrorResolver {
    /**
     * Resolves an error code to a human-readable message using
     * the application configuration.
     *
     * Falls back to a generic error message if no mapping is found.
     *
     * @param errorCode - Numeric HTTP or internal error code.
     * @returns The resolved message string.
     */
    resolve(errorCode: number): string {
        const config = getAppConfig();
        return (
            config.errors.messages[config.errors.map[errorCode]] ??
            config.errors.messages.generic
        );
    }
}
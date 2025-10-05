/**
 * @fileoverview
 * Interface defining a strategy for resolving error codes into
 * human-readable messages.
 *
 * Implementations may use configuration files, translation services,
 * or custom mappings to determine the final message.
 */

/**
 * Defines the contract for classes that resolve numeric error codes
 * into displayable messages.
 */
export interface IErrorResolver {
    /**
     * Resolves an error code into a human-readable message.
     *
     * @param errorCode - The numeric HTTP or application-specific error code.
     * @returns The corresponding error message, or a generic fallback if unknown.
     */
    resolve(errorCode: number): string;
}
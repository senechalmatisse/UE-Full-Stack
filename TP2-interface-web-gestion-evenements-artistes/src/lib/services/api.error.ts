/**
 * Custom application error for consistent error handling across services.
 *
 * Used to represent domain-specific or API-related errors with
 * an associated HTTP status code.
 */
export class AppError extends Error {

	/**
	 * Creates a new {@link AppError} instance.
	 *
	 * @param code - The associated HTTP status code (e.g., 404, 500).
	 * @param message - A descriptive error message.
	 */
	constructor(
		public code: number,
		message: string
	) {
		super(message);
		this.name = 'AppError';
	}
}
import { getAppConfig } from '../config';

/**
 * Custom application error for consistent error handling across services.
 *
 * Extends the native Error with an HTTP status code
 * and an optional UI color mapped from {@link APP_CONFIG.errors.colors}.
 */
export class AppError extends Error {
	code: number;
	color?: string;

	/**
	 * Creates a new {@link AppError} instance.
	 *
	 * @param code - The associated HTTP status code (e.g., 404, 500).
	 * @param message - A descriptive error message.
	 */
	constructor(code: number, message: string) {
		super(message);
		this.code = code;
		this.color = getAppConfig().errors.colors[code];
	}
}
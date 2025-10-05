import { Sanitizer } from './sanitizer';
import { DefaultLabelProvider } from './label-provider.default';
import { DataValidator } from '../validation';
import { getAppConfig } from '../config';

let sanitizer: Sanitizer | null = null;

/**
 * @displayName getSanitizer
 * @public
 *
 * Singleton accessor for the {@link Sanitizer} instance.
 *
 * Automatically constructs the sanitizer using the global app configuration,
 * {@link DataValidator}, and {@link DefaultLabelProvider}.
 *
 * @returns A globally shared instance of {@link Sanitizer}.
 */
export function getSanitizer(): Sanitizer {
    if (!sanitizer) {
        const appConfig = getAppConfig();

        sanitizer = new Sanitizer(
            new DataValidator(),
            new DefaultLabelProvider(appConfig.messages)
        );
    }

    return sanitizer;
}
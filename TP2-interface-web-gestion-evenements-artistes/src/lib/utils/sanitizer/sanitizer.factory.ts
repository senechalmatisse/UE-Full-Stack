import { Sanitizer } from './sanitizer';
import { DefaultValidator } from './default-validator';
import { AppConfigProvider } from './app-config.provider';

let sanitizer: Sanitizer | null = null;

export function getSanitizer(): Sanitizer {
    if (!sanitizer) {
        sanitizer = new Sanitizer(new DefaultValidator(), new AppConfigProvider());
    }
    return sanitizer;
}
import { getDataValidator } from '$lib/utils/validation/factories';
import type { IValidator } from './interfaces';

/** Wrapper autour de DataValidator pour respecter DIP */
export class DefaultValidator implements IValidator {
    private readonly dataValidator = getDataValidator();

    sanitizeString(value: unknown, fallback?: string): string {
        return this.dataValidator.sanitizeString(value, fallback);
    }
}
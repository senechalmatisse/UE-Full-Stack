import { getAppConfig } from '../config';
import { PaginationValidator } from './pagination.validator';
import { DataValidator } from './data.validator';
import type { IPaginationValidator } from './pagination-validator.interface';
import type { IDataValidator } from './data-validator.interface';

let paginationValidator: IPaginationValidator | null = null;
let dataValidator: IDataValidator | null = null;

/**
 * Returns a singleton instance of {@link IPaginationValidator}.
 *
 * The validator enforces minimum, maximum, and default pagination sizes
 * as defined in the application configuration.
 *
 * @returns A shared {@link IPaginationValidator} instance.
 */
export function getPaginationValidator(): IPaginationValidator {
    if (!paginationValidator) {
        const { minSize, maxSize, defaultSize } = getAppConfig().pagination;
        paginationValidator = new PaginationValidator(minSize, maxSize, defaultSize);
    }
    return paginationValidator;
}

/**
 * Returns a singleton instance of {@link IDataValidator}.
 *
 * The validator provides sanitization utilities and validation
 * for paginated API responses, using configuration-defined defaults.
 *
 * @returns A shared {@link IDataValidator} instance.
 */
export function getDataValidator(): IDataValidator {
    if (!dataValidator) {
        const fallback = getAppConfig().messages.empty;
        dataValidator = new DataValidator(fallback);
    }
    return dataValidator;
}
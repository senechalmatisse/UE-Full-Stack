import { getAppConfig } from '$lib/config';
import { PaginationValidator } from './pagination.validator';
import { DataValidator } from './data.validator';
import type { IPaginationValidator, IDataValidator } from './interfaces';

let paginationValidator: IPaginationValidator | null = null;
let dataValidator: IDataValidator | null = null;

export function getPaginationValidator(): IPaginationValidator {
    if (!paginationValidator) {
        const { minSize, maxSize, defaultSize } = getAppConfig().pagination;
        paginationValidator = new PaginationValidator(minSize, maxSize, defaultSize);
    }
    return paginationValidator;
}

export function getDataValidator(): IDataValidator {
    if (!dataValidator) {
        const fallback = getAppConfig().messages.empty;
        dataValidator = new DataValidator(fallback);
    }
    return dataValidator;
}
import type { PaginationParams } from '$lib/types/pagination';

/** Interface pour la validation et normalisation de la pagination */
export interface IPaginationValidator {
    validate(pageParam: string | null, sizeParam: string | null): PaginationParams;
    toApiPage(page: number): number;
    fromApiPage(apiPage: number): number;
}

/** Interface pour la validation et la sanitisation des données */
export interface IDataValidator {
    validatePaginatedResponse<T>(data: any): data is {
        content: T[];
        totalElements: number;
        totalPages: number;
        number: number;
        size: number;
        first: boolean;
        last: boolean;
    };

    sanitizeString(value: any, fallback?: string): string;
    sanitizeNumber(value: any, fallback?: number): number;
    sanitizeBoolean(value: any): boolean;
}
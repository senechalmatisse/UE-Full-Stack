import { getAppConfig } from '$lib/config';

/**
 * Abstraction pour fournir la config de pagination.
 */
export interface PaginationConfigProvider {
    getMaxVisiblePages(): number;
}

/**
 * Implémentation par défaut basée sur AppConfig global.
 */
export class AppConfigPaginationProvider implements PaginationConfigProvider {
    getMaxVisiblePages(): number {
        return getAppConfig().pagination.maxVisiblePages;
    }
}
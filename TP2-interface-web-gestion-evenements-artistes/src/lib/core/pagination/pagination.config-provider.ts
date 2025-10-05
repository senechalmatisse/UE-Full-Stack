import { getAppConfig } from '../config';
import type { IPaginationConfigProvider } from './pagination.config-provider.interface';

/**
 * @displayName AppConfigPaginationProvider
 * @public
 *
 * Default pagination configuration provider based on the global AppConfig.
 *
 * This class reads pagination settings from the application configuration
 * and exposes them through a standardized interface.
 */
export class AppConfigPaginationProvider implements IPaginationConfigProvider {
    /**
     * Retrieves the maximum number of visible pages in pagination controls.
     *
     * @returns The configured maximum number of visible pages.
     */
    getMaxVisiblePages(): number {
        return getAppConfig().pagination.maxVisiblePages;
    }
}
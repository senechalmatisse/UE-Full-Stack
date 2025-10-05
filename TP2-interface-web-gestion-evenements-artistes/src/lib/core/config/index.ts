import { apiConfig, type ApiConfig } from "./api.config";
import { paginationConfig, type PaginationConfig } from "./pagination.config";
import { datesConfig, type DatesConfig } from "./dates.config";
import { messagesConfig, type MessagesConfig } from "./messages.config";
import { errorsConfig, type ErrorsConfig } from "./errors.config";
import { navigationConfig, type NavigationConfig } from "./navigation.config";

export interface AppConfig {
    api: ApiConfig;
    pagination: PaginationConfig;
    dates: DatesConfig;
    messages: MessagesConfig;
    errors: ErrorsConfig;
    navigation: NavigationConfig;
}

/**
 * Implémentation par défaut de la config
 */
export const defaultAppConfig: AppConfig = {
    api: apiConfig,
    pagination: paginationConfig,
    dates: datesConfig,
    messages: messagesConfig,
    errors: errorsConfig,
    navigation: navigationConfig,
};

/**
 * Fonction d’injection (permet de remplacer pour tests ou environnements spécifiques)
 */
let currentConfig: AppConfig = defaultAppConfig;

export function setAppConfig(config: AppConfig) {
    currentConfig = config;
}

export function getAppConfig(): AppConfig {
    return currentConfig;
}
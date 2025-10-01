import { apiConfig, type ApiConfig } from "./api.config";
import { paginationConfig, type PaginationConfig } from "./pagination.config";
import { datesConfig, type DatesConfig } from "./dates.config";
import { accessibilityConfig, type AccessibilityConfig } from "./accessibility.config";
import { messagesConfig, type MessagesConfig } from "./messages.config";
import { errorsConfig, type ErrorsConfig } from "./errors.config";

export interface AppConfig {
    api: ApiConfig;
    pagination: PaginationConfig;
    dates: DatesConfig;
    accessibility: AccessibilityConfig;
    messages: MessagesConfig;
    errors: ErrorsConfig;
}

/**
 * Implémentation par défaut de la config
 */
export const defaultAppConfig: AppConfig = {
    api: apiConfig,
    pagination: paginationConfig,
    dates: datesConfig,
    accessibility: accessibilityConfig,
    messages: messagesConfig,
    errors: errorsConfig,
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
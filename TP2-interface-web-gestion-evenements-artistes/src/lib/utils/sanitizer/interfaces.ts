/** Fournit les labels par défaut pour les entités */
export interface IConfigProvider {
    getDefaultArtistLabel(): string;
    getDefaultEventLabel(): string;
}

/** Fournit les méthodes de validation/sanitisation */
export interface IValidator {
    sanitizeString(value: any, fallback?: string): string;
}
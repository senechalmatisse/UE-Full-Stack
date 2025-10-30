/**
 * Utilitaire pour convertir les dates au format attendu par l'API Spring Boot
 * S'intègre avec le système de dates existant (DateService)
 * 
 * Principe SRP : Une seule responsabilité = conversion de dates pour l'API
 */

import type { IDateFormatter } from './date.formatter.interface';

/**
 * Types de formats de date supportés par l'API Spring Boot
 */
export enum ApiDateFormat {
    /** Format LocalDate Java : YYYY-MM-DD */
    LOCAL_DATE = 'LOCAL_DATE',
    /** Format LocalDateTime Java : YYYY-MM-DDTHH:mm:ss */
    LOCAL_DATE_TIME = 'LOCAL_DATE_TIME'
}

/**
 * Convertisseur de dates pour l'API
 * Respecte l'architecture existante avec IDateFormatter
 */
export class ApiDateConverter {
    constructor(private dateFormatter?: IDateFormatter) {}

    /**
     * Convertit une date JavaScript ou ISO en LocalDate (YYYY-MM-DD)
     * Format attendu par Spring Boot pour les champs LocalDate
     * 
     * @param date - Date à convertir (string ISO ou Date)
     * @returns Date au format YYYY-MM-DD
     * 
     * @example
     * toLocalDate('2025-12-07T00:00:00.000Z') // => '2025-12-07'
     * toLocalDate(new Date('2025-12-07')) // => '2025-12-07'
     */
    toLocalDate(date: string | Date): string {
        // Validation avec IDateFormatter si disponible
        if (this.dateFormatter && typeof date === 'string') {
            if (!this.dateFormatter.isValid(date)) {
                throw new Error(`Date invalide: ${date}`);
            }
        }

        const dateObj = typeof date === 'string' ? new Date(date) : date;

        if (isNaN(dateObj.getTime())) {
            throw new Error(`Date invalide: ${date}`);
        }

        // Extraction des composants de date en UTC
        const year = dateObj.getUTCFullYear();
        const month = String(dateObj.getUTCMonth() + 1).padStart(2, '0');
        const day = String(dateObj.getUTCDate()).padStart(2, '0');

        return `${year}-${month}-${day}`;
    }

    /**
     * Convertit une date en LocalDateTime (YYYY-MM-DDTHH:mm:ss)
     * Format attendu par Spring Boot pour les champs LocalDateTime
     * 
     * @param date - Date à convertir
     * @returns Date au format YYYY-MM-DDTHH:mm:ss
     */
    toLocalDateTime(date: string | Date): string {
        if (this.dateFormatter && typeof date === 'string') {
            if (!this.dateFormatter.isValid(date)) {
                throw new Error(`Date invalide: ${date}`);
            }
        }

        const dateObj = typeof date === 'string' ? new Date(date) : date;

        if (isNaN(dateObj.getTime())) {
            throw new Error(`Date invalide: ${date}`);
        }

        const year = dateObj.getUTCFullYear();
        const month = String(dateObj.getUTCMonth() + 1).padStart(2, '0');
        const day = String(dateObj.getUTCDate()).padStart(2, '0');
        const hours = String(dateObj.getUTCHours()).padStart(2, '0');
        const minutes = String(dateObj.getUTCMinutes()).padStart(2, '0');
        const seconds = String(dateObj.getUTCSeconds()).padStart(2, '0');

        return `${year}-${month}-${day}T${hours}:${minutes}:${seconds}`;
    }

    /**
     * Convertit une date API (LocalDate) vers le format des inputs HTML
     * 
     * @param apiDate - Date au format YYYY-MM-DD
     * @returns Date au format YYYY-MM-DD (identique pour les inputs)
     */
    fromLocalDateToInput(apiDate: string): string {
        // Validation du format
        if (!/^\d{4}-\d{2}-\d{2}$/.test(apiDate)) {
            throw new Error(`Format LocalDate invalide: ${apiDate}`);
        }
        return apiDate;
    }

    /**
     * Convertit plusieurs champs de date dans un payload
     * Utilise toLocalDate par défaut pour les champs LocalDate de Spring Boot
     * 
     * @param payload - Objet contenant les données
     * @param dateFields - Liste des champs à convertir
     * @param format - Format cible (par défaut LOCAL_DATE)
     * @returns Payload avec dates converties
     */
    convertDatesInPayload<T extends Record<string, any>>(
        payload: T,
        dateFields: Array<keyof T>,
        format: ApiDateFormat = ApiDateFormat.LOCAL_DATE
    ): T {
        const converted = { ...payload };

        dateFields.forEach(field => {
            const value = converted[field];
            if (value && typeof value === 'string') {
                try {
                    if (format === ApiDateFormat.LOCAL_DATE) {
                        converted[field] = this.toLocalDate(value) as any;
                    } else {
                        converted[field] = this.toLocalDateTime(value) as any;
                    }
                } catch (error) {
                    console.error(`Erreur de conversion du champ ${String(field)}:`, error);
                    throw error;
                }
            }
        });

        return converted;
    }
}

/**
 * Factory pour créer des convertisseurs avec ou sans DateService
 * Pattern Singleton pour réutiliser l'instance
 */
export class ApiDateConverterFactory {
    private static instance: ApiDateConverter | null = null;
    private static instanceWithFormatter: Array<[IDateFormatter, ApiDateConverter]> = [];

    /**
     * Récupère ou crée l'instance du convertisseur sans validation
     */
    static getInstance(): ApiDateConverter {
        if (!this.instance) {
            this.instance = new ApiDateConverter();
        }
        return this.instance;
    }

    /**
     * Récupère ou crée un convertisseur avec un DateFormatter spécifique
     * 
     * @param dateFormatter - Instance de IDateFormatter pour la validation
     * @returns Convertisseur avec validation intégrée
     */
    static getInstanceWithFormatter(dateFormatter: IDateFormatter): ApiDateConverter {
        const existing = this.instanceWithFormatter.find(([key]) => key === dateFormatter);
        if (!existing) {
            const converter = new ApiDateConverter(dateFormatter);
            this.instanceWithFormatter.push([dateFormatter, converter]);
            return converter;
        }
        return existing[1];
    }

    /**
     * Crée une nouvelle instance (pour les tests)
     */
    static createNew(dateFormatter?: IDateFormatter): ApiDateConverter {
        return new ApiDateConverter(dateFormatter);
    }
}

/**
 * Helpers pour les conversions courantes
 * Utilise l'instance par défaut sans validation
 */
export const ApiDateHelpers = {
    /**
     * Convertit une date d'input HTML vers LocalDate API
     * 
     * @example
     * ApiDateHelpers.toLocalDate('2025-12-07T00:00:00.000Z') // => '2025-12-07'
     */
    toLocalDate: (date: string | Date): string => {
        return ApiDateConverterFactory.getInstance().toLocalDate(date);
    },

    /**
     * Convertit une date vers LocalDateTime API
     * 
     * @example
     * ApiDateHelpers.toLocalDateTime('2025-12-07T14:30:00.000Z') // => '2025-12-07T14:30:00'
     */
    toLocalDateTime: (date: string | Date): string => {
        return ApiDateConverterFactory.getInstance().toLocalDateTime(date);
    },

    /**
     * Convertit plusieurs dates dans un payload
     * 
     * @example
     * const payload = {
     *   label: 'Mon événement',
     *   startDate: '2025-12-07T00:00:00.000Z',
     *   endDate: '2025-12-10T00:00:00.000Z'
     * };
     * ApiDateHelpers.convertDates(payload, ['startDate', 'endDate']);
     * // => { label: 'Mon événement', startDate: '2025-12-07', endDate: '2025-12-10' }
     */
    convertDates: <T extends Record<string, any>>(
        payload: T,
        dateFields: Array<keyof T>,
        format: ApiDateFormat = ApiDateFormat.LOCAL_DATE
    ): T => {
        return ApiDateConverterFactory.getInstance().convertDatesInPayload(
            payload,
            dateFields,
            format
        );
    },

    /**
     * Convertit une LocalDate API vers input HTML
     */
    fromApiToInput: (apiDate: string): string => {
        return ApiDateConverterFactory.getInstance().fromLocalDateToInput(apiDate);
    }
};
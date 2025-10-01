export interface IDateFormatter {
    format(dateString: string): string;
    isValidDate(dateString: string): boolean;
}

export interface IDateFormatterConfig {
    locale: string;
    options: Intl.DateTimeFormatOptions;
}
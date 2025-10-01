import { AppError } from "$lib/services/api.error";

/**
 * Composable for date validation logic.
 * 
 * Provides utilities to validate date strings and date ranges.
 * 
 * @example
 * ```svelte
 * <script lang="ts">
 *   import { useDateValidation } from "$lib/composables/useDateValidation";
 *   
 *   const { validateDateRange, isValidDate } = useDateValidation();
 *   validateDateRange(startDate, endDate);
 * </script>
 * ```
 */
export function useDateValidation() {
    
    /**
     * Checks if a date string is valid.
     * 
     * @param dateString - ISO date string to validate.
     * @returns true if the date is valid, false otherwise.
     */
    function isValidDate(dateString: string): boolean {
        const date = new Date(dateString);
        return !isNaN(date.getTime());
    }
    
    /**
     * Validates that both dates are valid.
     * 
     * @param startDate - Start date string.
     * @param endDate - End date string.
     * @throws {AppError} If either date is invalid.
     */
    function validateDates(startDate: string, endDate: string): void {
        const start = new Date(startDate);
        const end = new Date(endDate);
        
        if (isNaN(start.getTime()) || isNaN(end.getTime())) {
            throw new AppError(400, "Les dates doivent être valides");
        }
    }
    
    /**
     * Validates a date range ensuring end date is after start date.
     * 
     * @param startDate - Start date string.
     * @param endDate - End date string.
     * @throws {AppError} If dates are invalid or end is before start.
     */
    function validateDateRange(startDate: string, endDate: string): void {
        validateDates(startDate, endDate);
        
        const start = new Date(startDate);
        const end = new Date(endDate);
        
        if (start >= end) {
            throw new AppError(400, "La date de fin doit être après celle du début");
        }
    }
    
    /**
     * Checks if a date range is valid without throwing.
     * 
     * @param startDate - Start date string.
     * @param endDate - End date string.
     * @returns true if the range is valid, false otherwise.
     */
    function isValidDateRange(startDate: string, endDate: string): boolean {
        try {
            validateDateRange(startDate, endDate);
            return true;
        } catch {
            return false;
        }
    }
    
    return {
        isValidDate,
        validateDates,
        validateDateRange,
        isValidDateRange
    };
}
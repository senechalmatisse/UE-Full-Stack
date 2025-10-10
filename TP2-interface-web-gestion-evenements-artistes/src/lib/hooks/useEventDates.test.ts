import { describe, it, expect, vi, beforeEach } from 'vitest';
import { useEventDates } from './useEventDates';
import type { Event, IDateFormatter } from '$lib/core';
import * as Core from '$lib/core';

describe('useEventDates', () => {
    let mockFormatter: IDateFormatter;
    let event: Event;

    beforeEach(() => {
        event = {
            id: '1',
            label: 'Concert',
            startDate: '2025-10-12',
            endDate: '2025-10-15',
            artists: []
        };

        mockFormatter = {
            format: vi.fn((date) => `formatted-${date}`),
            isValid: vi.fn(),
            validateRange: vi.fn(),
            isValidRange: vi.fn()
        };
    });

    it('formatEventDates shouldReturnFormattedRange', () => {
        // GIVEN
        const { formatEventDates } = useEventDates(mockFormatter);

        // WHEN
        const result = formatEventDates(event);

        // THEN
        expect(mockFormatter.format).toHaveBeenCalledWith(event.startDate);
        expect(mockFormatter.format).toHaveBeenCalledWith(event.endDate);
        expect(result).toBe(`Du formatted-${event.startDate} au formatted-${event.endDate}`);
    });

    it('formatEventDates shouldReturnSingleDateIfStartEqualsEnd', () => {
        // GIVEN
        const singleDateEvent = { ...event, endDate: event.startDate };
        const { formatEventDates } = useEventDates(mockFormatter);

        // WHEN
        const result = formatEventDates(singleDateEvent);

        // THEN
        expect(result).toBe(`formatted-${event.startDate}`);
    });

    it('formatEventDates shouldReturnUnavailableIfNoDates', () => {
        // GIVEN
        const noDateEvent = { ...event, startDate: '', endDate: '' };
        const { formatEventDates } = useEventDates(mockFormatter);

        // WHEN
        const result = formatEventDates(noDateEvent);

        // THEN
        expect(result).toBe('Dates non disponibles');
    });

    it('formatEventDates shouldReturnUnavailableIfFormatterThrows', () => {
        // GIVEN
        mockFormatter.format = vi.fn(() => { throw new Error('fail'); });
        const { formatEventDates } = useEventDates(mockFormatter);

        // WHEN
        const result = formatEventDates(event);

        // THEN
        expect(result).toBe('Dates non disponibles');
    });

    it('useEventDates shouldUseDefaultFormatterIfNotProvided', () => {
        // GIVEN
        const spyGetFormatter = vi.spyOn(Core.DateServiceFactory, 'getFormatter');
        
        // WHEN
        const { dateFormatter } = useEventDates();

        // THEN
        expect(spyGetFormatter).toHaveBeenCalled();
        expect(dateFormatter).toBeDefined();
    });
});
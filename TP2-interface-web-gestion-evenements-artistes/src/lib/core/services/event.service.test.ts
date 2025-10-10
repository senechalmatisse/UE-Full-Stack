import { describe, it, expect, vi, beforeEach } from 'vitest';
import { createEventService, EventService } from './event.service';
import { ApiService } from './api.service';
import type { Event } from '../domain';
import { AppError } from './api.error';

describe('EventService', () => {
    let service: EventService;
    let apiServiceMock: Partial<ApiService<Event>>;

    beforeEach(() => {
        apiServiceMock = {
            request: vi.fn(),
        } as any;

        // Inject mock service into EventService
        service = new EventService();
        (service as any).apiService = apiServiceMock;
    });

    it('addArtistToEvent shouldCallApiWithPost', async () => {
        // GIVEN
        (apiServiceMock.request as any).mockResolvedValue(undefined);

        // WHEN
        await service.addArtistToEvent('event1', 'artist1');

        // THEN
        expect(apiServiceMock.request).toHaveBeenCalledWith(
            'events/event1/artists/artist1',
            { method: 'POST' }
        );
    });

    it('addArtistToEvent shouldHandleError', async () => {
        // GIVEN
        (apiServiceMock.request as any).mockRejectedValue(new Error('fail'));

        // WHEN / THEN
        await expect(service.addArtistToEvent('event1', 'artist1')).rejects.toBeInstanceOf(AppError);
    });

    it('removeArtistFromEvent shouldCallApiWithDelete', async () => {
        // GIVEN
        (apiServiceMock.request as any).mockResolvedValue(undefined);

        // WHEN
        await service.removeArtistFromEvent('event1', 'artist1');

        // THEN
        expect(apiServiceMock.request).toHaveBeenCalledWith(
            'events/event1/artists/artist1',
            { method: 'DELETE' }
        );
    });

    it('removeArtistFromEvent shouldHandleError', async () => {
        // GIVEN
        (apiServiceMock.request as any).mockRejectedValue(new Error('fail'));

        // WHEN / THEN
        await expect(service.removeArtistFromEvent('event1', 'artist1')).rejects.toBeInstanceOf(AppError);
    });

    it('sanitize shouldCallSanitizerEvent', () => {
        // GIVEN
        const rawEvent = { id: '1', label: 'Event1', startDate: '', endDate: '', artists: [] };
        const spy = vi.spyOn((service as any).sanitizer, 'event').mockReturnValue(rawEvent);

        // WHEN
        const result = (service as any).sanitize(rawEvent);

        // THEN
        expect(spy).toHaveBeenCalledWith(rawEvent);
        expect(result).toEqual(rawEvent);

        spy.mockRestore();
    });

    it('create shouldReturnNullIfRequestReturnsNull', async () => {
        // GIVEN
        (apiServiceMock.request as any).mockResolvedValue(null);
        (apiServiceMock.withJsonBody as any) = vi.fn();

        // WHEN
        const result = await (service as any).create('/endpoint', { label: 'New' });

        // THEN
        expect(result).toBeNull();
    });

    it('update shouldReturnNullIfRequestReturnsNull', async () => {
        // GIVEN
        (apiServiceMock.request as any).mockResolvedValue(null);
        (apiServiceMock.withJsonBody as any) = vi.fn();

        // WHEN
        const result = await (service as any).update('/endpoint', '1', { label: 'Updated' });

        // THEN
        expect(result).toBeNull();
    });

    it('getById shouldReturnNullIfRequestReturnsNull', async () => {
        // GIVEN
        (apiServiceMock.request as any).mockResolvedValue(null);

        // WHEN
        const result = await (service as any).getById('/endpoint', '1');

        // THEN
        expect(result).toBeNull();
    });

    it('delete shouldReturnTrueOnSuccess', async () => {
        // GIVEN
        (apiServiceMock.request as any).mockResolvedValue(undefined);

        // WHEN
        const result = await (service as any).delete('/endpoint', '1');

        // THEN
        expect(result).toBe(true);
    });

    it('delete shouldHandleError', async () => {
        // GIVEN
        (apiServiceMock.request as any).mockRejectedValue(new Error('fail'));

        // WHEN / THEN
        await expect((service as any).delete('/endpoint', '1')).rejects.toBeInstanceOf(AppError);
    });

    it('createEventService shouldReturnNewEventServiceInstance', () => {
        // GIVEN

        // WHEN
        const instance1 = createEventService();
        const instance2 = createEventService();

        // THEN
        expect(instance1).toBeInstanceOf(EventService);
        expect(instance2).toBeInstanceOf(EventService);
        expect(instance1).not.toBe(instance2);
    });
});
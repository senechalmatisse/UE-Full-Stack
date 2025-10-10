import { describe, it, expect, vi, beforeEach } from 'vitest';
import { ArtistService, createArtistService } from './artist.service';
import { ApiService } from './api.service';
import type { Artist, Event } from '../domain';
import { AppError } from './api.error';

describe('ArtistService', () => {
    let service: ArtistService;
    let apiServiceMock: Partial<ApiService<Artist>>;

    beforeEach(() => {
        apiServiceMock = {
            request: vi.fn(),
        } as any;

        service = new ArtistService();
        (service as any).apiService = apiServiceMock;
    });

    it('getArtistEvents shouldCallApiAndSanitizeEvents', async () => {
        // GIVEN
        const rawEvents: Event[] = [
            { id: '1', label: 'Event1', startDate: '', endDate: '', artists: [] },
            { id: '2', label: 'Event2', startDate: '', endDate: '', artists: [] },
        ];
        (apiServiceMock.request as any).mockResolvedValue(rawEvents);
        const sanitizerSpy = vi.spyOn((service as any).sanitizer, 'event')
            .mockImplementation((e) => e);

        // WHEN
        const result = await service.getArtistEvents('artist1');

        // THEN
        expect(apiServiceMock.request).toHaveBeenCalledWith('artists/artist1/events');
        expect(sanitizerSpy).toHaveBeenCalledTimes(rawEvents.length);
        expect(result).toEqual(rawEvents);

        sanitizerSpy.mockRestore();
    });

    it('getArtistEvents shouldHandleError', async () => {
        // GIVEN
        (apiServiceMock.request as any).mockRejectedValue(new Error('fail'));

        // WHEN / THEN
        await expect(service.getArtistEvents('artist1')).rejects.toBeInstanceOf(AppError);
    });

    it('getArtistEvents shouldReturnEmptyArrayIfRequestReturnsNull', async () => {
        // GIVEN
        (apiServiceMock.request as any).mockResolvedValue(null);

        // WHEN
        const result = await service.getArtistEvents('artist1');

        // THEN
        expect(result).toEqual([]);
    });

    it('getArtistEvents shouldReturnEmptyArrayIfRequestReturnsUndefined', async () => {
        // GIVEN
        (apiServiceMock.request as any).mockResolvedValue(undefined);

        // WHEN
        const result = await service.getArtistEvents('artist1');

        // THEN
        expect(result).toEqual([]);
    });

    it('sanitize shouldCallSanitizerArtist', () => {
        // GIVEN
        const rawArtist: Artist = { id: '1', label: 'Artist1' };
        const spy = vi.spyOn((service as any).sanitizer, 'artist').mockReturnValue(rawArtist);

        // WHEN
        const result = (service as any).sanitize(rawArtist);

        // THEN
        expect(spy).toHaveBeenCalledWith(rawArtist);
        expect(result).toEqual(rawArtist);

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

    it('createArtistService shouldReturnNewArtistServiceInstance', () => {
        // GIVEN

        // WHEN
        const instance1 = createArtistService();
        const instance2 = createArtistService();

        // THEN
        expect(instance1).toBeInstanceOf(ArtistService);
        expect(instance2).toBeInstanceOf(ArtistService);
        expect(instance1).not.toBe(instance2);
    });
});
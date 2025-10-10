import { describe, it, expect, vi, beforeEach } from 'vitest';
import { useEntityEditor } from './useEntityEditor';
import { AppError, getDataValidator } from '$lib/core';
import type { Artist } from '$lib/core';
import { createEventDispatcher } from 'svelte';

vi.mock('svelte', () => ({
    createEventDispatcher: vi.fn()
}));

describe('useEntityEditor', () => {
    let serviceMock: { update: ReturnType<typeof vi.fn> };
    let entity: Artist;
    let dispatchSpy: ReturnType<typeof vi.fn>;

    beforeEach(() => {
        entity = { id: '1', label: 'Original Artist' };

        serviceMock = { update: vi.fn() };

        dispatchSpy = vi.fn();
        (createEventDispatcher as unknown as ReturnType<typeof vi.fn>).mockReturnValue(dispatchSpy);

        // Mock sanitize
        const validator = getDataValidator();
        vi.spyOn(validator, 'sanitizeString').mockImplementation((str) => `sanitized-${str}`);
    });

    it('validateLabel shouldThrowIfTooShort', () => {
        // GIVEN
        const editor = useEntityEditor({
            entity,
            service: serviceMock,
            endpoint: '/artists',
            minLabelLength: 3
        });

        // WHEN / THEN
        expect(() => editor.validateLabel('ab')).toThrowError(AppError);
    });

    it('saveEntity shouldSanitizeAndCallUpdateAndDispatch', async () => {
        // GIVEN
        const updatedEntity = { id: '1', label: 'New Artist' };
        serviceMock.update.mockResolvedValue(updatedEntity);

        const editor = useEntityEditor({
            entity,
            service: serviceMock,
            endpoint: '/artists'
        });


        // WHEN
        const result = await editor.saveEntity({ label: 'New Artist' });

        // THEN
        expect(serviceMock.update).toHaveBeenCalledWith(
            '/artists',
            entity.id,
            { label: 'sanitized-New Artist' }
        );
        expect(result).toEqual(updatedEntity);
        expect(dispatchSpy).toHaveBeenCalledWith('updated', updatedEntity);
    });

    it('saveEntity shouldPreserveNonStringFieldsAndNotSanitizeThem', async () => {
        // GIVEN
        const updates = {
            label: 'New Name',
            active: true,
            count: 42,
            tags: ['a', 'b'],
            meta: { nested: 'value' }
        };

        const updatedEntity = { id: entity.id, label: 'New Name', active: true, count: 42, tags: ['a', 'b'], meta: { nested: 'value' } };
        (serviceMock.update as ReturnType<typeof vi.fn>).mockResolvedValue(updatedEntity);

        const editor = useEntityEditor({
            entity,
            service: serviceMock,
            endpoint: '/artists'
        });
        const validator = getDataValidator();
        const sanitizeSpy = vi.spyOn(validator, 'sanitizeString');

        // WHEN
        const result = await editor.saveEntity(updates);

        // THEN
        expect(serviceMock.update).toHaveBeenCalledWith(
            '/artists',
            entity.id,
            {
                label: 'sanitized-New Name',
                active: true,
                count: 42,
                tags: ['a', 'b'],
                meta: { nested: 'value' }
            }
        );

        expect(result).toEqual(updatedEntity);

        expect(sanitizeSpy).toHaveBeenCalledTimes(1);
        expect(sanitizeSpy).toHaveBeenCalledWith('New Name');
    });

    it('saveEntity shouldThrowAppErrorIfUpdateReturnsNull', async () => {
        // GIVEN
        serviceMock.update.mockResolvedValue(null);
        const editor = useEntityEditor({ entity, service: serviceMock, endpoint: '/artists' });

        // WHEN / THEN
        await expect(editor.saveEntity({ label: 'Updated' })).rejects.toBeInstanceOf(AppError);
    });

    it('saveEntity shouldThrowAppErrorIfLabelTooShort', async () => {
        // GIVEN
        const editor = useEntityEditor({ entity, service: serviceMock, endpoint: '/artists' });

        // WHEN / THEN
        await expect(editor.saveEntity({ label: 'ab' })).rejects.toBeInstanceOf(AppError);
    });
});
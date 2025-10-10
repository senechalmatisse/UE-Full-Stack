import { describe, it, expect, vi, beforeEach } from 'vitest';
import { useAssociation } from './useAssociation';
import { notifications } from '$lib/stores/notification.store';
import { getAppConfig, AppError } from '$lib/core';
import { get } from 'svelte/store';

describe('useAssociation', () => {
    let addEntitySpy: ReturnType<typeof useAssociation>;
    let updateFnMock: (entity: any, action: 'add' | 'remove') => void;

    beforeEach(() => {
        updateFnMock = vi.fn();
        vi.spyOn(global, 'confirm').mockImplementation(() => true);
        vi.spyOn(notifications, 'info').mockImplementation(vi.fn());
        vi.spyOn(notifications, 'success').mockImplementation(vi.fn());
        vi.spyOn(notifications, 'error').mockImplementation(vi.fn());
        vi.spyOn(notifications, 'warning').mockImplementation(vi.fn());

        addEntitySpy = useAssociation<any>();
    });

    it('performAction shouldReturnSuccessWithDataOnResolve', async () => {
        // GIVEN
        const action = vi.fn().mockResolvedValue('result');

        // WHEN
        const result = await addEntitySpy.performAction(action);

        // THEN
        expect(result).toEqual({ success: true, data: 'result' });
        expect(action).toHaveBeenCalled();
        expect(get(addEntitySpy.isLoading)).toBe(false);
        expect(notifications.info).toHaveBeenCalled();
    });

    it('performAction shouldReturnFailureWithAppError', async () => {
        // GIVEN
        const action = vi.fn().mockRejectedValue(new AppError(500, 'AppErrorMessage'));

        // WHEN
        const result = await addEntitySpy.performAction(action);

        // THEN
        expect(result).toEqual({ success: false, error: 'AppErrorMessage' });
        expect(notifications.error).toHaveBeenCalledWith('AppErrorMessage');
        expect(get(addEntitySpy.isLoading)).toBe(false);
    });

    it('performAction shouldReturnFailureWithGenericError', async () => {
        // GIVEN
        const action = vi.fn().mockRejectedValue(new Error('Fail'));
        const genericMsg = getAppConfig().errors.messages.generic;

        // WHEN
        const result = await addEntitySpy.performAction(action);

        // THEN
        expect(result).toEqual({ success: false, error: 'Error: Fail' });
        expect(notifications.error).toHaveBeenCalledWith(genericMsg);
        expect(get(addEntitySpy.isLoading)).toBe(false);
    });

    it('addEntity shouldCallUpdateFnAndNotifyOnSuccess', async () => {
        // GIVEN
        const entity = { id: 1 };
        const action = vi.fn().mockResolvedValue(entity);
        const confirmMsg = 'Confirm add?';
        const successMsg = 'Added successfully';

        // WHEN
        await addEntitySpy.addEntity(confirmMsg, action, updateFnMock, successMsg);

        // THEN
        expect(updateFnMock).toHaveBeenCalledWith(entity, 'add');
        expect(notifications.success).toHaveBeenCalledWith(successMsg);
    });

    it('addEntity shouldNotCallUpdateFnIfUserCancels', async () => {
        // GIVEN
        const entity = { id: 1 };
        vi.spyOn(global, 'confirm').mockReturnValueOnce(false);
        const action = vi.fn().mockResolvedValue(entity);

        // WHEN
        await addEntitySpy.addEntity('Confirm add?', action, updateFnMock, 'Success');

        // THEN
        expect(updateFnMock).not.toHaveBeenCalled();
        expect(notifications.warning).toHaveBeenCalled();
    });

    it('removeEntity shouldCallUpdateFnAndNotifyOnSuccess', async () => {
        // GIVEN
        const entity = { id: 1 };
        const action = vi.fn().mockResolvedValue(undefined);
        const confirmMsg = 'Confirm remove?';
        const successMsg = 'Removed successfully';

        // WHEN
        await addEntitySpy.removeEntity(confirmMsg, action, updateFnMock, entity, successMsg);

        // THEN
        expect(updateFnMock).toHaveBeenCalledWith(entity, 'remove');
        expect(notifications.success).toHaveBeenCalledWith(successMsg);
    });

    it('removeEntity shouldNotCallUpdateFnIfUserCancels', async () => {
        // GIVEN
        const entity = { id: 1 };
        vi.spyOn(global, 'confirm').mockReturnValueOnce(false);
        const action = vi.fn().mockResolvedValue(undefined);

        // WHEN
        await addEntitySpy.removeEntity('Confirm remove?', action, updateFnMock, entity, 'Success');

        // THEN
        expect(updateFnMock).not.toHaveBeenCalled();
        expect(notifications.warning).toHaveBeenCalled();
    });
});
import { describe, it, expect, vi, beforeEach, afterEach, type Mock } from 'vitest';
import { get } from 'svelte/store';
import { useSaveAction } from './useSaveAction';
import { notifications } from '$lib/stores/notification.store';
import { getAppConfig, AppError, type AppConfig } from '$lib/core';

// Mock dependencies
vi.mock('svelte', () => ({
    writable: (val: any) => {
        let value = val;
        const subscribers = new Set<(val: any) => void>();
        return {
            subscribe: (fn: (val: any) => void) => {
                subscribers.add(fn);
                fn(value);
                return () => subscribers.delete(fn);
            },
            set: (newVal: any) => {
                value = newVal;
                subscribers.forEach(fn => fn(value));
            },
            update: (fn: (val: any) => any) => {
                value = fn(value);
                subscribers.forEach(fn => fn(value));
            }
        };
    },
    createEventDispatcher: () => vi.fn()
}));

vi.mock('$lib/stores/notification.store', () => ({
    notifications: {
        success: vi.fn(),
        error: vi.fn(),
        info: vi.fn(),
        warning: vi.fn(),
        remove: vi.fn()
    }
}));

vi.mock('$lib/core', async () => {
    const actual = await vi.importActual('$lib/core');
    return {
        ...actual,
        getAppConfig: vi.fn(),
        AppError: actual.AppError
    };
});

describe('useSaveAction', () => {
    const mockAppConfig: AppConfig = {
        api: {} as any,
        pagination: {} as any,
        dates: {} as any,
        messages: {
            loading: 'Loading...',
            empty: 'No resources found.',
            defaults: {
                artistLabel: 'Unknown artist',
                eventLabel: 'Event without title'
            }
        },
        errors: {
            messages: {
                generic: 'An unexpected error occurred'
            },
            colors: {}
        } as any,
        navigation: {} as any
    };

    beforeEach(() => {
        vi.clearAllMocks();
        (getAppConfig as Mock).mockReturnValue(mockAppConfig);
    });

    afterEach(() => {
        vi.restoreAllMocks();
    });

    describe('initialization', () => {
        it('shouldInitializeWithCorrectDefaultState', () => {
            // GIVEN: A success message for the save action
            const successMessage = 'Data saved successfully';

            // WHEN: useSaveAction is initialized
            const { isSaving } = useSaveAction(successMessage);

            // THEN: isSaving should be false initially
            expect(get(isSaving)).toBe(false);
        });

        it('shouldReturnIsSavingStoreAndRunMethod', () => {
            // GIVEN: A success message
            const successMessage = 'Entity updated';

            // WHEN: useSaveAction is called
            const result = useSaveAction(successMessage);

            // THEN: The returned object should have isSaving store and run method
            expect(result).toHaveProperty('isSaving');
            expect(result).toHaveProperty('run');
            expect(typeof result.run).toBe('function');
        });
    });

    describe('run method - successful operations', () => {
        let mockDispatch: Mock;

        beforeEach(() => {
            mockDispatch = vi.fn();
            vi.mocked(vi.fn()).mockReturnValue(mockDispatch);
        });

        it('shouldSetIsSavingToTrueDuringOperation', async () => {
            // GIVEN: A composable with a slow async action
            const successMessage = 'Saved';
            const { isSaving, run } = useSaveAction<string>(successMessage);
            let isSavingDuringExecution = false;

            const slowAction = async () => {
                await new Promise(resolve => setTimeout(resolve, 10));
                isSavingDuringExecution = get(isSaving);
                return 'result';
            };

            // WHEN: The run method is executed
            const promise = run(slowAction);

            // THEN: isSaving should be true during execution
            await promise;
            expect(isSavingDuringExecution).toBe(true);
        });

        it('shouldDisplayLoadingNotificationOnStart', async () => {
            // GIVEN: A composable and a successful action
            const successMessage = 'Operation completed';
            const { run } = useSaveAction(successMessage);
            const mockAction = vi.fn(async () => ({ id: 1, name: 'Test' }));

            // WHEN: The run method is called
            await run(mockAction);

            // THEN: An info notification with loading message should be shown
            expect(notifications.info).toHaveBeenCalledWith('Loading...');
        });

        it('shouldDispatchUpdatedEventWithReturnedEntity', async () => {
            // GIVEN: A composable with mocked event dispatcher
            const successMessage = 'Success';
            const mockDispatch = vi.fn();

            const svelteModule = await import('svelte');
            vi.spyOn(svelteModule, 'createEventDispatcher').mockReturnValue(mockDispatch);

            const { run } = useSaveAction<{ id: number }>(successMessage);
            const updatedEntity = { id: 42 };
            const mockAction = async () => updatedEntity;

            // WHEN: The action completes successfully
            await run(mockAction);

            // THEN: The 'updated' event should be dispatched with the entity
            expect(mockDispatch).toHaveBeenCalledWith('updated', updatedEntity);
        });

        it('shouldShowSuccessNotificationOnCompletion', async () => {
            // GIVEN: A composable and a successful action
            const successMessage = 'Data has been saved';
            const { run } = useSaveAction(successMessage);
            const mockAction = async () => ({ status: 'ok' });

            // WHEN: The action completes successfully
            await run(mockAction);

            // THEN: A success notification should be displayed
            expect(notifications.success).toHaveBeenCalledWith(successMessage);
        });

        it('shouldReturnTheUpdatedEntity', async () => {
            // GIVEN: A composable and an action returning an entity
            const successMessage = 'Updated';
            const { run } = useSaveAction<{ id: number; value: string }>(successMessage);
            const expectedEntity = { id: 10, value: 'test data' };
            const mockAction = async () => expectedEntity;

            // WHEN: The action is executed
            const result = await run(mockAction);

            // THEN: The returned value should match the entity
            expect(result).toEqual(expectedEntity);
        });

        it('shouldResetIsSavingToFalseAfterCompletion', async () => {
            // GIVEN: A composable with a successful action
            const successMessage = 'Completed';
            const { isSaving, run } = useSaveAction(successMessage);
            const mockAction = async () => ({ done: true });

            // WHEN: The action completes
            await run(mockAction);

            // THEN: isSaving should be reset to false
            expect(get(isSaving)).toBe(false);
        });
    });

    describe('run method - error handling', () => {
        it('shouldThrowAppErrorWhenActionReturnsNull', async () => {
            // GIVEN: A composable and an action returning null
            const successMessage = 'Success';
            const { run } = useSaveAction(successMessage);
            const mockAction = async () => null;

            // WHEN: The action returns null
            const result = await run(mockAction);

            // THEN: An error notification should be shown and null returned
            expect(notifications.error).toHaveBeenCalled();
            expect(result).toBeNull();
        });

        it('shouldHandleAppErrorWithCustomMessage', async () => {
            // GIVEN: A composable and an action throwing AppError
            const successMessage = 'Success';
            const { run } = useSaveAction(successMessage);
            const customErrorMessage = 'Custom validation error';
            const mockAction = async () => {
                throw new AppError(400, customErrorMessage);
            };

            // WHEN: The action throws an AppError
            const result = await run(mockAction);

            // THEN: The custom error message should be displayed
            expect(notifications.error).toHaveBeenCalledWith(customErrorMessage);
            expect(result).toBeNull();
        });

        it('shouldHandleGenericErrorWithDefaultMessage', async () => {
            // GIVEN: A composable and an action throwing a generic error
            const successMessage = 'Success';
            const { run } = useSaveAction(successMessage);
            const mockAction = async () => {
                throw new Error('Unexpected error');
            };

            // WHEN: The action throws a generic error
            const result = await run(mockAction);

            // THEN: The generic error message from config should be shown
            expect(notifications.error).toHaveBeenCalledWith('An unexpected error occurred');
            expect(result).toBeNull();
        });

        it('shouldReturnNullWhenErrorOccurs', async () => {
            // GIVEN: A composable and a failing action
            const successMessage = 'Success';
            const { run } = useSaveAction(successMessage);
            const mockAction = async () => {
                throw new AppError(500, 'Server error');
            };

            // WHEN: The action fails
            const result = await run(mockAction);

            // THEN: The result should be null
            expect(result).toBeNull();
        });

        it('shouldResetIsSavingToFalseAfterError', async () => {
            // GIVEN: A composable with a failing action
            const successMessage = 'Success';
            const { isSaving, run } = useSaveAction(successMessage);
            const mockAction = async () => {
                throw new Error('Failure');
            };

            // WHEN: The action fails
            await run(mockAction);

            // THEN: isSaving should be reset to false
            expect(get(isSaving)).toBe(false);
        });
    });

    describe('run method - edge cases', () => {
        it('shouldHandleMultipleConsecutiveCalls', async () => {
            // GIVEN: A composable and multiple actions
            const successMessage = 'Success';
            const { run } = useSaveAction(successMessage);
            const action1 = async () => ({ id: 1 });
            const action2 = async () => ({ id: 2 });

            // WHEN: Multiple actions are executed consecutively
            const result1 = await run(action1);
            const result2 = await run(action2);

            // THEN: Both should complete successfully
            expect(result1).toEqual({ id: 1 });
            expect(result2).toEqual({ id: 2 });
            expect(notifications.success).toHaveBeenCalledTimes(2);
        });

        it('shouldHandleActionWithComplexReturnType', async () => {
            // GIVEN: A composable with typed entity
            interface ComplexEntity {
                id: number;
                nested: { value: string };
                items: number[];
            }
            const successMessage = 'Success';
            const { run } = useSaveAction<ComplexEntity>(successMessage);
            const complexEntity: ComplexEntity = {
                id: 99,
                nested: { value: 'test' },
                items: [1, 2, 3]
            };
            const mockAction = async () => complexEntity;

            // WHEN: The action returns a complex entity
            const result = await run(mockAction);

            // THEN: The complex entity should be returned intact
            expect(result).toEqual(complexEntity);
        });

        it('shouldHandleActionThrowingNullErrorMessage', async () => {
            // GIVEN: A composable and action returning null
            const successMessage = 'Success';
            const { run } = useSaveAction(successMessage);
            const mockAction = async () => null;

            // WHEN: The action returns null
            await run(mockAction);

            // THEN: The French error message should be shown
            expect(notifications.error).toHaveBeenCalledWith('Mise à jour échouée');
        });
    });

    describe('integration with dependencies', () => {
        it('shouldUseConfigMessagesForLoadingNotification', async () => {
            // GIVEN: A custom config with specific loading message
            const customConfig = {
                ...mockAppConfig,
                messages: {
                    ...mockAppConfig.messages,
                    loading: 'Custom loading message'
                }
            };
            (getAppConfig as Mock).mockReturnValue(customConfig);

            const { run } = useSaveAction('Success');
            const mockAction = async () => ({ id: 1 });

            // WHEN: The run method is called
            await run(mockAction);

            // THEN: The custom loading message should be used
            expect(notifications.info).toHaveBeenCalledWith('Custom loading message');
        });

        it('shouldUseConfigErrorMessagesForGenericErrors', async () => {
            // GIVEN: A custom config with specific generic error message
            const customConfig = {
                ...mockAppConfig,
                errors: {
                    ...mockAppConfig.errors,
                    messages: { generic: 'Custom generic error' }
                }
            };
            (getAppConfig as Mock).mockReturnValue(customConfig);

            const { run } = useSaveAction('Success');
            const mockAction = async () => {
                throw new Error('Random error');
            };

            // WHEN: A generic error occurs
            await run(mockAction);

            // THEN: The custom generic error message should be shown
            expect(notifications.error).toHaveBeenCalledWith('Custom generic error');
        });
    });
});
import { describe, it, expect, vi, beforeEach, afterEach, type Mock } from 'vitest';
import { PaginatedPageController } from './paginated-page.controller';
import {
    getAppConfig,
    AppError,
    getPaginationValidator,
    getDataValidator,
    type AppConfig,
    type PaginatedResponse,
} from '$lib/core';

// Mock dependencies
vi.mock('$lib/core', async () => {
    const actual = await vi.importActual('$lib/core');
    return {
        ...actual,
        getAppConfig: vi.fn(),
        getPaginationValidator: vi.fn(),
        getDataValidator: vi.fn()
    };
});

interface TestEntity {
    id: number;
    name: string;
}

describe('PaginatedPageController', () => {
    const mockAppConfig: AppConfig = {
        api: {} as any,
        pagination: {
            minSize: 1,
            maxSize: 100,
            defaultSize: 10
        } as any,
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
                generic: 'An unexpected error occurred',
                server: 'Server error occurred'
            },
            colors: {}
        } as any,
        navigation: {} as any
    };

    const mockPaginationValidator = {
        validate: vi.fn((page: string | null, size: string) => ({
            page: page ? parseInt(page) : 1,
            size: parseInt(size)
        })),
        toApiPage: vi.fn((page: number) => page - 1),
        fromApiPage: vi.fn((apiPage: number) => apiPage + 1)
    };

    const mockDataValidator = {
        sanitizeNumber: vi.fn((value: any, fallback: number) => 
            typeof value === 'number' ? value : fallback
        ),
        sanitizeBoolean: vi.fn((value: any) => Boolean(value)),
        sanitizeString: vi.fn((value: any, fallback: string) => 
            typeof value === 'string' ? value : fallback
        )
    };

    let mockService: {
        getAll: Mock;
    };

    beforeEach(() => {
        vi.clearAllMocks();
        (getAppConfig as Mock).mockReturnValue(mockAppConfig);
        (getPaginationValidator as Mock).mockReturnValue(mockPaginationValidator);
        (getDataValidator as Mock).mockReturnValue(mockDataValidator);

        mockService = {
            getAll: vi.fn()
        };
    });

    afterEach(() => {
        vi.restoreAllMocks();
    });

    describe('constructor', () => {
        it('shouldInitializeWithEndpointAndService', () => {
            // GIVEN: An endpoint and a service
            const endpoint = 'artists';

            // WHEN: A new controller is created
            const controller = new PaginatedPageController<TestEntity>(endpoint, mockService);

            // THEN: The controller should be instantiated
            expect(controller).toBeDefined();
            expect(controller).toBeInstanceOf(PaginatedPageController);
        });

        it('shouldCallValidatorFactories', () => {
            // GIVEN: An endpoint and service
            const endpoint = 'events';

            // WHEN: A new controller is created
            new PaginatedPageController<TestEntity>(endpoint, mockService);

            // THEN: Validator factories should be called
            expect(getPaginationValidator).toHaveBeenCalled();
            expect(getDataValidator).toHaveBeenCalled();
        });
    });

    describe('loadPageData - successful scenarios', () => {
        it('shouldLoadFirstPageWithDefaultParameters', async () => {
            // GIVEN: A controller and a successful API response
            const controller = new PaginatedPageController<TestEntity>('artists', mockService);
            const url = new URL('http://localhost:5173/artists?page=1&size=10');

            const mockResponse: PaginatedResponse<TestEntity> = {
                content: [{ id: 1, name: 'Artist 1' }, { id: 2, name: 'Artist 2' }],
                totalElements: 20,
                totalPages: 2,
                number: 0,
                size: 10,
                first: true,
                last: false
            };

            mockService.getAll.mockResolvedValue(mockResponse);

            // WHEN: loadPageData is called
            const result = await controller.loadPageData(url);

            // THEN: The result should contain paginated data
            expect(result.items).toHaveLength(2);
            expect(result.page).toBe(1);
            expect(result.totalPages).toBe(2);
            expect(result.first).toBe(true);
            expect(result.last).toBe(false);
            expect(result.totalElements).toBe(20);
            expect(result.size).toBe(10);
        });

        it('shouldCallServiceWithCorrectParameters', async () => {
            // GIVEN: A controller with specific pagination parameters
            const controller = new PaginatedPageController<TestEntity>('events', mockService);
            const url = new URL('http://localhost:5173/events?page=2&size=20');

            mockService.getAll.mockResolvedValue({
                content: [],
                totalElements: 0,
                totalPages: 1,
                number: 1,
                size: 20,
                first: false,
                last: true
            });

            // WHEN: loadPageData is called
            await controller.loadPageData(url);

            // THEN: The service should be called with correct endpoint and params
            expect(mockService.getAll).toHaveBeenCalledWith('events', {
                page: 1,
                size: 20,
                search: undefined
            });
        });

        it('shouldExtractSearchTermWhenEnabled', async () => {
            // GIVEN: A controller with search enabled
            const controller = new PaginatedPageController<TestEntity>('artists', mockService);
            const url = new URL('http://localhost:5173/artists?page=1&size=10&search=jazz');

            mockService.getAll.mockResolvedValue({
                content: [{ id: 3, name: 'Jazz Artist' }],
                totalElements: 1,
                totalPages: 1,
                number: 0,
                size: 10,
                first: true,
                last: true
            });

            // WHEN: loadPageData is called with withSearch enabled
            const result = await controller.loadPageData(url, true);

            // THEN: The search term should be included in the result
            expect(result.searchTerm).toBe('jazz');
            expect(mockService.getAll).toHaveBeenCalledWith('artists', {
                page: 0,
                size: 10,
                search: 'jazz'
            });
        });

        it('shouldHandleEmptySearchTerm', async () => {
            // GIVEN: A controller with search enabled but no search param
            const controller = new PaginatedPageController<TestEntity>('artists', mockService);
            const url = new URL('http://localhost:5173/artists?page=1&size=10');

            mockService.getAll.mockResolvedValue({
                content: [],
                totalElements: 0,
                totalPages: 1,
                number: 0,
                size: 10,
                first: true,
                last: true
            });

            // WHEN: loadPageData is called with withSearch enabled
            const result = await controller.loadPageData(url, true);

            // THEN: The search term should be an empty string
            expect(result.searchTerm).toBe('');
        });

        it('shouldNotIncludeSearchTermWhenDisabled', async () => {
            // GIVEN: A controller with search disabled
            const controller = new PaginatedPageController<TestEntity>('events', mockService);
            const url = new URL('http://localhost:5173/events?page=1&size=10&search=test');

            mockService.getAll.mockResolvedValue({
                content: [],
                totalElements: 0,
                totalPages: 1,
                number: 0,
                size: 10,
                first: true,
                last: true
            });

            // WHEN: loadPageData is called without withSearch
            const result = await controller.loadPageData(url, false);

            // THEN: The search term should be undefined
            expect(result.searchTerm).toBeUndefined();
        });

        it('shouldMapApiResponseCorrectly', async () => {
            // GIVEN: A controller and a complete API response
            const controller = new PaginatedPageController<TestEntity>('artists', mockService);
            const url = new URL('http://localhost:5173/artists?page=3&size=15');

            const mockResponse: PaginatedResponse<TestEntity> = {
                content: [
                    { id: 31, name: 'Artist 31' },
                    { id: 32, name: 'Artist 32' }
                ],
                totalElements: 50,
                totalPages: 4,
                number: 2,
                size: 15,
                first: false,
                last: false
            };

            mockService.getAll.mockResolvedValue(mockResponse);

            // WHEN: loadPageData is called
            const result = await controller.loadPageData(url);

            // THEN: All fields should be correctly mapped
            expect(result.items).toEqual(mockResponse.content);
            expect(result.page).toBe(3);
            expect(result.totalPages).toBe(4);
            expect(result.totalElements).toBe(50);
            expect(result.size).toBe(15);
            expect(result.first).toBe(false);
            expect(result.last).toBe(false);
        });
    });

    describe('loadPageData - out of range page handling', () => {
        it('shouldFallbackToLastPageWhenRequestedPageIsTooHigh', async () => {
            // GIVEN: A request for page 10 when only 3 pages exist
            const controller = new PaginatedPageController<TestEntity>('artists', mockService);
            const url = new URL('http://localhost:5173/artists?page=10&size=10');

            const initialResponse: PaginatedResponse<TestEntity> = {
                content: [],
                totalElements: 30,
                totalPages: 3,
                number: 9,
                size: 10,
                first: false,
                last: false
            };

            const lastPageResponse: PaginatedResponse<TestEntity> = {
                content: [
                    { id: 21, name: 'Artist 21' },
                    { id: 22, name: 'Artist 22' }
                ],
                totalElements: 30,
                totalPages: 3,
                number: 2,
                size: 10,
                first: false,
                last: true
            };

            mockService.getAll
                .mockResolvedValueOnce(initialResponse)
                .mockResolvedValueOnce(lastPageResponse);

            // WHEN: loadPageData is called
            const result = await controller.loadPageData(url);

            // THEN: The last valid page should be returned
            expect(mockService.getAll).toHaveBeenCalledTimes(2);
            expect(result.page).toBe(3);
            expect(result.last).toBe(true);
            expect(result.items).toHaveLength(2);
        });

        it('shouldNotFallbackWhenRequestedPageIsValid', async () => {
            // GIVEN: A valid page request within range
            const controller = new PaginatedPageController<TestEntity>('events', mockService);
            const url = new URL('http://localhost:5173/events?page=2&size=10');

            mockService.getAll.mockResolvedValue({
                content: [{ id: 11, name: 'Event 11' }],
                totalElements: 30,
                totalPages: 3,
                number: 1,
                size: 10,
                first: false,
                last: false
            });

            // WHEN: loadPageData is called
            await controller.loadPageData(url);

            // THEN: The service should only be called once
            expect(mockService.getAll).toHaveBeenCalledTimes(1);
        });

        it('shouldHandleEdgeCaseWhenTotalPagesIsZero', async () => {
            // GIVEN: A response with zero total pages
            const controller = new PaginatedPageController<TestEntity>('artists', mockService);
            const url = new URL('http://localhost:5173/artists?page=5&size=10');

            mockService.getAll.mockResolvedValue({
                content: [],
                totalElements: 0,
                totalPages: 0,
                number: 4,
                size: 10,
                first: true,
                last: true
            });

            // WHEN: loadPageData is called
            const result = await controller.loadPageData(url);

            // THEN: No fallback should occur and service called once
            expect(mockService.getAll).toHaveBeenCalledTimes(1);
            expect(result.items).toHaveLength(0);
            expect(result.totalPages).toBe(0);
        });

        it('shouldIncludeSearchTermInFallbackRequest', async () => {
            // GIVEN: An out-of-range request with search term
            const controller = new PaginatedPageController<TestEntity>('artists', mockService);
            const url = new URL('http://localhost:5173/artists?page=10&size=10&search=rock');

            mockService.getAll
                .mockResolvedValueOnce({
                    content: [],
                    totalElements: 15,
                    totalPages: 2,
                    number: 9,
                    size: 10,
                    first: false,
                    last: false
                })
                .mockResolvedValueOnce({
                    content: [{ id: 11, name: 'Rock Artist' }],
                    totalElements: 15,
                    totalPages: 2,
                    number: 1,
                    size: 10,
                    first: false,
                    last: true
                });

            // WHEN: loadPageData is called with search
            const result = await controller.loadPageData(url, true);

            // THEN: Both requests should include the search term
            expect(mockService.getAll).toHaveBeenCalledWith('artists', {
                page: 9,
                size: 10,
                search: 'rock'
            });
            expect(mockService.getAll).toHaveBeenCalledWith('artists', {
                page: 1,
                size: 10,
                search: 'rock'
            });
            expect(result.searchTerm).toBe('rock');
        });
    });

    describe('loadPageData - error handling', () => {
        it('shouldReturnEmptyStateWhenAppErrorIsThrown', async () => {
            // GIVEN: A controller and a service that throws AppError
            const controller = new PaginatedPageController<TestEntity>('artists', mockService);
            const url = new URL('http://localhost:5173/artists?page=1&size=10');

            const appError = new AppError(404, 'Resource not found');
            mockService.getAll.mockRejectedValue(appError);

            // WHEN: loadPageData is called
            const result = await controller.loadPageData(url);

            // THEN: An empty state with error message should be returned
            expect(result.items).toEqual([]);
            expect(result.errorMessage).toBe('Resource not found');
            expect(result.page).toBe(1);
            expect(result.size).toBe(10);
            expect(result.totalPages).toBe(1);
            expect(result.first).toBe(true);
            expect(result.last).toBe(true);
            expect(result.totalElements).toBe(0);
        });

        it('shouldReturnGenericErrorMessageForNonAppErrors', async () => {
            // GIVEN: A controller and a service that throws generic error
            const controller = new PaginatedPageController<TestEntity>('events', mockService);
            const url = new URL('http://localhost:5173/events?page=1&size=10');

            mockService.getAll.mockRejectedValue(new Error('Network error'));

            // WHEN: loadPageData is called
            const result = await controller.loadPageData(url);

            // THEN: The generic server error message should be used
            expect(result.errorMessage).toBe('Server error occurred');
            expect(result.items).toEqual([]);
        });

        it('shouldIncludeSearchTermInErrorState', async () => {
            // GIVEN: A failing request with search term
            const controller = new PaginatedPageController<TestEntity>('artists', mockService);
            const url = new URL('http://localhost:5173/artists?page=1&size=10&search=blues');

            mockService.getAll.mockRejectedValue(new AppError(500, 'Internal error'));

            // WHEN: loadPageData is called with search enabled
            const result = await controller.loadPageData(url, true);

            // THEN: The error state should include the search term
            expect(result.errorMessage).toBe('Internal error');
            expect(result.searchTerm).toBe('blues');
        });

        it('shouldHandleInvalidApiResponse', async () => {
            // GIVEN: A controller and invalid API response
            const controller = new PaginatedPageController<TestEntity>('artists', mockService);
            const url = new URL('http://localhost:5173/artists?page=1&size=10');

            mockService.getAll.mockResolvedValue({
                items: []
            } as any);

            // WHEN: loadPageData is called
            const result = await controller.loadPageData(url);

            // THEN: An error state should be returned
            expect(result.errorMessage).toBeDefined();
            expect(result.items).toEqual([]);
        });

        it('shouldHandleResponseWithNonArrayContent', async () => {
            // GIVEN: A response with non-array content
            const controller = new PaginatedPageController<TestEntity>('events', mockService);
            const url = new URL('http://localhost:5173/events?page=1&size=10');

            mockService.getAll.mockResolvedValue({
                content: 'not an array',
                totalElements: 10,
                totalPages: 1,
                number: 0,
                size: 10,
                first: true,
                last: true
            } as any);

            // WHEN: loadPageData is called
            const result = await controller.loadPageData(url);

            // THEN: An error state should be returned
            expect(result.errorMessage).toContain('Réponse invalide du serveur');
            expect(result.items).toEqual([]);
        });

        it('shouldHandleNullResponse', async () => {
            // GIVEN: A null response
            const controller = new PaginatedPageController<TestEntity>('artists', mockService);
            const url = new URL('http://localhost:5173/artists?page=1&size=10');

            mockService.getAll.mockResolvedValue(null as any);

            // WHEN: loadPageData is called
            const result = await controller.loadPageData(url);

            // THEN: An error state should be returned
            expect(result.errorMessage).toBeDefined();
            expect(result.items).toEqual([]);
        });
    });

    describe('loadPageData - pagination parameter extraction', () => {
        it('shouldExtractPageAndSizeFromURL', async () => {
            // GIVEN: A URL with specific pagination parameters
            const controller = new PaginatedPageController<TestEntity>('artists', mockService);
            const url = new URL('http://localhost:5173/artists?page=5&size=25');

            mockService.getAll.mockResolvedValue({
                content: [],
                totalElements: 0,
                totalPages: 1,
                number: 4,
                size: 25,
                first: false,
                last: true
            });

            // WHEN: loadPageData is called
            await controller.loadPageData(url);

            // THEN: The pagination validator should be called with correct params
            expect(mockPaginationValidator.validate).toHaveBeenCalledWith('5', '25');
        });

        it('shouldUseDefaultSizeWhenNotProvided', async () => {
            // GIVEN: A URL without size parameter
            const controller = new PaginatedPageController<TestEntity>('events', mockService);
            const url = new URL('http://localhost:5173/events'); // No page or size params

            mockService.getAll.mockResolvedValue({
                content: [],
                totalElements: 0,
                totalPages: 1,
                number: 0,
                size: 10,
                first: true,
                last: true
            });

            // WHEN: loadPageData is called
            await controller.loadPageData(url);

            // THEN: The validator should be called with null page and default size
            expect(mockPaginationValidator.validate).toHaveBeenCalledWith(null, '10');
        });
    });

    describe('data sanitization', () => {
        it('shouldSanitizeNumericFields', async () => {
            // GIVEN: A response with potentially invalid numeric values
            const controller = new PaginatedPageController<TestEntity>('artists', mockService);
            const url = new URL('http://localhost:5173/artists?page=1&size=10');

            mockService.getAll.mockResolvedValue({
                content: [{ id: 1, name: 'Test' }],
                totalElements: 10,
                totalPages: 2,
                number: 0,
                size: 10,
                first: true,
                last: false
            });

            // WHEN: loadPageData is called
            await controller.loadPageData(url);

            // THEN: Numeric fields should be sanitized
            expect(mockDataValidator.sanitizeNumber).toHaveBeenCalledWith(2, 1); // totalPages
            expect(mockDataValidator.sanitizeNumber).toHaveBeenCalledWith(10, 0); // totalElements
            expect(mockDataValidator.sanitizeNumber).toHaveBeenCalledWith(10, 10); // size
        });

        it('shouldSanitizeBooleanFields', async () => {
            // GIVEN: A response with boolean values
            const controller = new PaginatedPageController<TestEntity>('events', mockService);
            const url = new URL('http://localhost:5173/events?page=1&size=10');

            mockService.getAll.mockResolvedValue({
                content: [],
                totalElements: 0,
                totalPages: 1,
                number: 0,
                size: 10,
                first: true,
                last: true
            });

            // WHEN: loadPageData is called
            await controller.loadPageData(url);

            // THEN: Boolean fields should be sanitized
            expect(mockDataValidator.sanitizeBoolean).toHaveBeenCalledWith(true); // first
            expect(mockDataValidator.sanitizeBoolean).toHaveBeenCalledWith(true); // last
        });
    });

    describe('integration scenarios', () => {
        it('shouldHandleCompleteSuccessfulFlow', async () => {
            // GIVEN: A complete setup with realistic data
            const controller = new PaginatedPageController<TestEntity>('artists', mockService);
            const url = new URL('http://localhost:5173/artists?page=2&size=15&search=jazz');

            const mockResponse: PaginatedResponse<TestEntity> = {
                content: [
                    { id: 16, name: 'Jazz Artist 1' },
                    { id: 17, name: 'Jazz Artist 2' },
                    { id: 18, name: 'Jazz Artist 3' }
                ],
                totalElements: 45,
                totalPages: 3,
                number: 1,
                size: 15,
                first: false,
                last: false
            };

            mockService.getAll.mockResolvedValue(mockResponse);

            // WHEN: loadPageData is called with all features enabled
            const result = await controller.loadPageData(url, true);

            // THEN: All data should be correctly processed
            expect(result.items).toHaveLength(3);
            expect(result.page).toBe(2);
            expect(result.size).toBe(15);
            expect(result.totalPages).toBe(3);
            expect(result.totalElements).toBe(45);
            expect(result.searchTerm).toBe('jazz');
            expect(result.first).toBe(false);
            expect(result.last).toBe(false);
            expect(result.errorMessage).toBeUndefined();
        });

        it('shouldHandleEmptyResultsWithSearch', async () => {
            // GIVEN: A search query with no results
            const controller = new PaginatedPageController<TestEntity>('events', mockService);
            const url = new URL('http://localhost:5173/events?page=1&size=10&search=nonexistent');

            mockService.getAll.mockResolvedValue({
                content: [],
                totalElements: 0,
                totalPages: 0,
                number: 0,
                size: 10,
                first: true,
                last: true
            });

            // WHEN: loadPageData is called
            const result = await controller.loadPageData(url, true);

            // THEN: An empty result with search term should be returned
            expect(result.items).toEqual([]);
            expect(result.totalElements).toBe(0);
            expect(result.searchTerm).toBe('nonexistent');
            expect(result.errorMessage).toBeUndefined();
        });
    });
});
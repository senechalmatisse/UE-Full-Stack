import { describe, it, expect, vi, beforeEach } from 'vitest';
import { BaseService } from './base.service';
import { ApiService } from './api.service';
import { AppError } from './api.error';
import type { PaginatedResponse } from '../pagination';

// Dummy entity for tests
interface DummyEntity { id: string; name: string; }

class TestService extends BaseService<DummyEntity> {
    protected sanitize(data: any): DummyEntity {
        return { id: data.id, name: data.name };
    }
}

describe('BaseService', () => {
    let apiService: ApiService<DummyEntity>;
    let service: TestService;

    beforeEach(() => {
        apiService = {
            fetchPaginated: vi.fn(),
            request: vi.fn(),
            withJsonBody: vi.fn()
        } as unknown as ApiService<DummyEntity>;

        service = new TestService(apiService);
    });

    it('getAll shouldReturnSanitizedPaginatedData', async () => {
        // GIVEN valid paginated data
        const response: PaginatedResponse<DummyEntity> = {
            content: [{ id: '1', name: 'foo' }],
            totalElements: 1,
            totalPages: 1,
            number: 0,
            size: 1,
            first: true,
            last: true
        };
        (apiService.fetchPaginated as any).mockResolvedValue(response);

        // WHEN calling getAll
        const result = await service.getAll('/endpoint', { page: 1, size: 1 });

        // THEN it should return sanitized data
        expect(result.content[0].name).toBe('foo');
        expect(result.totalElements).toBe(1);
    });

    it('getAll shouldHandleError', async () => {
        // GIVEN fetchPaginated throws an error
        (apiService.fetchPaginated as any).mockRejectedValue(new Error('oops'));

        // WHEN calling getAll
        let error: any;
        try { await service.getAll('/endpoint', { page: 1, size: 1 }); }
        catch (err) { error = err; }

        // THEN it should throw AppError
        expect(error).toBeInstanceOf(AppError);
    });

    it('getById shouldReturnSanitizedEntity', async () => {
        // GIVEN request returns an entity
        (apiService.request as any).mockResolvedValue({ id: '1', name: 'foo' });

        // WHEN calling getById
        const result = await service.getById('/endpoint', '1');

        // THEN it should return sanitized entity
        expect(result?.id).toBe('1');
        expect(result?.name).toBe('foo');
    });

    it('getById shouldReturnNullIfNoEntity', async () => {
        // GIVEN request returns null
        (apiService.request as any).mockResolvedValue(null);

        // WHEN calling getById
        const result = await service.getById('/endpoint', '1');

        // THEN it should return null
        expect(result).toBeNull();
    });


    it('getById shouldCallHandleErrorOnFailure', async () => {
        // GIVEN request throws
        (apiService.request as any).mockRejectedValue(new Error('fail'));

        // WHEN calling getById
        let thrown: any;
        try {
            await service.getById('/endpoint', '1');
        } catch (err) {
            thrown = err;
        }

        // THEN handleError should be called and throw AppError
        expect(thrown).toBeInstanceOf(AppError);
    });

    it('create shouldReturnSanitizedEntity', async () => {
        // GIVEN request returns created entity
        (apiService.request as any).mockResolvedValue({ id: '1', name: 'foo' });
        (apiService.withJsonBody as any).mockReturnValue({});

        // WHEN calling create
        const result = await service.create('/endpoint', { name: 'foo' });

        // THEN it should return sanitized entity
        expect(result?.id).toBe('1');
    });

    it('create shouldReturnNullIfRequestReturnsNull', async () => {
        // GIVEN request returns null
        (apiService.request as any).mockResolvedValue(null);
        (apiService.withJsonBody as any).mockReturnValue({});

        // WHEN calling create
        const result = await service.create('/endpoint', { name: 'new entity' });

        // THEN it should return null
        expect(result).toBeNull();
    });

    it('create shouldCallHandleErrorOnFailure', async () => {
        // GIVEN request throws
        (apiService.request as any).mockRejectedValue(new Error('fail'));
        (apiService.withJsonBody as any).mockReturnValue({});

        // WHEN calling create
        let thrown: any;
        try {
            await service.create('/endpoint', { name: 'test' });
        } catch (err) {
            thrown = err;
        }

        // THEN it should throw AppError
        expect(thrown).toBeInstanceOf(AppError);
    });

    it('update shouldReturnSanitizedEntity', async () => {
        // GIVEN request returns updated entity
        (apiService.request as any).mockResolvedValue({ id: '1', name: 'updated' });
        (apiService.withJsonBody as any).mockReturnValue({});

        // WHEN calling update
        const result = await service.update('/endpoint', '1', { name: 'updated' });

        // THEN it should return sanitized entity
        expect(result?.name).toBe('updated');
    });

    it('update shouldReturnNullIfRequestReturnsNull', async () => {
        // GIVEN request returns null
        (apiService.request as any).mockResolvedValue(null);
        (apiService.withJsonBody as any).mockReturnValue({});

        // WHEN calling update
        const result = await service.update('/endpoint', '1', { name: 'update' });

        // THEN it should return null
        expect(result).toBeNull();
    });

    it('update shouldCallHandleErrorOnFailure', async () => {
        // GIVEN request throws
        (apiService.request as any).mockRejectedValue(new Error('fail'));
        (apiService.withJsonBody as any).mockReturnValue({});

        // WHEN calling update
        let thrown: any;
        try {
            await service.update('/endpoint', '1', { name: 'update' });
        } catch (err) {
            thrown = err;
        }

        // THEN it should throw AppError
        expect(thrown).toBeInstanceOf(AppError);
    });

    it('delete shouldReturnTrueOnSuccess', async () => {
        // GIVEN request resolves successfully
        (apiService.request as any).mockResolvedValue(undefined);

        // WHEN calling delete
        const result = await service.delete('/endpoint', '1');

        // THEN it should return true
        expect(result).toBe(true);
    });

    it('delete shouldCallHandleErrorOnFailure', async () => {
        // GIVEN request throws
        (apiService.request as any).mockRejectedValue(new Error('fail'));

        // WHEN calling delete
        let thrown: any;
        try {
            await service.delete('/endpoint', '1');
        } catch (err) {
            thrown = err;
        }

        // THEN it should throw AppError
        expect(thrown).toBeInstanceOf(AppError);
    });

    it('handleError shouldThrowAppErrorWithFallback', () => {
        // GIVEN a generic error
        const error = new Error('oops');

        // WHEN calling handleError
        let thrown: any;
        try { service['handleError'](error, 'generic'); } catch (e) { thrown = e; }

        // THEN it should throw AppError
        expect(thrown).toBeInstanceOf(AppError);
        expect(thrown.message).toBeDefined();
    });

    it('handleError shouldRethrowAppError', () => {
        // GIVEN an AppError
        const appErr = new AppError(500, 'custom');

        // WHEN calling handleError
        let thrown: any;
        try { service['handleError'](appErr, 'generic'); } catch (e) { thrown = e; }

        // THEN it should rethrow the same AppError
        expect(thrown).toBe(appErr);
    });

    it('handleError shouldUseFallbackKeyIfNoMapping', () => {
        // GIVEN a generic error with unknown status
        const error = { status: 999 };
        
        // WHEN calling handleError with fallbackKey
        let thrown: any;
        try {
            service['handleError'](error, 'generic');
        } catch (err) {
            thrown = err;
        }

        // THEN it should throw AppError using fallbackKey message
        expect(thrown).toBeInstanceOf(AppError);
        expect(thrown.message).toBeDefined();
    });
});
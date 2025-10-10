import { describe, it, expect, vi, beforeEach } from "vitest";
import { ApiService, ApiServiceFactory } from './api.service';
import { getAppConfig } from '../config';
import { AppError } from './api.error';

global.fetch = vi.fn();

describe('ApiService', () => {
    const apiConfig = getAppConfig().api;
    let service: ApiService<any>;

    beforeEach(() => {
        // GIVEN a new ApiService instance
        service = new ApiService(apiConfig);
        (fetch as vi.Mock).mockReset();
    });

    it('fetchPaginated shouldReturnDataIfValid', async () => {
        const validResponse = {
            content: [],
            totalElements: 0,
            totalPages: 0,
            number: 0,
            size: 1,
            first: true,
            last: true
        };

        // Mock makeRequest to return a Response-like object
        (service as any).makeRequest = vi.fn().mockResolvedValue({
            ok: true,
            json: async () => validResponse
        });

        const result = await service.fetchPaginated('/endpoint', { page: 1, size: 1 });
        expect(result).toEqual(validResponse);
    });

    it('fetchPaginated shouldThrowIfInvalid', async () => {
        (service as any).makeRequest = vi.fn().mockResolvedValue({
            ok: true,
            json: async () => ({ invalid: 'data' })
        });

        let error: any;
        try {
            await service.fetchPaginated('/endpoint', { page: 1, size: 1 });
        } catch (err) {
            error = err;
        }

        expect(error).toBeInstanceOf(AppError);
        expect(error.code).toBe(500);
    });

    it('shouldBuildUrlWithSearchParam', () => {
        // WHEN building url
        const url = (service as any).buildUrl('/endpoint', { page: 1, size: 5, search: 'query' });

        // THEN it should use default page and size with the search param
        expect(url).toContain('label=query');
        expect(url).toContain('page=1');
        expect(url).toContain('size=5');
    });

    it('shouldUseDefaultPageAndSizeIfUndefined', () => {
        // GIVEN endpoint and empty pagination params
        const endpoint = '/test';
        const params: any = {};

        // WHEN building url
        const url = (service as any).buildUrl(endpoint, params);

        // THEN it should use default page and size
        const { defaultSize } = getAppConfig().pagination;
        expect(url).toContain('page=1');
        expect(url).toContain(`size=${defaultSize}`);
    });

it('makeRequest shouldReturnResponseIfOk', async () => {
    // GIVEN fetch returning ok
    const mockResponse = { ok: true, status: 200, json: async () => ({}) } as unknown as Response;
    (fetch as vi.Mock).mockResolvedValue(mockResponse);

    // WHEN calling makeRequest
    const result = await (service as any).makeRequest('/endpoint', 'endpoint');

    // THEN it should return the Response
    expect(result).toBe(mockResponse);
});

    it('shouldThrowAppErrorIfResponseNotOk', async () => {
        // GIVEN fetch returning a 400 error
        (fetch as vi.Mock).mockResolvedValue({ ok: false, status: 400, statusText: 'Bad Request' });

        // WHEN calling makeRequest
        let caughtError: any;
        try {
            await (service as any).makeRequest('/endpoint', 'endpoint');
        } catch (err) {
            caughtError = err;
        }

        // THEN it should throw AppError with the response status
        expect(caughtError).toBeInstanceOf(AppError);
        expect(caughtError.code).toBe(400);
    });

    it('shouldRethrowErrorFromMakeRequestCatch', async () => {
        // GIVEN fetch throwing a network error
        const networkError = new Error('Network failure');
        (fetch as vi.Mock).mockRejectedValue(networkError);

        // WHEN calling makeRequest
        let caughtError: any;
        try {
            await (service as any).makeRequest('/endpoint', 'endpoint');
        } catch (err) {
            caughtError = err;
        }

        // THEN it should rethrow the original error
        expect(caughtError).toBe(networkError);
    });

    it('makeRequest shouldThrowAppErrorWithStatusTextOrServerMessage', async () => {
        (fetch as vi.Mock).mockResolvedValue({ ok: false, status: 400, statusText: '' });
        let error: any;
        try {
            await (service as any).makeRequest('/endpoint', 'endpoint');
        } catch (err) {
            error = err;
        }
        expect(error).toBeInstanceOf(AppError);
        expect(error.message).toBe(getAppConfig().errors.messages.server);
    });

    it('shouldAbortRequestIfControllerExists', () => {
        // GIVEN an ongoing controller
        const controller = new AbortController();
        (service as any).controllers.set('endpoint', controller);
        vi.spyOn(controller, 'abort');

        // WHEN cancelling request
        (service as any).cancelRequest('endpoint');

        // THEN controller.abort should be called and deleted
        expect(controller.abort).toHaveBeenCalled();
        expect((service as any).controllers.has('endpoint')).toBe(false);
    });

    it('withJsonBody shouldReturnCorrectRequestInit', () => {
        const payload = { name: 'test' };
        const req = service.withJsonBody(payload, 'POST');

        expect(req.method).toBe('POST');
        expect(req.body).toBe(JSON.stringify(payload));
        expect(req.headers).toEqual(apiConfig.defaultHeaders);
    });

    it('shouldThrow408OnAbortErrorAnd503OnGeneric', () => {
        // GIVEN a DOMException AbortError
        const abortErr = new DOMException('Aborted', 'AbortError');

        // THEN handleError should throw AppError 408
        expect(() => (service as any).handleError(abortErr))
            .toThrowError(new AppError(408, getAppConfig().errors.messages.timeout));

        // GIVEN a generic error
        const genericErr = new Error('oops');

        // THEN handleError should throw AppError 503
        expect(() => (service as any).handleError(genericErr))
            .toThrowError(new AppError(503, getAppConfig().errors.messages.generic));
    });

    it('shouldReturnNullForNoContentInRequest', async () => {
        // GIVEN fetch returning 204
        (fetch as vi.Mock).mockResolvedValue({ ok: true, status: 204, text: async () => '' });

        // WHEN calling request
        const result = await service.request('/endpoint');

        // THEN it should return null
        expect(result).toBeNull();
    });

    it('request shouldThrowAppErrorIfResponseNotOk', async () => {
        (fetch as vi.Mock).mockResolvedValue({ ok: false, status: 403, statusText: 'Forbidden' });
        let error: any;
        try {
            await service.request('/endpoint');
        } catch (err) {
            error = err;
        }
        expect(error).toBeInstanceOf(AppError);
        expect(error.code).toBe(403);
        expect(error.message).toBe('Forbidden');
    });

    it('shouldThrowAppErrorIfValidatorFailsInRequest', async () => {
        // GIVEN fetch returning JSON not matching validator
        (fetch as vi.Mock).mockResolvedValue({
            ok: true,
            status: 200,
            text: async () => JSON.stringify({ wrong: 'data' })
        });

        // WHEN calling request with validator
        let caughtError: any;
        try {
            await service.request('/endpoint', {}, (data: any): data is { foo: string } => 'foo' in data);
        } catch (err) {
            caughtError = err;
        }

        // THEN it should throw AppError 500
        expect(caughtError).toBeInstanceOf(AppError);
        expect(caughtError.code).toBe(500);
    });

    it('request shouldUseServerMessageIfStatusTextEmpty', async () => {
        // GIVEN fetch returning not ok with empty statusText
        (fetch as vi.Mock).mockResolvedValue({
            ok: false,
            status: 418, // arbitrary error code
            statusText: ''
        });

        let error: any;
        try {
            await service.request('/endpoint');
        } catch (err) {
            error = err;
        }

        // THEN it should throw AppError with message = messages.server
        expect(error).toBeInstanceOf(AppError);
        expect(error.code).toBe(418);
        expect(error.message).toBe(getAppConfig().errors.messages.server);
    });

    it('shouldReturnJsonFromRequest', async () => {
        // GIVEN fetch returning valid JSON
        const jsonData = { foo: 'bar' };
        (fetch as vi.Mock).mockResolvedValue({
            ok: true,
            status: 200,
            text: async () => JSON.stringify(jsonData)
        });

        // WHEN calling request
        const result = await service.request('/endpoint');

        // THEN it should return parsed JSON
        expect(result).toEqual(jsonData);
    });

    it('request shouldReturnNullIfNoText', async () => {
        (fetch as vi.Mock).mockResolvedValue({
            ok: true,
            status: 200,
            text: async () => ''
        });

        const result = await service.request('/endpoint');
        expect(result).toBeNull();
    });

    it('shouldCreateSingletonApiServiceFromFactory', () => {
        // GIVEN two calls to create factory with same key
        const service1 = ApiServiceFactory.create('singleton');
        const service2 = ApiServiceFactory.create('singleton');

        // THEN both should be the same instance
        expect(service1).toBe(service2);
    });
});
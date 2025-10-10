import { describe, it, expect, vi, beforeEach } from "vitest";
import { PaginatedPageController } from "./paginated-page.controller";
import { getAppConfig } from "../config";
import { getDataValidator, getPaginationValidator } from "../validation";
import { AppError } from "../services";

vi.mock("../config", () => ({
    getAppConfig: vi.fn()
}));

vi.mock("../validation", () => ({
    getPaginationValidator: vi.fn(),
    getDataValidator: vi.fn()
}));

describe("PaginatedPageController", () => {
    let serviceMock: any;
    let controller: PaginatedPageController<any>;
    const paginationValidatorMock = {
        validate: vi.fn(),
        toApiPage: vi.fn(),
        fromApiPage: vi.fn()
    };
    const dataValidatorMock = {
        sanitizeNumber: vi.fn(),
        sanitizeBoolean: vi.fn()
    };

    beforeEach(() => {
        vi.clearAllMocks();
        serviceMock = { getAll: vi.fn() };
        (getPaginationValidator as vi.Mock).mockReturnValue(paginationValidatorMock);
        (getDataValidator as vi.Mock).mockReturnValue(dataValidatorMock);
        (getAppConfig as vi.Mock).mockReturnValue({
            pagination: { minSize: 1 },
            errors: {
                messages: { server: "Server error" },
                colors: { 403: "orange", 500: "red" }
            }
        });

        controller = new PaginatedPageController("artists", serviceMock);
    });

    it("shouldLoadPageDataNormally", async () => {
        // GIVEN valid pagination params and API response
        paginationValidatorMock.validate.mockReturnValue({ page: 1, size: 10 });
        paginationValidatorMock.toApiPage.mockReturnValue(1);
        paginationValidatorMock.fromApiPage.mockReturnValue(1);
        dataValidatorMock.sanitizeNumber.mockImplementation((v) => v);
        dataValidatorMock.sanitizeBoolean.mockImplementation((v) => v);
        serviceMock.getAll.mockResolvedValue({
            content: ["artist1", "artist2"],
            number: 1,
            totalPages: 5,
            first: true,
            last: false,
            totalElements: 2,
            size: 10
        });

        // WHEN loading page data
        const result = await controller.loadPageData(new URL("http://localhost/artists?page=1"));

        // THEN it should return mapped items with pagination info
        expect(result.items).toEqual(["artist1", "artist2"]);
        expect(result.page).toBe(1);
        expect(result.totalPages).toBe(5);
        expect(result.first).toBe(true);
        expect(result.last).toBe(false);
        expect(result.totalElements).toBe(2);
        expect(result.size).toBe(10);
    });

    it("shouldFallbackToLastPageWhenPageExceedsTotal", async () => {
        // GIVEN requested page exceeds total pages
        paginationValidatorMock.validate.mockReturnValue({ page: 10, size: 10 });
        paginationValidatorMock.toApiPage.mockReturnValue(10);
        paginationValidatorMock.fromApiPage.mockReturnValue(5);
        dataValidatorMock.sanitizeNumber.mockImplementation((v) => v);
        dataValidatorMock.sanitizeBoolean.mockImplementation((v) => v);

        serviceMock.getAll
            .mockResolvedValueOnce({
                content: ["artist1"],
                number: 10,
                totalPages: 5,
                first: true,
                last: true,
                totalElements: 5,
                size: 10
            })
            .mockResolvedValueOnce({
                content: ["artist1"],
                number: 5,
                totalPages: 5,
                first: true,
                last: true,
                totalElements: 5,
                size: 10
            });

        // WHEN loading page data
        const result = await controller.loadPageData(new URL("http://localhost/artists?page=10"));

        // THEN it should return the last valid page
        expect(result.page).toBe(5);
    });

    it("shouldReturnEmptyStateOnServerError", async () => {
        // GIVEN API throws an error
        paginationValidatorMock.validate.mockReturnValue({ page: 1, size: 10 });
        paginationValidatorMock.toApiPage.mockReturnValue(1);
        serviceMock.getAll.mockRejectedValue(new Error("Network error"));

        // WHEN loading page data
        const result = await controller.loadPageData(new URL("http://localhost/artists?page=1"));

        // THEN it should return empty page state with error message
        expect(result.items).toEqual([]);
        expect(result.errorMessage).toBe("Server error");
        expect(result.page).toBe(1);
        expect(result.totalPages).toBe(1);
    });

    it("shouldIncludeSearchTermWhenWithSearchIsTrue", async () => {
        // GIVEN withSearch = true
        paginationValidatorMock.validate.mockReturnValue({ page: 1, size: 10 });
        paginationValidatorMock.toApiPage.mockReturnValue(1);
        paginationValidatorMock.fromApiPage.mockReturnValue(1);
        dataValidatorMock.sanitizeNumber.mockImplementation((v) => v);
        dataValidatorMock.sanitizeBoolean.mockImplementation((v) => v);
        serviceMock.getAll.mockResolvedValue({
            content: ["artist1"],
            number: 1,
            totalPages: 1,
            first: true,
            last: true,
            totalElements: 1,
            size: 10
        });

        // WHEN loading page data with search
        const result = await controller.loadPageData(
            new URL("http://localhost/artists?page=1&search=rock"),
            true
        );

        // THEN it should include search term in the result
        expect(result.searchTerm).toBe("rock");
    });

    it("shouldReturnEmptyStringForSearchTermWhenParamMissing", async () => {
        // GIVEN withSearch = true but URL has no "search" param
        paginationValidatorMock.validate.mockReturnValue({ page: 1, size: 10 });
        paginationValidatorMock.toApiPage.mockReturnValue(1);
        paginationValidatorMock.fromApiPage.mockReturnValue(1);
        dataValidatorMock.sanitizeNumber.mockImplementation((v) => v);
        dataValidatorMock.sanitizeBoolean.mockImplementation((v) => v);
        serviceMock.getAll.mockResolvedValue({
            content: [],
            number: 1,
            totalPages: 1,
            first: true,
            last: true,
            totalElements: 0,
            size: 10
        });

        // WHEN loading page data
        const result = await controller.loadPageData(
            new URL("http://localhost/artists?page=1"),
            true
        );

        // THEN searchTerm should be empty string
        expect(result.searchTerm).toBe("");
    });

    it("shouldUseAppErrorMessageWhenErrorIsAppError", async () => {
        // GIVEN service throws an AppError
        paginationValidatorMock.validate.mockReturnValue({ page: 1, size: 10 });
        paginationValidatorMock.toApiPage.mockReturnValue(1);
        serviceMock.getAll.mockRejectedValue(new AppError(403, "Forbidden"));

        // WHEN loading page data
        const result = await controller.loadPageData(new URL("http://localhost/artists?page=1"));

        // THEN errorMessage should use AppError.message
        expect(result.errorMessage).toBe("Forbidden");
    });

    it("shouldReturnErrorMessageForInvalidApiResponse", async () => {
        // GIVEN service returns invalid API response
        paginationValidatorMock.validate.mockReturnValue({ page: 1, size: 10 });
        paginationValidatorMock.toApiPage.mockReturnValue(1);
        serviceMock.getAll.mockResolvedValue({ invalid: true });

        // WHEN loading page data
        const result = await controller.loadPageData(new URL("http://localhost/artists?page=1"));

        // THEN it should return empty page state with server error
        expect(result.errorMessage).toBe("Réponse invalide du serveur pour artists");
        expect(result.items).toEqual([]);
    });
});
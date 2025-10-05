export type { IPaginationValidator } from "./pagination-validator.interface";
export type { IDataValidator } from "./data-validator.interface";

export { PaginationValidator } from "./pagination.validator";
export { DataValidator } from "./data.validator";

export { getPaginationValidator, getDataValidator } from "./validator.factory";
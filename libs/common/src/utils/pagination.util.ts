import { PaginatedResult, PaginationQuery } from '../interfaces/pagination.interface';

export interface NormalizedPagination {
  page: number;
  limit: number;
  skip: number;
  sort: Record<string, 1 | -1>;
}

/**
 * Normalize an unsanitized pagination query into Mongo-ready values.
 * Caps limit at 100 to protect against runaway scans.
 */
export function normalizePagination(query: PaginationQuery = {}): NormalizedPagination {
  const page = Math.max(1, Number(query.page) || 1);
  const limit = Math.min(100, Math.max(1, Number(query.limit) || 20));
  const sortBy = query.sortBy || 'createdAt';
  const sortOrder = query.sortOrder === 'asc' ? 1 : -1;
  return { page, limit, skip: (page - 1) * limit, sort: { [sortBy]: sortOrder } };
}

export function buildPaginatedResult<T>(data: T[], total: number, page: number, limit: number): PaginatedResult<T> {
  const totalPages = Math.max(1, Math.ceil(total / limit));
  return {
    data,
    meta: {
      total,
      page,
      limit,
      totalPages,
      hasNext: page < totalPages,
      hasPrev: page > 1,
    },
  };
}

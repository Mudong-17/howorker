import { PrismaClient } from "../generated/prisma";
import { PrismaD1 } from "@prisma/adapter-d1";
import type { Bindings } from "../index";

// 创建数据库连接
export function createPrismaClient(env: Bindings) {
  // 使用 D1 适配器连接 Cloudflare D1
  const adapter = new PrismaD1(env.DB);

  return new PrismaClient({
    adapter,
    log: ["error", "warn"],
  });
}

// 分页参数类型
export interface PaginationParams {
  page?: number;
  limit?: number;
}

// 标准化分页参数
export function normalizePagination(params: PaginationParams) {
  const page = Math.max(1, params.page || 1);
  const limit = Math.min(100, Math.max(1, params.limit || 20));
  const skip = (page - 1) * limit;

  return { page, limit, skip };
}

// 分页响应类型
export interface PaginatedResponse<T> {
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    pages: number;
    hasNext: boolean;
    hasPrev: boolean;
  };
}

// 创建分页响应
export function createPaginatedResponse<T>(
  data: T[],
  total: number,
  page: number,
  limit: number
): PaginatedResponse<T> {
  const pages = Math.ceil(total / limit);

  return {
    data,
    pagination: {
      page,
      limit,
      total,
      pages,
      hasNext: page < pages,
      hasPrev: page > 1,
    },
  };
}

// 通用查询过滤器
export interface CommonFilters {
  search?: string;
  status?: string;
  priority?: string;
  createdAfter?: string;
  createdBefore?: string;
  updatedAfter?: string;
  updatedBefore?: string;
}

// 构建日期过滤器
export function buildDateFilters(filters: CommonFilters) {
  const dateFilters: any = {};

  if (filters.createdAfter || filters.createdBefore) {
    dateFilters.createdAt = {};
    if (filters.createdAfter) {
      dateFilters.createdAt.gte = new Date(filters.createdAfter);
    }
    if (filters.createdBefore) {
      dateFilters.createdAt.lte = new Date(filters.createdBefore);
    }
  }

  if (filters.updatedAfter || filters.updatedBefore) {
    dateFilters.updatedAt = {};
    if (filters.updatedAfter) {
      dateFilters.updatedAt.gte = new Date(filters.updatedAfter);
    }
    if (filters.updatedBefore) {
      dateFilters.updatedAt.lte = new Date(filters.updatedBefore);
    }
  }

  return dateFilters;
}

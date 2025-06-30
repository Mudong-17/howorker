// 用户相关类型
export interface User {
  id: string;
  name?: string;
  email?: string;
  image?: string;
  createdAt: string;
  updatedAt: string;
}

// Todo 状态枚举
export enum TodoStatus {
  PENDING = "PENDING",
  IN_PROGRESS = "IN_PROGRESS",
  COMPLETED = "COMPLETED",
  CANCELLED = "CANCELLED",
}

// Todo 优先级枚举
export enum TodoPriority {
  LOW = "LOW",
  MEDIUM = "MEDIUM",
  HIGH = "HIGH",
  URGENT = "URGENT",
}

// Todo 任务类型
export interface Todo {
  id: string;
  encryptedTitle: string;
  titleNonce: string;
  encryptedDetails?: string;
  detailsNonce?: string;
  status: TodoStatus;
  priority: TodoPriority;
  dueDate?: string;
  completedAt?: string;
  estimatedMinutes?: number;
  actualMinutes?: number;
  encryptionKeyId: string;
  userId: string;
  parentId?: string;
  createdAt: string;
  updatedAt: string;
  // 临时添加的明文字段（用于调试和显示）
  title?: string;
  description?: string;
  // 关联数据
  subtasks?: Todo[];
  labels?: TodoLabel[];
  comments?: TodoComment[];
  // 计数字段
  _count?: {
    subtasks: number;
    comments: number;
  };
}

// 标签类型
export interface TodoLabel {
  id: string;
  encryptedName: string;
  nameNonce: string;
  encryptedDetails?: string;
  detailsNonce?: string;
  encryptionKeyId: string;
  userId: string;
  createdAt: string;
  updatedAt: string;
}

// 评论类型
export interface TodoComment {
  id: string;
  encryptedContent: string;
  contentNonce: string;
  encryptedDetails?: string;
  detailsNonce?: string;
  encryptionKeyId: string;
  todoId: string;
  userId: string;
  isDeleted: boolean;
  deletedAt?: string;
  createdAt: string;
  updatedAt: string;
  user?: User;
}

// 认证相关类型
export interface AuthState {
  isAuthenticated: boolean;
  user: User | null;
  accessToken: string | null;
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterData {
  email: string;
  password: string;
  name?: string;
}

export interface SRPRegisterData {
  email: string;
  salt: string;
  verifier: string;
  name?: string;
}

// SRP 认证相关
export interface SRPInitResponse {
  sessionId: string;
  serverPublicEphemeral: string;
  salt: string;
}

export interface SRPVerifyRequest {
  sessionId: string;
  clientSessionProof: string;
}

export interface SRPVerifyResponse {
  success: boolean;
  token: string;
  user: User;
  serverSessionProof: string;
}

// API 响应类型
export interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

// 分页类型
export interface PaginationParams {
  page?: number;
  limit?: number;
  sort?: string;
  order?: "asc" | "desc";
}

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

// 统计数据类型
export interface TodoStats {
  totalTodos: number;
  completedTodos: number;
  pendingTodos: number;
  inProgressTodos: number;
  cancelledTodos: number;
  overdueCount: number;
  completionRate: number;
  avgCompletionTime?: number;
}

import { api } from "./client";
import type {
  SRPRegisterData,
  SRPInitResponse,
  SRPVerifyRequest,
  SRPVerifyResponse,
  User,
} from "@/types";

// SRP 注册
export const srpRegister = async (data: SRPRegisterData) => {
  const response = await api.post<{ user: User }>("/auth/register", data);
  return response;
};

// SRP 登录初始化
export const srpLoginInit = async (
  email: string,
  clientPublicEphemeral: string
) => {
  const response = await api.post<SRPInitResponse>("/auth/login/init", {
    email,
    clientPublicEphemeral,
  });
  return response;
};

// SRP 登录验证
export const srpLoginVerify = async (data: SRPVerifyRequest) => {
  const response = await api.post<SRPVerifyResponse>(
    "/auth/login/verify",
    data
  );
  return response;
};

// 获取当前用户信息
export const getCurrentUser = async () => {
  const response = await api.get<User>("/auth/me");
  return response.data;
};

// 更新用户资料
export const updateProfile = async (data: Partial<User>) => {
  const response = await api.put<User>("/auth/profile", data);
  return response.data;
};

// 登出
export const logout = async () => {
  const response = await api.post("/auth/logout");
  return response.data;
};

// 删除账户
export const deleteAccount = async () => {
  const response = await api.delete("/auth/account");
  return response.data;
};

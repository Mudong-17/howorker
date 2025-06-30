import { useMutation, useQuery } from "@tanstack/react-query";
import { useAuthStore } from "@/stores/auth";
import {
  srpRegister,
  srpLoginInit,
  srpLoginVerify,
  getCurrentUser,
  logout,
} from "@/api/auth";
import { generateSRPSession, generateSRPRegistration } from "@/utils/srp";
import type { RegisterData } from "@/types";

// 注册Hook
export function useRegister() {
  return useMutation({
    mutationFn: async (data: RegisterData) => {
      // 生成SRP注册数据
      const srpData = generateSRPRegistration(data.email, data.password);

      // 发送注册请求，包含salt和verifier
      const response = await srpRegister({
        email: data.email,
        salt: srpData.salt,
        verifier: srpData.verifier,
        name: data.name,
      });

      return response;
    },
    onSuccess: (data) => {
      if (data?.data?.user) {
        // 注册成功后不自动登录，让用户手动登录
        console.log("注册成功:", data.data.user);
      }
    },
  });
}

// 登录Hook
export function useLogin() {
  const { setAuth } = useAuthStore();

  return useMutation({
    mutationFn: async ({
      email,
      password,
    }: {
      email: string;
      password: string;
    }) => {
      // 1. 生成客户端临时密钥对
      const srpSession = generateSRPSession(email, password);

      // 2. 初始化SRP登录，发送客户端公钥
      const initResponse = await srpLoginInit(
        email,
        srpSession.clientPublicEphemeral
      );
      if (!initResponse?.data) {
        throw new Error("登录初始化失败");
      }

      // 3. 完成客户端会话验证
      const verifyData = srpSession.completeSession(
        initResponse.data.salt,
        initResponse.data.serverPublicEphemeral
      );

      // 4. 验证登录
      const verifyResponse = await srpLoginVerify({
        sessionId: initResponse.data.sessionId,
        clientSessionProof: verifyData.clientProof,
      });

      return verifyResponse;
    },
    onSuccess: (data) => {
      console.log("登录成功:", data);
      if (data?.data) {
        setAuth(data.data.user, data.data.token);
      }
    },
  });
}

// 登出Hook
export function useLogout() {
  const { clearAuth } = useAuthStore();

  return useMutation({
    mutationFn: logout,
    onSuccess: () => {
      clearAuth();
    },
  });
}

// 获取当前用户Hook
export function useCurrentUser() {
  const { isAuthenticated } = useAuthStore();

  return useQuery({
    queryKey: ["currentUser"],
    queryFn: getCurrentUser,
    enabled: isAuthenticated,
    staleTime: 5 * 60 * 1000, // 5分钟
  });
}

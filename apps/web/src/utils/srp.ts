import SRP from "secure-remote-password/client";

export interface SRPSession {
  clientPublicEphemeral: string;
  completeSession: (
    salt: string,
    serverPublicEphemeral: string
  ) => {
    clientProof: string;
  };
}

// 生成SRP客户端会话
export function generateSRPSession(
  email: string,
  password: string
): SRPSession {
  // 生成客户端临时密钥对
  const clientEphemeral = SRP.generateEphemeral();

  return {
    clientPublicEphemeral: clientEphemeral.public,
    completeSession: (salt: string, serverPublicEphemeral: string) => {
      // 派生私钥
      const privateKey = SRP.derivePrivateKey(salt, email, password);

      // 派生会话密钥和证明
      const clientSession = SRP.deriveSession(
        clientEphemeral.secret,
        serverPublicEphemeral,
        salt,
        email,
        privateKey
      );

      return {
        clientProof: clientSession.proof,
      };
    },
  };
}

// 生成SRP注册数据
export function generateSRPRegistration(email: string, password: string) {
  const salt = SRP.generateSalt();
  const privateKey = SRP.derivePrivateKey(salt, email, password);
  const verifier = SRP.deriveVerifier(privateKey);

  return {
    salt,
    verifier,
  };
}

// 验证服务器证明（可选的额外安全检查）
// export function verifyServerProof(
//   clientSession: any,
//   serverProof: string
// ): boolean {
//   try {
//     SRP.verifySession(clientSession, serverProof);
//     return true;
//   } catch (error) {
//     console.error("Server proof verification failed:", error);
//     return false;
//   }
// }

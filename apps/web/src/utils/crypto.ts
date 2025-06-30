/**
 * 端对端加密工具
 * 使用 Web Crypto API 实现 AES-GCM 加密
 */

// 生成随机的加密密钥
export async function generateEncryptionKey(): Promise<CryptoKey> {
  return await crypto.subtle.generateKey(
    {
      name: "AES-GCM",
      length: 256,
    },
    true, // 可导出
    ["encrypt", "decrypt"]
  );
}

// 将密钥导出为 Base64 字符串
export async function exportKey(key: CryptoKey): Promise<string> {
  const exported = await crypto.subtle.exportKey("raw", key);
  return btoa(String.fromCharCode(...new Uint8Array(exported)));
}

// 从 Base64 字符串导入密钥
export async function importKey(keyData: string): Promise<CryptoKey> {
  const keyBuffer = Uint8Array.from(atob(keyData), (c) => c.charCodeAt(0));
  return await crypto.subtle.importKey(
    "raw",
    keyBuffer,
    {
      name: "AES-GCM",
      length: 256,
    },
    true,
    ["encrypt", "decrypt"]
  );
}

// 生成随机的初始化向量 (IV/Nonce)
export function generateNonce(): string {
  const nonce = crypto.getRandomValues(new Uint8Array(12)); // 96 bits for GCM
  return btoa(String.fromCharCode(...nonce));
}

// 加密文本
export async function encryptText(
  plaintext: string,
  key: CryptoKey,
  nonce?: string
): Promise<{ encryptedData: string; nonce: string }> {
  const encoder = new TextEncoder();
  const data = encoder.encode(plaintext);

  // 如果没有提供 nonce，生成一个新的
  const nonceString = nonce || generateNonce();
  const nonceBuffer = Uint8Array.from(atob(nonceString), (c) =>
    c.charCodeAt(0)
  );

  const encrypted = await crypto.subtle.encrypt(
    {
      name: "AES-GCM",
      iv: nonceBuffer,
    },
    key,
    data
  );

  const encryptedData = btoa(String.fromCharCode(...new Uint8Array(encrypted)));

  return {
    encryptedData,
    nonce: nonceString,
  };
}

// 检查字符串是否是有效的Base64
function isValidBase64(str: string): boolean {
  try {
    return btoa(atob(str)) === str;
  } catch {
    return false;
  }
}

// 解密文本
export async function decryptText(
  encryptedData: string,
  key: CryptoKey,
  nonce: string
): Promise<string> {
  try {
    // 检查数据是否是有效的Base64格式
    if (!isValidBase64(encryptedData)) {
      console.warn("数据不是有效的Base64格式，可能是明文数据:", encryptedData);
      // 如果不是Base64，可能是旧的明文数据，直接返回
      return encryptedData;
    }

    if (!isValidBase64(nonce)) {
      console.warn("Nonce不是有效的Base64格式:", nonce);
      // 如果nonce无效，返回原始数据
      return encryptedData;
    }

    const encryptedBuffer = Uint8Array.from(atob(encryptedData), (c) =>
      c.charCodeAt(0)
    );
    const nonceBuffer = Uint8Array.from(atob(nonce), (c) => c.charCodeAt(0));

    const decrypted = await crypto.subtle.decrypt(
      {
        name: "AES-GCM",
        iv: nonceBuffer,
      },
      key,
      encryptedBuffer
    );

    const decoder = new TextDecoder();
    return decoder.decode(decrypted);
  } catch (error) {
    console.error("解密失败:", error);
    console.warn("尝试返回原始数据作为明文");
    // 如果解密失败，返回原始数据（可能是旧的明文数据）
    return encryptedData;
  }
}

// 从本地存储获取用户加密密钥
export async function getUserEncryptionKey(): Promise<CryptoKey | null> {
  try {
    const keyData = localStorage.getItem("userEncryptionKey");
    if (!keyData) {
      return null;
    }
    return await importKey(keyData);
  } catch (error) {
    console.error("获取用户加密密钥失败:", error);
    return null;
  }
}

// 保存用户加密密钥到本地存储
export async function saveUserEncryptionKey(key: CryptoKey): Promise<void> {
  try {
    const keyData = await exportKey(key);
    localStorage.setItem("userEncryptionKey", keyData);
  } catch (error) {
    console.error("保存用户加密密钥失败:", error);
    throw error;
  }
}

// 初始化或获取用户加密密钥
export async function initializeUserEncryptionKey(): Promise<CryptoKey> {
  let key = await getUserEncryptionKey();

  if (!key) {
    // 如果没有密钥，生成一个新的
    key = await generateEncryptionKey();
    await saveUserEncryptionKey(key);
  }

  return key;
}

// 加密任务数据
export async function encryptTodoData(data: {
  title: string;
  description?: string;
}): Promise<{
  encryptedTitle: string;
  titleNonce: string;
  encryptedDetails?: string;
  detailsNonce?: string;
  encryptionKeyId: string;
}> {
  const key = await initializeUserEncryptionKey();
  const keyId = await exportKey(key); // 使用密钥本身作为ID（实际项目中应使用哈希）

  // 加密标题
  const { encryptedData: encryptedTitle, nonce: titleNonce } =
    await encryptText(data.title, key);

  let encryptedDetails: string | undefined;
  let detailsNonce: string | undefined;

  // 加密描述（如果有）
  if (data.description) {
    const details = JSON.stringify({ description: data.description });
    const result = await encryptText(details, key);
    encryptedDetails = result.encryptedData;
    detailsNonce = result.nonce;
  }

  return {
    encryptedTitle,
    titleNonce,
    encryptedDetails,
    detailsNonce,
    encryptionKeyId: keyId.substring(0, 16), // 截取前16位作为keyId
  };
}

// 解密任务数据
export async function decryptTodoData(encryptedTodo: {
  encryptedTitle: string;
  titleNonce: string;
  encryptedDetails?: string;
  detailsNonce?: string;
}): Promise<{
  title: string;
  description?: string;
}> {
  const key = await getUserEncryptionKey();

  if (!key) {
    throw new Error("未找到解密密钥");
  }

  // 解密标题
  const title = await decryptText(
    encryptedTodo.encryptedTitle,
    key,
    encryptedTodo.titleNonce
  );

  let description: string | undefined;

  // 解密描述（如果有）
  if (encryptedTodo.encryptedDetails && encryptedTodo.detailsNonce) {
    try {
      const detailsJson = await decryptText(
        encryptedTodo.encryptedDetails,
        key,
        encryptedTodo.detailsNonce
      );

      // 尝试解析JSON
      try {
        const details = JSON.parse(detailsJson);
        description = details.description;
      } catch (jsonError) {
        // 如果JSON解析失败，可能是明文描述
        console.warn("JSON解析失败，使用原始文本作为描述:", jsonError);
        description = detailsJson;
      }
    } catch (error) {
      console.warn("解密任务详情失败:", error);
      description = undefined;
    }
  }

  return {
    title,
    description,
  };
}

import path from "node:path";
import type { PrismaConfig } from "prisma";
import { PrismaD1HTTP } from "@prisma/adapter-d1";

// import your .env file
import "dotenv/config";

type Env = {
  CLOUDFLARE_D1_TOKEN?: string;
  CLOUDFLARE_ACCOUNT_ID?: string;
  CLOUDFLARE_DATABASE_ID?: string;
  DATABASE_URL?: string;
  PRISMA_LOCAL_MIGRATION?: string;
};

// 检测是否应该使用本地模式
const shouldUseLocal =
  process.env.PRISMA_LOCAL_MIGRATION === "true" ||
  process.env.DATABASE_URL?.startsWith("file:");

// 检测是否有 D1 凭据且不强制本地模式
const shouldUseD1 =
  !shouldUseLocal &&
  process.env.CLOUDFLARE_D1_TOKEN &&
  process.env.CLOUDFLARE_ACCOUNT_ID &&
  process.env.CLOUDFLARE_DATABASE_ID;

const baseConfig = {
  earlyAccess: true,
  schema: path.join("prisma", "schema.prisma"),
} as const;

// 如果应该使用 D1，添加 migrate 配置
const configWithD1 = {
  ...baseConfig,
  migrate: {
    async adapter(env: Env) {
      console.log("☁️ 使用 D1 HTTP 适配器");
      return new PrismaD1HTTP({
        CLOUDFLARE_D1_TOKEN: env.CLOUDFLARE_D1_TOKEN!,
        CLOUDFLARE_ACCOUNT_ID: env.CLOUDFLARE_ACCOUNT_ID!,
        CLOUDFLARE_DATABASE_ID: env.CLOUDFLARE_DATABASE_ID!,
      });
    },
  },
} satisfies PrismaConfig<Env>;

// 如果强制本地模式或没有 D1 凭据，使用基础配置（标准 SQLite）
if (shouldUseLocal) {
  console.log("🔧 使用本地 SQLite 模式进行迁移");
}

export default shouldUseD1 ? configWithD1 : baseConfig;

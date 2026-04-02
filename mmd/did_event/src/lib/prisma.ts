// src/lib/prisma.ts
import { PrismaClient } from "@/generated/prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import pg from "pg";
import { ensureDatabaseUrl } from "@/lib/db-env";

const globalForPrisma = global as unknown as { prisma: PrismaClient };

ensureDatabaseUrl();

const prismaClientSingleton = () => {
  // sslmode=require の警告を回避: 接続文字列の sslmode を verify-full に置換
  const dbUrl = process.env.DATABASE_URL!.replace(
    /sslmode=require\b/,
    "sslmode=verify-full"
  );

  const pool = new pg.Pool({
    connectionString: dbUrl,
    max: 1,                    // Serverless: 1接続のみ（インスタンス数が多くてもDB上限を超えにくい）
    idleTimeoutMillis: 5000,   // 5秒アイドルで解放（Serverlessでは素早く返す）
    connectionTimeoutMillis: 10000, // 10秒で接続タイムアウト
    allowExitOnIdle: true,     // 全接続がアイドルならプロセス終了を許可
  });

  // プール枯渇やDB切断時にプロセスをクラッシュさせない
  pool.on("error", (err) => {
    console.error("[DB Pool] Unexpected error on idle client:", err.message);
  });

  const adapter = new PrismaPg(pool);
  return new PrismaClient({
    adapter,
    log: process.env.NODE_ENV === "development" ? ["error", "warn"] : ["error"],
  });
};

const _prisma = globalForPrisma.prisma || prismaClientSingleton();
export const prisma = _prisma as any; // Schema and code use models not in generated client (communityMember, campaign, etc.)

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = _prisma;

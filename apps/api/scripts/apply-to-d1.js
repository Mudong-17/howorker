#!/usr/bin/env node

const { execSync } = require("child_process");
const fs = require("fs");
const path = require("path");

function applyMigrationsToLocalD1() {
  console.log("🔄 将 Prisma 迁移应用到本地 D1 数据库...");

  try {
    const migrationsDir = path.join("prisma", "migrations");

    if (!fs.existsSync(migrationsDir)) {
      console.log("❌ 没有找到 Prisma 迁移目录");
      console.log("💡 请先运行: bunx prisma migrate dev");
      process.exit(1);
    }

    // 获取所有迁移目录
    const migrationDirs = fs
      .readdirSync(migrationsDir)
      .filter((name) =>
        fs.statSync(path.join(migrationsDir, name)).isDirectory()
      )
      .sort();

    if (migrationDirs.length === 0) {
      console.log("❌ 没有找到迁移文件");
      process.exit(1);
    }

    console.log(`📁 找到 ${migrationDirs.length} 个迁移:`);
    migrationDirs.forEach((dir) => console.log(`  - ${dir}`));

    // 解析命令行参数
    const args = process.argv.slice(2);
    const databaseName =
      args.find((arg) => arg.startsWith("--db="))?.split("=")[1] || "howorker";

    console.log(`\n🎯 目标数据库: ${databaseName} (本地)`);

    // 应用每个迁移
    for (const migrationDir of migrationDirs) {
      const migrationPath = path.join(
        migrationsDir,
        migrationDir,
        "migration.sql"
      );

      if (!fs.existsSync(migrationPath)) {
        console.log(`⚠️  跳过 ${migrationDir}: 没有 migration.sql 文件`);
        continue;
      }

      console.log(`\n📝 应用迁移: ${migrationDir}`);

      const command = `bunx wrangler d1 execute ${databaseName} --local --file="${migrationPath}"`;

      try {
        execSync(command, {
          stdio: "inherit",
          cwd: process.cwd(),
        });
        console.log(`✅ ${migrationDir} 应用成功`);
      } catch (error) {
        console.error(`❌ ${migrationDir} 应用失败:`, error.message);

        // 如果是 "table already exists" 错误，警告但继续
        if (error.message.includes("already exists")) {
          console.log(`⚠️  表已存在，继续下一个迁移...`);
          continue;
        }

        process.exit(1);
      }
    }

    console.log("\n🎉 所有迁移已成功应用到本地 D1 数据库！");
  } catch (error) {
    console.error("❌ 应用迁移失败:", error.message);
    process.exit(1);
  }
}

// 显示帮助信息
function showHelp() {
  console.log(`
📚 使用方法: bun apply-to-d1.js [选项]

选项:
  --db=<数据库名>    指定数据库名称 (默认: howorker)
  --help             显示帮助信息

示例:
  bun apply-to-d1.js                    # 应用到本地 D1
  bun apply-to-d1.js --db=my-database   # 指定数据库名称

💡 提示: 
  - 确保已经运行 'bunx prisma migrate dev' 生成 Prisma 迁移
  - 确保 wrangler 已配置
  - 脚本会自动应用所有迁移到本地 D1 数据库
  `);
}

// 主函数
if (require.main === module) {
  const args = process.argv.slice(2);

  if (args.includes("--help")) {
    showHelp();
    process.exit(0);
  }

  applyMigrationsToLocalD1();
}

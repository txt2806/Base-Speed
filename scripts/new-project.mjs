#!/usr/bin/env node
/**
 * new-project.mjs — Biến H2Base thành dự án quản lý mới của bạn.
 *
 * Chạy: npm run new:project
 *
 * Script làm 3 việc (toàn bộ trên working copy, rollback bằng git):
 *   1. Rename app: package.json "name" + NEXT_PUBLIC_APP_NAME trong .env.local (tạo nếu thiếu).
 *   2. Reset trang chủ admin về dashboard trống (backup trang cũ thành .bak).
 *   3. LIỆT KÊ demo modules kèm lệnh xóa — KHÔNG tự xóa (dry-run, bạn quyết định).
 *
 * Không có dependency — Node thuần.
 */

import { readFileSync, writeFileSync, existsSync, copyFileSync } from "node:fs";
import { readdirSync, statSync } from "node:fs";
import path from "node:path";

const ROOT = process.cwd();
const args = process.argv.slice(2);
const isDryRun = args.includes("--dry-run");

// ---------- 1. Rename app ----------
const pkgPath = path.join(ROOT, "package.json");
const pkg = JSON.parse(readFileSync(pkgPath, "utf-8"));

const appName = isDryRun
  ? "<dry-run-app-name>"
  : (args.find((a) => !a.startsWith("--")) ?? path.basename(ROOT))
      .toLowerCase()
      .replace(/[^a-z0-9-]/g, "-");

const actions = [];

if (!isDryRun) {
  pkg.name = appName;
  writeFileSync(pkgPath, JSON.stringify(pkg, null, 2) + "\n");
}
actions.push(`package.json name -> "${appName}"`);

// .env.local: tạo/mở rộng NEXT_PUBLIC_APP_NAME
const envPath = path.join(ROOT, ".env.local");
const envExamplePath = path.join(ROOT, ".env.example");
const envExample = existsSync(envExamplePath) ? readFileSync(envExamplePath, "utf-8") : "";
let envContent = existsSync(envPath) ? readFileSync(envPath, "utf-8") : envExample;
if (!isDryRun) {
  if (envContent.includes("NEXT_PUBLIC_APP_NAME=")) {
    envContent = envContent.replace(/NEXT_PUBLIC_APP_NAME=.*/, `NEXT_PUBLIC_APP_NAME=${appName}`);
  } else {
    envContent = `NEXT_PUBLIC_APP_NAME=${appName}\n${envContent}`;
  }
  writeFileSync(envPath, envContent);
}
actions.push(`.env.local NEXT_PUBLIC_APP_NAME -> "${appName}"`);

// ---------- 2. Reset dashboard về trang trắng ----------
const adminHome = path.join(ROOT, "apps", "web", "src", "app", "(admin)", "page.tsx");
const blankPage = path.join(ROOT, "apps", "web", "src", "app", "(admin)", "blank", "page.tsx");
if (existsSync(adminHome) && existsSync(blankPage)) {
  if (!isDryRun) {
    copyFileSync(adminHome, `${adminHome}.bak`);
    const blankContent = readFileSync(blankPage, "utf-8");
    writeFileSync(adminHome, blankContent.replace(/Blank Page/g, "Dashboard"));
  }
  actions.push("apps/web/src/app/(admin)/page.tsx -> dashboard trống (backup .page.tsx.bak)");
}

// ---------- 3. Liệt kê demo modules (dry-run — KHÔNG tự xóa) ----------
const featuresDir = path.join(ROOT, "apps", "web", "src", "features");
const demoModules = existsSync(featuresDir)
  ? readdirSync(featuresDir).filter((d) => {
      if (d.startsWith("_")) return false;
      try {
        return statSync(path.join(featuresDir, d)).isDirectory();
      } catch {
        return false;
      }
    })
  : [];

const adminDir = path.join(ROOT, "apps", "web", "src", "app", "(admin)");
const routesFor = (feature) => {
  if (!existsSync(adminDir)) return [];
  const candidates = [feature, feature.replace(/-/g, "")];
  return readdirSync(adminDir).filter((d) => candidates.includes(d));
};

console.log(`\nH2Base -> "${appName}"\n`);
console.log("Đã thực hiện:");
for (const a of actions) console.log(`  ✓ ${a}`);

console.log("\nDemo/feature modules hiện có (tự xóa module không dùng — lệnh kèm sẵn):");
for (const m of demoModules) {
  const routes = routesFor(m);
  const rmRoute = routes.length
    ? routes.map((r) => `rm -rf "apps/web/src/app/(admin)/${r}"`).join(" && ")
    : `(không có route)`;
  console.log(`  • ${m}`);
  console.log(`      rm -rf apps/web/src/features/${m}${routes.length ? ` && ${rmRoute}` : ""}`);
}

console.log(`
Tiếp theo:
  1. Xóa các demo module không dùng (lệnh ở trên) + bỏ entry menu tương ứng trong
     apps/web/src/core/layout/nav-items.tsx
  2. Copy module mẫu:
     cp -r apps/web/src/features/_template apps/web/src/features/<domain-mới>
     cp -r apps/api/src/features/_template apps/api/src/features/<domain-mới>
  3. npm run dev — bắt đầu nghiệp vụ đầu tiên.
`);

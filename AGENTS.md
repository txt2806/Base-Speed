# AGENTS.md — Hướng dẫn cho AI agent làm việc trong repo này

> Đọc file này đầu mỗi session. Mục tiêu: mọi code sinh ra nhất quán, không cần giải thích lại.

## Repo là gì

H2Base — code base chuẩn cho **mọi webapp quản trị** (Next.js 16 App Router, React 19, TS strict, Tailwind v4, NestJS Backend, Prisma ORM). Kiến trúc **Vertical Slice** — mỗi module nghiệp vụ tự đóng gói 100%.

## Kiến trúc Monorepo

```text
apps/web/     # Next.js 16 — Frontend
apps/api/     # NestJS — Backend
packages/database/  # Prisma schema, migrations, seed
```

## Cấu trúc Frontend — `apps/web/src/`

```text
src/app/                          # routing only: pages, layouts — KHÔNG logic
  (admin)/<domain>/page.tsx       #   mỗi route import từ @/features/<domain>
  (auth)/                         #   signin / signup
  (error-pages)/                  #   404, 500

src/features/                      # ★ module nghiệp vụ — vertical slice
  _template/                      #   module mẫu rỗng (copy khi tạo mới)
  <domain>/
    components/                   #     UI components riêng module
    hooks/                        #     hooks riêng module
    api/                          #     API calls riêng module
    actions/                      #     server actions riêng module ("use server" + zod)
    types.ts                      #     types riêng module
    constants.ts                  #     hằng số riêng module
    index.ts                      #     ★ public API — bên ngoài chỉ import từ đây

src/core/                         # hạ tầng dùng chung (KHÔNG nghiệp vụ)
  ui/                             #   UI primitives: Button, Table, Modal, Form
  layout/                         #   AppSidebar, AppHeader, nav-items
  shared/                         #   components dùng chung: Card, Breadcrumb
  hooks/                          #   cross-module hooks: useModal, useGoBack
  context/                        #   providers toàn app: Sidebar, Theme
  lib/                            #   api-client, utils, logger
  types/                          #   types dùng chung toàn app
  constants/                      #   hằng số toàn app
```

## Cấu trúc Backend — `apps/api/src/`

```text
src/features/                      # ★ module nghiệp vụ — vertical slice
  _template/                      #   module mẫu rỗng
  <domain>/
    dto/                          #     Data Transfer Objects
    entities/                     #     entity types
    guards/                       #     guards riêng module
    middlewares/                  #     middlewares riêng module
    <domain>.controller.ts
    <domain>.service.ts
    <domain>.module.ts            #     NestJS module — self-contained
    index.ts

src/core/                         # hạ tầng dùng chung (KHÔNG nghiệp vụ)
  auth/                           #   JWT, auth guard chung
  config/                         #   env validation
  database/                       #   Prisma service
  filters/                        #   exception filters
  interceptors/                   #   logging, transform
  pipes/                          #   validation pipe
  decorators/                     #   custom decorators
  types/                          #   types dùng chung
```

## Cấu trúc Database — `packages/database/`

```text
prisma/schema/                    # Prisma schema chia theo module
  base.prisma                     #   datasource + generator config
  <domain>.prisma                 #   schema riêng từng module
prisma/migrations/                # migration history
prisma/seed/                      # seed data theo module
```

## Thêm module mới — 3 bước duy nhất

1. Copy `features/_template/` → `features/<domain>/` ở cả `web` và `api`.
2. Tạo route `apps/web/src/app/(admin)/<domain>/page.tsx` import từ module.
3. Thêm 1 entry trong `apps/web/src/core/layout/nav-items.tsx`.

Xóa module = xóa folder module + xóa route. Không chạm code ngoài.

## Quy tắc bắt buộc khi sinh code

1. Import nội bộ **luôn** `@/...`. Không bao giờ `../` hay `../../`.
2. Component: `PascalCase.tsx`, folder `kebab-case`, hook `useXxx.ts`.
3. **Không `any`**, **không `console.*`** (lint error). Hằng số — đặt tên, không magic values.
4. **Module KHÔNG import module.** Dùng chung → đưa vào `core/`.
5. Server action: `"use server"` + zod `safeParse` + typed result — **đặt trong `features/<domain>/actions/`**.
6. API call client: **đặt trong `features/<domain>/api/`**, dùng `api-client` từ `@/core/lib/api-client`.
7. Type dùng 1 nơi: riêng module → `features/<domain>/types.ts`; dùng chung → `core/types/`.
8. File > 250 dòng → tách. Module chỉ export qua `index.ts` public API.
9. Trước khi claim xong: `npm run lint && npm run format:check && npm run build` đều phải pass.

## Phụ thuộc một chiều

```text
app/(routes) → features/<domain> → core/(ui | lib | hooks | types | context)

modules KHÔNG import modules
core    KHÔNG import modules
```

Vi phạm → ESLint `import/no-cycle` báo lỗi.

## Luồng việc

- Thay đổi lớn: thống nhất yêu cầu + kế hoạch với user trước khi code. Dùng bộ skill của Matt Pocock (`brainstorming` → `writing-plans` → `implement` → `code-review`/`tdd`). Không dùng workflow spec-first.
- Đọc `CLEANCODE.md` cho bản đầy đủ 13 rule cho người.

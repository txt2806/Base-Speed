# H2Base — Code base chuẩn cho webapp quản lý (Fullstack Monorepo)

H2Base là code base dùng chung để khởi động **mọi dự án webapp quản trị** — Quản lý bán hàng, kho, CRM, HRM, phòng khám, trường học... — trong vài phút. Kiến trúc **Vertical Slice** (module chiều sâu): mỗi phân hệ nghiệp vụ tự đóng gói 100%, merge module = copy thư mục, xóa module = xóa thư mục — không chạm code ngoài.

Stack: **Next.js 16 (App Router) · React 19 · TypeScript strict · Tailwind CSS v4 · NestJS (Backend) · Prisma (ORM) · Zod · ESLint 9 + Prettier**

## Kiến trúc tổng quan

```text
Monorepo
├── apps/
│   ├── web/          # Next.js 16 — Frontend
│   └── api/          # NestJS — Backend
├── packages/
│   └── database/     # Prisma schema, migrations, seed
├── docs/             # tài liệu dự án
└── tools/            # scripts, generators, CI helpers
```

> **Triết lý cốt lõi: Vertical Slice Isolation.**
> Mỗi module nghiệp vụ (`orders`, `products`, `customers`...) chứa **toàn bộ** code của nó — từ UI component, hook, API call, type, server action (FE) cho đến controller, service, DTO, guard (BE) và schema Prisma riêng. Module A không import gì từ module B. Khi ghép 2 project: merge thư mục module. Khi tách: xóa thư mục module.

---

## Bắt đầu dự án mới trong 10 phút

```bash
# 1. Lấy code base
git clone <repo-này> my-app && cd my-app
npm install

# 2. Dọn thành dự án của bạn
npm run new:project

# 3. Xóa module demo không dùng
#    VD: rm -rf apps/web/src/features/calendar apps/api/src/features/calendar

# 4. Copy module mẫu, bắt đầu nghiệp vụ đầu tiên
cp -r apps/web/src/features/_template apps/web/src/features/orders
cp -r apps/api/src/features/_template apps/api/src/features/orders

# 5. Chạy
npm run dev
```

Ba việc duy nhất khi thêm một domain module:

1. Copy `features/_template/` → `features/<domain>/` ở cả `web` và `api`.
2. Tạo route `apps/web/src/app/(admin)/<domain>/page.tsx` import từ module.
3. Thêm 1 entry menu trong `apps/web/src/core/layout/nav-items.tsx`.

Xóa nghiệp vụ = xóa đúng thư mục module ở `web` + `api` + xóa route. Không chạm code ngoài.

---

## Cấu trúc thư mục chi tiết

### Frontend — `apps/web/`

```text
apps/web/src/
├── app/                          # Routing only — pages, layouts (KHÔNG logic)
│   ├── (admin)/                  #   khu vực quản trị (sidebar + header)
│   │   ├── orders/page.tsx       #     → import từ @/features/orders
│   │   ├── products/page.tsx     #     → import từ @/features/products
│   │   └── ...
│   ├── (auth)/                   #   signin / signup
│   └── (error-pages)/            #   404, 500...
│
├── features/                      # ★ TRÁI TIM — module nghiệp vụ theo chiều sâu
│   ├── _template/                #   module mẫu rỗng (copy khi tạo mới)
│   │   ├── components/           #     UI components riêng module
│   │   ├── hooks/                #     hooks riêng module
│   │   ├── api/                  #     API calls riêng module (dùng api-client)
│   │   ├── actions/              #     server actions riêng module (zod validate)
│   │   ├── types.ts              #     types riêng module
│   │   ├── constants.ts          #     hằng số riêng module
│   │   └── index.ts              #     public API — bên ngoài chỉ import từ đây
│   │
│   ├── orders/                   #   VD: Module đơn hàng
│   │   ├── components/
│   │   │   ├── OrderList.tsx
│   │   │   ├── OrderForm.tsx
│   │   │   └── OrderStatusBadge.tsx
│   │   ├── hooks/
│   │   │   ├── useOrders.ts
│   │   │   └── useOrderMutation.ts
│   │   ├── api/
│   │   │   └── order-api.ts      #     gọi BE qua api-client
│   │   ├── actions/
│   │   │   └── order-actions.ts  #     "use server" + zod safeParse
│   │   ├── types.ts
│   │   ├── constants.ts
│   │   └── index.ts
│   │
│   ├── dashboard/  auth/  calendar/  charts/  ...
│   └── <domain>/                 #   bất kỳ module mới
│
├── core/                         # Hạ tầng dùng chung (KHÔNG nghiệp vụ)
│   ├── ui/                       #   UI primitives: Button, Table, Modal, Form...
│   ├── layout/                   #   AppSidebar, AppHeader, nav-items
│   ├── shared/                   #   Components dùng chung: Card, Breadcrumb...
│   ├── hooks/                    #   Cross-module hooks: useModal, useGoBack...
│   ├── context/                  #   Providers toàn app: Sidebar, Theme
│   ├── lib/                      #   api-client, utils (cn), logger
│   ├── types/                    #   Types dùng chung toàn app
│   └── constants/                #   Hằng số toàn app
│
└── icons/                        # SVG icons
```

### Backend — `apps/api/`

```text
apps/api/src/
├── main.ts                       # Bootstrap NestJS
├── app.module.ts                 # Root module — import các domain modules
│
├── features/                      # ★ Module nghiệp vụ — vertical slice
│   ├── _template/                #   module mẫu rỗng
│   │   ├── dto/                  #     Data Transfer Objects (zod/class-validator)
│   │   ├── entities/             #     entity / model types
│   │   ├── guards/               #     guards riêng module (nếu cần)
│   │   ├── middlewares/          #     middlewares riêng module (nếu cần)
│   │   ├── <domain>.controller.ts
│   │   ├── <domain>.service.ts
│   │   ├── <domain>.module.ts    #     NestJS module — self-contained
│   │   └── index.ts
│   │
│   ├── orders/
│   │   ├── dto/
│   │   │   ├── create-order.dto.ts
│   │   │   └── update-order.dto.ts
│   │   ├── entities/
│   │   │   └── order.entity.ts
│   │   ├── guards/
│   │   │   └── order-owner.guard.ts
│   │   ├── orders.controller.ts
│   │   ├── orders.service.ts
│   │   ├── orders.module.ts
│   │   └── index.ts
│   │
│   ├── auth/  users/  products/  ...
│   └── <domain>/
│
├── core/                         # Hạ tầng dùng chung (KHÔNG nghiệp vụ)
│   ├── auth/                     #   JWT strategy, auth guard chung
│   ├── config/                   #   env validation, config module
│   ├── database/                 #   Prisma service, database module
│   ├── filters/                  #   exception filters toàn app
│   ├── interceptors/             #   logging, transform interceptors
│   ├── pipes/                    #   validation pipe toàn app
│   ├── decorators/               #   custom decorators (CurrentUser, Roles...)
│   └── types/                    #   types dùng chung
│
└── shared/                       # Utils dùng chung (không phụ thuộc NestJS)
    ├── helpers/
    └── constants/
```

### Database — `packages/database/`

```text
packages/database/
├── prisma/
│   ├── schema/                   # ★ Prisma schema chia theo module
│   │   ├── base.prisma           #   datasource + generator config
│   │   ├── user.prisma           #   model User, Role, Permission
│   │   ├── order.prisma          #   model Order, OrderItem
│   │   ├── product.prisma        #   model Product, Category
│   │   └── <domain>.prisma       #   schema riêng từng module
│   ├── migrations/               #   migration history
│   └── seed/                     #   seed data
│       ├── index.ts
│       ├── user.seed.ts
│       └── <domain>.seed.ts
├── generated/                    # Prisma Client generated
├── package.json
└── index.ts                      # re-export PrismaClient + types
```

---

## Nguyên tắc Vertical Slice — Tóm tắt

| Nguyên tắc                  | Mô tả                                                                       |
| --------------------------- | --------------------------------------------------------------------------- |
| **Module tự chứa**          | Mọi thứ của `orders` nằm trong `features/orders/` — FE lẫn BE               |
| **Không import chéo**       | `orders` KHÔNG import từ `products`. Dùng chung → đưa vào `core/`           |
| **Merge = copy folder**     | Ghép module từ project A sang B: copy folder module + thêm route + thêm nav |
| **Xóa = xóa folder**        | Bỏ module: xóa folder + xóa route. Không sửa code khác                      |
| **`core/` là hạ tầng**      | `core/` chứa UI primitives, layout, utils, types — KHÔNG chứa nghiệp vụ     |
| **`index.ts` là ranh giới** | Bên ngoài module chỉ import qua `index.ts` — public API                     |

---

## Phụ thuộc một chiều

```text
app/(routes) → features/<domain> → core/(ui | lib | hooks | types | context)
                                      ↑
modules KHÔNG import modules          core KHÔNG import modules
```

Vi phạm → ESLint `import/no-cycle` báo lỗi.

---

## Data layer

- **FE gọi API**: mỗi module có `api/` riêng, dùng `api-client` từ `@/core/lib/api-client`.
- **Server Action**: mỗi module có `actions/` riêng, `"use server"` + zod `safeParse`.
- **BE service**: mỗi module có `<domain>.service.ts` inject `PrismaService` từ `core/database/`.
- **Biến môi trường**: copy `.env.example` → `.env.local`, điền các biến cần thiết.

---

## Quality gates (bắt buộc trước khi merge)

```bash
npm run lint          # ESLint: cấm any, console, import chéo module, circular deps
npm run format:check  # Prettier thống nhất toàn repo
npm run build         # Next.js + NestJS production build
```

Bộ rule đầy đủ (13 rule, mapping sang ESLint/Prettier): [CLEANCODE.md](./CLEANCODE.md). AI agent đọc: [AGENTS.md](./AGENTS.md).

---

## Credits

UI gốc từ [TailAdmin](https://tailadmin.com) — Tailwind admin dashboard template (MIT). H2Base refactor kiến trúc vertical slice, thêm backend + Prisma + rule + luồng khởi động nhanh.

## License

MIT

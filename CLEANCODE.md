# CLEANCODE.md — Bộ rule clean code H2Base (Vertical Slice)

> 13 rule, tất cả được tooling (ESLint + Prettier) ép buộc. Rule không ép bằng tool chỉ là lời khuyên — và sẽ bị quên.

## Quy tắc cấu trúc (1–5)

1. **File component**: `PascalCase.tsx`, named export đồng nhất. Folder cha `kebab-case`. File hook `useXxx.ts`, util `camelCase.ts`.
2. **1 component = 1 file chính.** File vượt 250 dòng → tách (data ra file riêng, sub-render ra component con).
3. **Vertical Slice Isolation**: mỗi module nghiệp vụ (`features/<domain>/`) tự chứa toàn bộ components, hooks, api, actions, types, constants. Tuyệt đối **không** đặt chung controllers/services/actions của mọi module vào 1 thư mục ngang cấp app.
4. **`core/` là hạ tầng, không phải nghiệp vụ**: `core/` chỉ chứa UI primitives, layout, shared components, cross-module hooks, providers, utils, types dùng chung. Không bao giờ chứa logic nghiệp vụ cụ thể.
5. **Import alias `@/`** — cấm `../../`. Cấm relative import vượt ra ngoài thư mục hiện tại.

## Quy tắc code (6–10)

6. **TS strict, cấm `any`.** Cần escape hatch → `unknown` + type guard.
7. **Cấm `console.*`** trong code commit. Debug có chủ đích → `core/lib/logger.ts` (khi có) hoặc eslint-disable kèm lý do.
8. **Không magic values.** Hằng số đặt tên, đưa vào `core/constants/` (dùng chung) hoặc `features/<domain>/constants.ts` (riêng module).
9. **Type đặt 1 nơi**: dùng chung → `core/types/`; riêng module → `features/<domain>/types.ts`. Cấm định nghĩa lại cùng type 2 nơi.
10. **Tên thể hiện ý đồ**: `getOrdersByCustomer` (không `fetchData2`); boolean có prefix `is/has/should`.

## Quy tắc module boundary (11)

11. **Module KHÔNG import module.** `orders` không import từ `products`. Cần dùng chung → nâng lên `core/`. Bên ngoài module chỉ import qua `index.ts` (public API).

## Quy tắc tooling (12–13)

12. **`npm run lint`** = ESLint flat config + các rule ở trên — lỗi = không merge.
    **`npm run format:check`** = Prettier (printWidth 100, trailingComma all, tailwind class sort) — sai format = không merge.
13. **`npm run build`** pass là điều kiện merge cuối cùng.

## Phụ thuộc một chiều (no circular deps)

### Frontend (apps/web)

```text
app/(routes) → features/<domain> → core/(ui | lib | hooks | types | context)

modules KHÔNG import modules
core    KHÔNG import modules
```

### Backend (apps/api)

```text
app.module → features/<domain>.module → core/(database | config | auth | filters | types)

modules KHÔNG import modules
core    KHÔNG import modules
```

### Toàn hệ thống

```text
apps/web  → packages/database (import types)
apps/api  → packages/database (import PrismaClient + types)

apps/web  KHÔNG import apps/api (giao tiếp qua HTTP API)
```

Vi phạm → ESLint `import/no-cycle` báo lỗi.

## Server/Client tách bạch (FE)

- `"use client"` chỉ xuất hiện trong `features/<domain>/components/`, `features/<domain>/hooks/`, `core/ui/`, `core/context/`.
- `features/<domain>/actions/` là server code — không bao giờ có `"use client"`.
- Server Action validate bằng zod trước khi chạm data. Input `unknown` → `schema.safeParse` → trả typed result.

## Vi phạm thì sao?

- Lint fail ở CI/commit → sửa trước khi merge. Không tắt rule toàn cục để "đi tiếp".
- Cần ngoại lệ thực sự → `eslint-disable-next-line <rule> -- <lý do ngắn>` tại đúng dòng.

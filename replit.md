# Workspace

## Overview

pnpm workspace monorepo using TypeScript. Each package manages its own dependencies.

## Stack

- **Monorepo tool**: pnpm workspaces
- **Node.js version**: 24
- **Package manager**: pnpm
- **TypeScript version**: 5.9
- **API framework**: Express 5
- **Database**: PostgreSQL + Drizzle ORM
- **Validation**: Zod (`zod/v4`), `drizzle-zod`
- **API codegen**: Orval (from OpenAPI spec)
- **Build**: esbuild (CJS bundle)

## Structure

```text
artifacts-monorepo/
├── artifacts/              # Deployable applications
│   ├── api-server/         # Express API server (REST endpoints)
│   ├── erp-ui/             # ERP web app (React + Vite + Tailwind)
│   └── mockup-sandbox/     # Component preview server (canvas)
├── lib/                    # Shared libraries
│   ├── api-spec/           # OpenAPI spec + Orval codegen config
│   ├── api-client-react/   # Generated React Query hooks
│   ├── api-zod/            # Generated Zod schemas from OpenAPI
│   └── db/                 # Drizzle ORM schema + DB connection
├── scripts/                # Utility scripts (single workspace package)
│   └── src/                # Individual .ts scripts, run via `pnpm --filter @workspace/scripts run <script>`
├── pnpm-workspace.yaml     # pnpm workspace (artifacts/*, lib/*, lib/integrations/*, scripts)
├── tsconfig.base.json      # Shared TS options (composite, bundler resolution, es2022)
├── tsconfig.json           # Root TS project references
└── package.json            # Root package with hoisted devDeps
```

## TypeScript & Composite Projects

Every package extends `tsconfig.base.json` which sets `composite: true`. The root `tsconfig.json` lists all packages as project references. This means:

- **Always typecheck from the root** — run `pnpm run typecheck` (which runs `tsc --build --emitDeclarationOnly`). This builds the full dependency graph so that cross-package imports resolve correctly. Running `tsc` inside a single package will fail if its dependencies haven't been built yet.
- **`emitDeclarationOnly`** — we only emit `.d.ts` files during typecheck; actual JS bundling is handled by esbuild/tsx/vite...etc, not `tsc`.
- **Project references** — when package A depends on package B, A's `tsconfig.json` must list B in its `references` array. `tsc --build` uses this to determine build order and skip up-to-date packages.

## Root Scripts

- `pnpm run build` — runs `typecheck` first, then recursively runs `build` in all packages that define it
- `pnpm run typecheck` — runs `tsc --build --emitDeclarationOnly` using project references

## Packages

### `artifacts/api-server` (`@workspace/api-server`)

Express 5 API server. Routes live in `src/routes/` and use `@workspace/api-zod` for request and response validation and `@workspace/db` for persistence.

- Entry: `src/index.ts` — reads `PORT`, starts Express
- App setup: `src/app.ts` — mounts CORS, JSON/urlencoded parsing, routes at `/api`
- Routes: `src/routes/index.ts` mounts sub-routers; `src/routes/health.ts` exposes `GET /health` (full path: `/api/health`)
- ERP routes: `src/routes/enterprises.ts` (`/api/enterprises`, GET/POST/PATCH/DELETE + `/:id` with members + `/enterprises-stats`) and `src/routes/employees.ts` (`/api/employees` CRUD + `/employees-stats`)
- Depends on: `@workspace/db`, `@workspace/api-zod`
- `pnpm --filter @workspace/api-server run dev` — run the dev server
- `pnpm --filter @workspace/api-server run build` — production esbuild bundle (`dist/index.cjs`)
- Build bundles an allowlist of deps (express, cors, pg, drizzle-orm, zod, etc.) and externalizes the rest

### `lib/db` (`@workspace/db`)

Database layer using Drizzle ORM with PostgreSQL. Exports a Drizzle client instance and schema models.

- `src/index.ts` — creates a `Pool` + Drizzle instance, exports schema
- `src/schema/index.ts` — barrel re-export of all models
- `src/schema/<modelname>.ts` — table definitions with `drizzle-zod` insert schemas (no models definitions exist right now)
- `drizzle.config.ts` — Drizzle Kit config (requires `DATABASE_URL`, automatically provided by Replit)
- Exports: `.` (pool, db, schema), `./schema` (schema only)

Production migrations are handled by Replit when publishing. In development, we just use `pnpm --filter @workspace/db run push`, and we fallback to `pnpm --filter @workspace/db run push-force`.

### `lib/api-spec` (`@workspace/api-spec`)

Owns the OpenAPI 3.1 spec (`openapi.yaml`) and the Orval config (`orval.config.ts`). Running codegen produces output into two sibling packages:

1. `lib/api-client-react/src/generated/` — React Query hooks + fetch client
2. `lib/api-zod/src/generated/` — Zod schemas

Run codegen: `pnpm --filter @workspace/api-spec run codegen`

### `lib/api-zod` (`@workspace/api-zod`)

Generated Zod schemas from the OpenAPI spec (e.g. `HealthCheckResponse`). Used by `api-server` for response validation.

### `lib/api-client-react` (`@workspace/api-client-react`)

Generated React Query hooks and fetch client from the OpenAPI spec (e.g. `useHealthCheck`, `healthCheck`).

### `artifacts/erp-ui` (`@workspace/erp-ui`)

ERP web app for "Chè Quân Chu" tea origin tracing (Vietnamese UI). Vite + React + Tailwind + shadcn-style components.

#### SSO Architecture (implemented)
Five distinct systems. After login, user sees only the systems they have permission for (stored in `AuthUser.modules[]`):

| System | Route | Module key | Description |
|---|---|---|---|
| Portal | `/portal` | `portal` | Account & access management (always shown) |
| ERP | `/module/erp` | `erp` | Thu mua, sản xuất, đóng gói, bán hàng |
| Truy xuất nguồn gốc | `/module/txng` | `txng` | QR code, chuỗi cung ứng, chứng nhận |
| Vùng trồng | `/module/vung-trong` | `vung_trong` | Vùng nguyên liệu, cây trồng, thu hoạch |
| Thiết bị IoT | `/module/iot` | `iot` | Cảm biến, giám sát, thiết bị |

- Login response now returns `user.modules[]` derived from enterprise's licensed modules (ERP→`erp`, TXNG→`txng`, VT→`vung_trong`+`iot`). Super admin (no enterprise) gets all modules.
- Legacy `/quan-tri/*` routes still work (mapped to Portal) for backward compatibility.
- `QuanTriPage.tsx` is an orphan (superseded by `PortalPage.tsx`).

#### Key files
- Routing: `src/App.tsx` — all routes protected
- Auth: `src/contexts/AuthContext.tsx` | `src/lib/api.ts` — `AuthUser` includes `modules: string[]`
- Navigation: `src/components/Sidebar.tsx` — dynamic module visibility based on `user.modules`
- Home: `src/pages/HomePage.tsx` — 5 system cards with gradient colors, permission-filtered
- Portal: `src/pages/PortalPage.tsx` — enterprise tree + access shortcuts

#### Pages (live data, backed by Postgres)
- `/portal/doanh-nghiep` — enterprises CRUD + module licensing (ERP/TXNG/VT)
- `/portal/doanh-nghiep/:id` — enterprise detail + members
- `/portal/nguoi-dung` — employees CRUD + permission matrix + reset password
- `/portal/co-so` — facilities + QR + Print + Gán nhân viên + Import/Xuất Excel
- `/portal/don-vi-tinh` — units CRUD
- `/module/erp/thuong-pham` — products CRUD
- `/module/erp/quy-cach` — grades + % quality + standards + Xuất Excel
- `/module/erp/thu-mua` — purchase orders with auto-price calculation

## Sprint Status (ESG Valley)

### Sprint 1 — Portal SSO + Cơ sở (COMPLETE)
- Login ✅ | Doanh nghiệp CRUD + Phân quyền modules ✅ | User CRUD + Phân quyền + Reset mật khẩu ✅
- Đơn vị tính CRUD ✅ | Cơ sở CRUD + QR + Print + Gán nhân viên ✅
- Import Excel cơ sở ✅ | Xuất Excel cơ sở ✅ | Download file mẫu ✅

### Sprint 2 — Thương phẩm + Quy cách + Đơn thu mua (COMPLETE)
- Thương phẩm CRUD (bán thành phẩm + thành phẩm cuối) ✅
- Quy cách + % Chất lượng + Tiêu chuẩn CRUD ✅ | Xuất Excel Quy cách ✅
- Đơn thu mua: tạo/xem/sửa/xóa + auto-tính giá theo quy cách + % chất lượng ✅

### Sprint 2 Print 2 — Refinements (COMPLETE)
- **Quy cách**: Loại chè dropdown từ Thương phẩm ✅ | Nhiều mức đơn giá (JSON array) cho Quy cách + % CL ✅
- **% Chất lượng**: Đổi label "Xếp loại" → "Ghi chú" (UI only, DB column `ghi_chu`) ✅
- **Thương phẩm**: Thêm trường GTIN + Hình ảnh (URL) + preview ✅ | Đổi nhãn "Mã sản phẩm" → "Mã thương phẩm" ✅
- **Đơn thu mua**: Bỏ Mã phiếu/DN/Trạng thái khỏi form ✅ | Thứ tự: Ngày → Cơ sở ✅
- Auto-fill Địa chỉ thu mua + Mã lô mẻ (từ mã cơ sở + ngày) ✅
- Đơn giá → dropdown từ danh sách giá của Quy cách/% CL ✅ | Hint text đơn giá áp dụng ✅
- Card layout cho line items (không cuộn ngang) ✅ | Bỏ nút "Thêm dòng" header ✅
- "Làm tròn" → "Tiền lẻ" với hai ô Trừ / Cộng ✅ | Bộ lọc ngày trên danh sách ✅
- DB: `grades.prices`, `quality_levels.prices+ghi_chu`, `products.gtin+image_url`, `purchase_orders.dia_chu_thu+ma_lo_me` ✅

### SSO Architecture Restructure (COMPLETE)
- Portal = tài khoản & phân quyền (route `/portal`, replaces `/quan-tri`) ✅
- 5 system cards on Home page with gradient UI, permission-filtered ✅
- Sidebar: Portal + ERP + TXNG + Vùng trồng + IoT, dynamic per user.modules ✅
- Login response returns modules[] derived from enterprise licensing ✅
- PortalPage.tsx: enterprise tree overview + flow diagram + shortcuts ✅

### `scripts` (`@workspace/scripts`)

Utility scripts package. Each script is a `.ts` file in `src/` with a corresponding npm script in `package.json`. Run scripts via `pnpm --filter @workspace/scripts run <script>`. Scripts can import any workspace package (e.g., `@workspace/db`) by adding it as a dependency in `scripts/package.json`.

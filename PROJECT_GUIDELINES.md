# Aarham Apparel: Project Guidelines

How to design, write and maintain the Aarham Apparel reselling platform. Read this before you change anything. If the code and this document disagree, trust the code, then fix this document.

| | Frontend | Backend |
|---|---|---|
| Folder | `ResellingPortalFrontEnd/` (its own git repo) | `ResllingPortalBackend-/` (its own git repo) |
| Stack | Next.js 14.2 App Router, React 18, TypeScript 5 (strict), Tailwind 3.4, daisyUI 4.12, Zustand, Axios, React Hook Form + Zod, lucide-react | NestJS 10, Prisma 7 (`prisma-client` generator + `@prisma/adapter-pg`), PostgreSQL 16, class-validator, `@nestjs/schedule` |
| Local port | `4000` | `3000` |
| Hosting | Render web service | Render web service (`render.yaml` Blueprint), Render PostgreSQL `resellingplatform` |

---

## 1. Golden rules

1. **The backend owns the business rules.** Pricing, stock, order state, roles and payouts are decided in NestJS. The frontend only displays them and calls the API. Never copy a business rule into the UI as the only check.
2. **UI-only means UI-only.** When a task is about looks or layout, change markup and classes only. Leave handlers, `useEffect`s, store calls, API calls, routes and role checks exactly as they are.
3. **Reuse before you build.** Use the shared component (`components/panel/*`, `StatusBadge`, `PanelModal`, …) rather than making a local copy. One concept gets one component.
4. **Check against the source.** Before you map a status, enum or response field in the UI, look up what the backend actually returns (`prisma/schema.prisma`, the service). Don't guess.
5. **Work step by step.** Make small changes and verify each one. Find and explain the root cause before you fix it.
6. **"Done" means verified.** Type-check, lint and a production build must pass (see §9). A type-check alone is not enough.
7. **Secrets never go in git.** Use `.env` locally and Render's dashboard (`sync: false`) in production.
8. **Never edit an applied migration.** Add a new one.

---

## 2. Product map

One Next.js app serves three audiences:

| Experience | Route group | Users | Sidebar |
|---|---|---|---|
| Storefront | `app/(storefront)` | Retail customers | none (public `Navbar`/`Footer`) |
| Reseller portal | `app/reseller` | Approved `RESELLER` users | **light** (`base-100`) |
| Admin back office | `app/(dashboard)` (`/dashboard`, `/admin/*`, `/orders`, `/inventory`, `/cms`, …) | Staff roles | **dark** (black, white text) |
| Auth | `app/(auth)` | Everyone | none |

**Roles** (`UserRole` enum): `SUPER_ADMIN`, `ADMIN`, `MANAGER`, `SALES_EXECUTIVE`, `INVENTOR`, `RESELLER`, `USER`. Staff roles get the admin panel, resellers are sent to `/reseller`, and customers stay on the storefront. The backend enforces this. The frontend layouts only redirect.

---

## 3. Design principles

### 3.1 Principles

- **One product, two skins.** The admin and reseller panels share structure, spacing, sizes, active-state logic and motion. Only the colour tokens differ (dark admin sidebar, light reseller sidebar).
- **Consistency beats novelty.** A new screen should look like it was always there. Copy the closest existing page's pattern.
- **Nothing should jump.** Use skeletons shaped like the final content, fixed image ratios, and buttons that keep their width while loading.
- **Calm motion.** Short fades and scales (150–250 ms), and respect `prefers-reduced-motion`.
- **Accessible by default.** Use real buttons and links, `aria-label` on icon-only buttons, visible `focus-visible` rings, keyboard close for overlays.
- **Mobile is first-class.** Check every screen at **375 px, 1366 px and 1440 px**, at **100 % browser zoom** with the sidebar open. Don't allow horizontal page scroll. Tabs scroll sideways and never wrap.
- **Laptops are the tightest desktop.** At 1366 px the sidebar leaves only about **1050 px** of content width. A page that only looks right at 75–90 % zoom is broken. See §3.8.

### 3.2 Theme and tokens

Theme: daisyUI `corporate`, overridden in `tailwind.config.ts`:

| Token | Value | Note |
|---|---|---|
| `primary` | `#001C94` | Brand navy. Actions, active nav, active tabs. |
| `secondary` | `#F4F6FC` | **Same as `base-200`, so it's nearly invisible on white.** Don't use `bg-secondary` for anything that must stand out; use `bg-primary/10 text-primary`. Don't change the value either, because the storefront relies on it. |
| `base-200` | `#F4F6FC` | Borders, muted backgrounds, tab tracks. |

These conventions are also documented at the top of `src/components/panel/index.ts`:

| Thing | Classes |
|---|---|
| Card / panel | `bg-base-100 rounded-2xl border border-base-200 shadow-sm`, padding `p-4 sm:p-6` |
| Modal box | `rounded-2xl` |
| Buttons, inputs, tabs | `rounded-xl` |
| Badges | `rounded-full` |
| Heading text | `text-base-content` (not `text-black`, `text-slate-900` or `text-gray-800`) |
| Muted text | `text-base-content/60` |
| Page body | `flex flex-col gap-6` |
| Animations | `animate-fade-in`, `animate-scale-in`, `animate-slide-in-left` (defined in `tailwind.config.ts`) |

**Tailwind 3.4 trap:** v4-only classes such as `animate-in`, `fade-in`, `backdrop-blur-xs` and `shadow-xs` compile to nothing, with no error. Use `backdrop-blur-sm`, `shadow-sm` and the custom animations above. Check with:

```bash
grep -rn "animate-in\|backdrop-blur-xs\|shadow-xs" ResellingPortalFrontEnd/src
```

### 3.3 Shared panel components (`src/components/panel/`)

Import them from the barrel: `import { PanelPage, PanelPageHeader, … } from "@/components/panel";`

| Component | Use it for | Key rules |
|---|---|---|
| `PanelShell` / `PanelSidebar` | Both panel layouts | Owns the mobile drawer (slide + backdrop fade), Escape, body-scroll lock, close on route change. |
| `MobileBottomNav` | Phone-only floating bottom bar (below `lg`) | Four slots plus a raised centre Home button. Panels pass `bottomNav` to `PanelShell` (`"menu"` = a slot that opens the sidebar drawer); the storefront and auth layouts use `StorefrontBottomNav`. Anything fixed to the bottom of the screen must sit above it on phones (`bottom-28 lg:bottom-4`). |
| `useActiveNav(hrefs)` | Sidebar highlighting | Longest-prefix match, so **exactly one** item is lit. Never use `pathname === href` or `pathname.includes()` for nav state. |
| `PanelPage` | Every panel page's outer wrapper | `width="default"` (`max-w-7xl`), `"narrow"` (`max-w-3xl`, for forms, cart, track), `"full"` (big tables). |
| `PanelPageHeader` | The one `<h1>` per page | `title`, `subtitle?`, `icon?` (shown in a `bg-primary/10` chip), `actions?`, `backHref?`. Actions wrap under the title on mobile. |
| `PanelButton` | Buttons | Variants `primary`, `secondary`, `ghost`, `danger`, `danger-outline`; `size="sm"` (default) or `"xs"` (table rows); `loading`; `iconOnly`. Defaults to `type="button"`. |
| `PanelTabs` | Tab bars and status filters | One row, scrolls sideways, same height for every tab, active = `bg-primary text-white`. |
| `PanelModal` | **Every** dialog | Escape and backdrop close it, scroll lock, focus return, bottom sheet on phones. **Cancel on the left, primary action on the right.** |
| `PanelCard` | Content blocks, stat cards | Card token plus an optional header row. |
| `PanelTable` | Data tables | `table-sm`, no `table-zebra`, actions in the last column, right-aligned in a `flex justify-end gap-1` group. Must fit about 1050 px without sideways scroll (§3.8). |
| `PanelEmpty` | Empty lists and empty cart | Icon + title + text + optional action. |
| `PanelSkeleton` | Loading states | `variant="table" \| "cards" \| "form"`. Use instead of full-page spinners. |
| `StatusBadge` | **Every** status pill | One status → one colour across admin and reseller. Unknown statuses fall back to a neutral ghost badge with a readable label. |

### 3.4 Buttons

| Variant | Classes (what `PanelButton` produces) |
|---|---|
| primary | `btn btn-primary btn-sm rounded-xl gap-2 text-white font-semibold` |
| secondary | `btn btn-outline btn-sm rounded-xl gap-2` |
| ghost | `btn btn-ghost btn-sm rounded-xl gap-2` |
| danger | `btn btn-error btn-sm rounded-xl gap-2 text-white` |
| icon-only | `btn btn-ghost btn-sm btn-square rounded-xl` + `aria-label` |

- Sizes: page header, toolbar and modal footer use `btn-sm`. Table rows use `btn-xs`. Use `w-full` only in mobile sheets, auth forms, the sidebar footer and the cart checkout button.
- Icons: `size={16}`, or `size={14}` inside `btn-xs`.
- Loading: disable the button and put `loading loading-spinner loading-xs` **before** the label.
- Don't add `px-6`, `font-extrabold`, `shadow-lg shadow-primary/20` or `flex items-center` (`btn` already centres its content).
- Deliberate brand colours (for example the WhatsApp green) can stay, but use the standard size and radius.

### 3.5 Navigation

- Admin sections live in the **left sidebar as collapsible groups under Dashboard**. Don't add horizontal nav bars for admin sections.
- A new group should copy the existing pattern (for example "Products & Attributes"): chevron on the right, auto-opens when it holds the active route, the user can collapse it, animated open and close.
- Nav row: `h-10 px-3 rounded-xl text-sm font-medium`, icon `size={18}` in a fixed `w-5` slot, label truncates with a `title` tooltip, badge `ml-auto` inside the same row.
- **Phones get a bottom bar.** Below `lg`, every audience shows `MobileBottomNav`: storefront = Categories, Message (WhatsApp), Home, Cart, Login/Account; reseller = Menu, Catalog, Home, Cart, Orders; admin = Menu, Orders, Home, Products, Inventory. Everything else stays in the drawer. Pick slots for the most frequent tasks, keep labels to one short word, and keep the bar's z-index (`z-30`) below drawers and modals.
- Don't let daisyUI `.menu` focus or active styles leak (they leave the previous item lit after client-side navigation).

### 3.6 Feedback, loading and motion

- **Page loading:** use `PanelSkeleton` in the shape of the content. The route-level `loading.tsx` files in `(dashboard)` and `reseller` render inside the content area, so the sidebar and header stay visible.
- **Spinners** go only inside buttons (`loading-xs`).
- **Success and error messages:** use one consistent pattern per screen (an inline alert under the header or a top-right toast). Don't add new `alert()` calls. Replace existing ones when you touch that code.
- Use `transition-colors` (~150 ms) on interactive elements. Avoid `transition-all` on large containers.

### 3.7 Storefront

The storefront (`components/public`, `components/homepage`) has its own visual language driven by CMS content and the Homepage Builder. Panel rules (sidebar, `PanelPage`) don't apply there, but these do: no layout shift, fixed image ratios (`SafeImage` / `next/image`), accessibility, mobile-first, and sanitised HTML.

### 3.8 Wide tables and filter bars (fit at 100 % zoom)

Admin list pages (orders, inventory, products, withdrawals) must fit about **1050 px** of content width at 100 % zoom. That's a 1366 px laptop with the sidebar open. Reference implementation: `(dashboard)/orders/page.tsx`.

**Filter / toolbar card**
- Don't use one `flex flex-wrap justify-between` row for everything. It breaks into uneven lines and leaves single buttons stranded.
- **Row 1:** search (`md:flex-1 md:min-w-[160px]`, so the row still fits when Reset Filters appears), date range and text filters, then the toolbar buttons grouped on the right (`flex gap-2 ml-auto`). Reset Filters sits in that group.
- **Row 2:** dropdown filters in a grid (`grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-x-4 gap-y-3`). Each label gets `whitespace-nowrap min-w-0`, icons get `shrink-0`, and the select gets `flex-1 min-w-0` so it fills its cell.

**Data table**
- Wrap it in `overflow-x-auto`, and keep the table's `min-w-[…]` at **920 px or less**. Don't use values like `min-w-[1100px]`.
- Cell padding is `px-3` (`[&_th]:px-3 [&_td]:px-3` or `table-sm`). Don't keep daisyUI's default `px-4` on tables with 8+ columns.
- Aim for **8 columns or fewer**. Stack related narrow values in one cell instead of giving each its own column: ref + type badge, processing + payment status, date + time.
- Keep headers short: "Status", "Total Bill", "Order Date". Avoid long uppercase headers like "Processing Status", because `uppercase tracking-wider` makes them wider than their data.
- Secondary text that can be long, such as "Via Reseller: name (phone)", wraps (`leading-tight` in a `max-w-[220px]` cell). Only short values (refs, money, dates, badges) use `whitespace-nowrap`.

**Sticky action column**
- Use `sticky right-0 z-10` with a background that matches its row: `bg-slate-50` in the header, `bg-base-100` in the body.
- Row buttons are `btn-xs` with `whitespace-nowrap flex-nowrap` and a `shrink-0` icon, so the label never drops under the icon. Use a short label ("Manage", "View") and put the full text in `title`.
- If the sticky column covers other columns at 1366 px, the table is too wide. Fix the width; don't leave it to scroll.

---

## 4. Frontend practices

### 4.1 Where code goes

```text
src/
├── app/                # routes only: page.tsx, layout.tsx, loading.tsx, error.tsx, api/*
├── components/
│   ├── panel/          # shared admin + reseller design system (see §3.3)
│   ├── shared/         # Header, Footer, Navbar wrapper, AttributeManager, modals
│   ├── homepage/       # storefront section registry + renderer
│   ├── homepage-admin/ # Homepage Builder (list, library, variants, editor, preview)
│   ├── courier/        # Steadfast track / pickups / returns / invoices panels
│   ├── cms/, public/, ui/
├── services/           # axios instance + one `<area>.api.ts` per backend area
├── store/              # Zustand stores (auth, cart, reseller cart, CMS, categories)
└── utils/              # csvExporter, links, sanitizeHtml
```

### 4.2 Rules

- **API calls go through `services/`.** Pages never call `axios` or `fetch` against the backend directly. Add a typed function to the right `<area>.api.ts` (see `withdrawal.api.ts` for the pattern: exported request/response interfaces + an `xxxApi` object).
- **Use the shared axios instance** (`services/axios.ts`). It attaches the bearer token and does a **single-flight refresh** on 401. On refresh failure it logs out and redirects protected routes to `/login`. Don't write your own token handling.
- **Types:** keep `strict` on. Mirror backend enums as string-literal unions in the service file (for example `WithdrawalStatus`). Avoid `any`. Prisma `Decimal` fields arrive as strings, so type them `number | string` and convert with `Number()` before maths or formatting.
- **State:** server data lives in component state, loaded through services. Use Zustand only for cross-page client state (auth session, carts, CMS cache). `useAuthStore` persists to `localStorage` (`auth-storage`). Wait for `hasHydrated` before making auth decisions.
- **Client components:** add `"use client"` only where hooks or browser APIs are needed. Keep `layout.tsx` auth and role checks as they are.
- **Forms:** use React Hook Form + Zod for new forms. Validate on the client for UX, but the backend DTO is the real gate.
- **Errors:** show the backend's message when there is one (`err.response?.data?.message`, which may be a string or a string array from `ValidationPipe`), and a friendly fallback otherwise.
- **HTML from the CMS:** always render through `sanitizeHtml()` before `dangerouslySetInnerHTML`.
- **Buttons:** every non-submit `<button>` gets `type="button"`.
- **File size:** split pages over ~500 lines into local components (see §10 for the current giants). Don't make them bigger.
- **Imports:** use the `@/` alias (`@/components/...`, `@/services/...`).

---

## 5. Backend practices

### 5.1 Module layout

Each feature is a Nest module folder: `x.module.ts`, `x.controller.ts`, `x.service.ts`, `dto/*.dto.ts`. Register new modules in `src/app.module.ts`. Current modules: `auth`, `metadata/*` (category, subcategory, child-category, brand, color, size, age-variant), `product`, `inventory` (+ `inventory-monitor`), `cart`, `order` (+ `steadfast.service`), `cms/*`, `homepage`, `media`, `user`, `support`, `withdrawal`, `prisma`.

### 5.2 Rules

- **Thin controllers, fat services.** Controllers parse input, apply guards and delegate. All logic and Prisma access lives in services.
- **Every input is a DTO with class-validator decorators.** The global `ValidationPipe` uses `whitelist`, `forbidNonWhitelisted` and `transform`, so undeclared fields are **rejected**. Adding a field on the frontend means adding it to the DTO. Use `@Type(() => Number)` for numeric query params, `@IsEnum(PrismaEnum)` for enums, and give user-facing messages (`{ message: '...' }`).
- **Path params:** validate IDs with `ParseUUIDPipe`.
- **Auth:** protect with `@UseGuards(JwtAccessGuard, RolesGuard)` + `@Roles(...)`. Define role lists as named constants at the top of the controller (`ADMIN_ROLES`, `RESELLER_ROLES`). Public endpoints use the `@Public()` decorator or no guard. **Default to protected.** The current user is `req.user` (set by `JwtAccessGuard`).
- **Ownership:** reseller endpoints must scope queries by `req.user.id`, never by an ID from the request body.
- **Errors:** throw Nest exceptions (`BadRequestException`, `NotFoundException`, `ForbiddenException`, `ConflictException`) with readable messages. The frontend shows them.
- **Transactions:** any write that touches more than one table, especially **stock** (`Inventory` + `InventoryTransaction`), orders and payouts, goes in `prisma.$transaction`. Stock changes always write a ledger row (`STOCK_IN` / `STOCK_OUT` with a purpose).
- **Order state:** status changes go through `OrderService`. Moving to `CANCELLED`/`RETURNED` restocks, and moving back re-deducts. Restock must run **once** (guarded). Don't update `processingStatus` directly elsewhere.
- **Prisma client import:** it's generated to `prisma/generated/`, so import enums and types from `'../../prisma/generated/client'` (relative). Run `npm run prisma:generate` after schema changes.
- **Money:** use Prisma `Decimal` columns for prices and amounts. Don't do float maths on currency without rounding to 2 decimals.
- **Scheduled jobs** (`@Cron`): must be idempotent and guarded against overlap (see `courierSyncRunning` in `order.service.ts`). Current jobs: courier status sync every 10 minutes, abandoned-cart cleanup daily at 03:00.
- **External integrations** (Steadfast): keep them inside a dedicated service (`steadfast.service.ts`) with timeouts (`STEADFAST_HTTP_TIMEOUT_MS`). Treat external status strings as untrusted and map them explicitly.
- **Homepage Builder input** is checked against `src/homepage/section-registry.ts`. Never store unvalidated JSON.

### 5.3 Database migrations

```bash
# 1. edit prisma/schema.prisma
# 2. create a migration (snake_case name describing the change)
npx prisma migrate dev --name add_x_to_y
# 3. regenerate the client (also runs in `npm run build`)
npm run prisma:generate
```

- Migrations run automatically on **every Render deploy** (`prisma migrate deploy`), so a broken migration blocks the deploy.
- Never edit or delete a migration that has been applied anywhere. Fix forward.
- Destructive changes (drop or rename a column) need a data-migration plan. Prefer add, backfill, then switch, then drop in a later release.

---

## 6. Cross-cutting checklists

### Add a feature end to end
1. Schema change + migration (§5.3).
2. Backend DTO, service, controller and guards. Register the module.
3. Frontend types + function in `services/<area>.api.ts`.
4. UI built from the panel components. Add a sidebar entry under the right group.
5. Check it as each role that should and **shouldn't** have access.
6. Run the verification in §9 in both repos.

### Add or change an enum or status value
1. `prisma/schema.prisma` enum + migration.
2. Backend DTO `@IsEnum` messages and any `switch`/maps in services.
3. Frontend string-literal union in the service file.
4. **`StatusBadge` `STATUS_STYLES`** with the right colour (warning = waiting, info = in progress, success = done, error = failed or cancelled, ghost/neutral = inactive).
5. Any filters (`PanelTabs`) and CSV exports that list statuses.

### Add a Homepage Builder section or variant
The registry exists on **both** sides and they must match:
1. Backend `src/homepage/section-registry.ts`: type, variants, allowed settings fields and defaults.
2. Frontend `src/components/homepage/types.ts` + `registry.tsx`: render component per variant.
3. `components/homepage/sections/*`: the component.
4. `components/homepage-admin/VariantThumb.tsx` / `fields.tsx`: builder thumbnail and editor fields.
5. Publishing triggers `/api/revalidate`, which calls `revalidatePath("/")` and is protected by the `x-revalidate-secret` header when `REVALIDATE_SECRET` is set.

---

## 7. Environment variables

### Frontend (`.env.local` locally, Render env in production)

| Variable | Used in | Purpose |
|---|---|---|
| `NEXT_PUBLIC_API_URL` | `services/axios.ts` | Backend base URL (defaults to `http://localhost:3000`). **The README says `NEXT_PUBLIC_API_BASE_URL`, but the code reads `NEXT_PUBLIC_API_URL`.** |
| `REVALIDATE_SECRET` | `app/api/revalidate/route.ts` | Shared secret for cache revalidation. If unset, the endpoint is open. |

### Backend (`.env` locally, from `.env.example`)

| Variable | Purpose |
|---|---|
| `DATABASE_URL` | Postgres connection. On Render, use the **Internal** URL of `resellingplatform` (same region: Singapore). |
| `PORT` | Render injects it. `3000` locally. |
| `FRONTEND_URL` | Single CORS origin. Must match the deployed frontend exactly. |
| `ACCESS_TOKEN_SECRET`, `REFRESH_TOKEN_SECRET` | JWT secrets (Render generates them). |
| `ACCESS_TOKEN_TTL`, `REFRESH_TOKEN_TTL` | `15m` / `7d`. |
| `STEADFAST_API_KEY`, `STEADFAST_SECRET_KEY` | Courier credentials. |
| `STEADFAST_BASE_URL`, `STEADFAST_HTTP_TIMEOUT_MS` | Courier API endpoint and timeout. |
| `STEADFAST_WEBHOOK_TOKEN` | Bearer token checked on `POST /orders/steadfast-webhook`. **Not in `.env.example` or `render.yaml` yet. If unset, the webhook accepts any caller.** |

---

## 8. Running locally and deploying

### Local

```bash
# Backend
cd ResllingPortalBackend-
docker compose up -d          # Postgres 16 on :5432 (db aarham_apparel)
cp .env.example .env          # then fill secrets
npm install
npm run prisma:migrate:dev
npm run start:dev             # http://localhost:3000, health at /health
```

```bash
# Frontend
cd ResellingPortalFrontEnd
npm ci
echo NEXT_PUBLIC_API_URL=http://localhost:3000 > .env.local
npm run dev                   # http://localhost:4000
```

Useful: `npm run prisma:studio` (database browser), `npm run verify:auth` (reseller approval check script), and `inventory_monitor_postman_collection.json` (API collection).

### Deploy (Render)

- **Backend:** `render.yaml` Blueprint, auto-deploys from `main`. Build: `npm ci --include=dev && npm run build` (runs `prisma generate` + `nest build`). Start: `prisma migrate deploy` then `node dist/src/main`. Health check: `/health` (pings the database).
  - The entry point is `dist/src/main.js`, **not** `dist/main.js`, because the generated Prisma client sits outside `src/`. Update the start command if the build layout changes.
- **Frontend:** Render web service. Build `npm run build`, start `npm run start:prod` (uses `$PORT`). `.npmrc` sets `include=dev` so Tailwind and daisyUI install during the build.
- **Node versions:** the frontend pins `20.18.0` (`.node-version`) and the backend Render uses `22.12.0`. Keep local versions matching each repo.

---

## 9. Definition of done

Run these in each repo you touched. All must pass:

```bash
# Frontend
npx tsc --noEmit
npm run lint
npm run build      # next.config has eslint.ignoreDuringBuilds, so lint must be run separately
```

```bash
# Backend
npm run build      # prisma generate + nest build (type-checks)
```

Then check by hand:
- [ ] Desktop 1440 px, laptop **1366 px at 100 % zoom** (sidebar open, no sideways table scroll, sticky column covers nothing) **and** mobile 375 px.
- [ ] Each affected role (staff, reseller, customer, logged out).
- [ ] Only one sidebar item is highlighted, and the drawer closes on navigation.
- [ ] Loading, empty and error states look right, and nothing jumps.
- [ ] No new `alert()`, no dead Tailwind classes, no `any` where a type exists.
- [ ] Schema changed → migration committed; enum changed → `StatusBadge` updated.

There are **no automated tests** in either repo yet, so manual checking is required, not optional.

---

## 10. Maintenance watchlist (known issues, checked on 2026-10-26)

Fix these when you're working nearby, or schedule them. Remove an item once it's fixed.

| # | Area | Issue | Why it matters / suggested fix |
|---|---|---|---|
| 1 | Backend, media | Uploads are written to local `uploads/` on the server's disk. | Render's disk is **ephemeral**: uploaded images are lost on every redeploy or restart. Move to object storage (S3, Cloudinary, R2) or a Render persistent disk (paid). |
| 2 | Backend, hosting | `render.yaml` uses `plan: free`, which sleeps when idle. | `@Cron` jobs (courier sync, cart cleanup) don't run while it sleeps, and the first request after idle is slow. Use a paid plan or an external scheduler. |
| 3 | Backend, security | `STEADFAST_WEBHOOK_TOKEN` isn't documented. Without it the webhook is unauthenticated. | Add it to `.env.example` and `render.yaml` (`sync: false`) and set it in Steadfast. |
| 4 | Backend, security | `JwtAccessGuard` falls back to `'dev-access-secret'` when `ACCESS_TOKEN_SECRET` is missing. | A misconfigured deploy would accept tokens signed with a public string. Fail at startup instead. |
| 5 | Frontend, config | The README env name (`NEXT_PUBLIC_API_BASE_URL`) differs from the code (`NEXT_PUBLIC_API_URL`). | New setups silently hit localhost. Fix the README. |
| 6 | Frontend, UI | `StatusBadge` has no colour for `IN_PROGRESS` (support tickets), `RETURNED`, `DUE`, `PARTIAL`, `DEACTIVATED`, `PUBLISHED`, `ARCHIVED`. | They show as neutral grey. Add them to `STATUS_STYLES`. |
| 7 | Frontend, UX | About 31 `alert()` calls and mixed toast/inline feedback. | Standardise on one pattern (§3.6). |
| 8 | Frontend, UI | Raw `fixed inset-0` overlays outside `PanelModal` in `orders`, `inventory`, `dashboard/products` and `BulkAddToCartModal`. | Move panel dialogs to `PanelModal`. Storefront drawers (`CartDrawer`, `Navbar`) are fine. |
| 9 | Both, size | Very large files: `order.service.ts` (~2.3k lines), `(dashboard)/orders/page.tsx` (~2k), `dashboard/products`, `inventory`, `inventory-monitor` (>1.1k each). | Hard to review and easy to break. Split by concern (courier, status, reporting) when you next change them. |
| 10 | Frontend, security | `sanitizeHtml` uses regex on the server. `next.config` allows images from any `https` host. | Consider `isomorphic-dompurify`, and narrow `images.remotePatterns` to known hosts. |
| 11 | Frontend, CSS | `globals.css` forces `input, select, textarea { color: #000 !important }` and blue `option` styles. | This overrides daisyUI theming. Be aware of it when styling form controls, and don't add more `!important`. |
| 12 | Frontend | `components/Navbar.tsx` is re-exported by `components/shared/Navbar.tsx`. | Two entry points for one component. Collapse them into one. |
| 13 | Backend | Controllers type `req` as `any`. | Add a typed `@CurrentUser()` decorator. |
| 14 | Backend, docs | The README module list and route table predate `cms`, `homepage`, `media`, `user`, `support` and `withdrawal`. | Update the README. |
| 15 | Backend, repo hygiene | `scratch-create-admin.ts` and `scratch-db.ts` sit in the repo root and aren't git-ignored. | Move them into `scripts/` or delete them. Make sure they contain no real credentials. |
| 16 | Both | No automated tests. | Start with service-level tests for stock, order status and withdrawal maths, the riskiest logic. |

---

## 11. Working with AI assistants on this repo

- `UI_CONSISTENCY_PROMPT.md` (root) is the original spec for the panel design system. §3 of this document is the current summary.
- Point assistants at this file first. For layout fixes, point them at §3.8 and the 1366 px / 100 % zoom check. Remind them that UI tasks must not touch logic, that statuses must be checked against the backend, and that "done" means lint + type-check + build.
- This file sits in the workspace root, **outside** both git repos. Copy it (or the relevant half) into each repo's `README.md` or `CLAUDE.md` if it should be versioned with the code.

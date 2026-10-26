# 🛍️ Aarham Apparel — Web Frontend

[![Next.js](https://img.shields.io/badge/Next.js-14.2.5-black?style=for-the-badge&logo=next.js)](https://nextjs.org/)
[![React](https://img.shields.io/badge/React-18-61DAFB?style=for-the-badge&logo=react)](https://reactjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0-3178C6?style=for-the-badge&logo=typescript)](https://www.typescriptlang.org/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-3.4.1-38B2AC?style=for-the-badge&logo=tailwind-css)](https://tailwindcss.com/)
[![daisyUI](https://img.shields.io/badge/daisyUI-4.12-5A0EF8?style=for-the-badge)](https://daisyui.com/)
[![Zustand](https://img.shields.io/badge/Zustand-4.5.4-764ABC?style=for-the-badge)](https://zustand-demo.pmnd.rs/)

## What this project is

**Aarham Apparel** is an apparel commerce platform for a clothing brand. It is not just a
storefront — it is one application that serves three different audiences:

| Experience | Route group | Who it is for | What they do |
| :--- | :--- | :--- | :--- |
| **Storefront** | `app/(storefront)` | Retail customers | Browse the catalog, pick variants, check out, pay, and track their own orders |
| **Reseller portal** | `app/reseller` | Approved wholesale resellers | See wholesale prices, build an order on behalf of their own customers, set a custom sell price, track profit, and withdraw it |
| **Admin back office** | `app/(dashboard)` | Owners, admins, managers, inventory and sales staff | Run the catalog, stock, orders, content, courier bookings, payouts, users and support |

The frontend is the web client for a separate **NestJS + Prisma + PostgreSQL** API. All
business logic, authentication, role checks and data storage live in that backend; this repo
renders the experiences and calls the API.

The UI system is shared across both internal panels (`/dashboard/**` and `/reseller/**`) so the
product feels like one application. The admin sidebar is dark and the reseller sidebar is light,
but their structure, spacing, active-state logic and motion are identical.

---

## 👥 Roles

The backend issues seven roles. The frontend uses them to decide which panel and which actions
are available:

`SUPER_ADMIN` · `ADMIN` · `MANAGER` · `SALES_EXECUTIVE` · `INVENTOR` · `RESELLER` · `USER`

Staff roles can open the admin panel; resellers are routed to `/reseller`; ordinary customers
stay on the storefront.

---

## ✨ What the frontend covers

### Storefront (retail customers)
- Home page with hero banners, categories, featured products and promotional sections.
- Catalog and product detail pages with color, size and age-variant selection.
- Slide-over cart drawer with live totals.
- Checkout with customer address, district/thana, courier charge and payment method
  (Cash on Delivery, bKash, Nagad, Bank Transfer).
- Customer order history, order detail and tracking.
- CMS-driven content pages, legal documents, and announcement pop-ups.

### Reseller portal
- **Dashboard** — earned profit, pending profit, order counts and quick actions.
- **Product catalog** — wholesale pricing next to retail pricing, variant selection, quantity
  controls and add-to-order.
- **Cart / checkout** — one focused checkout: line items, quantity steppers, a custom selling
  price per item, courier policy, advance-courier handling, payment method and a sticky order
  summary with estimated profit.
- **Orders** — reseller-only order list with status, courier status and profit, plus a detail
  modal and CSV export.
- **Track** — read-only Steadfast tracking for the reseller's own booked consignments.
- **Payouts & wallet** — withdrawable balance, payout history, request-withdrawal flow, and
  proof/transaction details for completed payouts.
- **Support tickets** — create a ticket, copy the generated Ticket ID, search/filter, and read
  the support team's reply.

### Admin back office
- **Dashboard** — inventory and movement overview.
- **Product management** — products, pricing, variants and stock setup.
- **Products & Attributes** — categories, subcategories, child categories, brands, colors,
  sizes and age variants.
- **Inventory & Inventory Monitor** — per-size stock levels, stock-in/out adjustments, audit
  ledger, low-stock alerts, movement analytics and CSV export.
- **Orders & Sales** — customer and reseller orders, payment status, processing status,
  courier booking/sync, returns and stock restocking.
- **Base CMS** — WhatsApp/contact info, site logo and social links.
- **Homepage Builder** (`/admin/homepage`) — drag-and-drop section list, design variants,
  live preview, save draft and publish.
- **Custom Pages Builder** — modular landing pages for campaigns.
- **Product Landing CMS** — per-product landing mode, hero video and section configuration.
- **External API Integrations** — payment gateways, courier APIs and tracking pixels.
- **Legal Documents** — versioned Terms, Privacy, Return/Refund and Reseller Agreement pages.
- **Pop-up Notices** — targeted announcement modals for the storefront and/or reseller panel.
- **User Management** — search/filter accounts, view full profile, change role, change status.
- **Reseller Withdrawals** — approve/complete/reject payout requests, record TrxID and attach
  proof documents.
- **Courier Management** — Steadfast balance/health, shipment list, pickup, returns and
  invoice panels, courier policy settings.
- **Support Tickets** — search tickets, update status and write resolution notes visible to the
  reseller.

---

## 🏗️ Frontend architecture

```text
src/
├── app/
│   ├── (auth)/                 # login, register
│   ├── (storefront)/           # public shop: home, shop, products, checkout,
│   │                           # my-orders, about, legal, CMS pages
│   ├── (dashboard)/            # admin panel: dashboard, products, attributes,
│   │                           # inventory, orders, cms, admin/*, loading.tsx
│   ├── reseller/               # reseller portal: dashboard, products, cart,
│   │                           # orders, track, payouts, support, loading.tsx
│   ├── globals.css             # Tailwind layers, shared panel-table styles
│   └── layout.tsx              # root layout
├── components/
│   ├── panel/                  # shared design system + shell used by BOTH panels
│   │   ├── PanelPage.tsx
│   │   ├── PanelPageHeader.tsx
│   │   ├── PanelCard.tsx
│   │   ├── PanelTable.tsx
│   │   ├── PanelTabs.tsx
│   │   ├── PanelModal.tsx
│   │   ├── PanelEmpty.tsx
│   │   ├── PanelSkeleton.tsx
│   │   ├── PanelButton.tsx
│   │   ├── StatusBadge.tsx
│   │   ├── useActiveNav.ts     # longest-match active nav
│   │   ├── PanelSidebar.tsx
│   │   └── PanelShell.tsx
│   ├── shared/                 # Header, Footer, AttributeManager, modals
│   ├── cms/                    # CMS module manager
│   ├── homepage/               # homepage section registry + renderer
│   ├── homepage-admin/         # builder shell, section list, library, variants
│   ├── courier/                # track, pickups, returns, invoices panels
│   ├── public/                 # storefront section components
│   └── ui/                     # rich text, media field, skeleton, spinner
├── services/                   # Axios client + one module per API area
├── store/                      # Zustand stores (auth, cart, reseller cart, CMS, categories)
└── utils/                      # CSV export, links, HTML sanitising
```

### Shared panel design system

Both panels use `src/components/panel/` for their page container, header, cards, tables, tabs,
modals, empty/skeleton states and status badges. The conventions are documented at the top of
`src/components/panel/index.ts`:

- **Cards / panels:** `rounded-2xl`, `bg-base-100`, `border-base-200`, `shadow-sm`
- **Buttons:** `btn btn-sm rounded-xl gap-2` (use `btn-xs` inside table rows)
- **Tabs:** one row, horizontal scroll on mobile, never wrap
- **Modals:** one shared `PanelModal` (Escape/backdrop close, scroll lock, focus return,
  bottom-sheet on phones, Cancel left / primary right)
- **Status colours:** one `StatusBadge` map shared by admin and reseller

`useActiveNav` collapses duplicate matches (e.g. `/admin/courier` vs
`/admin/courier/shipments`) so exactly one nav item is ever highlighted. `PanelShell` owns the
mobile drawer, backdrop fade, Escape handling, body-scroll lock and route-change close.

---

## 🛠️ Tech stack

- **Framework:** Next.js 14.2 (App Router)
- **UI:** React 18, Tailwind CSS 3.4, daisyUI 4.12 (`corporate` theme, primary `#001C94`)
- **State:** Zustand
- **Icons:** Lucide React
- **Forms & validation:** React Hook Form + Zod
- **HTTP:** Axios
- **Language:** TypeScript 5

---

## 🚀 Getting started

### 1. Install dependencies

```bash
npm ci
```

### 2. Configure environment

Create `.env.local`:

```env
NEXT_PUBLIC_API_BASE_URL="http://localhost:3000"
```

The backend (NestJS) is expected on port `3000`.

### 3. Run the development server

```bash
npm run dev
```

The frontend runs at **http://localhost:4000**.

---

## 📜 Scripts

| Command | Description |
| :--- | :--- |
| `npm run dev` | Start the Next.js dev server on port `4000` |
| `npm run build` | Build the optimized production bundle |
| `npm run start` | Serve the production build on port `4000` |
| `npm run start:prod` | Serve on `$PORT` (deployment) |
| `npm run lint` | Run ESLint |
| `npx tsc --noEmit` | Type-check without emitting files |

Both `npx tsc --noEmit` and `npm run lint` are expected to pass before merging.

---

## 📝 Notes

- **UI-only changes** should not alter API calls, stores, routes, auth or role checks.
- The admin sidebar stays dark and the reseller sidebar stays light; only colour tokens differ.
- The backend lives in the sibling `ResllingPortalBackend-` repository and owns the database,
  business rules, RBAC and third-party integrations (Steadfast, payment gateways).

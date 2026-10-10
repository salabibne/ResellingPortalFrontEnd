# 🛍️ Aarham Apparel — Frontend Web Application

[![Next.js](https://img.shields.io/badge/Next.js-14.2.5-black?style=for-the-badge&logo=next.js)](https://nextjs.org/)
[![React](https://img.shields.io/badge/React-18-61DAFB?style=for-the-badge&logo=react)](https://reactjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0-3178C6?style=for-the-badge&logo=typescript)](https://www.typescriptlang.org/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-3.4.1-38B2AC?style=for-the-badge&logo=tailwind-css)](https://tailwindcss.com/)
[![Zustand](https://img.shields.io/badge/Zustand-4.5.4-764ABC?style=for-the-badge)](https://zustand-demo.pmnd.rs/)

The **Frontend Web Client** for the **Aarham Apparel Platform**, engineered using **Next.js 14 (App Router)**, **TypeScript**, **Tailwind CSS**, and **Zustand**. It offers a fast, responsive user experience for retail shoppers, wholesale resellers, and store managers.

---

## 📐 Application Architecture & Structure

The codebase follows the modern Next.js 14 App Router pattern located within `src/`:

```text
src/
├── app/                      # Next.js App Router Pages & Layouts
│   ├── (auth)/               # Authentication routes (login, register)
│   ├── (dashboard)/          # Dashboard management routes (orders, products, inventory)
│   ├── shop/                 # Product catalog & single product details page
│   ├── checkout/             # Order checkout page with address & payment selection
│   ├── my-orders/            # Customer order history & tracking
│   ├── layout.tsx            # Root layout component
│   └── page.tsx              # Landing homepage featuring banners & categories
├── components/               # Reusable UI Components
│   ├── shared/               # Header, Footer, Navbar, Loading Spinner
│   ├── shop/                 # Product Cards, Filter Sidebars, Variant Selectors
│   ├── cart/                 # Slide-over Cart Drawer, Quantity Selectors
│   └── ui/                   # Modal dialogs, buttons, badge indicators
├── services/                 # API Client Integration Modules
│   ├── api.ts                # Axios HTTP client configuration with interceptors
│   ├── auth.api.ts           # Authentication API calls
│   ├── product.api.ts        # Product & category fetchers
│   ├── cart.api.ts           # Cart operations
│   └── order.api.ts          # Order submission & tracking API
└── store/                    # Zustand Global State Management
    ├── useAuthStore.ts       # Active user session & role state
    └── useCartStore.ts       # Cart items, open/close drawer state & calculations
```

---

## 🎨 UI/UX Features & Key Capabilities

### 1. 👕 Dynamic Storefront & Product Discovery
- **Hero Banners & Collections**: Visual homepage highlighting new arrivals and trending categories.
- **Multilevel Filters**: Instant filtering by Category, Subcategory, Brand, Price Range, and Availability.
- **Variant Selectors**: Interactive color swatch pickers (with visual hex colors) and size selectors on product detail pages.

### 2. 💼 Specialized Reseller Portal View
- **Dual Price Display**: Authenticated resellers automatically see wholesale pricing (`resellerPrice`) alongside retail prices.
- **Bulk Purchasing**: Streamlined ordering UI for wholesale quantity selections.

### 3. 🛒 Interactive Cart Drawer & Checkout Flow
- **Slide-Over Cart Drawer**: Accessible from anywhere in the app without page reloads.
- **Real-Time Calculation**: Dynamic calculation of subtotals, promo discounts, and courier fees.
- **Multi-Step Checkout**: Integrated shipping address form with District/Thana selectors and payment method choices (COD, bKash, Nagad, Bank Transfer).

### 4. 📊 Responsive Dashboard & Order History
- **Customer Portal**: View active and past orders with status badges (`PENDING`, `PROCESSING`, `SHIPPED`, `DELIVERED`).
- **Responsive Layout**: Designed for seamless experience across mobile, tablet, and desktop viewports.

---

## 🛠️ Tech Stack & Key Libraries

- **Framework**: [Next.js 14.2](https://nextjs.org/) (App Router)
- **UI Framework**: [React 18](https://react.dev/)
- **State Management**: [Zustand](https://zustand-demo.pmnd.rs/)
- **Styling**: [Tailwind CSS](https://tailwindcss.com/) & [DaisyUI](https://daisyui.com/)
- **Icons**: [Lucide React](https://lucide.dev/)
- **Forms & Validation**: [React Hook Form](https://react-hook-form.com/) & [Zod](https://zod.dev/)
- **HTTP Client**: [Axios](https://axios-http.com/)

---

## 🚀 Getting Started

### 1. Install Dependencies
```bash
npm install
```

### 2. Configure Environment Variables
Create a `.env.local` file in the root of `Frontend/`:
```env
NEXT_PUBLIC_API_BASE_URL="http://localhost:3000"
```

### 3. Run Development Server
```bash
npm run dev
```
The frontend will start at **[http://localhost:4000](http://localhost:4000)**.

---

## 📜 NPM Scripts Reference

| Command | Description |
| :--- | :--- |
| `npm run dev` | Launch Next.js dev server on port `4000` |
| `npm run build` | Build optimized production bundle |
| `npm run start` | Serve production build on port `4000` |
| `npm run lint` | Run ESLint static analysis checks |

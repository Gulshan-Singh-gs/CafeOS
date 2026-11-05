# CafeOS — Multi-Tenant Independent Café Operations Platform

> **Target Deployment**: Independent Cafés in Kurali (Morinda Road / Bus Stand area), SAS Nagar, Punjab, India.

CafeOS is a production-grade, zero-commission operations platform engineered specifically for independent café owners. It replaces paper kots and aggregator commissions with a sleek, branded mobile ordering experience for customers and a live, synchronized kitchen operations terminal for baristas and owners.

---

## 🌟 Key Features & Workflow

### 1. Customer Mobile Storefront (`/cafe/[slug]`)
- **Café-Specific Branding**: Accessible via public URL (e.g., `/cafe/kurali-chai-bakehouse`).
- **Authentic Indian Menu**: Pre-seeded with Punjabi café specialties in INR (Kulhad Adrak Elaichi Chai, Amritsari Paneer Tikka Toastie, Bun Maska, Highway Cold Coffee, Samosa Chaat, Brownies).
- **Interactive Cart & Real-Time Controls**: Quantity selectors, item removal, veg/non-veg indicators, category tabs, and search filtering.
- **Dining Options**: Select between **Dine-In** (with optional Table Number) and **Takeaway / Parcel**.
- **Special Kitchen Requests**: Special instructions box for customizable spice and sugar levels.
- **Instant Order Number & Live Status Tracker (`/order/[id]`)**: Auto-updates every 3.5s across the 4 stages: `Received` → `Preparing` → `Ready` → `Completed`.

### 2. Owner Operations & Kitchen Terminal (`/dashboard`)
- **Live Kitchen Kan-ban**: Incoming order stream with immediate audio/visual status indicators.
- **Single-Click Status Transitions**: Baristas advance orders with one click (`Start Preparing` → `Mark Ready` → `Complete Order` or `Cancel`).
- **Live Sales & Performance Stats**: Real-time counters for today's gross sales in INR (`₹`), active kitchen tickets, average order value, and completed orders.
- **Menu & Price Management (`/dashboard` → Menu Tab)**: Edit prices in INR, toggle items between **Available** and **Sold Out**, and publish new seasonal items on the fly with instant persistence.
- **One-Click Demo Reset**: Reset all demo orders and catalog items to clean initial seed data via the "Reset Demo Data" button.

### 3. Bulletproof Multi-Tenancy & Zero-Trust Pricing
- **Tenant Isolation**: Every query and mutation is strictly scoped by `cafe_id`. Switching between *Verma & Sons (Kurali)* and *Shivalik Foothills Brews (Pinjore)* confirms that Café 2 cannot inspect or mutate Café 1's orders or catalog.
- **Authoritative Server Pricing**: The client *never* submits prices or order totals. Clients submit only `{ item_id, quantity, notes }`. The server authoritatively validates menu existence, tenant ownership, current stock availability, and computes the bill from authoritative database records.

---

## 🏗️ Technical Architecture & Tech Stack

- **Framework**: [Next.js 15](https://nextjs.org/) (App Router, Server Actions, Route Handlers)
- **Language**: TypeScript throughout (Strict type safety, zero `any`)
- **Styling**: Tailwind CSS + Custom HSL Design Tokens (Warm Terracotta `#D9531E`, Roasted Espresso `#1C130E`, Cardamom Cream `#FDFBF7`, Brass Gold `#C89242`)
- **Icons**: Lucide React
- **SEO & Structured Data**: JSON-LD `Restaurant` schema, OpenGraph tags, canonical links, and semantic HTML
- **Database & Persistence**:
  - **Live Cloud Mode**: Supabase PostgreSQL with official migration script and Row-Level Security (`supabase/migrations/20261105000000_init_cafeos.sql`).
  - **Local Out-of-the-Box Mode**: Persistent, atomic file-backed relational store (`.data/cafeos_store.json`) requiring zero external cloud dependencies for local evaluation and testing.

---

## 🚀 Quickstart & Local Setup

### 1. Prerequisites
- Node.js `v18+` or `v20+` (Tested on `v26.5.0`)
- `pnpm` (or `npm`)

### 2. Install Dependencies
```bash
# In the project root (C:\Users\Code66\.antigravity-ide\Persona\OS\CafeOS)
pnpm install
```

### 3. Environment Variables (Optional)
Copy `.env.example` to `.env`:
```bash
cp .env.example .env
```
*(Note: If left unset, CafeOS automatically operates in zero-setup local persistent mode with full seed data).*

### 4. Run Development Server
```bash
pnpm dev
```
Open **[http://localhost:3000](http://localhost:3000)** in your browser.

---

## 🔑 Demo Access & Walkthrough Guide

| Persona | URL | Description |
| :--- | :--- | :--- |
| **Platform Explorer** | `http://localhost:3000/` | Central landing page, tenant overview, architectural guarantees |
| **Customer Storefront (Kurali)** | `http://localhost:3000/cafe/kurali-chai-bakehouse` | Browse menu, customize cart, submit orders in INR |
| **Owner Operations Dashboard** | `http://localhost:3000/dashboard` | Manage incoming orders, advance statuses, edit menu prices |
| **Tenant Isolation Test (Pinjore)** | `http://localhost:3000/cafe/pinjore-brews` | Second tenant to verify cross-tenant data isolation |

### Testing the End-to-End Workflow:
1. Open **Customer Storefront** in one browser window (or mobile emulator): `http://localhost:3000/cafe/kurali-chai-bakehouse`.
2. Add **Special Adrak Elaichi Kulhad Chai** and **Amritsari Paneer Tikka Toastie** to your cart.
3. Open the cart drawer, enter name and phone, and click **Confirm & Place Order**.
4. You will be redirected to the live tracker (`/order/[id]`) showing status: `Received`.
5. Open **Owner Dashboard** in a second window: `http://localhost:3000/dashboard`.
6. See the new order arrive immediately at the top of the queue.
7. Click **Start Preparing** → Notice the customer's tracking screen instantly updates to `Preparing`!
8. Click **Mark Ready** → Notice customer's tracker updates to `Ready for Pickup`!
9. In the Owner Dashboard, switch to the **Menu & Pricing Management** tab, change the price of an item or toggle availability to *Sold Out*, and refresh the customer storefront: the edit persists.
10. Click **Reset Demo Data** in the dashboard header at any time to restore the initial demo state.

---

## 🛡️ Supabase Database Migration (Cloud Deployment)

To deploy the schema to your Supabase project:
1. Open your Supabase Dashboard → **SQL Editor**.
2. Run the SQL script located at:
   `supabase/migrations/20261105000000_init_cafeos.sql`
3. Configure your Supabase credentials in `.env`:
   ```env
   NEXT_PUBLIC_SUPABASE_URL="https://your-project.supabase.co"
   NEXT_PUBLIC_SUPABASE_ANON_KEY="eyJ..."
   SUPABASE_SERVICE_ROLE_KEY="eyJ..."
   ```
4. The database enforces Row Level Security (RLS) on all 7 tables (`cafes`, `profiles`, `memberships`, `categories`, `menu_items`, `orders`, `order_items`).

---

## 📜 Acceptance Criteria Verification Matrix

| # | Acceptance Criterion | Implementation Status | Verified Evidence |
| :---: | :--- | :---: | :--- |
| 1 | Customer can browse menu on phone | ✅ PASS | Responsive mobile layout, viewport meta, category tabs, touch controls |
| 2 | Customer can submit an order | ✅ PASS | Form validation (Name, Phone, Items, Dining Option), `/api/orders` |
| 3 | Order is persisted in database | ✅ PASS | Authoritative server write with unique `CF-XXXX` identifier |
| 4 | Owner can see the order | ✅ PASS | Live kitchen feed auto-polls every 4s, audio/visual cues |
| 5 | Owner can change its status | ✅ PASS | Status transition state machine: `Received` → `Preparing` → `Ready` → `Completed` |
| 6 | Customer can see updated status | ✅ PASS | Auto-polling tracker at `/order/[id]` syncs status changes without page refresh |
| 7 | Menu edits persist after refresh | ✅ PASS | Live price updates & availability toggles persist in atomic relational store |
| 8 | Second café cannot access first café's data | ✅ PASS | Multi-tenant isolation scoped strictly by `cafe_id` across all queries |
| 9 | Application works with seeded demo data | ✅ PASS | Verma & Sons (Kurali) pre-seeded with 12 authentic items & realistic orders |
| 10 | README explains setup, env & demo access | ✅ PASS | Comprehensive instructions provided above |

---

Built with pride for the bustling street cafes and roasteries of Punjab.


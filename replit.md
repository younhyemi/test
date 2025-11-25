# Mobile Restaurant Order Management System

## Overview

This is a mobile-optimized web application for restaurant order management with QR code-based customer self-ordering capability. Built as a full-stack TypeScript application, it supports multi-tenant operation where administrators manage the entire system while customers can only access their own table's functions.

The application follows a function-first design philosophy prioritizing speed, clarity, and error prevention for busy restaurant environments. It uses Material Design 3 principles optimized for mobile touch interfaces with large buttons (60-70px minimum height), 16px+ fonts, and card-based layouts.

## Recent Changes (November 25, 2025)

Successfully migrated from single-store table-based system to multi-tenant QR code-based architecture:
- Added main landing page with table number input and admin/customer mode branching
- Implemented QR code URL parameter support (?table=NUMBER)
- Created separate admin and customer home pages
- Modified all customer pages to support both URL parameters and sessionStorage for table context
- Fixed cancelOrder to properly clear serve_yn and pay_yn flags to hide cancelled orders from dashboards
- All pages tested with end-to-end playwright tests

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Application Flow

**Main Entry Point (`/`)**
- Table number input field
- "입장하기" (Enter) button
- If "admin" entered → redirect to `/admin` (Admin Mode)
- If other value entered → redirect to `/customer` (Customer Mode)
- QR code support: `/?table=5` automatically fills table number

**Admin Mode**
- Admin home (`/admin`) - 4 menu buttons
  - Menu Management (`/manage`)
  - Table Order Confirmation (`/admin-order`)
  - Food Confirmation (`/food-confirm`)
  - Payment Processing (`/payment`)

**Customer Mode**
- Customer home (`/customer`) - 2 menu buttons, displays table number
  - Order (`/order`)
  - Order Status (`/order-status`)
- All customer pages support both URL parameter (`?table=N`) and sessionStorage
- Customers can only view/manage their own table's orders

### Frontend Architecture

**Framework & Build Tool**
- React 18 with TypeScript for type-safe component development
- Vite as the build tool and development server
- Wouter for lightweight client-side routing

**UI Component System**
- shadcn/ui component library with Radix UI primitives
- Tailwind CSS for utility-first styling with custom design tokens
- Component style: "new-york" variant from shadcn/ui
- Mobile-first responsive design with max-width containers (max-w-2xl)

**State Management**
- TanStack Query (React Query) v5 for server state management
- Query client configured with no automatic refetching (user-controlled updates)
- sessionStorage for table number persistence
- URL parameters for QR code deep linking

**Table Number Management**
- URL parameter takes precedence over sessionStorage
- Both URL and sessionStorage updated on page load
- Enables QR code sharing and page refresh without losing context

### Backend Architecture

**Runtime & Framework**
- Node.js with Express.js for HTTP server
- TypeScript throughout with ES modules
- Dual-mode server setup (development with Vite middleware, production with static files)

**API Design**
- RESTful HTTP endpoints under `/api` prefix
- JSON request/response format
- Database operations abstracted through storage layer interface

**Database Layer**
- Drizzle ORM for type-safe database operations
- PostgreSQL as the database (via Neon serverless with WebSocket support)
- Storage abstraction layer (`IStorage` interface)

**Schema Design**:
- `menus` table: menu items with name, price, and sale status (Y/N flag)
- `orders` table: table-based orders with menu reference, quantity, serve status, payment status, and use status (for soft deletes)

### Core Application Features

**Main Page (`/`)**
- Table number input with QR parameter support
- Admin/customer mode branching logic
- Auto-fill from URL parameter

**Admin Home (`/admin`)**
- Navigation hub with 4 main functions
- Back navigation to logout

**Menu Management (`/manage`) - Admin Only**
- Create, update, and delete menu items
- Toggle items between available (sale_yn='Y') and sold-out (sale_yn='N')
- Real-time validation using Zod schemas
- Sold-out items hidden from customer order page

**Customer Home (`/customer`)**
- Shows table number in header
- Navigation to order placement and status check
- Table number from URL or sessionStorage

**Order Entry (`/order`) - Customer**
- Table number automatically set from URL/sessionStorage
- Only shows available menus (sale_yn='Y')
- Quantity adjustment with +/- buttons
- Batch order creation for multiple items per table
- Returns to customer home after order placement

**Order Status (`/order-status`) - Customer**
- View own table's orders only
- Shows menu items, quantities, prices
- Displays serve status (준비중/제공완료)
- Total amount calculation
- Real-time updates on refresh

**Table Order Confirmation (`/admin-order`) - Admin Only**
- View orders grouped by table number
- Collapsible sections to reduce scrolling
- Individual serve status updates (serve_yn toggle)
- Bulk table order cancellation (sets use_yn='N', serve_yn='N', pay_yn='N')

**Food Confirmation (`/food-confirm`) - Admin Only**
- View orders grouped by menu item
- Shows table numbers for each order
- Batch serve status updates by checkbox selection
- Aggregated quantities for kitchen efficiency

**Payment Processing (`/payment`) - Admin Only**
- View unpaid orders grouped by table
- One-click payment completion for entire table bill (pay_yn='Y')
- Automatic calculation of total amounts
- Only shows orders with pay_yn='N' and use_yn='Y'

### Order Cancellation Logic

When an order is cancelled:
- `use_yn` set to 'N' (soft delete)
- `serve_yn` set to 'N' (removed from kitchen dashboard)
- `pay_yn` set to 'N' (removed from payment dashboard)

This ensures cancelled orders are completely hidden from all operational dashboards.

### External Dependencies

**UI Component Libraries**
- @radix-ui/* - Headless accessible UI primitives (accordion, dialog, dropdown, etc.)
- lucide-react - Icon library
- embla-carousel-react - Touch-friendly carousel component
- cmdk - Command menu component

**Form & Validation**
- react-hook-form - Form state management
- @hookform/resolvers - Form validation adapter
- zod - Schema validation (shared between client and server)
- drizzle-zod - Automatic Zod schema generation from Drizzle schemas

**Data Fetching**
- @tanstack/react-query - Async state management

**Styling**
- tailwindcss - Utility-first CSS framework
- tailwind-merge - Conditional class merging
- class-variance-authority - Component variant management
- clsx - Conditional className utility

**Database**
- @neondatabase/serverless - PostgreSQL client for Neon
- drizzle-orm - Type-safe ORM
- drizzle-kit - Schema migration tool
- ws - WebSocket support for Neon

**Date Handling**
- date-fns - Lightweight date utility library

**Session Management**
- express-session - Session middleware
- connect-pg-simple - PostgreSQL session store

**Development Tools**
- @replit/vite-plugin-* - Replit-specific development enhancements
- tsx - TypeScript execution for development server
- esbuild - Production server bundling

### Configuration & Build

**TypeScript Configuration**
- Strict mode enabled for maximum type safety
- Path aliases: `@/*` for client source, `@shared/*` for shared code
- ESNext modules with bundler resolution

**Build Process**
- Client: Vite builds React app to `dist/public`
- Server: esbuild bundles Express server to `dist/index.js`
- Shared schema code imported by both client and server

**Development Workflow**
- `npm run dev` - Vite dev server with HMR + Express API
- `npm run build` - Production builds for both client and server
- `npm run db:push` - Push Drizzle schema changes to database

## QR Code Implementation

**URL Format**: `https://your-domain.com/?table=5`

**Behavior**:
1. Main page auto-fills table number input
2. Customer clicks "입장하기" to enter customer mode
3. All customer pages (`/customer`, `/order`, `/order-status`) read table parameter from URL
4. Table number persisted in sessionStorage for navigation between pages
5. Page refresh or direct link access maintains table context

**Benefits**:
- Easy table access via QR code scan
- No manual table number entry needed
- Shareable links for table context
- Works across page refreshes and new tabs

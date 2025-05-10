# Bumibrew: Local Producers Marketplace

A Next.js (App Router) platform connecting local producers and artisans with nearby consumers to promote sustainable consumption, local economies, and reduce carbon footprint.

## Table of Contents

- [Project Overview](#project-overview)
- [Features](#features)
- [Tech Stack](#tech-stack)
- [Folder Structure](#folder-structure)
- [Setup & Installation](#setup--installation)
- [Environment Variables](#environment-variables)
- [API & Service Architecture](#api--service-architecture)
- [Core Flows](#core-flows)
- [Usage Tips](#usage-tips)
- [Contribution Guidelines](#contribution-guidelines)
- [Credits](#credits)
- [FAQ](#faq)

---

## Project Overview

Bumibrew is a frontend-only MVP platform designed to bridge the gap between local producers/artisans and community consumers. The platform enables users to discover, purchase, and review locally produced goods, supporting both economic and environmental sustainability.

**Key Principles:**

- Clean Code
- DRY (Don't Repeat Yourself)
- Centralized Logic & Configuration

## Features

- **Authentication**: Consumer & seller roles, protected pages, centralized auth utility
- **Market Discovery**: Search, filter, and server-side pagination for products
- **Product Details**: Rich product info, image handling, related products
- **Seller Listings**: Standard & premium, seller-specific pages
- **Cart & Checkout**: Add to cart, adjust quantity, apply promo codes/vouchers, shipping info, payment selection
- **Payment**: Simulated wallet balance or cash on delivery
- **Vouchers & Promotions**: Seller/product-specific vouchers, promo codes, stacking, clear UI indicators
- **Order & Review Flow**: Track orders, leave 5-star product reviews post-purchase
- **Wishlist**: Save products for later
- **Responsive Design**: Mobile-first, accessible UI
- **Unique Feature**: (Customize this section as needed)

## Tech Stack

- **Framework**: Next.js (App Router)
- **Language**: TypeScript
- **UI**: Tailwind CSS, Headless UI, React Icons
- **State Management**: React Context, hooks
- **API**: Axios-based, external APIs only (no backend in repo)
- **Validation**: Zod
- **Utilities**: date-fns, uuid, html2canvas, xlsx, jsPDF

## Folder Structure

```
├── public/                   # Static assets
├── src/
│   ├── app/                  # Next.js App Router pages
│   ├── components/           # UI & feature components
│   ├── constants/            # Centralized constants
│   ├── context/              # React contexts
│   ├── hooks/                # Custom hooks (e.g., useDebounce)
│   ├── lib/                  # Utilities (auth, validation schemas, etc.)
│   ├── scripts/              # Utility/test scripts
│   ├── services/             # API services (Axios-based)
│   │   └── api/              # Endpoint-specific services
│   ├── styles/               # Global styles
│   ├── types/                # Centralized TypeScript types
│   └── utils/                # Helper utilities
├── .env.local                # Environment variables
├── package.json              # Dependencies & scripts
├── tsconfig.json             # TypeScript config
└── README.md                 # Project documentation
```

## Setup & Installation

1. **Clone the repository:**
   ```bash
   git clone <repo-url>
   cd fsse_oct24_groupc_gfp_frontend
   ```
2. **Install dependencies:**
   ```bash
   npm install
   # or
   yarn install
   ```
3. **Configure environment variables:**
   - Copy `.env.local.example` to `.env.local` (if available) and update values as needed.
   - At minimum, set the API base URL and any public keys required.
4. **Run the development server:**
   ```bash
   npm run dev
   # or
   yarn dev
   ```
5. **Open the app:**
   Visit [https://bumibrew-pearl.vercel.app/](https://bumibrew-pearl.vercel.app/)

## Environment Variables

- `NEXT_PUBLIC_API_BASE_URL`: Base URL for API requests (see `src/services/api/config.ts`)
- Add other variables as needed for public keys or third-party services.

## API & Service Architecture

- **All API calls use Axios** and are organized in `src/services/api/`.
- **Endpoints are centralized** in `src/services/api/config.ts` for consistency.
- **TypeScript types** for all responses are in `src/types/apiResponses.ts`.
- **No backend code** in this repo; all data is fetched from external APIs.
- **Auth utility** (`src/lib/auth.ts`) manages tokens, user info, and session state.
- **Error handling** is consistent and user-friendly, with toast notifications.

## Core Flows

### Authentication

- Login & registration use Axios-based services.
- Auth state is managed via localStorage and cookies.
- User roles (consumer/seller) determine access to protected pages.

### Product & Market

- Debounced search and server-side pagination for products.
- Product detail pages fetch full info and related products.

### Cart & Checkout

- Add, update, or remove items from cart (with product name toasts).
- Apply promo codes and seller/product-specific vouchers (stackable).
- Store checkout info (shipping, payment, totals) in localStorage for success page.

### Vouchers & Promotions

- Seller and product-specific vouchers managed via API.
- UI shows available vouchers per seller, with stacking and clear indicators.
- Voucher API endpoints and formats are documented in `src/services/api/vouchers.ts`.

### Orders & Reviews

- Orders tracked per user, with review flow post-purchase.
- Product reviews synced via localStorage and API.

### Wishlist

- Users can add/remove products to wishlist; managed via API and localStorage.

## Usage Tips

- Use the dashboard for seller-specific actions (voucher management, product uploads).
- Promo codes and vouchers can be stacked for maximum discount.
- All user feedback (toasts, errors) is designed to be clear and actionable.

## Contribution Guidelines

- Follow clean code, DRY, and centralization principles.
- Use TypeScript and centralized types for all new features.
- Place new API endpoints and types in the correct centralized files.
- Write clear, reusable components and hooks.
- Use toast notifications for user feedback.
- Document new features in this README.

## Credits

- Developed by Group C, FSSE Okt 2024, RevoU
- Special thanks to all contributors, mentors, and the open-source community

## FAQ

**Q: Does this project include a backend?**
A: No. This is a frontend-only project. All data is fetched from external APIs or mocked.

**Q: How are vouchers and promo codes managed?**
A: Vouchers are managed per seller/product via the API. Promo codes can be stacked with vouchers for maximum discount. See `src/services/api/vouchers.ts` for details.

**Q: How is authentication handled?**
A: Auth is managed via centralized utilities and Axios-based services. Tokens are stored in localStorage and cookies, with role-based access throughout the app.

**Q: Can I contribute?**
A: Yes! Please read the contribution guidelines above and submit a pull request.

---

For any issues or suggestions, please open an issue or contact the maintainers.

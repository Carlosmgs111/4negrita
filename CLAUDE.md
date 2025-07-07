# CodeViz Research Context

> **Note**: This file contains research context from CodeViz. Most recent contexts are at the bottom.

---

## Research Query

Show the struture of this project

*Session: b0d29dbaa3bbee9e67e1b4195aec44c0 | Generated: 7/6/2025, 9:22:23 PM*

### Analysis Summary

# Project Structure Report

This project is a web application built with **Astro**, **React** (for interactive components), and **Tailwind CSS** for styling. It leverages **Supabase** for backend services (authentication, database) and includes API routes for various functionalities, including payment processing via **Wompi**.

## High-Level Architecture

The application follows a component-based architecture, separating concerns into distinct modules for UI, state management, utility functions, and API interactions.

*   **Frontend (Astro/React):** Handles rendering of pages, user interface components, and client-side interactions. Pages are defined in [src/pages/](src/pages/) and utilize components from [src/components/](src/components/) and layouts from [src/layouts/](src/layouts/).
*   **Backend (Astro API Routes):** Provides server-side logic for authentication, ticket management, user profiles, and payment webhooks. These are defined within [src/pages/api/](src/pages/api/).
*   **Shared Logic:** Utility functions, Supabase integration, and state management are centralized in [src/lib/](src/lib/) and [src/stores/](src/stores/).

## Core Directories and Components

### **`src/` - Source Code**

The primary directory for all application source code.

#### **`src/components/` - User Interface Components**

This directory houses reusable UI components, categorized by their functional area.

*   **`src/components/Auth/`**: Contains components related to user authentication.
    *   **Login**: [Login.tsx](src/components/Auth/Login.tsx)
    *   **OTP Verification**: [OTPVerification.tsx](src/components/Auth/OTPVerification.tsx)
    *   **Signup**: [Signup.tsx](src/components/Auth/Signup.tsx)
*   **`src/components/Dashboard/`**: Components for the user dashboard.
    *   **Logout Button**: [LogoutButton.tsx](src/components/Dashboard/LogoutButton.tsx)
    *   **Owned Tickets**: [OwnedTickets.tsx](src/components/Dashboard/OwnedTickets.tsx)
    *   **Security Settings**: [SecuritySettings.tsx](src/components/Dashboard/SecuritySettings.tsx)
    *   **User Settings**: [UserSettings.tsx](src/components/Dashboard/UserSettings.tsx)
*   **`src/components/Guide/`**: Components for the application guide/documentation.
    *   **Header**: [Header.astro](src/components/Guide/Header.astro)
    *   **Navigation Index**: [NavIndex.astro](src/components/Guide/NavIndex.astro)
    *   **Sidebar**: [Sidebar.astro](src/components/Guide/Sidebar.astro)
    *   **Icons**: [src/components/Guide/Icons/](src/components/Guide/Icons/) contains various SVG icons used in the guide.
*   **`src/components/Home/`**: Components for the main landing page.
    *   **Call to Action**: [CallToAction.astro](src/components/Home/CallToAction.astro)
    *   **FAQ Accordion**: [FAQAccordion.tsx](src/components/Home/FAQAccordion.tsx)
    *   **FAQ Section**: [FAQSection.astro](src/components/Home/FAQSection.astro)
    *   **Hero Section**: [Hero.astro](src/components/Home/Hero.astro)
    *   **Progress Section**: [ProgressSection.astro](src/components/Home/ProgressSection.astro)
    *   **Raffle Details**: [RaffleDetails.astro](src/components/Home/RaffleDetails.astro)
    *   **Story Section**: [StorySection.astro](src/components/Home/StorySection.astro)
*   **`src/components/Payment/`**: Components related to payment processing.
    *   **Payment Canceled**: [PaymentCanceled.astro](src/components/Payment/PaymentCanceled.astro)
    *   **Payment Resume**: [PaymentResume.astro](src/components/Payment/PaymentResume.astro)
    *   **Payment Success**: [PaymentSuccess.astro](src/components/Payment/PaymentSuccess.astro)
    *   **Wompi Payment Button**: [WompiPaymentButton.astro](src/components/Payment/WompiPaymentButton.astro)
*   **`src/components/Tickets/`**: Components for displaying and managing tickets.
    *   **Ticket Button**: [TicketButton.tsx](src/components/Tickets/TicketButton.tsx)
    *   **Tickets Display**: [TicketsDisplay.tsx](src/components/Tickets/TicketsDisplay.tsx)
    *   **Tickets HUB**: [TicketsHUB.tsx](src/components/Tickets/TicketsHUB.tsx)
    *   **Tickets Purchase Confirm**: [TicketsPurchaseConfirm.tsx](src/components/Tickets/TicketsPurchaseConfirm.tsx)
    *   **Ticket SVG**: [TicketSVG.tsx](src/components/Tickets/TicketSVG.tsx)
*   **`src/components/ui/`**: Reusable UI primitives based on Shadcn UI.
    *   Includes components like [accordion.tsx](src/components/ui/accordion.tsx), [button.tsx](src/components/ui/button.tsx), [input.tsx](src/components/ui/input.tsx), etc.
*   **`src/components/Utilities/`**: General utility components.
    *   **Confetti Wrapper**: [ConfettiWrapper.tsx](src/components/Utilities/ConfettiWrapper.tsx)
    *   **Countdown**: [Countdown.astro](src/components/Utilities/Countdown.astro)
    *   **Tooltip**: [Tooltip.astro](src/components/Utilities/Tooltip.astro) and [Tooltip.tsx](src/components/Utilities/Tooltip.tsx)
    *   **Transaction Loader**: [TransactionLoader.astro](src/components/Utilities/TransactionLoader.astro)
    *   **Warning Banner**: [WarningBanner.astro](src/components/Utilities/WarningBanner.astro)
*   **Root Components**:
    *   **Footer**: [Footer.astro](src/components/Footer.astro)
    *   **Navbar**: [Navbar.astro](src/components/Navbar.astro) and [Navbar.tsx](src/components/Navbar.tsx)

#### **`src/hooks/` - React Hooks**

Custom React hooks for encapsulating reusable logic.

*   **Payment Hook**: [usePayment.ts](src/hooks/usePayment.ts)
*   **Tickets Hook**: [useTickets.ts](src/hooks/useTickets.ts)
*   **Toast Hook**: [useToast.ts](src/hooks/useToast.ts)

#### **`src/layouts/` - Astro Layouts**

Astro layouts define the common structure for pages.

*   **Auth Layout**: [AuthLayout.astro](src/layouts/AuthLayout.astro)
*   **Guide Layout**: [GuideLayout.astro](src/layouts/GuideLayout.astro)
*   **Base Layout**: [Layout.astro](src/layouts/Layout.astro)

#### **`src/lib/` - Utility Functions and Libraries**

Contains shared utility functions and core integrations.

*   **Check Log State**: [checkLogState.ts](src/lib/checkLogState.ts)
*   **Generate Reference Code**: [genRefCode.ts](src/lib/genRefCode.ts)
*   **Semantic Compressor**: [SemantCompressor.ts](src/lib/SemantCompressor.ts)
*   **State Manager**: [StateManager.ts](src/lib/StateManager.ts)
*   **Supabase Client**: [supabase.ts](src/lib/supabase.ts) - Initializes and exports the Supabase client.
*   **URL Manager**: [URLManager.ts](src/lib/URLManager.ts)
*   **Utilities**: [utils.ts](src/lib/utils.ts) - General utility functions.

#### **`src/mocks/` - Mock Data**

JSON files containing mock data for development or testing.

*   [faqs.json](src/mocks/faqs.json)
*   [Phones+OTP.json](src/mocks/Phones+OTP.json)
*   [testValidMobilePrefix.json](src/mocks/testValidMobilePrefix.json)
*   [validMobilePrefix.json](src/mocks/validMobilePrefix.json)

#### **`src/pages/` - Astro Pages and API Endpoints**

This directory defines the application's routes, including both static pages and API endpoints.

*   **Root Pages**:
    *   **Dashboard**: [dashboard.astro](src/pages/dashboard.astro)
    *   **Home/Index**: [index.astro](src/pages/index.astro)
    *   **SVG Test Page**: [svg.astro](src/pages/svg.astro)
    *   **Tickets**: [tickets.astro](src/pages/tickets.astro)
*   **`src/pages/api/` - API Endpoints**: Server-side functions exposed as API routes.
    *   **`src/pages/api/auth/`**: Authentication API endpoints.
        *   **Login**: [login.ts](src/pages/api/auth/login.ts)
        *   **Logout**: [logout.ts](src/pages/api/auth/logout.ts)
        *   **Request OTP**: [requestOtp.ts](src/pages/api/auth/requestOtp.ts)
        *   **Signup**: [signup.ts](src/pages/api/auth/signup.ts)
        *   **Verify OTP**: [verifyOTP.ts](src/pages/api/auth/verifyOTP.ts)
    *   **`src/pages/api/health/`**: Health check endpoint.
        *   [index.ts](src/pages/api/health/index.ts)
    *   **`src/pages/api/ticket/`**: Ticket-related API endpoints.
        *   **Specific Ticket IDs**: [ids].ts](src/pages/api/ticket/[ids].ts)
        *   **All Tickets**: [index.ts](src/pages/api/ticket/index.ts)
        *   **Raffle Numbers**: [numbers].ts](src/pages/api/ticket/[raffleId]/[numbers].ts)
    *   **`src/pages/api/user/`**: User profile and security API endpoints.
        *   **Profile**: [profile.ts](src/pages/api/user/profile.ts)
        *   **Security**: [security.ts](src/pages/api/user/security.ts)
    *   **`src/pages/api/wompi/`**: Wompi payment integration.
        *   **Webhook**: [webhook.ts](src/pages/api/wompi/webhook.ts) - Handles incoming Wompi payment notifications.
*   **`src/pages/auth/`**: Authentication-related pages.
    *   **Login**: [login.astro](src/pages/auth/login.astro)
    *   **Signup**: [signup.astro](src/pages/auth/signup.astro)
    *   **Verify Phone**: [verify-phone.astro](src/pages/auth/verify-phone.astro)
*   **`src/pages/guide/`**: Guide/documentation pages.
    *   **Index**: [index.astro](src/pages/guide/index.astro)
    *   **Purchase**: [purchase.astro](src/pages/guide/purchase.astro)
    *   **Signup**: [signup.astro](src/pages/guide/signup.astro)
    *   **Test Credentials**: [test-credentials.astro](src/pages/guide/test-credentials.astro)
    *   **Test Payment Data**: [test-payment-data.astro](src/pages/guide/test-payment-data.astro)
    *   **Tickets Selection**: [tickets-selection.astro](src/pages/guide/tickets-selection.astro)
*   **`src/pages/payment/`**: Payment flow pages.
    *   **Checkout**: [checkout.astro](src/pages/payment/checkout.astro)
    *   **Result**: [result.astro](src/pages/payment/result.astro)

#### **`src/stores/` - State Management**

Pinia-like stores for managing global application state.

*   **Auth Store**: [authStore.ts](src/stores/authStore.ts)
*   **Payment Store**: [payment.ts](src/stores/payment.ts)
*   **Combined Stores**: [stores.ts](src/stores/stores.ts)

#### **`src/styles/` - Global Styles**

*   **Global CSS**: [global.css](src/styles/global.css) - Contains global CSS rules, likely including Tailwind CSS imports.

#### **`src/types/` - TypeScript Type Definitions**

*   **Index Definitions**: [index.d.ts](src/types/index.d.ts) - Contains global TypeScript type declarations.

## Configuration Files

*   **`astro.config.mjs`**: Astro project configuration, defining integrations (e.g., React, Tailwind) and build settings.
*   **`components.json`**: Configuration for Shadcn UI components.
*   **`package.json`**: Project metadata, scripts, and dependencies (e.g., `astro`, `react`, `tailwindcss`, `supabase-js`).
*   **`pnpm-lock.yaml`**: PNPM dependency lock file.
*   **`tailwind.config.ts`**: Tailwind CSS configuration, including theme, plugins, and content paths.
*   **`tsconfig.json`**: TypeScript compiler configuration.
*   **`vercel.json`**: Vercel deployment configuration.

## Static Assets

*   **`public/`**: Contains static assets served directly by the web server.
    *   [favicon.svg](public/favicon.svg)
    *   [negrita_portrait.jpg](public/negrita_portrait.jpg)
    *   [supabase-logo-wordmark--light.svg](public/supabase-logo-wordmark--light.svg)


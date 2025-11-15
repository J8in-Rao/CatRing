# System Architecture

This document outlines the architecture of the CatRing (Catering Reservation and Ordering System) application.

## 1. Architectural Style

The application is built using a **JAMstack architecture**. It features a modern frontend built with Next.js that interacts directly with a suite of backend services provided by Firebase. This headless approach decouples the frontend from the backend, leading to better performance, higher security, and easier scalability.

-   **Frontend**: A Next.js (App Router) client-side application responsible for all UI rendering and user interaction.
-   **Backend**: A "serverless" backend composed entirely of Firebase services (Firestore, Firebase Authentication).

---

## 2. Core Components

### Frontend (Client)
-   **Framework**: Next.js 14 with the App Router.
-   **Language**: TypeScript.
-   **UI Library**: React with ShadCN UI for pre-built, accessible components.
-   **Styling**: Tailwind CSS for utility-first styling, with a theming system for light/dark modes.
-   **State Management**: Primarily managed through React hooks (`useState`, `useEffect`) and custom hooks for interacting with Firebase (`useUser`, `useCollection`, `useDoc`).
-   **Forms**: `react-hook-form` is used for managing form state and validation, coupled with `zod` for schema definition.

### Backend (Firebase)
-   **Authentication**: **Firebase Authentication** handles all user registration and login flows (Email/Password). It secures the application by providing user identity (UID) which is used throughout the backend.
-   **Database**: **Firestore** serves as the single source of truth. It's a NoSQL document database that stores all application data, including user profiles, products, carts, and orders. Its real-time capabilities are leveraged to provide live updates in the UI (e.g., cart changes, order status updates).
-   **Security**: Firestore Security Rules are the primary mechanism for protecting data. They define who can read, write, and update documents, ensuring users can only access their own data and admins have the correct privileges.

---

## 3. Data Flow Diagram

The diagram below illustrates the typical data flow for a core action, such as a user adding an item to their cart.

```
+---------------------------+
|   User's Browser (Client) |
|      (Next.js / React)    |
+-------------+-------------+
              | 1. User clicks "Add to Cart"
              v
+-------------+-------------+
|    Client-Side Logic      |
| (`/products/page.tsx`)    |
+-------------+-------------+
              | 2. Calls setDocumentNonBlocking()
              |    with item data
              v
+-------------+-------------+
|      Firebase SDK         |
+-------------+-------------+
              | 3. Sends write request to Firestore
              v
+---------------------------+      +---------------------------+
|        Firestore          |----->|  Firestore Security Rules |
| (carts/{userId}/items/...) | 4.   |  (e.g., isOwner(userId))  |
+-------------+-------------+      +---------------------------+
              | 5. If rule passes, data is written
              |
              | 6. Real-time listener is triggered
              v
+-------------+-------------+
|  Real-time Data Hooks     |
|   (e.g., useCollection)   |
+-------------+-------------+
              | 7. UI is automatically updated
              v
+-------------+-------------+
|    Header Cart Icon       |
|    (Shows new item count) |
+---------------------------+

```

**Flow Explanation:**
1.  A user interacts with the UI.
2.  An event handler in a React component triggers a function to interact with Firestore.
3.  The client-side Firebase SDK sends the request to the Firestore backend.
4.  Firestore evaluates the request against the deployed Security Rules.
5.  If the request is authorized, the data is written to the database.
6.  Anywhere the application is listening to that specific data (e.g., a hook in the header listening to the cart), Firestore pushes the update in real-time.
7.  The React component re-renders with the new data, updating the UI without a page refresh.

---

## 4. Code Structure & Modularity

The codebase is organized using the Next.js App Router conventions, which group files by route (feature). This is a highly modular approach.

-   `/src/app/(feature)`: Each top-level folder in `app` (e.g., `/cart`, `/products`, `/caterer`) contains the pages and components related to that feature.
-   `/src/components`: Contains reusable UI components (`/ui`), layout components (`/layout`), and the global `FirebaseErrorListener`.
-   `/src/firebase`: Contains all Firebase-related logic, including initialization (`config.ts`, `index.ts`), providers (`provider.tsx`, `client-provider.tsx`), and custom hooks (`use-collection.tsx`, `use-doc.tsx`).
-   `/src/lib`: Contains shared utilities (`utils.ts`), data definitions (`definitions.ts`), the logging function (`logger.ts`), and placeholder image data.

This structure ensures that the code is **maintainable**, as related logic is co-located, and **testable**, as individual components and hooks can be tested in isolation.

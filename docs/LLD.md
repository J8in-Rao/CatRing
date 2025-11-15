# Low-Level Design (LLD)

This document provides a detailed component-level layout and describes the responsibilities of the core modules in the CatRing application.

---

## 1. Screen & Component Breakdown

### User-Facing Screens

1.  **Register (`/register`)**
    -   **Component**: `RegisterPage`
    -   **UI Elements**: `Card`, `Form`, `Input` (Name, Email, Password), `RadioGroup` (Customer/Caterer), `Button`.
    -   **Logic**: Handles form validation using `zod` and `react-hook-form`. On submit, calls `createUserWithEmailAndPassword`, then creates a new user document in the `/users` collection in Firestore.

2.  **Login (`/login`)**
    -   **Component**: `LoginPage`
    -   **UI Elements**: `Card`, `Form`, `Input` (Email, Password), `Button`.
    -   **Logic**: Handles form submission and calls `signInWithEmailAndPassword`.

3.  **Home (`/`)**
    -   **Component**: `HomePage`
    -   **UI Elements**: Hero section, "How It Works" section, `Card`s for featured products.
    -   **Logic**: Fetches a limited number of products from Firestore to display as "Featured Dishes". Each `ProductCard` has an "Add to Cart" button.

4.  **Products / Menu (`/products`)**
    -   **Component**: `ProductsPage`, `ProductGrid`
    -   **UI Elements**: `Input` for search, `Select` for category filtering, grid of `ProductCard` components.
    -   **Logic**: Fetches all products and their associated caterer names from Firestore. The `ProductGrid` component handles client-side filtering based on search terms and selected categories.

5.  **Product Details (`/products/[id]`)**
    -   **Component**: `ProductDetailPage`
    -   **UI Elements**: `Image`, `Button` for quantity, "Add to Cart" button.
    -   **Logic**: Fetches a single product document from Firestore based on the URL parameter. Handles adding the specified quantity of an item to the user's cart.

6.  **Cart (`/cart`)**
    -   **Component**: `CartPage`
    -   **UI Elements**: List of cart items with quantity controls, `Card` for order summary.
    -   **Logic**: Subscribes to the user's cart sub-collection (`/carts/{userId}/items`) in real-time. Allows users to update quantities or remove items. The "Proceed to Checkout" button triggers the order creation process.

7.  **My Orders (`/profile/orders`)**
    -   **Component**: `MyOrdersPage`
    -   **UI Elements**: A list of `Card`s, each representing a past order.
    -   **Logic**: Fetches all orders from the `/orders` collection where `userId` matches the current user. Includes functionality to cancel an order if its status is "Pending".

8.  **Profile (`/profile`)**
    -   **Component**: `ProfilePage`
    -   **UI Elements**: `Form` with `Input` fields for name, phone, and address.
    -   **Logic**: Fetches the current user's document from the `/users` collection and allows them to update their profile information.

### Admin-Facing Screens

1.  **Dashboard (`/caterer/dashboard`)**
    -   **Component**: `CatererDashboardPage`
    -   **UI Elements**: `Card`s for key metrics (Total Revenue, Total Orders, etc.), a `BarChart` for sales data, and a `Table` for recent orders.
    -   **Logic**: Fetches all products created by the admin and all orders containing those products. It then calculates and displays aggregate data and charts.

2.  **Product Management (`/caterer/products`)**
    -   **Component**: `CatererProductsPage`, `ProductForm`
    -   **UI Elements**: "Add New Product" button, grid of product cards with `DropdownMenu` for Edit/Delete actions. A `Dialog` (`ProductForm`) is used for adding/editing products.
    -   **Logic**: Fetches all products where `createdBy` matches the admin's UID. Handles CRUD (Create, Read, Update, Delete) operations for products.

3.  **Incoming Orders (`/caterer/orders`)**
    -   **Component**: `CatererOrdersPage`
    -   **UI Elements**: List of `Card`s, each representing an order relevant to the caterer. A `Select` dropdown is used to change the order status.
    -   **Logic**: Fetches all system orders, then filters them to show only those containing items sold by the logged-in caterer. The items and total on each card are also filtered to be relevant to that caterer.

---

## 2. Module Responsibilities

The codebase is organized into modules (folders) with distinct responsibilities.

-   **`src/firebase`**:
    -   **Responsibility**: To provide a clean and consistent interface for interacting with Firebase services.
    -   **`index.ts`**: Central export file for all Firebase hooks and functions.
    -   **`provider.tsx`**: Provides Firebase context (app, auth, firestore instances) and user authentication state to the entire app.
    -   **`client-provider.tsx`**: Ensures Firebase is initialized only once on the client.
    -   `firestore/use-collection.tsx`: A hook for real-time subscriptions to Firestore queries.
    -   `firestore/use-doc.tsx`: A hook for real-time subscriptions to a single Firestore document.
    -   `non-blocking-updates.tsx`: Contains functions for performing Firestore writes (`setDoc`, `addDoc`, `deleteDoc`) without awaiting them, improving UI responsiveness.

-   **`src/lib`**:
    -   **Responsibility**: To store shared code, type definitions, and utilities.
    -   **`definitions.ts`**: Contains TypeScript types for all major data models (e.g., `Product`, `Order`, `User`).
    -   **`logger.ts`**: Exports the `logAction` function, providing a centralized way to write logs to Firestore.
    -   **`utils.ts`**: General utility functions, such as `cn` for merging Tailwind classes.

-   **`src/components`**:
    -   **Responsibility**: To provide reusable React components.
    -   **`ui/`**: Contains the ShadCN UI components (e.g., `Button`, `Card`, `Input`). These are the basic building blocks of the interface.
    -   **`layout/`**: Contains major layout components like `Header` and `Footer`.
    -   **`theme-provider.tsx`**: Manages the application's light/dark theme.

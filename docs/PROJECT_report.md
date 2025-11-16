# Project Report: Catering Reservation & Ordering System (CatRing)

---

## 1. Introduction

This project is a web-based platform designed to connect rural caterers with a broader audience, allowing them to showcase their culinary skills, promote traditional Indian culture, and sell their products online. It provides a seamless e-commerce experience for customers and a simple yet powerful management dashboard for caterers.

### 1.1. Technologies Used

*   **Frontend**: Next.js (App Router), React, TypeScript, Tailwind CSS
*   **UI Components**: ShadCN UI
*   **Backend & Database**: Firebase
    *   **Firebase Authentication**: For user registration and login (Email/Password).
    *   **Firestore**: As the NoSQL database for storing all application data (users, products, orders, etc.).
*   **Styling**: `globals.css` with CSS variables for easy theming (light/dark mode).
*   **Form Management**: `react-hook-form` with `zod` for validation.

---

## 2. System Architecture

The application is built using a **JAMstack architecture**. It features a modern frontend built with Next.js that interacts directly with a suite of backend services provided by Firebase. This headless approach decouples the frontend from the backend, leading to better performance, higher security, and easier scalability.

### 2.1. Core Components

#### Frontend (Client)
-   **Framework**: Next.js 14 with the App Router.
-   **Language**: TypeScript.
-   **UI Library**: React with ShadCN UI for pre-built, accessible components.
-   **Styling**: Tailwind CSS for utility-first styling, with a theming system for light/dark modes.
-   **State Management**: Primarily managed through React hooks (`useState`, `useEffect`) and custom hooks for interacting with Firebase (`useUser`, `useCollection`, `useDoc`).
-   **Forms**: `react-hook-form` is used for managing form state and validation, coupled with `zod` for schema definition.

#### Backend (Firebase)
-   **Authentication**: **Firebase Authentication** handles all user registration and login flows (Email/Password). It secures the application by providing user identity (UID) which is used throughout the backend.
-   **Database**: **Firestore** serves as the single source of truth. It's a NoSQL document database that stores all application data, including user profiles, products, carts, and orders. Its real-time capabilities are leveraged to provide live updates in the UI.
-   **Security**: Firestore Security Rules are the primary mechanism for protecting data. They define who can read, write, and update documents.

### 2.2. Data Flow Diagram

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

---

## 3. Database Design (Firestore)

The Firestore database is structured into five top-level collections:

1.  **`/users/{userId}`**: Stores public user profile information, including their role (`user` or `admin`). The document ID is the user's Firebase Auth UID.
2.  **`/products/{productId}`**: Contains all catering products available on the platform.
3.  **`/carts/{userId}/items/{productId}`**: A sub-collection storing the items in a specific user's cart. This ensures a user's cart data is isolated and secure.
4.  **`/orders/{orderId}`**: A record of all orders placed by all users. Security rules ensure users can only read their own orders, while admins can view all of them.
5.  **`/logs/{logId}`**: A collection that stores logs of important system events for auditing purposes.

---

## 4. Core Features & Workflows

### 4.1. Customer (User) Features
- **Authentication**: Securely register and log in to the platform.
- **Product Browsing**: View a full menu of available dishes with details, pricing, and images.
- **Filtering & Search**: Easily find specific dishes by name or filter by category.
- **Shopping Cart**: Add and remove items from a persistent shopping cart.
- **Order Placement**: Place orders seamlessly with a clear summary of the total cost.
- **Order History**: View a list of all past orders and their current status.
- **Order Cancellation**: Cancel an order if it is still in the "Pending" status.
- **Profile Management**: Update personal information, including delivery address and phone number.
- **Theme Switching**: Toggle between light and dark modes for comfortable viewing.

### 4.2. Caterer (Admin) Features
- **Authentication**: Register as a caterer and log in to the admin dashboard.
- **Dashboard**: Get an at-a-glance overview of total revenue, total orders, pending orders, and the number of products on the menu. Includes a sales chart for the last 7 days.
- **Product Management (CRUD)**: Create, Read, Update, and Delete products from the menu.
- **Order Management**: View incoming orders relevant to them and update the order status through its lifecycle.

### 4.3. Customer Onboarding & First Order Workflow
1.  User lands on the homepage and registers as a "Customer".
2.  After logging in, they browse the `/products` page.
3.  They add dishes to their cart.
4.  They navigate to the `/cart` page, review their items, and proceed to checkout.
5.  The system checks if they have a delivery address in their `/profile`. If not, it redirects them to add one.
6.  The order is placed and saved to the `/orders` collection with a "Pending" status.
7.  The user is redirected to their "My Orders" page.

### 44. Caterer Onboarding & Order Fulfillment Workflow
1.  A caterer registers as a "Caterer (Admin)".
2.  After logging in, they go to the "Manage Products" page and add a new product.
3.  A customer places an order that includes the caterer's product.
4.  The caterer navigates to the "Incoming Orders" page. They see the new order, but only the item(s) they are responsible for and the sub-total for those items.
5.  The caterer updates the order status from "Pending" to "Accepted", and so on, until it is "Completed".
6.  The caterer visits their "Dashboard" to see updated revenue and order count metrics.

---

## 5. Low-Level Design (LLD)

### 5.1. Screen & Component Breakdown

#### User-Facing Screens
- **Register (`/register`)**: Handles user registration as a "Customer" or "Caterer".
- **Login (`/login`)**: Handles user authentication.
- **Home (`/`)**: Displays a hero section and featured products.
- **Products / Menu (`/products`)**: Displays a grid of all available products with search and filter functionality.
- **Product Details (`/products/[id]`)**: Shows detailed information for a single product.
- **Cart (`/cart`)**: Allows users to review items, update quantities, and proceed to checkout.
- **My Orders (`/profile/orders`)**: Lists all past orders for the logged-in user.
- **Profile (`/profile`)**: Allows users to update their name, phone number, and delivery address.

#### Admin-Facing Screens
- **Dashboard (`/caterer/dashboard`)**: Displays key metrics (revenue, order counts) and a sales chart.
- **Product Management (`/caterer/products`)**: Allows admins to perform CRUD operations on their products.
- **Incoming Orders (`/caterer/orders`)**: Shows a list of relevant orders, with the ability to update the status.

### 5.2. Code Structure and Modularity
The codebase is organized using the Next.js App Router conventions, which group files by feature. This promotes maintainability and scalability.
-   `/src/app/(feature)`: Each top-level folder in `app` (e.g., `/cart`, `/products`, `/caterer`) contains the pages and components related to that feature.
-   `/src/components`: Contains reusable UI components, layout components, and the global `FirebaseErrorListener`.
-   `/src/firebase`: Contains all Firebase-related logic, including initialization, providers, and custom hooks.
-   `/src/lib`: Contains shared utilities, type definitions (`definitions.ts`), and the logging function (`logger.ts`).

---

## 6. Test Cases

### **6.1. Authentication**
| ID | Description | Expected Result |
| :--- | :--- | :--- |
| **TC01** | Valid user can register as a "Customer" or "Caterer". | User is redirected to Login. A new document is created in `/users` with the correct role. |
| **TC02**| Login fails with wrong password. | An error toast "Login Failed: Invalid email or password" is displayed. |

### **6.2. Product Management (Admin)**
| ID | Description | Expected Result |
| :--- | :--- | :--- |
| **TC03** | Admin can add a new product. | The new product appears in the product list and the `/products` collection. |
| **TC04** | Non-admin user cannot access admin pages. | Navigation links are not visible. Direct navigation is blocked. |

### **6.3. Cart & Ordering (User)**
| ID | Description | Expected Result |
| :--- | :--- | :--- |
| **TC05**| User can add an item to the cart. | A toast notification appears. The cart icon updates. |
| **TC06**| User can place an order. | User is redirected to "My Orders". A new document is created in `/orders`. The cart becomes empty. |
| **TC07**| User cannot place an order without an address. | User is redirected to the `/profile` page with an error toast. |

### **6.4. Order Management (Admin)**
| ID | Description | Expected Result |
| :--- | :--- | :--- |
| **TC08**| Admin can update order status. | The status badge on the order card updates in real-time. |
| **TC09**| Admin only sees relevant items in an order. | The order card only displays items belonging to the caterer and shows a sub-total for those items. |

### **6.5. Security Rules**
| ID | Description | Expected Result |
| :--- | :--- | :--- |
| **TC10**| A user cannot write to another user's cart. | The write request is denied by Firestore Security Rules. |
| **TC11**| A non-admin cannot create a product. | The write request to the `/products` collection is denied. |


## 7. Live website
https://cat-ring.vercel.app/

---

## 7. Setup and Execution

To run this project locally, follow these steps:

1.  **Clone the Repository**:
    ```bash
    git clone https://github.com/J8in-Rao/CatRing
    cd CatRing
    ```

2.  **Install Dependencies**:
    ```bash
    npm install
    ```

3.  **Run the Development Server**:
    ```bash
    npm run dev
    ```

4.  **Open the Application**:
    Open your browser and navigate to `http://localhost:9002` (or the port specified in the terminal). The application is configured to connect to a development Firebase project and will work out of the box.

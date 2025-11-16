# Catering Reservation & Ordering System (CatRing)

This project is a web-based platform designed to connect rural caterers with a broader audience, allowing them to showcase their culinary skills, promote traditional Indian culture, and sell their products online. It provides a seamless e-commerce experience for customers and a simple yet powerful management dashboard for caterers.

## Technologies Used

*   **Frontend**: Next.js (App Router), React, TypeScript, Tailwind CSS
*   **UI Components**: ShadCN UI
*   **Backend & Database**: Firebase
    *   **Firebase Authentication**: For user registration and login (Email/Password).
    *   **Firestore**: As the NoSQL database for storing all application data (users, products, orders, etc.).
*   **Styling**: `globals.css` with CSS variables for easy theming (light/dark mode).
*   **Form Management**: `react-hook-form` with `zod` for validation.

---

## Core Features

### 1. Customer (User) Features
- **Authentication**: Securely register and log in to the platform.
- **Product Browsing**: View a full menu of available dishes with details, pricing, and images.
- **Filtering & Search**: Easily find specific dishes by name or filter by category.
- **Shopping Cart**: Add and remove items from a persistent shopping cart.
- **Order Placement**: Place orders seamlessly with a clear summary of the total cost.
- **Order History**: View a list of all past orders and their current status.
- **Order Cancellation**: Cancel an order if it is still in the "Pending" status.
- **Profile Management**: Update personal information, including delivery address and phone number.
- **Theme Switching**: Toggle between light and dark modes for comfortable viewing.

### 2. Caterer (Admin) Features
- **Authentication**: Register as a caterer and log in to the admin dashboard.
- **Dashboard**: Get an at-a-glance overview of total revenue, total orders, pending orders, and the number of products on the menu. Includes a sales chart for the last 7 days.
- **Product Management (CRUD)**:
    - **Create**: Add new food items with names, descriptions, prices, categories, and image URLs.
    - **Read**: View all personal products listed on the platform.
    - **Update**: Edit the details of existing products.
    - **Delete**: Remove products from the menu.
- **Order Management**:
    - **View Incoming Orders**: See a filtered list of orders that contain at least one of their products.
    - **Isolated View**: Each order card shows only the items and sub-total relevant to the caterer, avoiding confusion from split orders.
    - **Update Status**: Change the status of an order through its lifecycle: `Pending` → `Accepted` → `Processing` → `Out For Delivery` → `Completed`.

### 3. System-Wide Features
- **Logging**: Every critical action (e.g., user login, product creation, order placement, status update) is automatically recorded in a dedicated `logs` collection in Firestore for auditing and debugging.
- **Responsive Design**: The UI is fully responsive and works seamlessly on mobile, tablet, and desktop devices.
- **Real-time Updates**: The application uses real-time Firestore listeners, so data on pages like the cart and order lists updates automatically without needing a page refresh.

---

## System Architecture

The application employs a modern JAMstack architecture, with a Next.js frontend that communicates directly with Firebase backend services.

- **Frontend (Client-Side)**: Built with the Next.js App Router, the frontend is responsible for rendering the user interface and handling all user interactions. It uses React components for UI elements and client-side hooks to manage state and fetch data directly from Firebase.

- **Backend (Firebase)**:
    - **Firebase Authentication** acts as the identity provider, managing user accounts and securing access.
    - **Firestore** is the single source of truth for all application data. Security rules are configured to ensure that users can only access and modify data they are permitted to. For instance, a user can only write to their own cart, while an admin can only modify their own products.

- **Data Flow**:
    1. A user interacts with the UI (e.g., adds an item to the cart).
    2. A client-side function is called, which interacts with the Firebase SDK.
    3. The SDK sends a request to Firestore (e.g., `setDoc` to update a cart item).
    4. Firestore evaluates the request against its Security Rules.
    5. If allowed, the data is written.
    6. Real-time listeners in the app pick up the change and update the UI automatically.



---

## Database Design (Firestore)

The Firestore database is structured into five top-level collections:

1.  **`/users/{userId}`**: Stores public user profile information, including their role (`user` or `admin`). The document ID is the user's Firebase Auth UID.
2.  **`/products/{productId}`**: Contains all catering products available on the platform.
3.  **`/carts/{userId}/items/{productId}`**: A sub-collection storing the items in a specific user's cart. This ensures a user's cart data is isolated and secure.
4.  **`/orders/{orderId}`**: A record of all orders placed by all users. Security rules ensure users can only read their own orders, while admins can view all of them.
5.  **`/logs/{logId}`**: A collection that stores logs of important system events for auditing purposes.

---

## Core Workflows

### 1. New Customer Onboarding & First Order
1.  User lands on the homepage and registers as a "Customer".
2.  After logging in, they browse the `/products` page.
3.  They add a few dishes to their cart. The cart icon updates.
4.  They navigate to the `/cart` page, review their items, and proceed to checkout.
5.  The system checks if they have a delivery address in their `/profile`. If not, it redirects them to add one.
6.  Once the address is present, the order is placed and saved to the `/orders` collection with a "Pending" status.
7.  The user is redirected to their "My Orders" page, where they can see their new order.

### 2. New Caterer Onboarding & Order Fulfillment
1.  A caterer lands on the homepage and registers as a "Caterer (Admin)".
2.  After logging in, they see additional navigation links for their dashboard.
3.  They go to the "Manage Products" page and add a new product to the menu.
4.  A customer places an order that includes the caterer's new product.
5.  The caterer navigates to the "Incoming Orders" page. They see the new order, but only the item(s) they are responsible for and the sub-total for those items.
6.  The caterer uses the dropdown to update the order status from "Pending" to "Accepted", and so on, until it is "Completed".
7.  The caterer visits their "Dashboard" to see updated revenue and order count metrics.


### 3. Live Website

        https://cat-ring.vercel.app/

---

## Getting Started (Local Development)

To run this project locally, follow these steps:

1.  **Clone the Repository**:
    ```bash
    # (Instruction for the user to clone their own public GitHub repo)
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
    Open your browser and navigate to `http://localhost:9002` (or the port specified in the terminal).

The application is configured to connect to a development Firebase project. All authentication and database operations will work out of the box.

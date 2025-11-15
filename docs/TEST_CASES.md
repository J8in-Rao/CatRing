# Test Cases

This document outlines the key test cases for the CatRing application to ensure its functionality, reliability, and security.

---

### **1. Authentication**

| ID | Description | Steps | Expected Result |
| :--- | :--- | :--- | :--- |
| **TC01** | Valid user can register as a "Customer" | 1. Go to Register page. 2. Fill form with unique email and select "Customer". 3. Submit. | User is redirected to Login. A new document is created in `/users` with `role: "user"`. |
| **TC02** | Valid user can register as a "Caterer" | 1. Go to Register page. 2. Fill form with unique email and select "Caterer (Admin)". 3. Submit. | User is redirected to Login. A new document is created in `/users` with `role: "admin"`. |
| **TC03** | User cannot register with an existing email | 1. Attempt to register with an email that is already in use. | An error message "Registration Failed: ...email-already-in-use" is displayed. |
| **TC04** | Valid user can log in | 1. Go to Login page. 2. Enter correct credentials for an existing user. 3. Submit. | User is redirected to the homepage and their name/email appears in the user menu. |
| **TC05** | Login fails with wrong password | 1. Go to Login page. 2. Enter a correct email but an incorrect password. | An error toast "Login Failed: Invalid email or password" is displayed. |

### **2. Product Management (Admin)**

| ID | Description | Steps | Expected Result |
| :--- | :--- | :--- | :--- |
| **TC06** | Admin can add a new product | 1. Log in as an admin. 2. Go to "Manage Products". 3. Click "Add New Product". 4. Fill and submit the form. | The new product appears in the product list. A new document is created in the `/products` collection. |
| **TC07** | Admin can edit an existing product | 1. Log in as an admin. 2. Go to "Manage Products". 3. Click "Edit" on a product. 4. Change the price and save. | The product's price is updated in the UI. The corresponding document in `/products` is updated. |
| **TC08** | Admin can delete a product | 1. Log in as an admin. 2. Go to "Manage Products". 3. Click "Delete" on a product and confirm. | The product is removed from the product list. The corresponding document is deleted from `/products`. |
| **TC09** | Non-admin user cannot access admin pages | 1. Log in as a "user". 2. Attempt to navigate to `/caterer/dashboard` or other admin URLs. | The navigation links are not visible. Direct navigation might lead to an error or empty state (depending on security rules). |

### **3. Cart & Ordering (User)**

| ID | Description | Steps | Expected Result |
| :--- | :--- | :--- | :--- |
| **TC10**| User can add an item to the cart | 1. Log in as a user. 2. On the products page, click "Add to Cart" on an item. | A toast notification appears. The cart icon in the header updates. A new document is created in `/carts/{userId}/items`. |
| **TC11**| Cart item quantity can be updated | 1. Go to the Cart page. 2. Use the `+` or `-` buttons to change an item's quantity. | The quantity and sub-total for the item update in real-time. |
| **TC12**| Cart items persist on page refresh | 1. Add items to cart. 2. Refresh the browser. 3. Navigate back to the cart page. | The items are still present in the cart. |
| **TC13**| User can place an order | 1. Add items to cart. 2. Ensure profile has an address. 3. Click "Proceed to Checkout". | User is redirected to "My Orders". A new document is created in the `/orders` collection with "Pending" status. The cart becomes empty. |
| **TC14**| User cannot place an order without an address | 1. Add items to cart. 2. Ensure profile has NO address. 3. Click "Proceed to Checkout". | User is redirected to the `/profile` page with a toast asking them to add an address. |
| **TC15**| User can cancel a "Pending" order | 1. Place an order. 2. Go to "My Orders". 3. Click "Cancel Order" and confirm. | The order's status changes to "Cancelled". |

### **4. Order Management (Admin)**

| ID | Description | Steps | Expected Result |
| :--- | :--- | :--- | :--- |
| **TC16**| Admin can update order status | 1. Log in as an admin. 2. Go to "Incoming Orders". 3. Use the dropdown to change an order's status from "Pending" to "Accepted". | The status badge on the order card updates in real-time. The `status` field in the `/orders` document is updated. |
| **TC17**| Admin only sees relevant items in an order | 1. A user places an order with items from Caterer A and Caterer B. 2. Log in as Caterer A. 3. View the order on the "Incoming Orders" page. | The order card only displays the items belonging to Caterer A and shows a sub-total for those items only. |


### **5. Profile Management**

| ID | Description | Steps | Expected Result |
| :--- | :--- | :--- | :--- |
| **TC18**| User can update their profile information | 1. Log in as a user. 2. Go to "My Profile". 3. Change the phone number and address. 4. Save changes. | A success toast is shown. The user's document in the `/users` collection is updated with the new information. |

### **6. Security Rules**

| ID | Description | Test Method | Expected Result |
| :--- | :--- | :--- | :--- |
| **TC19**| Unauthenticated users cannot read/write data | Use Firestore Emulator UI or browser console to attempt to read from `/products`. | Request is denied with "Missing or insufficient permissions". |
| **TC20**| A user cannot write to another user's cart | Log in as User A. Use console to try to write to `/carts/{User_B_UID}/items`. | Request is denied. |
| **TC21**| A non-admin cannot create a product | Log in as a "user". Use console to try to write to the `/products` collection. | Request is denied. |

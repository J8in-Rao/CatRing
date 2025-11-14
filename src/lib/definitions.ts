import { FieldValue } from "firebase/firestore";

export type Product = {
  id: string;
  name: string;
  description: string;
  price: number;
  imageUrl: string;
  category: string;
};

export type CartItem = {
  id: string;
  name: string;
  price: number;
  imageUrl: string;
  quantity: number;
  productId: string;
};

export type OrderItem = {
  productId: string;
  name: string;
  quantity: number;
  price: number;
};

export type Order = {
  id: string;
  userId: string;
  items: OrderItem[];
  totalAmount: number;
  status: "Pending" | "Accepted" | "Processing" | "Out For Delivery" | "Completed";
  createdAt: FieldValue;
  address: string;
};

export type User = {
    name: string;
    email: string;
    role: 'user' | 'admin';
    phone?: string;
    address?: string;
    createdAt: FieldValue;
}

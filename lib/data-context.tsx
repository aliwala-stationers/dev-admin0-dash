"use client";

import { createContext, useContext, useState, ReactNode, useEffect } from "react";

export interface Product {
  id: string;
  name: string;
  category: string;
  brand: string;
  price: string;
  stock: string;
  sku: string;
  description: string;
  status: boolean;
  images: string[];
  createdAt: string;
}

export interface Category {
  id: string;
  name: string;
  slug: string;
  description: string;
  status: boolean;
  productCount: number;
  createdAt: string;
}

export interface Brand {
  id: string;
  name: string;
  slug: string;
  description: string;
  status: boolean;
  logo?: string;
  createdAt: string;
}

export interface Order {
  id: string;
  customer: string;
  date: string;
  total: number;
  status: "pending" | "processing" | "shipped" | "delivered" | "cancelled";
  items: number;
}

export interface Customer {
  id: string;
  name: string;
  email: string;
  phone: string;
  orders: number;
  totalSpent: number;
  status: "active" | "inactive";
  joinedDate: string;
}

export interface Payment {
  id: string;
  orderId: string;
  customer: string;
  date: string;
  amount: number;
  method: "credit_card" | "debit_card" | "paypal" | "bank_transfer";
  status: "completed" | "pending" | "processing" | "failed" | "refunded";
  transactionId: string;
}

interface DataContextType {
  products: Product[];
  categories: Category[];
  brands: Brand[];
  orders: Order[];
  customers: Customer[];
  payments: Payment[];
  addProduct: (product: Omit<Product, "id" | "createdAt">) => void;
  updateProduct: (id: string, product: Partial<Product>) => void;
  deleteProduct: (id: string) => void;
  addCategory: (category: Omit<Category, "id" | "createdAt" | "productCount">) => void;
  updateCategory: (id: string, category: Partial<Category>) => void;
  deleteCategory: (id: string) => void;
  addBrand: (brand: Omit<Brand, "id" | "createdAt">) => void;
  updateBrand: (id: string, brand: Partial<Brand>) => void;
  deleteBrand: (id: string) => void;
  getProduct: (id: string) => Product | undefined;
  getCategory: (id: string) => Category | undefined;
  getBrand: (id: string) => Brand | undefined;
}

const initialProducts: Product[] = [
  {
    id: "1",
    name: "Wireless Headphones",
    category: "Electronics",
    brand: "Sony",
    price: "99.99",
    stock: "45",
    sku: "WH-001",
    description: "Premium wireless headphones with noise-canceling technology and 40-hour battery life.",
    status: true,
    images: [
      "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=800&q=80",
      "https://images.unsplash.com/photo-1484704849700-f032a568e944?w=800&q=80"
    ],
    createdAt: "2023-12-01",
  },
];

const initialCategories: Category[] = [
  {
    id: "1",
    name: "Electronics",
    slug: "electronics",
    description: "Electronic devices and gadgets.",
    status: true,
    productCount: 45,
    createdAt: "2023-11-15",
  },
];

const initialBrands: Brand[] = [
  {
    id: "1",
    name: "Sony",
    slug: "sony",
    description: "Global leader in consumer electronics and entertainment.",
    status: true,
    createdAt: "2023-10-10",
  },
  {
    id: "2",
    name: "Nike",
    slug: "nike",
    description: "Leading sportswear and equipment brand.",
    status: true,
    createdAt: "2023-10-12",
  }
];

const initialOrders: Order[] = [
  { id: "ORD-1001", customer: "John Doe", date: "2024-01-05", total: 249.99, status: "delivered", items: 3 },
  { id: "ORD-1002", customer: "Jane Smith", date: "2024-01-05", total: 149.99, status: "processing", items: 2 },
  { id: "ORD-1003", customer: "Bob Johnson", date: "2024-01-04", total: 399.99, status: "shipped", items: 5 },
  { id: "ORD-1004", customer: "Alice Williams", date: "2024-01-04", total: 89.99, status: "pending", items: 1 },
  { id: "ORD-1005", customer: "Charlie Brown", date: "2024-01-03", total: 199.99, status: "cancelled", items: 2 },
];

const initialCustomers: Customer[] = [
  { id: "1", name: "John Doe", email: "john.doe@example.com", phone: "+1 234 567 8900", orders: 12, totalSpent: 1249.99, status: "active", joinedDate: "2023-06-15" },
  { id: "2", name: "Jane Smith", email: "jane.smith@example.com", phone: "+1 234 567 8901", orders: 8, totalSpent: 849.99, status: "active", joinedDate: "2023-07-22" },
  { id: "3", name: "Bob Johnson", email: "bob.johnson@example.com", phone: "+1 234 567 8902", orders: 24, totalSpent: 2499.99, status: "active", joinedDate: "2023-05-10" },
  { id: "4", name: "Alice Williams", email: "alice.williams@example.com", phone: "+1 234 567 8903", orders: 3, totalSpent: 299.99, status: "inactive", joinedDate: "2023-11-05" },
  { id: "5", name: "Charlie Brown", email: "charlie.brown@example.com", phone: "+1 234 567 8904", orders: 15, totalSpent: 1599.99, status: "active", joinedDate: "2023-08-18" },
];

const initialPayments: Payment[] = [
  { id: "PAY-1001", orderId: "ORD-1001", customer: "John Doe", date: "2024-01-05", amount: 249.99, method: "credit_card", status: "completed", transactionId: "txn_1A2B3C4D5E" },
  { id: "PAY-1002", orderId: "ORD-1002", customer: "Jane Smith", date: "2024-01-05", amount: 149.99, method: "paypal", status: "pending", transactionId: "txn_2B3C4D5E6F" },
  { id: "PAY-1003", orderId: "ORD-1003", customer: "Bob Johnson", date: "2024-01-04", amount: 399.99, method: "credit_card", status: "completed", transactionId: "txn_3C4D5E6F7G" },
  { id: "PAY-1004", orderId: "ORD-1004", customer: "Alice Williams", date: "2024-01-04", amount: 89.99, method: "debit_card", status: "processing", transactionId: "txn_4D5E6F7G8H" },
  { id: "PAY-1005", orderId: "ORD-1005", customer: "Charlie Brown", date: "2024-01-03", amount: 199.99, method: "credit_card", status: "failed", transactionId: "txn_5E6F7G8H9I" },
];

const DataContext = createContext<DataContextType | undefined>(undefined);

export function DataProvider({ children }: { children: ReactNode }) {
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [brands, setBrands] = useState<Brand[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [payments, setPayments] = useState<Payment[]>([]);
  const [isInitialized, setIsInitialized] = useState(false);

  useEffect(() => {
    const storedProducts = localStorage.getItem("products");
    const storedCategories = localStorage.getItem("categories");
    const storedBrands = localStorage.getItem("brands");
    const storedOrders = localStorage.getItem("orders");
    const storedCustomers = localStorage.getItem("customers");
    const storedPayments = localStorage.getItem("payments");
    
    setProducts(storedProducts ? JSON.parse(storedProducts) : initialProducts);
    setCategories(storedCategories ? JSON.parse(storedCategories) : initialCategories);
    setBrands(storedBrands ? JSON.parse(storedBrands) : initialBrands);
    setOrders(storedOrders ? JSON.parse(storedOrders) : initialOrders);
    setCustomers(storedCustomers ? JSON.parse(storedCustomers) : initialCustomers);
    setPayments(storedPayments ? JSON.parse(storedPayments) : initialPayments);
    setIsInitialized(true);
  }, []);

  useEffect(() => {
    if (isInitialized) {
      localStorage.setItem("products", JSON.stringify(products));
      localStorage.setItem("categories", JSON.stringify(categories));
      localStorage.setItem("brands", JSON.stringify(brands));
      localStorage.setItem("orders", JSON.stringify(orders));
      localStorage.setItem("customers", JSON.stringify(customers));
      localStorage.setItem("payments", JSON.stringify(payments));
    }
  }, [products, categories, brands, orders, customers, payments, isInitialized]);

  const addProduct = (product: Omit<Product, "id" | "createdAt">) => {
    const newProduct: Product = {
      ...product,
      id: Math.random().toString(36).substr(2, 9),
      createdAt: new Date().toISOString().split('T')[0],
    };
    setProducts((prev) => [newProduct, ...prev]);
  };

  const updateProduct = (id: string, updatedFields: Partial<Product>) => {
    setProducts((prev) =>
      prev.map((p) => (p.id === id ? { ...p, ...updatedFields } : p))
    );
  };

  const deleteProduct = (id: string) => {
    setProducts((prev) => prev.filter((p) => p.id !== id));
  };

  const addCategory = (category: Omit<Category, "id" | "createdAt" | "productCount">) => {
    const newCategory: Category = {
      ...category,
      id: Math.random().toString(36).substr(2, 9),
      productCount: 0,
      createdAt: new Date().toISOString().split('T')[0],
    };
    setCategories((prev) => [newCategory, ...prev]);
  };

  const updateCategory = (id: string, updatedFields: Partial<Category>) => {
    setCategories((prev) =>
      prev.map((c) => (c.id === id ? { ...c, ...updatedFields } : c))
    );
  };

  const deleteCategory = (id: string) => {
    setCategories((prev) => prev.filter((c) => c.id !== id));
  };

  const addBrand = (brand: Omit<Brand, "id" | "createdAt">) => {
    const newBrand: Brand = {
      ...brand,
      id: Math.random().toString(36).substr(2, 9),
      createdAt: new Date().toISOString().split('T')[0],
    };
    setBrands((prev) => [newBrand, ...prev]);
  };

  const updateBrand = (id: string, updatedFields: Partial<Brand>) => {
    setBrands((prev) =>
      prev.map((b) => (b.id === id ? { ...b, ...updatedFields } : b))
    );
  };

  const deleteBrand = (id: string) => {
    setBrands((prev) => prev.filter((b) => b.id !== id));
  };

  const getProduct = (id: string) => products.find((p) => p.id === id);
  const getCategory = (id: string) => categories.find((c) => c.id === id);
  const getBrand = (id: string) => brands.find((b) => b.id === id);

  return (
    <DataContext.Provider
      value={{
        products,
        categories,
        brands,
        orders,
        customers,
        payments,
        addProduct,
        updateProduct,
        deleteProduct,
        addCategory,
        updateCategory,
        deleteCategory,
        addBrand,
        updateBrand,
        deleteBrand,
        getProduct,
        getCategory,
        getBrand,
      }}
    >
      {children}
    </DataContext.Provider>
  );
}

export function useData() {
  const context = useContext(DataContext);
  if (context === undefined) {
    throw new Error("useData must be used within a DataProvider");
  }
  return context;
}
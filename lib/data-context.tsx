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

interface DataContextType {
  products: Product[];
  categories: Category[];
  brands: Brand[];
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

const DataContext = createContext<DataContextType | undefined>(undefined);

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

export function DataProvider({ children }: { children: ReactNode }) {
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [brands, setBrands] = useState<Brand[]>([]);
  const [isInitialized, setIsInitialized] = useState(false);

  useEffect(() => {
    const storedProducts = localStorage.getItem("products");
    const storedCategories = localStorage.getItem("categories");
    const storedBrands = localStorage.getItem("brands");
    
    setProducts(storedProducts ? JSON.parse(storedProducts) : initialProducts);
    setCategories(storedCategories ? JSON.parse(storedCategories) : initialCategories);
    setBrands(storedBrands ? JSON.parse(storedBrands) : initialBrands);
    setIsInitialized(true);
  }, []);

  useEffect(() => {
    if (isInitialized) {
      localStorage.setItem("products", JSON.stringify(products));
      localStorage.setItem("categories", JSON.stringify(categories));
      localStorage.setItem("brands", JSON.stringify(brands));
    }
  }, [products, categories, brands, isInitialized]);

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
// @/lib/data-context.tsx

"use client"

import {
  createContext,
  useContext,
  useState,
  ReactNode,
  useEffect,
} from "react"

type DataState = {
  products: Product[]
  categories: Category[]
  brands: Brand[]
  orders: Order[]
  customers: Customer[]
  payments: Payment[]
  enquiries: Enquiry[]
  newsletterSubscribers: Newsletter[]
}

export interface Product {
  id: string
  name: string
  category: string
  brand: string
  price: number // Changed to number
  stock: number // Changed to number
  sku: string
  description: string
  status: boolean
  images: string[]
  createdAt: string
}

// Category and Brand interfaces look good as they are!

export interface Category {
  id: string
  name: string
  slug: string
  description: string
  status: boolean
  productCount: number
  createdAt: string
}

export interface Brand {
  id: string
  name: string
  slug: string
  description: string
  status: boolean
  logo?: string
  createdAt: string
}

export type OrderStatus =
  | "order_placed"
  | "accepted_order_by_seller"
  | "order_rejected_by_seller"
  | "order_cancelled_by_customer"
  | "order_packed"
  | "order_shipped"
  | "order_delivered"

export interface OrderHistory {
  status: OrderStatus
  date: string
  reason?: string
}

export interface Order {
  id: string
  customer: string
  date: string
  lastUpdated?: string
  total: number
  status: OrderStatus
  items: number
  history?: OrderHistory[]
  productIds?: string[] // Added to link products
}

export interface Address {
  type: "shipping" | "billing" | "delivery"
  street: string
  city: string
  state: string
  zipCode: string
  country: string
  isDefault?: boolean
}

export interface Customer {
  id: string
  name: string
  email: string
  phone: string
  orders: number
  totalSpent: number
  status: "active" | "inactive"
  joinedDate: string
  addresses?: Address[]
}

export interface Payment {
  id: string
  orderId: string
  customer: string
  date: string
  amount: number
  method: "credit_card" | "debit_card" | "paypal" | "bank_transfer" | "upi"
  status: "completed" | "pending" | "processing" | "failed" | "refunded"
  transactionId: string
  details?: {
    brand?: string
    last4?: string
    expiry?: string
    bankName?: string
    accountNumber?: string
    ifscCode?: string
    utrNumber?: string
    upiId?: string
    screenshotUrl?: string
    reason?: string
    customerEmail?: string
  }
}

export interface Enquiry {
  id: string
  name: string
  email: string
  subject: string
  message: string
  status: "new" | "read" | "replied"
  createdAt: string
}

export interface Newsletter {
  id: string
  email: string
  status: "active" | "unsubscribed"
  createdAt: string
}

interface DataContextType {
  products: Product[]
  categories: Category[]
  brands: Brand[]
  orders: Order[]
  customers: Customer[]
  payments: Payment[]
  enquiries: Enquiry[]
  newsletterSubscribers: Newsletter[]
  updateOrderStatus: (id: string, status: OrderStatus, reason?: string) => void
  addProduct: (product: Omit<Product, "id" | "createdAt">) => void
  updateProduct: (id: string, product: Partial<Product>) => void
  deleteProduct: (id: string) => void
  addCategory: (
    category: Omit<Category, "id" | "createdAt" | "productCount">,
  ) => void
  updateCategory: (id: string, category: Partial<Category>) => void
  deleteCategory: (id: string) => void
  addBrand: (brand: Omit<Brand, "id" | "createdAt">) => void
  updateBrand: (id: string, brand: Partial<Brand>) => void
  deleteBrand: (id: string) => void
  deleteEnquiry: (id: string) => void
  updateEnquiryStatus: (id: string, status: Enquiry["status"]) => void
  deleteSubscriber: (id: string) => void
  updateSubscriberStatus: (id: string, status: Newsletter["status"]) => void
  getProduct: (id: string) => Product | undefined
  getCategory: (id: string) => Category | undefined
  getBrand: (id: string) => Brand | undefined
}

const initialProducts: Product[] = [
  {
    id: "1",
    name: "Wireless Headphones",
    category: "Electronics",
    brand: "Sony",
    price: 99.99,
    stock: 45,
    sku: "WH-001",
    description:
      "Premium wireless headphones with noise-canceling technology and 40-hour battery life.",
    status: true,
    images: [
      "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=800&q=80",
      "https://images.unsplash.com/photo-1484704849700-f032a568e944?w=800&q=80",
    ],
    createdAt: "2023-12-01",
  },
  {
    id: "2",
    name: "Air Max Plus",
    category: "Footwear",
    brand: "Nike",
    price: 159.99,
    stock: 20,
    sku: "NIKE-AMP-01",
    description: "Iconic Nike sneakers with maximum cushioning and style.",
    status: true,
    images: [
      "https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=800&q=80",
    ],
    createdAt: "2023-12-05",
  },
]

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
]

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
  },
]

// const initialOrders: Order[] = [
//   {
//     id: "ORD-1001",
//     customer: "John Doe",
//     date: "2024-01-05",
//     total: 249.99,
//     status: "order_delivered",
//     items: 3,
//     productIds: ["1", "2"], // Assuming product 2 exists or we add it
//     history: [
//       { status: "order_placed", date: "2024-01-05 10:30 AM" },
//       { status: "accepted_order_by_seller", date: "2024-01-05 02:15 PM" },
//       { status: "order_packed", date: "2024-01-06 09:00 AM" },
//       { status: "order_shipped", date: "2024-01-06 02:00 PM" },
//       { status: "order_delivered", date: "2024-01-07 04:30 PM" },
//     ],
//   },
//   {
//     id: "ORD-1002",
//     customer: "Jane Smith",
//     date: "2024-01-05",
//     total: 149.99,
//     status: "accepted_order_by_seller",
//     items: 2,
//     productIds: ["1"],
//     history: [
//       { status: "order_placed", date: "2024-01-05 11:20 AM" },
//       { status: "accepted_order_by_seller", date: "2024-01-05 04:00 PM" },
//     ],
//   },
//   {
//     id: "ORD-1003",
//     customer: "Bob Johnson",
//     date: "2024-01-04",
//     total: 399.99,
//     status: "order_shipped",
//     items: 5,
//     productIds: ["2"],
//     history: [
//       { status: "order_placed", date: "2024-01-04 09:00 AM" },
//       { status: "accepted_order_by_seller", date: "2024-01-04 11:30 AM" },
//       { status: "order_packed", date: "2024-01-04 03:00 PM" },
//       { status: "order_shipped", date: "2024-01-05 08:00 AM" },
//     ],
//   },
//   {
//     id: "ORD-1004",
//     customer: "Alice Williams",
//     date: "2024-01-04",
//     total: 89.99,
//     status: "order_placed",
//     items: 1,
//     productIds: ["1"],
//     history: [{ status: "order_placed", date: "2024-01-04 02:15 PM" }],
//   },
//   {
//     id: "ORD-1005",
//     customer: "Charlie Brown",
//     date: "2024-01-03",
//     total: 199.99,
//     status: "order_cancelled_by_customer",
//     items: 2,
//     productIds: ["1", "2"],
//     history: [
//       { status: "order_placed", date: "2024-01-03 10:00 AM" },
//       { status: "order_cancelled_by_customer", date: "2024-01-03 11:45 AM" },
//     ],
//   },
// ]
const initialOrders: Order[] = []

// const initialCustomers: Customer[] = [
//   {
//     id: "1",
//     name: "John Doe",
//     email: "john.doe@example.com",
//     phone: "+1 234 567 8900",
//     orders: 12,
//     totalSpent: 1249.99,
//     status: "active",
//     joinedDate: "2023-06-15",
//     addresses: [
//       {
//         type: "shipping",
//         street: "123 Main St",
//         city: "New York",
//         state: "NY",
//         zipCode: "10001",
//         country: "USA",
//         isDefault: true,
//       },
//       {
//         type: "billing",
//         street: "123 Main St",
//         city: "New York",
//         state: "NY",
//         zipCode: "10001",
//         country: "USA",
//         isDefault: true,
//       },
//       {
//         type: "delivery",
//         street: "456 Delivery Ave",
//         city: "Brooklyn",
//         state: "NY",
//         zipCode: "11201",
//         country: "USA",
//       },
//     ],
//   },
//   {
//     id: "2",
//     name: "Jane Smith",
//     email: "jane.smith@example.com",
//     phone: "+1 234 567 8901",
//     orders: 8,
//     totalSpent: 849.99,
//     status: "active",
//     joinedDate: "2023-07-22",
//     addresses: [
//       {
//         type: "shipping",
//         street: "789 Oak Rd",
//         city: "Los Angeles",
//         state: "CA",
//         zipCode: "90001",
//         country: "USA",
//         isDefault: true,
//       },
//       {
//         type: "billing",
//         street: "789 Oak Rd",
//         city: "Los Angeles",
//         state: "CA",
//         zipCode: "90001",
//         country: "USA",
//         isDefault: true,
//       },
//     ],
//   },
//   {
//     id: "3",
//     name: "Bob Johnson",
//     email: "bob.johnson@example.com",
//     phone: "+1 234 567 8902",
//     orders: 24,
//     totalSpent: 2499.99,
//     status: "active",
//     joinedDate: "2023-05-10",
//   },
//   {
//     id: "4",
//     name: "Alice Williams",
//     email: "alice.williams@example.com",
//     phone: "+1 234 567 8903",
//     orders: 3,
//     totalSpent: 299.99,
//     status: "inactive",
//     joinedDate: "2023-11-05",
//   },
//   {
//     id: "5",
//     name: "Charlie Brown",
//     email: "charlie.brown@example.com",
//     phone: "+1 234 567 8904",
//     orders: 15,
//     totalSpent: 1599.99,
//     status: "active",
//     joinedDate: "2023-08-18",
//   },
// ]
const initialCustomers: Customer[] = []

// const initialPayments: Payment[] = [
//   {
//     id: "PAY-1001",
//     orderId: "ORD-1001",
//     customer: "John Doe",
//     date: "2024-01-05",
//     amount: 249.99,
//     method: "credit_card",
//     status: "completed",
//     transactionId: "txn_1A2B3C4D5E",
//     details: {
//       brand: "Visa",
//       last4: "4242",
//       expiry: "12/25",
//       customerEmail: "john.doe@example.com",
//     },
//   },
//   {
//     id: "PAY-1002",
//     orderId: "ORD-1002",
//     customer: "Jane Smith",
//     date: "2024-01-05",
//     amount: 149.99,
//     method: "paypal",
//     status: "pending",
//     transactionId: "txn_2B3C4D5E6F",
//     details: {
//       customerEmail: "jane.smith@example.com",
//     },
//   },
//   {
//     id: "PAY-1003",
//     orderId: "ORD-1003",
//     customer: "Bob Johnson",
//     date: "2024-01-04",
//     amount: 399.99,
//     method: "credit_card",
//     status: "completed",
//     transactionId: "txn_3C4D5E6F7G",
//     details: {
//       brand: "Mastercard",
//       last4: "9876",
//       expiry: "08/24",
//       customerEmail: "bob.johnson@example.com",
//     },
//   },
//   {
//     id: "PAY-1004",
//     orderId: "ORD-1004",
//     customer: "Alice Williams",
//     date: "2024-01-04",
//     amount: 89.99,
//     method: "debit_card",
//     status: "processing",
//     transactionId: "txn_4D5E6F7G8H",
//     details: {
//       brand: "Visa",
//       last4: "1234",
//       expiry: "05/26",
//       customerEmail: "alice.williams@example.com",
//     },
//   },
//   {
//     id: "PAY-1005",
//     orderId: "ORD-1005",
//     customer: "Charlie Brown",
//     date: "2024-01-03",
//     amount: 199.99,
//     method: "credit_card",
//     status: "failed",
//     transactionId: "txn_5E6F7G8H9I",
//     details: {
//       brand: "Amex",
//       last4: "1001",
//       expiry: "03/24",
//       reason: "Insufficient funds",
//       customerEmail: "charlie.brown@example.com",
//     },
//   },
//   {
//     id: "PAY-1006",
//     orderId: "ORD-1001",
//     customer: "John Doe",
//     date: "2024-01-05",
//     amount: 500.0,
//     method: "upi",
//     status: "completed",
//     transactionId: "upi_txn_987654321",
//     details: {
//       upiId: "john.doe@okaxis",
//       utrNumber: "UTR123456789",
//       screenshotUrl: "https://picsum.photos/400/600.jpg",
//     },
//   },
//   {
//     id: "PAY-1007",
//     orderId: "ORD-1002",
//     customer: "Jane Smith",
//     date: "2024-01-06",
//     amount: 1500.0,
//     method: "bank_transfer",
//     status: "processing",
//     transactionId: "bank_ref_11223344",
//     details: {
//       bankName: "State Bank of India",
//       accountNumber: "•••• 8899",
//       ifscCode: "SBIN0001234",
//       utrNumber: "NEFT000998877",
//       screenshotUrl: "https://picsum.photos/400/600.jpg",
//     },
//   },
// ]
const initialPayments: Payment[] = []

// const initialEnquiries: Enquiry[] = [
//   {
//     id: "1",
//     name: "David Miller",
//     email: "david.miller@example.com",
//     subject: "Product Availability",
//     message:
//       "Hello, I wanted to check if the Wireless Headphones will be back in stock soon?",
//     status: "new",
//     createdAt: "2024-01-06",
//   },
//   {
//     id: "2",
//     name: "Sarah Wilson",
//     email: "sarah.w@example.com",
//     subject: "Shipping Query",
//     message: "Do you provide international shipping to Canada?",
//     status: "read",
//     createdAt: "2024-01-05",
//   },
//   {
//     id: "3",
//     name: "Michael Ross",
//     email: "mike.r@example.com",
//     subject: "Bulk Order Discount",
//     message:
//       "I'm looking to buy 50 units for my company. Do you offer bulk discounts?",
//     status: "replied",
//     createdAt: "2024-01-04",
//   },
// ]
const initialEnquiries: Enquiry[] = []

// const initialNewsletter: Newsletter[] = [
//   {
//     id: "1",
//     email: "alex.g@example.com",
//     status: "active",
//     createdAt: "2024-01-07",
//   },
//   {
//     id: "2",
//     email: "maria.s@example.com",
//     status: "active",
//     createdAt: "2024-01-06",
//   },
//   {
//     id: "3",
//     email: "tom.h@example.com",
//     status: "unsubscribed",
//     createdAt: "2024-01-05",
//   },
// ]
const initialNewsletter: Newsletter[] = []

const DataContext = createContext<DataContextType | undefined>(undefined)

function safeParse<T>(value: string | null, fallback: T): T {
  try {
    return value ? JSON.parse(value) : fallback
  } catch {
    return fallback
  }
}

export function DataProvider({ children }: { children: ReactNode }) {
  // const [products, setProducts] = useState<Product[]>([])
  // const [categories, setCategories] = useState<Category[]>([])
  // const [brands, setBrands] = useState<Brand[]>([])
  // const [orders, setOrders] = useState<Order[]>([])
  // const [customers, setCustomers] = useState<Customer[]>([])
  // const [payments, setPayments] = useState<Payment[]>([])
  // const [enquiries, setEnquiries] = useState<Enquiry[]>([])
  // const [newsletterSubscribers, setNewsletterSubscribers] = useState<
  //   Newsletter[]
  // >([])
  // const [isInitialized, setIsInitialized] = useState(false)
  const [state, setState] = useState<DataState>(() => {
    if (typeof window === "undefined") {
      return {
        products: initialProducts,
        categories: initialCategories,
        brands: initialBrands,
        orders: initialOrders,
        customers: initialCustomers,
        payments: initialPayments,
        enquiries: initialEnquiries,
        newsletterSubscribers: initialNewsletter,
      }
    }

    return {
      products: safeParse(localStorage.getItem("products"), initialProducts),
      categories: safeParse(
        localStorage.getItem("categories"),
        initialCategories,
      ),
      brands: safeParse(localStorage.getItem("brands"), initialBrands),
      orders: safeParse(localStorage.getItem("orders"), initialOrders),
      customers: safeParse(localStorage.getItem("customers"), initialCustomers),
      payments: safeParse(localStorage.getItem("payments"), initialPayments),
      enquiries: safeParse(localStorage.getItem("enquiries"), initialEnquiries),
      newsletterSubscribers: safeParse(
        localStorage.getItem("newsletter"),
        initialNewsletter,
      ),
    }
  })
  // useEffect(() => {
  //   const storedProducts = localStorage.getItem("products")
  //   const storedCategories = localStorage.getItem("categories")
  //   const storedBrands = localStorage.getItem("brands")
  //   const storedOrders = localStorage.getItem("orders")
  //   const storedCustomers = localStorage.getItem("customers")
  //   const storedPayments = localStorage.getItem("payments")
  //   const storedEnquiries = localStorage.getItem("enquiries")
  //   const storedNewsletter = localStorage.getItem("newsletter")

  //   setProducts(storedProducts ? JSON.parse(storedProducts) : initialProducts)
  //   setCategories(
  //     storedCategories ? JSON.parse(storedCategories) : initialCategories,
  //   )
  //   setBrands(storedBrands ? JSON.parse(storedBrands) : initialBrands)
  //   setOrders(
  //     storedOrders
  //       ? JSON.parse(storedOrders).map((o: any) => ({
  //           ...o,
  //           productIds:
  //             o.productIds ||
  //             initialOrders.find((io) => io.id === o.id)?.productIds,
  //         }))
  //       : initialOrders,
  //   )
  //   setCustomers(
  //     storedCustomers
  //       ? JSON.parse(storedCustomers).map((c: any) => ({
  //           ...c,
  //           addresses:
  //             c.addresses ||
  //             initialCustomers.find((ic) => ic.id === c.id)?.addresses,
  //         }))
  //       : initialCustomers,
  //   )
  //   setPayments(
  //     storedPayments
  //       ? JSON.parse(storedPayments).map((p: any) => ({
  //           ...p,
  //           details:
  //             p.details ||
  //             initialPayments.find((ip) => ip.id === p.id)?.details,
  //         }))
  //       : initialPayments,
  //   )
  //   setEnquiries(
  //     storedEnquiries ? JSON.parse(storedEnquiries) : initialEnquiries,
  //   )
  //   setNewsletterSubscribers(
  //     storedNewsletter ? JSON.parse(storedNewsletter) : initialNewsletter,
  //   )
  //   setIsInitialized(true)
  // }, [])
  const {
    products,
    categories,
    brands,
    orders,
    customers,
    payments,
    enquiries,
    newsletterSubscribers,
  } = state
  // useEffect(() => {
  //   setIsInitialized(true)
  // }, [])
  // useEffect(() => {
  //   if (isInitialized) {
  //     localStorage.setItem("products", JSON.stringify(products))
  //     localStorage.setItem("categories", JSON.stringify(categories))
  //     localStorage.setItem("brands", JSON.stringify(brands))
  //     localStorage.setItem("orders", JSON.stringify(orders))
  //     localStorage.setItem("customers", JSON.stringify(customers))
  //     localStorage.setItem("payments", JSON.stringify(payments))
  //     localStorage.setItem("enquiries", JSON.stringify(enquiries))
  //     localStorage.setItem("newsletter", JSON.stringify(newsletterSubscribers))
  //   }
  // }, [
  //   products,
  //   categories,
  //   brands,
  //   orders,
  //   customers,
  //   payments,
  //   enquiries,
  //   newsletterSubscribers,
  //   isInitialized,
  // ])

  useEffect(() => {
    if (typeof window === "undefined") return

    localStorage.setItem("products", JSON.stringify(products))
    localStorage.setItem("categories", JSON.stringify(categories))
    localStorage.setItem("brands", JSON.stringify(brands))
    localStorage.setItem("orders", JSON.stringify(orders))
    localStorage.setItem("customers", JSON.stringify(customers))
    localStorage.setItem("payments", JSON.stringify(payments))
    localStorage.setItem("enquiries", JSON.stringify(enquiries))
    localStorage.setItem("newsletter", JSON.stringify(newsletterSubscribers))
  }, [
    products,
    categories,
    brands,
    orders,
    customers,
    payments,
    enquiries,
    newsletterSubscribers,
  ])

  const addProduct = (product: Omit<Product, "id" | "createdAt">) => {
    const newProduct: Product = {
      ...product,
      // id: Math.random().toString(36).substr(2, 9),
      id: crypto.randomUUID(),
      createdAt: new Date().toISOString().split("T")[0],
    }
    // setProducts((prev) => [newProduct, ...prev])
    setState((prevState) => ({
      ...prevState,
      products: [newProduct, ...prevState.products],
    }))
  }

  const updateProduct = (id: string, updatedFields: Partial<Product>) => {
    // setProducts((prev) =>
    //   prev.map((p) => (p.id === id ? { ...p, ...updatedFields } : p)),
    setState((prev) => ({
      ...prev,
      products: prev.products.map((p) =>
        p.id === id ? { ...p, ...updatedFields } : p,
      ),
    }))
  }

  const deleteProduct = (id: string) => {
    setState((prev) => ({
      ...prev,
      products: prev.products.filter((p) => p.id !== id),
    }))
  }

  const addCategory = (
    category: Omit<Category, "id" | "createdAt" | "productCount">,
  ) => {
    const newCategory: Category = {
      ...category,
      // id: Math.random().toString(36).substr(2, 9),
      id: crypto.randomUUID(),
      productCount: 0,
      createdAt: new Date().toISOString().split("T")[0],
    }
    setState((prev) => ({
      ...prev,
      categories: [newCategory, ...prev.categories],
    }))
  }

  const updateCategory = (id: string, updatedFields: Partial<Category>) => {
    setState((prev) => ({
      ...prev,
      categories: prev.categories.map((c) =>
        c.id === id ? { ...c, ...updatedFields } : c,
      ),
    }))
  }

  const deleteCategory = (id: string) => {
    setState((prev) => ({
      ...prev,
      categories: prev.categories.filter((c) => c.id !== id),
    }))
  }

  const addBrand = (brand: Omit<Brand, "id" | "createdAt">) => {
    const newBrand: Brand = {
      ...brand,
      // id: Math.random().toString(36).substr(2, 9),
      id: crypto.randomUUID(),
      createdAt: new Date().toISOString().split("T")[0],
    }
    setState((prev) => ({ ...prev, brands: [newBrand, ...prev.brands] }))
  }

  const updateBrand = (id: string, updatedFields: Partial<Brand>) => {
    setState((prev) => ({
      ...prev,
      brands: prev.brands.map((b) =>
        b.id === id ? { ...b, ...updatedFields } : b,
      ),
    }))
  }

  const deleteBrand = (id: string) => {
    setState((prev) => ({
      ...prev,
      brands: prev.brands.filter((b) => b.id !== id),
    }))
  }

  const updateOrderStatus = (
    id: string,
    status: OrderStatus,
    reason?: string,
  ) => {
    setState((prev) => ({
      ...prev,
      orders: prev.orders.map((o) => {
        if (o.id === id) {
          // Prevent duplicate history entries if same status updated (unless reason changes)
          const isDuplicate =
            o.history &&
            o.history[o.history.length - 1]?.status === status &&
            o.history[o.history.length - 1]?.reason === reason
          if (isDuplicate) return o

          const now = new Date().toLocaleString()
          const newHistory = [
            ...(o.history || []),
            { status, date: now, reason },
          ]
          return {
            ...o,
            status,
            history: newHistory,
            lastUpdated: now,
          }
        }
        return o
      }),
    }))
  }

  const deleteEnquiry = (id: string) => {
    setState((prev) => ({
      ...prev,
      enquiries: prev.enquiries.filter((e) => e.id !== id),
    }))
  }

  const updateEnquiryStatus = (id: string, status: Enquiry["status"]) => {
    setState((prev) => ({
      ...prev,
      enquiries: prev.enquiries.map((e) =>
        e.id === id ? { ...e, status } : e,
      ),
    }))
  }

  const deleteSubscriber = (id: string) => {
    setState((prev) => ({
      ...prev,
      newsletterSubscribers: prev.newsletterSubscribers.filter(
        (s) => s.id !== id,
      ),
    }))
  }

  const updateSubscriberStatus = (id: string, status: Newsletter["status"]) => {
    setState((prev) => ({
      ...prev,
      newsletterSubscribers: prev.newsletterSubscribers.map((s) =>
        s.id === id ? { ...s, status } : s,
      ),
    }))
  }

  const getProduct = (id: string) => products.find((p) => p.id === id)
  const getCategory = (id: string) => categories.find((c) => c.id === id)
  const getBrand = (id: string) => brands.find((b) => b.id === id)

  return (
    <DataContext.Provider
      value={{
        products,
        categories,
        brands,
        orders,
        customers,
        payments,
        enquiries,
        newsletterSubscribers,
        updateOrderStatus,
        addProduct,
        updateProduct,
        deleteProduct,
        addCategory,
        updateCategory,
        deleteCategory,
        addBrand,
        updateBrand,
        deleteBrand,
        deleteEnquiry,
        updateEnquiryStatus,
        deleteSubscriber,
        updateSubscriberStatus,
        getProduct,
        getCategory,
        getBrand,
      }}
    >
      {children}
    </DataContext.Provider>
  )
}

export function useData() {
  const context = useContext(DataContext)
  if (context === undefined) {
    throw new Error("useData must be used within a DataProvider")
  }
  return context
}

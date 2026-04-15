# AI Skills / Project Notes

## Table of Contents

- [Quick Reference](#quick-reference)
  - [Common Commands](#common-commands)
  - [Key Files](#key-files)
  - [Common Patterns](#common-patterns)
- [Principles (WHY)](#principles-why)
  - [Component Architecture](#component-architecture)
  - [Data Fetching](#data-fetching)
  - [Error Handling](#error-handling)
  - [Code Quality](#code-quality)
  - [UX Principles](#ux-principles)
  - [Styling Conventions](#styling-conventions)
  - [Anti-Patterns (DON'T)](#anti-patterns-dont)
  - [Technology Decisions](#technology-decisions)
  - [Boundaries](#boundaries)
  - [Scaling Notes](#scaling-notes)
- [Patterns (HOW)](#patterns-how)
  - [API Routes](#api-routes)
    - [Standard Route Structure](#standard-route-structure)
    - [Duplicate Checking](#duplicate-checking)
    - [Pagination Pattern](#pagination-pattern)
    - [Filtering Pattern](#filtering-pattern)
  - [React Query](#react-query)
    - [Provider Setup](#provider-setup)
    - [Query Keys](#query-keys)
    - [Custom Hooks](#custom-hooks)
  - [Form Validation](#form-validation)
    - [Numeric Validation](#numeric-validation)
    - [Error Handling](#error-handling-1)
  - [Pagination with Debounced Search](#pagination-with-debounced-search)
    - [State Management](#state-management)
    - [Debounce Effect](#debounce-effect)
  - [Skeleton Loading](#skeleton-loading)
    - [Implementation](#implementation)
    - [Loading State Pattern](#loading-state-pattern)
  - [Product Image Upload](#product-image-upload)
    - [Shared Hook](#shared-hook)
    - [Upload Process](#upload-process)
  - [Sequential Subcategory Filtering](#sequential-subcategory-filtering)
    - [Implementation](#implementation-1)
  - [Drawer Pattern for Create Forms](#drawer-pattern-for-create-forms)
    - [Implementation](#implementation-2)
  - [Searchable Dropdown with Command](#searchable-dropdown-with-command)
    - [Implementation](#implementation-3)
  - [Git Hooks](#git-hooks)
    - [Pre-commit Hook](#pre-commit-hook)
  - [Code Formatting Patterns](#code-formatting-patterns)
    - [Simplified Return Statements](#simplified-return-statements)
    - [Comment Conventions](#comment-conventions)
- [Code Examples](#code-examples)
  - [API Route with Hoisting Pattern](#api-route-with-hoisting-pattern)
  - [Form Validation Error Handling](#form-validation-error-handling)
  - [Skeleton Component Pattern](#skeleton-component-pattern)
  - [Pagination Reset with Refs](#pagination-reset-with-refs)
  - [Debounce Effect](#debounce-effect-1)
  - [Money Formatting Usage](#money-formatting-usage)
  - [Comment Conventions](#comment-conventions-1)
  - [Git Pre-commit Hook](#git-pre-commit-hook)
- [Project Context](#project-context)
  - [Project Overview](#project-overview)
  - [Architecture Overview](#architecture-overview)
  - [UI / Admin Area Conventions](#ui--admin-area-conventions)
  - [TanStack React Table Usage](#tanstack-react-table-usage)
  - [TanStack React Query Setup](#tanstack-react-query-setup)
  - [Existing Global Providers](#existing-global-providers)
  - [DataContext Notes](#datacontext-notes)
  - [API Routes (Examples)](#api-routes-examples)
  - [Suggested Patterns for API Fetching](#suggested-patterns-for-api-fetching)
  - [Install / Troubleshooting](#install--troubleshooting)
  - [Package Manager](#package-manager)
  - [Product Management System](#product-management-system)
  - [Product Image Uploader Hook](#product-image-uploader-hook)
  - [Skeleton Loading Pattern](#skeleton-loading-pattern)
  - [Numeric Input Validation](#numeric-input-validation)
  - [Form Section Organization](#form-section-organization)
  - [Error Logging System](#error-logging-system)
  - [Dashboard Improvements](#dashboard-improvements)
  - [React Key Prop Best Practices](#react-key-prop-best-practices)
  - [Subcategory System](#subcategory-system)
  - [CSS/Tailwind Notes](#csstailwind-notes)
  - [Recent UI Improvements](#recent-ui-improvements)
  - [Money Formatting Utilities](#money-formatting-utilities)
- [Recent Changes](#recent-changes)

## Quick Reference

### Common Commands

- `pnpm install` - Install dependencies
- `pnpm exec prettier --write` - Format files
- `pnpm exec eslint --fix` - Fix linting issues

### Key Files

- `lib/utils.ts` - Currency formatting utilities
- `lib/server/errorlogs.ts` - Server-side error logging
- `app/providers.tsx` - React Query provider setup
- `hooks/api/useProducts.ts` - Product data fetching with error handling
- `.husky/pre-commit` - Git pre-commit hook (Prettier + ESLint)

### Common Patterns

- **API Route Structure**: Hoist params and parsedBody outside try/catch, use `logServerError()` for errors
- **Skeleton Loading**: Define skeleton components outside component body, use `Skeleton` from shadcn/ui
- **Pagination Reset**: Use refs to track previous filter state, reset page when filters change
- **Currency Formatting**: Use `formatCurrency()`, `formatCurrencyWithSign()`, `formatProfitMargin()` from `lib/utils.ts`
- **Form Validation**: Use Zod schema with regex validation for numeric fields, handle errors with toast
- **Image Upload**: Use `useProductImageUploader` hook with presigned URLs
- **Error Logging**: Server-side via `logServerError()`, client-side via `logError()` in hooks

## Principles (WHY)

### Component Architecture

- **Shared Components**: Product add/edit forms use shared components under `components/admin/products/` for consistency
- **Reusable Sections**: Each form section is a reusable component (general info, pricing, inventory, etc.)
- **Skeleton Loading**: Better UX than spinners - shows placeholder content that mimics actual layout
- **Form Section Organization**: Card-based sections with descriptive titles for better visual hierarchy

### Data Fetching

- **React Query for Caching**: Prevents duplicate requests, provides stale-while-revalidate behavior
- **Stable Query Keys**: Use consistent key patterns for cache invalidation
- **Mutations for Updates**: Use mutations for create/update/delete operations, invalidate keys afterward
- **Server-Side Pagination**: Reduces payload size, improves performance for large datasets

### Error Handling

- **Centralized Logging**: All errors logged consistently via `logServerError()` for debugging
- **Non-Blocking in Critical Paths**: Error logging is non-blocking in logout/auth-me routes
- **User-Friendly Messages**: Client-side error categorization provides helpful toast messages
- **Hoisting Pattern**: Hoist params/parsedBody outside try/catch to prevent stream read errors

### Code Quality

- **Define Components Outside Render**: Prevents React from re-creating components on every render
- **Single-Line Returns**: Use single-line returns for simple responses to reduce visual noise
- **Explanatory Comments**: Add comments for non-obvious patterns (hoisting, refs, ESLint disables)
- **Integer Math for Currency**: Use integer math (cents) to avoid floating point precision issues

### UX Principles

- **Debounced Search**: 300ms debounce reduces API calls while maintaining responsiveness
- **Sequential Filtering**: Category/subcategory filtering shows only relevant options
- **Auto-Reset Pagination**: Reset page to 1 when filters change to show relevant results
- **Numeric Input Validation**: Use text inputs with regex validation instead of number type for better mobile UX

### Styling Conventions

- **shadcn/ui Components**: Use pre-built components for consistency
- **Tailwind CSS**: Utility-first CSS for rapid development
- **Gradient Patterns**: Use consistent gradient patterns (`from-slate-50 to-slate-100`)
- **Badge Styling**: Use `capitalize` instead of `uppercase` for better readability

### Anti-Patterns (DON'T)

- **Don't call `req.json()` inside catch** - Hoist `parsedBody` outside try/catch to prevent "body stream already read" errors
- **Don't define components inside render** - Define skeleton components and other reusable components outside component body to avoid re-creation on every render
- **Don't pre-filter arrays instead of table state** - Use TanStack Table filtering/sorting state instead of pre-filtering arrays in render for better performance
- **Don't use unstable query keys** - Use stable query keys like `["products", params]` and `["products", id]` to avoid unnecessary refetches

### Technology Decisions

**Why React Query over SWR?**

- Better TypeScript support and type inference
- More comprehensive devtools for debugging
- More flexible mutation API with better error handling
- Built-in caching strategies and stale-while-revalidate
- Better documentation and community adoption

**Why Mongoose over Prisma?**

- Direct MongoDB access with schema validation
- More flexibility for complex queries and aggregations
- Lower overhead for simple CRUD operations
- Better control over database interactions
- Familiarity with MongoDB ecosystem

**Why Next.js API instead of separate backend?**

- Single codebase reduces deployment complexity
- Shared types between frontend and backend
- Serverless-ready with automatic scaling
- Faster development with unified deployment
- Leverages Next.js built-in optimizations

**Why integer math instead of float?**

- Avoids floating point precision errors (0.1 + 0.2 !== 0.3)
- Predictable calculations for financial data
- Consistent behavior across different environments
- Easier debugging and testing
- Standard practice for currency applications

### Boundaries

- **API routes = business logic boundary** - All data validation, transformation, and business rules live in API routes. UI components should only call endpoints and handle responses.
- **Hooks = data access boundary** - React Query hooks encapsulate all data fetching logic. Components should not directly call fetch or manage loading/error states.
- **UI = presentation only** - Components should only handle rendering and user interactions. No business logic, no data fetching, no validation.

### Scaling Notes

**When to move to microservices?**

- When team size grows beyond 10-15 developers
- When different domains have independent scaling needs
- When deployment cycles need to be decoupled
- When codebase becomes too large to maintain in monolith

**When Mongo becomes bottleneck?**

- When read/write operations exceed 10k/second
- When complex aggregations slow down queries
- When database size exceeds 100GB
- When response times consistently exceed 500ms

**When to introduce caching layer (Redis)?**

- When API response times are >200ms
- When same data is read frequently with low write rate
- When session management needs horizontal scaling
- When real-time features require pub/sub

### API Routes

**Standard Route Structure**

- All API routes follow consistent error handling:
  1. Hoist `params` outside try/catch for error logging access (prevents nested await issues)
  2. For PUT/POST routes, hoist `parsedBody` outside try/catch to prevent "body stream already read" errors
  3. Try block with admin verification
  4. Catch AuthError with logging
  5. Catch general errors with logging
- Use `isValidObjectId()` for ID validation
- Serialize responses with consistent field inclusion

**Duplicate Checking**

- Products: Check SKU and slug uniqueness before create/update
- Categories/Brands: Check slug uniqueness
- Return 409 status with specific error message
- Log duplicate errors with `logServerError()`

**Pagination Pattern**

- Products API supports pagination via `page` and `limit` query params
- Response includes `data` array and `pagination` object:
  - `total` - total matching records
  - `page` - current page
  - `limit` - items per page
  - `pages` - total pages
- Client-side: useProducts hook accepts `ProductsParams` interface

**Filtering Pattern**

- Products API supports filtering by:
  - `search` - searches name, SKU, category name, subcategory name, brand name
  - `category` - filter by category ID or slug
  - `subcategory` - filter by subcategory ID or slug
  - `brand` - filter by brand ID or slug
- Converts string IDs to ObjectIds with fallback to slug lookup

### React Query

**Provider Setup**

- Query client provider is implemented in: `app/providers.tsx`
- Root layout wraps the app with the provider: `app/layout.tsx` imports `Providers` from `./providers` and wraps existing providers
- React Query Devtools are enabled only in development: `process.env.NODE_ENV === "development"`
- Config lives in `app/providers.tsx` (QueryClient construction)
- Current defaults:
  - `staleTime: 30_000`
  - `refetchOnWindowFocus: false`
  - `retry: 1`

**Query Keys**

- Put client-side fetch functions in a small API layer (e.g. `lib/api/*.ts`) and consume via React Query hooks
- Use stable query keys:
  - List: `["products", params]`
  - Detail: `["products", id]`
- Use mutations for create/update/delete and invalidate relevant keys afterward

**Custom Hooks**

- Put fetch functions in `lib/api/*.ts`
- Consume via React Query hooks in `hooks/api/`
- Handle errors with toast messages

### Form Validation

**Error Handling**

- Use `onFormError` callback with `form.handleSubmit()`
- Catch first error and display as toast
- Provide immediate feedback on validation failures

### Pagination with Debounced Search

**State Management**

- Products page implements server-side pagination with debounced search
- State:
  - `page`, `limit` - pagination state
  - `searchQuery` - raw search input
  - `debouncedSearch` - 300ms debounced search value
  - `categoryFilter`, `subcategoryFilter`, `brandFilter` - filter state

**Debounce Effect**

- 300ms debounce reduces API calls while maintaining responsiveness
- Auto-reset page when filters change using refs to track previous state (avoids stale closure issues)
- Pagination UI with page numbers (max 5 visible) and prev/next buttons
- Uses `useProducts` hook with `ProductsParams` interface

### Product Image Upload

**Shared Hook**

- Shared hook `useProductImageUploader` in `components/admin/products/product-image-uploader.tsx`
- Handles both add and edit modes via `mode` parameter
- Returns:
  - `fileInputRef`, `videoInputRef` - refs for file inputs
  - `previews`, `videoPreview` - current preview URLs
  - `filesToUpload`, `videoFile` - files pending upload (add mode)
  - `newImageFiles`, `newVideoFile` - new files for edit mode
  - `handleImageChange`, `handleVideoChange` - file selection handlers
  - `removeImage`, `removeVideo` - removal handlers
- Add mode: stores all files for upload
- Edit mode: tracks only new/changed files with index mapping
- Components: `ImageUploadCard`, `VideoUploadCard` for UI rendering

**Upload Process**

- Uses presigned URLs via `/api/uploads/presign` endpoint
- Uploads to R2/S3 storage
- Generate base64 preview
- Handle add/edit mode differences

### Sequential Subcategory Filtering

**Implementation**

- Category selection filters subcategory dropdown to show only related options
- Subcategory selection auto-selects its parent category
- Category change resets subcategory if it doesn't belong to new category
- Implementation in `components/admin/products/categorization-section.tsx`

### Drawer Pattern for Create Forms

**Implementation**

- Use Vaul Drawer component for inline creation of related items (categories, subcategories, brands)
- Drawer components include full form with validation, image upload, and status toggle
- Icon-only drawer trigger buttons placed next to select dropdowns using flex layout
- Drawer receives callback prop to auto-select newly created item in parent form
- Pre-fill parent field when drawer is triggered from context (e.g., category ID for subcategory drawer)
- Consistent UI/UX with sections: Basic Info, Image Upload, Status
- Use React Hook Form with Zod validation inside drawer
- Toast notifications for success/error feedback

**Pattern**

```typescript
// Drawer component with callback
interface SubcategoryDrawerProps {
  onSubcategoryCreated?: (subcategoryId: string) => void
  selectedCategoryId?: string
  categories: any[]
}

export function SubcategoryDrawer({
  onSubcategoryCreated,
  selectedCategoryId,
  categories,
}: SubcategoryDrawerProps) {
  const createMutation = useCreateSubcategory()

  const onSubmit = async (values: SubcategoryFormValues) => {
    const result = await createMutation.mutateAsync(values)
    if (result?._id) {
      onSubcategoryCreated?.(result._id)
      setOpen(false)
      toast.success("Subcategory created successfully")
    }
  }

  return (
    <Drawer open={open} onOpenChange={setOpen}>
      <DrawerTrigger asChild>
        <Button variant="outline" size="icon">
          <Plus className="h-4 w-4" />
        </Button>
      </DrawerTrigger>
      <DrawerContent>
        {/* Form with validation */}
      </DrawerContent>
    </Drawer>
  )
}

// Parent field integration
const handleSubcategoryCreated = (subcategoryId: string) => {
  if (subcategoryId) {
    form.setValue("subcategory", subcategoryId, { shouldValidate: true })
  }
}

<div className="flex gap-2">
  <Select>
    {/* Select dropdown */}
  </Select>
  <SubcategoryDrawer
    onSubcategoryCreated={handleSubcategoryCreated}
    selectedCategoryId={selectedCategoryId}
    categories={categories}
  />
</div>
```

### Searchable Dropdown with Command

**Implementation**

- Use cmdk Command component for searchable dropdowns instead of native Select
- Wrap Command in Popover for dropdown behavior
- Real-time search filtering with CommandInput
- Checkmark icon for selected item
- "None" option for optional fields
- Auto-close on selection
- Consistent styling across all searchable selects (category, subcategory, brand)

**Pattern**

```typescript
const [open, setOpen] = useState(false)
const [search, setSearch] = useState("")

const filteredItems = items.filter((item) =>
  item.name.toLowerCase().includes(search.toLowerCase())
)

const selectedItem = items.find(
  (item) => (item._id || item.id) === form.watch("fieldName")
)

<Popover open={open} onOpenChange={setOpen}>
  <PopoverTrigger asChild>
    <FormControl>
      <Button
        variant="outline"
        role="combobox"
        aria-expanded={open}
        className="w-full justify-between"
      >
        {selectedItem ? selectedItem.name : "Select item"}
        <Search className="ml-2 h-4 w-4 shrink-0 opacity-50" />
      </Button>
    </FormControl>
  </PopoverTrigger>
  <PopoverContent className="w-[200px] p-0">
    <Command>
      <CommandInput
        placeholder="Search..."
        value={search}
        onValueChange={setSearch}
      />
      <CommandList>
        <CommandEmpty>No item found.</CommandEmpty>
        <CommandGroup>
          {filteredItems.map((item) => (
            <CommandItem
              key={item._id || item.id}
              value={item.name}
              onSelect={() => {
                form.setValue("fieldName", item._id || item.id, {
                  shouldValidate: true,
                })
                setOpen(false)
                setSearch("")
              }}
            >
              <Check
                className={`mr-2 h-4 w-4 ${
                  (item._id || item.id) === field.value
                    ? "opacity-100"
                    : "opacity-0"
                }`}
              />
              {item.name}
            </CommandItem>
          ))}
        </CommandGroup>
      </CommandList>
    </Command>
  </PopoverContent>
</Popover>
```

### Git Hooks

**Pre-commit Hook**

- Runs Prettier and ESLint on staged files
- Uses `xargs` for efficient file processing
- ESLint uses `|| true` to prevent blocking on warnings
- Re-stages formatted files after linting
- Pre-push hook also exists at `.husky/pre-push`

**Pre-commit Hook Pattern**

```bash
FILES=$(git diff --cached --name-only --diff-filter=ACMR)
[ -z "$FILES" ] && exit 0

echo "$FILES" | xargs pnpm exec prettier --write --ignore-unknown

JS_TS_FILES=$(echo "$FILES" | grep -E '\.(js|ts|tsx)$' || true)

if [ -n "$JS_TS_FILES" ]; then
  echo "$JS_TS_FILES" | xargs pnpm exec eslint --fix --max-warnings=100 || true
fi

git add $FILES
```

### Code Formatting Patterns

**Simplified Return Statements**

- Single-line returns for simple responses
- Multi-line only for complex responses or comments

**Comment Conventions**

- Inline for quick explanations: `// Clean reference to hoisted id`
- Block for detailed explanations
- Document ESLint disables: `// eslint-disable-next-line react-hooks/set-state-in-effect`

## Code Examples

### API Route with Hoisting Pattern

```typescript
export async function PUT(req: NextRequest, { params }: RouteContext) {
  // Hoist params outside try/catch for clean error logging access
  const { id } = await params

  // Hoist state container to preserve request body for error logging
  // This prevents "body stream already read" fatal crash in catch block
  let parsedBody: Record<string, any> = {}

  try {
    await verifyAdmin()
    // ... validation ...

    // Single point of stream consumption
    parsedBody = await req.json()
    // ... use parsedBody throughout ...
  } catch (error: unknown) {
    if (error instanceof AuthError) {
      await logServerError({
        errorType: "validation",
        errorMessage: error.message,
        endpoint: `/api/products/${id}`, // Clean reference to hoisted id
        method: "PUT",
        requestData: parsedBody, // Safe reference to hoisted state
        stackTrace: error.stack,
      })
      return NextResponse.json(
        { error: error.message, code: error.code },
        { status: error.status },
      )
    }
    // ... general error handling with parsedBody ...
  }
}
```

### Form Validation Error Handling

```typescript
const onFormError = (errors: any) => {
  const firstError = Object.values(errors)[0] as any
  if (firstError?.message) toast.error(firstError.message)
  else toast.error("Please fill in all required fields")
}

<Button onClick={form.handleSubmit(onSubmit, onFormError)}>
```

### Skeleton Component Pattern

```typescript
// ✅ Correct: Outside component body
const DashboardSkeleton = () => <div className="p-6 space-y-8">{/* content */}</div>

export default function DashboardPage() {
  if (isLoading) return <DashboardSkeleton />
}

// ❌ Incorrect: Inside component (re-creates on render)
export default function DashboardPage() {
  const DashboardSkeleton = () => <div className="p-6 space-y-8">{/* content */}</div>
  if (isLoading) return <DashboardSkeleton />
}
```

### Pagination Reset with Refs

```typescript
const prevFiltersRef = useRef({
  debouncedSearch,
  categoryFilter,
  subcategoryFilter,
  brandFilter,
})
const pageRef = useRef(page)

useEffect(() => {
  pageRef.current = page
}, [page])

useEffect(() => {
  const prev = prevFiltersRef.current
  const filtersChanged =
    prev.debouncedSearch !== debouncedSearch ||
    prev.categoryFilter !== categoryFilter ||
    prev.subcategoryFilter !== subcategoryFilter ||
    prev.brandFilter !== brandFilter

  if (filtersChanged) {
    pageRef.current = 1
    prevFiltersRef.current = {
      debouncedSearch,
      categoryFilter,
      subcategoryFilter,
      brandFilter,
    }
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setPage(1)
  }
}, [debouncedSearch, categoryFilter, subcategoryFilter, brandFilter])
```

### Debounce Effect

```typescript
useEffect(() => {
  const timer = setTimeout(() => setDebouncedSearch(searchQuery), 300)
  return () => clearTimeout(timer)
}, [searchQuery])
```

### Money Formatting Usage

```typescript
import {
  formatCurrency,
  formatCurrencyWithSign,
  formatNumber,
  formatPercentage,
  formatDifference,
  formatDiscount,
  formatProfitMargin,
  formatMarkup,
} from "@/lib/utils"

// Price display
<div>{formatCurrency(product.price)}</div>

// Profit/Loss with color
<div className={profit >= 0 ? "text-green-600" : "text-red-600"}>
  {formatCurrencyWithSign(profit)}
</div>

// Discount badge
<Badge>{formatDiscount(originalPrice, salePrice)} OFF</Badge>

// Analytics
<div>Margin: {formatProfitMargin(costPrice, sellingPrice)}</div>
<div>Tax: {formatPercentage(product.tax)}</div>
<div>Quantity: {formatNumber(quantity)}</div>
```

### Comment Conventions

```typescript
// Inline: quick explanation
const id = params.id // Clean reference to hoisted id

// Block: detailed explanation
// Hoist state container to preserve request body for error logging
let parsedBody: Record<string, any> = {}

// ESLint disable documentation
// eslint-disable-next-line react-hooks/set-state-in-effect
setPage(1)
```

## Project Context

### Project Overview

- Next.js App Router project (`app/` directory)
- React 19
- Uses Mongoose (`mongoose`) for DB access
- Has API routes under `app/api/**/route.ts`
- Repo includes `pnpm-lock.yaml` and `pnpm-workspace.yaml`, so `pnpm` is the expected package manager

### Architecture Overview

**Frontend**

- Next.js App Router (file-based routing, server/client components, layouts, route handlers)
- React Query (data fetching/caching, provider in `app/providers.tsx`, hooks in `hooks/api/`, devtools in dev, 30s stale time, no refetch on focus, 1 retry)
- shadcn/ui (Radix UI + Tailwind, components in `components/ui/`)

**Backend**

- API Routes (Next.js handlers in `app/api/**/route.ts`, RESTful CRUD, admin verification, centralized error logging, pagination)
- MongoDB (Mongoose ODM, models in `models/`, schema validation, connection in `lib/db.ts`, population)

**Cross-cutting**

- Error Logging (server: `lib/server/errorlogs.ts`, client: `logError()` helper, categorized types, non-blocking in critical paths)
- Auth (Firebase for customers, admin verification in `lib/auth/verifyAdmin.ts`, provider: `lib/auth-context.tsx`)
- Data Context (global provider: `lib/data-context.tsx`, localStorage persistence, composed with AuthProvider and React Query)

### UI / Admin Area Conventions

- Admin pages in `app/admin/**` (client components with `"use client"`)
- UI primitives in `components/ui/**` (Radix UI + Tailwind)
- List layout: title + action button, search + filters row, `Table` in `rounded-md border bg-card`
- Examples: Orders (`app/admin/orders/page.tsx`), Categories (`app/admin/categories/page.tsx`)

### TanStack React Table Usage

- Package: `@tanstack/react-table`
- Orders list uses TanStack Table for sorting (`SortingState` + `getSortedRowModel`) and filtering (global search + column filters)
- Rendering: `table.getHeaderGroups()` + `flexRender` for headers, `table.getRowModel()` for rows

### TanStack React Query Setup

- Packages: `@tanstack/react-query`, `@tanstack/react-query-devtools`

### Existing Global Providers

- Auth: `lib/auth-context.tsx`
- Data: `lib/data-context.tsx`
- Composition in `app/layout.tsx`: Providers → AuthProvider → DataProvider

### DataContext Notes

- `useData()` from `lib/data-context.tsx` for list data (orders, categories)
- Initialized from `localStorage` with fallback to `initial*` datasets
- Use TanStack Table filtering/sorting state instead of pre-filtering arrays

### API Routes (Examples)

**Auth**

- `app/api/auth/login/route.ts` - Admin login
- `app/api/auth/logout/route.ts` - Admin logout
- `app/api/auth/me/route.ts` - Get current admin

**Products**

- `app/api/products/route.ts` - List/create products (pagination, filtering)
- `app/api/products/[id]/route.ts` - Get/update/delete product by ID
- `app/api/products/search/route.ts` - Search products

**Categories**

- `app/api/categories/route.ts` - List/create categories
- `app/api/categories/[id]/route.ts` - Get/update/delete category by ID

**Subcategories**

- `app/api/subcategories/route.ts` - List/create subcategories
- `app/api/subcategories/[id]/route.ts` - Get/update/delete subcategory by ID

**Brands**

- `app/api/brands/route.ts` - List/create brands
- `app/api/brands/[id]/route.ts` - Get/update/delete brand by ID

**Customers**

- `app/api/customers/route.ts` - List/create customers
- `app/api/customers/mobile-app-consumer/auth/me/route.ts` - Get current customer
- `app/api/customers/mobile-app-consumer/auth/verify-customer/route.ts` - Verify customer

**Enquiries**

- `app/api/enquiries/route.ts` - List/create enquiries
- `app/api/enquiries/[id]/route.ts` - Get/update/delete enquiry by ID

**Newsletter**

- `app/api/newsletter/route.ts` - List/create subscribers
- `app/api/newsletter/[id]/route.ts` - Get/update/delete subscriber by ID

**Error Logs**

- `app/api/error-logs/route.ts` - Create/list error logs

**Uploads**

- `app/api/uploads/presign/route.ts` - Generate presigned upload URL

### Suggested Patterns for API Fetching

- Client-side fetch functions in `lib/api/*.ts`, consume via React Query hooks
- Stable query keys: List `["products", params]`, Detail `["products", id]`
- Use mutations for create/update/delete, invalidate keys afterward

### Install / Troubleshooting

- If TypeScript shows module-not-found errors for TanStack packages, run `pnpm install`

### Package Manager

- Expected package manager: `pnpm` (repo includes `pnpm-lock.yaml` and `pnpm-workspace.yaml`)

### Product Management System

**Shared Component Architecture**

- Forms use shared components in `components/admin/products/`:
  - Schema, general info, pricing, inventory, taxation, categorization, barcode
  - Image uploader, profit margin calculator

**Product Schema Fields**

- Standard: name, slug, description, sku, stock, hsn, tax, upc, barcode
- Pricing: costPrice, b2cPrice, b2bPrice, b2bMinQty
- Relations: category, subcategory, brand (populated)
- Media: images (max 5), videoUrl (optional)
- Display uses `formatCurrency()`, `formatCurrencyWithSign()`, `formatProfitMargin()`, `formatMarkup()`

**Image/Video Upload Pattern**

- Presigned URLs via `/api/uploads/presign` to R2/S3
- Shared hook handles selection, preview, upload, add/edit modes

### Product Image Uploader Hook

- Shared hook in `components/admin/products/product-image-uploader.tsx`
- Handles add/edit modes via `mode` parameter
- Returns refs, previews, files, handlers for image/video upload
- Add mode: stores all files; edit mode: tracks only new/changed files

### Skeleton Loading Pattern

- Better UX than spinners - shows placeholder content mimicking actual layout
- Define components outside render to avoid re-creation
- Use `Skeleton` from `@/components/ui/skeleton`
- Accept props for dynamic rendering (e.g., `limit` for row count)

**Implementations**

- Dashboard: `DashboardSkeleton` with bento grid layout
- Products: `TableSkeleton` (rows), `AnalyticsCardsSkeleton` (cards)

**Best Practices**

- Match actual layout and sizing
- Handle empty states separately
- Use consistent spacing
- Keep structure simple and static

**Loading State Pattern**

```typescript
if (isLoading) return <PageSkeleton />
if (error) return <ErrorState error={error} />
if (!data?.length) return <EmptyState />
return <ActualContent data={data} />
```

### Numeric Input Validation

- Use text inputs instead of `type="number"` to avoid mobile number pad
- Validate with regex in Zod schema:
  - `b2cPrice`, `tax`: `/^\d+(\.\d{1,2})?$/` - decimal values
  - `stock`: `/^\d+$/` - whole numbers
- Display with `formatCurrency()` / `formatPercentage()`

### Form Section Organization

- Card-based sections with descriptive titles for visual hierarchy
- Inventory separated from pricing into its own card
- Reusable components for consistency between add/edit pages

### Error Logging System

**Server-Side**

- Centralized via `lib/server/errorlogs.ts`
- `logServerError()` logs errorType, errorMessage, endpoint, method, requestData, stackTrace
- Non-blocking in logout/auth-me routes (void async)

**Client-Side**

- `logError()` helper in `hooks/api/useProducts.ts`
- Logs to `/api/error-logs` endpoint
- Categorizes errors as duplicate vs server
- User-friendly toast messages for common errors

### Dashboard Improvements

- Uses `DashboardSkeleton`, `TableSkeleton`, `AnalyticsCardsSkeleton` for better UX
- Handles paginated products data: `productsData?.data` with `pagination.total`
- Added subcategories to dashboard stats

### React Key Prop Best Practices

- Use unique keys: `key={item._id || item.id}`
- SelectItem cannot have empty string values - use "none"

### Subcategory System

- Separate model with required Category reference
- API routes: `app/api/subcategories/route.ts`, `[id]/route.ts`
- Hook: `hooks/api/useSubcategories.ts`
- Added to Product model, forms, and products listing filter

### CSS/Tailwind Notes

- Use `bg-gradient-to-br` (not `bg-linear-to-br`)
- Badge styling: use `capitalize` instead of `uppercase`
- Common gradient: `from-slate-50 to-slate-100 dark:from-slate-950 dark:to-slate-900`

### Recent UI Improvements

- Address badges: uppercase → capitalize
- Fixed gradients on orders, login, profile pages
- Commented out "View on Store" button

### Money Formatting Utilities

**Overview**

- Centralized utilities in `lib/utils.ts` using INR with `en-IN` locale
- Integer math (cents) to avoid floating point precision issues
- Lightweight `Intl.NumberFormat` implementation with TSDoc documentation

**Type Definitions**

```typescript
type CurrencyOptions = {
  showDecimals?: boolean
  compact?: boolean
}

type NumericValue = number | string
```

**Helper Functions (Private)**

- `toNumber(value, defaultValue)` - Safe parsing with fallback
- `toCents(amount)` - Rupees to cents (integer)
- `fromCents(cents)` - Cents back to rupees

**Available Functions**

**`formatCurrency(amount, options)`**

- Currency formatting with ₹ symbol
- Options: `showDecimals`, `compact`
- Example: `formatCurrency(1234.56)` → "₹1,234.56"

**`formatCurrencyWithSign(amount, options)`**

- Currency with +/- sign for profits/losses
- Example: `formatCurrencyWithSign(100)` → "+₹100.00"

**`formatNumber(amount)`**

- Number formatting without currency (Indian locale)
- Example: `formatNumber(1234.56)` → "1,234.56"

**`formatPercentage(value, asDecimal)`**

- Percentage formatting
- `asDecimal: true` treats input as decimal (0.18 = 18%)
- Example: `formatPercentage(18)` → "18.00%"

**`formatDifference(value1, value2, options)`**

- Difference with sign (uses integer math)
- Example: `formatDifference(100, 50)` → "+₹50.00"

**`formatDiscount(originalPrice, discountedPrice)`**

- Discount percentage (returns 0% if price increased)
- Example: `formatDiscount(100, 80)` → "20.0%"

**`formatProfitMargin(costPrice, sellingPrice)`**

- Profit margin percentage: `((Selling - Cost) / Cost) * 100`
- Example: `formatProfitMargin(100, 125)` → "25.00%"

**`formatMarkup(costPrice, sellingPrice)`**

- Markup percentage: `((Selling - Cost) / Cost) * 100`
- Example: `formatMarkup(100, 125)` → "25.00%"

### Usage Examples

```typescript
import {
  formatCurrency,
  formatCurrencyWithSign,
  formatNumber,
  formatPercentage,
  formatDifference,
  formatDiscount,
  formatProfitMargin,
  formatMarkup,
} from "@/lib/utils"

// Price display
<span>{formatCurrency(product.price)}</span>

// Profit/Loss with color
<span className={profit >= 0 ? "text-green-600" : "text-red-600"}>
  {formatCurrencyWithSign(profit)}
</span>

// Discount badge
<Badge>{formatDiscount(originalPrice, salePrice)} OFF</Badge>

// Analytics
<div>Margin: {formatProfitMargin(costPrice, sellingPrice)}</div>
<div>Tax: {formatPercentage(product.tax)}</div>
<div>Quantity: {formatNumber(quantity)}</div>

**Performance & Best Practices**
- Formatters created at module level (not in components)
- Efficient for high-frequency rendering (lists, tables)
- Integer math (cents) prevents floating point precision issues
- Safe parsing with default values prevents crashes
- TSDoc documentation provides IDE autocomplete

## Recent Changes

### April 15, 2026

- Added category, subcategory, and brand drawers for inline item creation
- Implemented searchable dropdowns using cmdk Command component
- Added drawer pattern for create forms with callback integration
- Made category field required in subcategory drawer with validation
- Added Command component wrapper for cmdk primitives
- Fixed formatting and linting across drawer components
- Added money formatting utilities to `lib/utils.ts`
- Restructured ai-skills.md into Principles, Patterns, Code Examples, Quick Reference
- Fixed pre-commit hook for empty JS/TS file lists
- Added ESLint disable for setState-in-effect
- Moved skeleton components outside render

### April 14, 2026

- Fixed React linting for components created during render
- Updated skeleton loading patterns
- Added error logging to API routes
```

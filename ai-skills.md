# AI Skills / Project Notes

## Project overview

- Next.js App Router project (`app/` directory)
- React 19
- Uses Mongoose (`mongoose`) for DB access
- Has API routes under `app/api/**/route.ts`

## UI / Admin area conventions

- Admin pages live under `app/admin/**` and are generally client components (`"use client"`).
- UI primitives are shadcn-style wrappers under `components/ui/**` (Radix UI components + Tailwind classes).
- Common admin list layout pattern:
  - Top section: title + optional action button
  - Controls row: search input (with `lucide-react` icon) + optional filters (`Select`)
  - Content: `Table` inside `rounded-md border bg-card`
- Example list pages:
  - Orders: `app/admin/orders/page.tsx`
  - Categories: `app/admin/categories/page.tsx`

## TanStack React Table usage

- Installed package:
  - `@tanstack/react-table`
- Orders list is implemented with TanStack Table state for:
  - Sorting (`SortingState` + `getSortedRowModel`)
  - Filtering:
    - Global search (`globalFilter` + `globalFilterFn`)
    - Status filter via column filters (`ColumnFiltersState`)
- Rendering pattern:
  - Headers: `table.getHeaderGroups()` + `flexRender`
  - Rows: `table.getRowModel()` + `flexRender`

## TanStack React Query setup

- Installed packages:
  - `@tanstack/react-query`
  - `@tanstack/react-query-devtools`

### Provider wiring

- Query client provider is implemented in:
  - `app/providers.tsx`
- Root layout wraps the app with the provider:
  - `app/layout.tsx` imports `Providers` from `./providers` and wraps existing providers

### Devtools

- React Query Devtools are enabled only in development:
  - `process.env.NODE_ENV === "development"`

### Default query options

- Config lives in `app/providers.tsx` (QueryClient construction)
- Current defaults:
  - `staleTime: 30_000`
  - `refetchOnWindowFocus: false`
  - `retry: 1`

## Existing global providers

- Auth provider:
  - `lib/auth-context.tsx`
- Data provider:
  - `lib/data-context.tsx`
- Provider composition in `app/layout.tsx`:
  - `Providers` (React Query)
  - `AuthProvider`
  - `DataProvider`

## DataContext notes

- Many admin pages use `useData()` from `lib/data-context.tsx` for list data (e.g. orders, categories).
- Data is initialized from `localStorage` and falls back to `initial*` datasets when not present.
- When wiring tables, prefer using TanStack Table filtering/sorting state instead of pre-filtering arrays in render.

## API routes (examples)

- Products API:
  - `app/api/products/route.ts`
  - `app/api/products/[id]/route.ts`
  - `app/api/products/search/route.ts`

## Suggested patterns for API fetching

- Put client-side fetch functions in a small API layer (e.g. `lib/api/*.ts`) and consume via React Query hooks.
- Use stable query keys:
  - List: `["products", params]`
  - Detail: `["products", id]`
- Use mutations for create/update/delete and invalidate relevant keys afterward.

## Install / troubleshooting

- If TypeScript shows module-not-found errors for TanStack packages, run:
  - `pnpm install` (or `npm install` / `yarn` depending on the package manager)

## Package manager

- Repo includes `pnpm-lock.yaml` and `pnpm-workspace.yaml`, so `pnpm` is the expected package manager.

## Product Management System

### Shared Component Architecture

- Product add/edit forms use shared components under `components/admin/products/`:
  - `product-schema.ts` - Zod validation schema with B2B/B2C pricing fields
  - `general-info-section.tsx` - Product name, slug, description fields
  - `pricing-section.tsx` - Cost price, B2C price, B2B price, SKU/UPC fields
  - `inventory-section.tsx` - Stock quantity management
  - `taxation-section.tsx` - HSN code and GST percentage
  - `categorization-section.tsx` - Category, subcategory, brand selection
  - `barcode-section.tsx` - Barcode image upload
  - `product-image-uploader.tsx` - Shared hook and components for image/video upload
  - `profit-margin-calculator.tsx` - Real-time profit/margin analysis

### Product Schema Fields

- Standard fields: name, slug, description, sku, stock, hsn, tax, upc, barcode
- Pricing structure:
  - `costPrice` - Base cost of the product
  - `b2cPrice` - Business-to-customer selling price (maps to `price` for backward compatibility)
  - `b2bPrice` - Business-to-business selling price
  - `b2bMinQty` - Minimum quantity for B2B pricing
- Relations: category, subcategory, brand (populated objects)
- Media: images (array, max 5), videoUrl (optional)
- Status: boolean active flag

### Image/Video Upload Pattern

- Uses presigned URLs via `/api/uploads/presign` endpoint
- Uploads to R2/S3 storage
- Shared hook `useProductImageUploader` handles:
  - File selection and validation
  - Base64 preview generation
  - Upload coordination
  - Add/edit mode differences

## Error Logging System

### Server-Side Error Logging

- Centralized error logging via `lib/server/errorlogs.ts`
- Function `logServerError()` logs errors with:
  - errorType: "validation", "duplicate", "server", "network", "unknown"
  - errorMessage
  - endpoint
  - method
  - requestData
  - stackTrace (optional)
- Used across all API routes (products, categories, brands, enquiries, auth, uploads)
- Non-blocking in logout/auth-me routes (void async)

### Client-Side Error Logging

- `hooks/api/useProducts.ts` includes `logError()` helper
- Logs to `/api/error-logs` endpoint
- Categorizes errors as duplicate vs server based on message content
- Provides user-friendly toast messages for common errors (SKU/slug duplicates)

## API Route Patterns

### Standard Route Structure

- All API routes follow consistent error handling:
  1. Hoist `params` outside try/catch for error logging access (prevents nested await issues)
  2. For PUT/POST routes, hoist `parsedBody` outside try/catch to prevent "body stream already read" errors
  3. Try block with admin verification
  4. Catch AuthError with logging
  5. Catch general errors with logging
- Use `isValidObjectId()` for ID validation
- Serialize responses with consistent field inclusion

### Hoisting Pattern Example

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

### Duplicate Checking

- Products: Check SKU and slug uniqueness before create/update
- Categories/Brands: Check slug uniqueness
- Return 409 status with specific error message
- Log duplicate errors with `logServerError()`

### Pagination Pattern

- Products API supports pagination via `page` and `limit` query params
- Response includes `data` array and `pagination` object:
  - `total` - total matching records
  - `page` - current page
  - `limit` - items per page
  - `pages` - total pages
- Client-side: useProducts hook accepts `ProductsParams` interface

### Filtering Pattern

- Products API supports filtering by:
  - `search` - searches name, SKU, category name, subcategory name, brand name
  - `category` - filter by category ID or slug
  - `subcategory` - filter by subcategory ID or slug
  - `brand` - filter by brand ID or slug
- Converts string IDs to ObjectIds with fallback to slug lookup

## Dashboard Improvements

### Skeleton Loading

- Dashboard uses `DashboardSkeleton` component during data loading
- Products page uses `TableSkeleton` and `AnalyticsCardsSkeleton`
- Better UX than single spinner

### Data Structure

- Dashboard now handles paginated products data: `productsData?.data`
- Uses `pagination.total` for accurate counts
- Added subcategories to dashboard stats

## React Key Prop Best Practices

- Always use unique keys for list items
- Pattern: `key={item._id || item.id}` for robustness
- SelectItem components cannot have empty string values - use "none" or similar

## Git Hooks

- Pre-commit hook runs Prettier and ESLint on staged files
- Uses `xargs` to pass file list to prettier for efficient processing
- ESLint uses `|| true` to prevent blocking on warnings (non-blocking)
- Fixed to properly handle empty JS/TS file lists with `|| true` after grep
- Uses `git add $FILES` to stage formatted files after prettier/ESLint fixes
- Pre-push hook also exists (check `.husky/pre-push`)
- Pre-commit hook pattern:

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

## Subcategory System

- Separate Subcategory model from Category hierarchy
- Subcategory belongs to a Category (required reference)
- API routes: `app/api/subcategories/route.ts` and `app/api/subcategories/[id]/route.ts`
- React Query hook: `hooks/api/useSubcategories.ts`
- Admin pages: `app/admin/subcategories/page.tsx`, `add/page.tsx`, `edit/[id]/page.tsx`
- Subcategory field added to Product model and forms
- Subcategory filter added to products listing page

## CSS/Tailwind Notes

- Use `bg-gradient-to-br` for gradients (not `bg-linear-to-br` - this was a typo that was fixed)
- Badge styling: use `capitalize` instead of `uppercase` for better readability
- Common gradient pattern: `from-slate-50 to-slate-100 dark:from-slate-950 dark:to-slate-900`

## Recent UI Improvements

- Customer address badges changed from uppercase to capitalize
- Orders page gradient backgrounds fixed
- Login page gradient fixed
- Profile page gradient fixed
- "View on Store" button commented out on product detail page

## Sequential Subcategory Filtering

- CategorizationSection component implements sequential filtering between category and subcategory
- When category is selected, subcategory dropdown only shows subcategories belonging to that category
- When subcategory is selected, its parent category is automatically selected
- When category is changed, subcategory is reset if it doesn't belong to the new category
- Implementation in `components/admin/products/categorization-section.tsx`:
  - CategoryField accepts `onCategoryChange` callback
  - SubcategoryField accepts `selectedCategoryId` prop for filtering
  - CategorizationSection uses `form.watch("category")` to track changes
  - Auto-selects parent category when subcategory changes

## Product Image Uploader Hook

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

## Form Validation Error Handling

- Pattern for form validation errors in add/edit pages:

  ```typescript
  const onFormError = (errors: any) => {
    const firstError = Object.values(errors)[0] as any
    if (firstError?.message) {
      toast.error(firstError.message)
    } else {
      toast.error("Please fill in all required fields")
    }
  }

  <Button onClick={form.handleSubmit(onSubmit, onFormError)}>
  ```

- Used in both product add and edit pages
- Provides immediate feedback on validation failures
- Catches first error and displays as toast

## Pagination with Debounced Search

- Products page implements server-side pagination with debounced search
- State:
  - `page`, `limit` - pagination state
  - `searchQuery` - raw search input
  - `debouncedSearch` - 300ms debounced search value
  - `categoryFilter`, `subcategoryFilter`, `brandFilter` - filter state
- Debounce effect:
  ```typescript
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchQuery)
    }, 300)
    return () => clearTimeout(timer)
  }, [searchQuery])
  ```
- Auto-reset page when filters change using refs to track previous state (avoids stale closure issues):

  ```typescript
  const prevFiltersRef = useRef({
    debouncedSearch,
    categoryFilter,
    subcategoryFilter,
    brandFilter,
  })
  const pageRef = useRef(page)

  // Update pageRef when page state changes (for pagination controls)
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
      // Force a re-render to pick up the new page value
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setPage(1)
    }
  }, [debouncedSearch, categoryFilter, subcategoryFilter, brandFilter])
  ```

- Pagination UI with page numbers (max 5 visible) and prev/next buttons
- Uses `useProducts` hook with `ProductsParams` interface

## Skeleton Loading Pattern

- Skeleton components provide better UX than single spinners
- Dashboard: `DashboardSkeleton` with bento grid layout
- Products page:
  - `TableSkeleton` - table row skeletons matching column count (accepts `limit` prop)
  - `AnalyticsCardsSkeleton` - analytics card placeholders
- Pattern: Replace loading state with skeleton component, render actual content when data loads
- Skeleton components use `Skeleton` from `@/components/ui/skeleton`
- Skeleton components can accept props (e.g., `limit` for table row count) for dynamic rendering
- **Important**: Define skeleton components outside the component body to avoid re-creation on every render:

  ```typescript
  // ✅ Correct: Outside component body
  const DashboardSkeleton = () => (
    <div className="p-6 space-y-8">
      {/* Skeleton content */}
    </div>
  )

  export default function DashboardPage() {
    if (isLoading) return <DashboardSkeleton />
    // ...
  }

  // ❌ Incorrect: Inside component body (re-creates on every render)
  export default function DashboardPage() {
    const DashboardSkeleton = () => (
      <div className="p-6 space-y-8">
        {/* Skeleton content */}
      </div>
    )

    if (isLoading) return <DashboardSkeleton />
    // ...
  }
  ```

## Numeric Input Validation

- Product forms use text inputs instead of `type="number"` to avoid mobile number pad
- Numeric validation handled via regex in Zod schema:
  - `b2cPrice`: `/^\d+(\.\d{1,2})?$/` - validates decimal prices
  - `stock`: `/^\d+$/` - validates whole numbers
  - `tax`: `/^\d+(\.\d{1,2})?$/` - validates tax percentage
- Pattern: Remove `type="number"` attributes, add regex validation to schema
- Provides better UX while maintaining data integrity

## Form Section Organization

- Product forms use card-based section organization for better visual hierarchy
- Inventory (stock) separated into its own card instead of being grouped with pricing
- Pricing card renamed from "Pricing & Stock" to "Pricing" for clarity
- Each section is a reusable component for consistency between add/edit pages
- Pattern: Group related fields into logical sections with descriptive card titles

## Code Formatting Patterns

### Simplified Return Statements

- Use single-line return statements for simple responses to reduce visual noise
- Prefer `return NextResponse.json({ error: errorMessage }, { status: 500 })` over multi-line
- Multi-line returns only for complex responses or when adding comments
- Pattern applied consistently across all API routes

### Comment Conventions

- Add explanatory comments for non-obvious patterns (e.g., hoisting, refs)
- Use inline comments for quick explanations: `// Clean reference to hoisted id`
- Use block comments for detailed explanations:
  ```typescript
  // Hoist state container to preserve the request body for error logging.
  // This prevents the "body stream already read" fatal crash in the catch block.
  let parsedBody: Record<string, any> = {}
  ```
- Document ESLint disable directives when necessary: `// eslint-disable-next-line react-hooks/set-state-in-effect`

## Money Formatting Utilities

### Overview

- Centralized currency formatting utilities in `lib/utils.ts`
- Uses Indian Rupee (INR) with `en-IN` locale for consistent formatting
- All calculations use integer math (cents) to avoid floating point precision issues
- Lightweight implementation using `Intl.NumberFormat` (no heavy dependencies like Dinero.js)
- Full TSDoc documentation with examples for IDE autocomplete

### Type Definitions

```typescript
type CurrencyOptions = {
  showDecimals?: boolean
  compact?: boolean
}

type NumericValue = number | string
```

### Helper Functions (Private)

**`toNumber(value, defaultValue)`**

- Safely parses string or number to number
- Returns defaultValue if parsing fails
- Used internally by all formatters

**`toCents(amount)`**

- Converts rupees to cents (integer)
- Uses `Math.round()` for precision
- Prevents floating point errors in calculations

**`fromCents(cents)`**

- Converts cents back to rupees
- Used after integer math operations

### Available Functions

**`formatCurrency(amount, options)`**

- Basic currency formatting with ₹ symbol
- Options:
  - `showDecimals: false` - Removes decimal places (e.g., "₹1,234")
  - `compact: true` - Uses compact notation (e.g., "₹1.2K", "₹1.5M")
- Example: `formatCurrency(1234.56)` → "₹1,234.56"
- Example: `formatCurrency(1234, { showDecimals: false })` → "₹1,234"
- Example: `formatCurrency(1500000, { compact: true })` → "₹1.5M"

**`formatCurrencyWithSign(amount, options)`**

- Currency formatting with explicit +/- sign
- Useful for profits, losses, differences
- Example: `formatCurrencyWithSign(100)` → "+₹100.00"
- Example: `formatCurrencyWithSign(-50)` → "-₹50.00"
- Example: `formatCurrencyWithSign(1000, { compact: true })` → "+₹1K"

**`formatNumber(amount)`**

- Number formatting without currency symbol
- Uses Indian locale (comma separators)
- Example: `formatNumber(1234.56)` → "1,234.56"
- Example: `formatNumber("10000")` → "10,000"

**`formatPercentage(value, asDecimal)`**

- Percentage formatting
- `asDecimal: true` treats input as decimal (0.18 = 18%)
- Example: `formatPercentage(18)` → "18.00%"
- Example: `formatPercentage(0.18, true)` → "18.00%"

**`formatDifference(value1, value2, options)`**

- Calculates and formats difference between two values with sign
- Uses integer math to avoid floating point precision issues
- Automatically adds sign based on which value is larger
- Example: `formatDifference(100, 50)` → "+₹50.00"
- Example: `formatDifference(50, 100)` → "-₹50.00"
- Example: `formatDifference(1000, 800, { showDecimals: false })` → "+₹200"

**`formatDiscount(originalPrice, discountedPrice)`**

- Calculates and formats discount percentage
- Uses integer math to avoid floating point precision issues
- Returns 0% if discounted price is higher than original (price increase)
- Example: `formatDiscount(100, 80)` → "20.0%"
- Example: `formatDiscount(100, 120)` → "0%" (no negative discount)
- Example: `formatDiscount(0, 50)` → "0%" (handles zero original)

**`formatProfitMargin(costPrice, sellingPrice)`**

- Calculates and formats profit margin percentage
- Uses integer math to avoid floating point precision issues
- Formula: `((Selling Price - Cost Price) / Cost Price) * 100`
- Example: `formatProfitMargin(100, 125)` → "25.00%"
- Example: `formatProfitMargin(100, 80)` → "-20.00%" (loss)
- Example: `formatProfitMargin(0, 50)` → "0%" (handles zero cost)

**`formatMarkup(costPrice, sellingPrice)`**

- Calculates and formats markup percentage
- Uses integer math to avoid floating point precision issues
- Formula: `((Selling Price - Cost Price) / Cost Price) * 100`
- Example: `formatMarkup(100, 125)` → "25.00%"
- Example: `formatMarkup(100, 80)` → "-20.00%" (negative markup)
- Example: `formatMarkup(0, 50)` → "0%" (handles zero cost)

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

// Product price display
<span>{formatCurrency(product.price)}</span>
<span>{formatCurrency(product.price, { showDecimals: false })}</span>

// Profit/Loss display with color coding
<span className={profit >= 0 ? "text-green-600" : "text-red-600"}>
  {formatCurrencyWithSign(profit)}
</span>

// Price comparison
<span>{formatDifference(b2cPrice, b2bPrice)}</span>

// Discount badge
<Badge>{formatDiscount(originalPrice, salePrice)} OFF</Badge>

// Profit margin in analytics
<div>Margin: {formatProfitMargin(costPrice, sellingPrice)}</div>

// Markup in product details
<div>Markup: {formatMarkup(costPrice, sellingPrice)}</div>

// Percentage display
<div>Tax: {formatPercentage(product.tax)}</div>
<div>Commission: {formatPercentage(0.15, true)}</div>

// Number formatting (no currency)
<div>Quantity: {formatNumber(quantity)}</div>
```

### Performance & Best Practices

- Formatters are created once at module level (not inside components)
- Avoids re-creation on every render
- Efficient for high-frequency rendering (lists, tables)
- All currency calculations use integer math (cents) to prevent floating point precision issues
- Safe parsing with default values prevents crashes on invalid input
- Full TSDoc documentation provides IDE autocomplete and hover information

# 🚀 Production-Ready Auth + Cart Architecture Fix Plan

## PHASE 1: Auth Provider Stabilization (CRITICAL)

### Step 1.1: Add Hydration Flag

**File:** `components/auth/auth-provider.tsx`

**Change:**
```typescript
interface AuthContextType {
  user: AuthUser | null
  loading: boolean
  isHydrated: boolean  // ✅ NEW: Indicates auth has been checked
  isAuthenticated: boolean
  signOut: () => Promise<void>
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  loading: true,
  isHydrated: false,  // ✅ NEW
  isAuthenticated: false,
  signOut: async () => {},
})
```

**Initialization Logic:**
```typescript
export function AuthProvider({ children }: AuthProviderProps) {
  const [user, setUser] = useState<AuthUser | null>(null)
  const [loading, setLoading] = useState(true)
  const [isHydrated, setIsHydrated] = useState(false)  // ✅ NEW

  // ... existing code ...

  useEffect(() => {
    const initializeSession = async () => {
      setLoading(true)  // ✅ Explicitly set loading

      const { data: { session } } = await supabase.auth.getSession()

      if (session?.user) {
        await loadUserProfile(session.user.id)
      }

      setLoading(false)
      setIsHydrated(true)  // ✅ Mark as hydrated
    }

    initializeSession()
  }, [loadUserProfile, supabase])

  // ... onAuthStateChange ...

  return (
    <AuthContext.Provider value={{
      user,
      loading,
      isHydrated,  // ✅ NEW
      isAuthenticated: !!user,
      signOut,
    }}>
      {children}
    </AuthContext.Provider>
  )
}
```

**Why This Fixes Issues:**
- Components can now distinguish between "initializing" vs "confirmed guest"
- Prevents premature cart initialization
- Eliminates hydration mismatches

---

### Step 1.2: Add Auth State Enum (Advanced)

**For Even Better Clarity:**
```typescript
enum AuthState {
  INITIALIZING = 'initializing',    // Getting session
  AUTHENTICATED = 'authenticated',  // User loaded
  GUEST = 'guest',                  // No session, confirmed
  ERROR = 'error',                  // Auth failed
}

interface AuthContextType {
  user: AuthUser | null
  authState: AuthState  // ✅ Single source of truth
  isAuthenticated: boolean
  signOut: () => Promise<void>
}
```

**Usage in Components:**
```typescript
const { authState, user } = useAuth()

if (authState === AuthState.INITIALIZING) {
  return <Skeleton />
}

if (authState === AuthState.GUEST) {
  return <SignInButton />
}

return <UserMenu user={user} />
```

**Why This Is Better:**
- No ambiguity about auth state
- Impossible states become impossible
- Type-safe state transitions

---

## PHASE 2: Cart Initialization Guard (CRITICAL)

### Step 2.1: Wait for Auth Hydration

**File:** `components/cart/cart-provider.tsx`

**Change:**
```typescript
// ❌ OLD:
useEffect(() => {
  if (!loading) {
    initializeCartWithAuth()
  }
}, [loading, initializeCartWithAuth])

// ✅ NEW:
useEffect(() => {
  // Don't initialize until auth is fully hydrated
  if (!loading && isHydrated) {
    initializeCartWithAuth()
  }
}, [loading, isHydrated, initializeCartWithAuth])
```

**Why This Works:**
- Cart waits for auth to be **fully resolved**
- No more race conditions
- Correct cart source selected on first load

---

### Step 2.2: Prevent Re-initialization if Already Loaded

**File:** `lib/stores/cart-store.ts`

**Change:**
```typescript
initializeCart: async (userId?: string) => {
  const { isInitialized, isLoading, items } = get()

  // ✅ Guard: Don't reinitialize if already done
  if (isInitialized && !isLoading) {
    console.log('[Cart] Already initialized, skipping')
    return
  }

  // ✅ Prevent concurrent initializations
  if (isLoading) {
    console.log('[Cart] Already loading, skipping')
    return
  }

  set({ isLoading: true })

  try {
    const loadedItems = userId
      ? await loadCartFromSupabase(userId)
      : loadGuestCartFromLocalStorage()

    // ✅ Only update if we got valid data
    if (loadedItems !== null) {
      set({
        items: loadedItems,
        isInitialized: true,
        isLoading: false
      })
    }
  } catch (error) {
    console.error('[Cart] Initialization failed:', error)
    // ✅ Keep existing items on error
    set({ isLoading: false })
  }
}
```

**Why This Prevents Data Loss:**
- Won't clear cart if already initialized
- Prevents concurrent loads
- Preserves items on error

---

## PHASE 3: Smart Guest → User Cart Merge

### Step 3.1: Implement Proper Merge Logic

**File:** `components/cart/cart-provider.tsx`

**New Helper Function:**
```typescript
const mergeCartItems = (guestItems: CartItem[], userItems: CartItem[]): CartItem[] => {
  const merged = [...userItems]

  for (const guestItem of guestItems) {
    const existingIndex = merged.findIndex(
      item => item.productId === guestItem.productId &&
              item.variantId === guestItem.variantId
    )

    if (existingIndex >= 0) {
      // Item exists: Add quantities
      merged[existingIndex].quantity += guestItem.quantity
      merged[existingIndex].totalPrice =
        merged[existingIndex].pricePerUnit * merged[existingIndex].quantity
    } else {
      // New item: Add to cart
      merged.push(guestItem)
    }
  }

  return merged
}
```

**Updated Migration Logic:**
```typescript
if (isNewLogin && !hasMigratedRef.current) {
  const guestCartItems = loadGuestCartFromLocalStorage()

  if (guestCartItems.length > 0) {
    try {
      // ✅ Load existing user cart FIRST
      const existingUserCart = await loadCartFromSupabase(userId)

      // ✅ Merge instead of replace
      const mergedCart = mergeCartItems(guestCartItems, existingUserCart)

      // ✅ Save merged result
      await saveCartToSupabase(mergedCart, userId, { maxRetries: 3 })

      // ✅ Update Zustand state with merged cart
      setState({ items: mergedCart, isInitialized: true })

      // ✅ Clear guest cart
      clearGuestCartFromLocalStorage()

      // ✅ Show user notification
      toast.success(`Cart synced! ${guestCartItems.length} items added.`)

    } catch (error) {
      console.error('[Cart] Migration failed:', error)
      toast.error('Failed to sync cart. Items saved locally.')
    }
  }

  hasMigratedRef.current = true
}
```

**Why This Prevents Data Loss:**
- Existing Supabase items preserved
- Guest items added (quantities merged if duplicate)
- User sees transparent operation
- Fallback: Guest items stay in localStorage if migration fails

---

### Step 3.2: Persist Migration Status in Supabase

**Instead of `useRef` (resets on unmount):**

**Option A: Session Storage (Simple)**
```typescript
const getMigrationKey = (userId: string) => `cart-migrated-${userId}`

const hasMigrated = sessionStorage.getItem(getMigrationKey(userId)) === 'true'

if (isNewLogin && !hasMigrated) {
  // ... migration logic ...

  sessionStorage.setItem(getMigrationKey(userId), 'true')
}
```

**Option B: Supabase User Metadata (Robust)**
```typescript
// Check user metadata
const { data: { user } } = await supabase.auth.getUser()
const cartMigratedAt = user?.user_metadata?.cart_migrated_at

const now = Date.now()
const migrationWindow = 60 * 60 * 1000  // 1 hour

if (isNewLogin && (!cartMigratedAt || now - cartMigratedAt > migrationWindow)) {
  // ... migration logic ...

  // Mark as migrated
  await supabase.auth.updateUser({
    data: { cart_migrated_at: now }
  })
}
```

**Why This Is Better:**
- Survives component unmounts
- Prevents duplicate migrations across tabs
- Can expire after X hours (allow re-migration if needed)

---

## PHASE 4: Debounced Cart Sync

### Step 4.1: Add Debounce to Prevent Race Conditions

**File:** `lib/stores/cart-store.ts`

**Install Dependency:**
```bash
npm install lodash.debounce
# or
npm install use-debounce
```

**Implement Debounced Sync:**
```typescript
import { debounce } from 'lodash'

// Create debounced sync function (300ms delay)
const debouncedSyncToSupabase = debounce(
  async (items: CartItem[], userId: string) => {
    await saveCartToSupabase(items, userId)
  },
  300,  // Wait 300ms after last change
  { trailing: true }
)

const debouncedSyncToLocalStorage = debounce(
  (items: CartItem[]) => {
    saveGuestCartToLocalStorage(items)
  },
  300,
  { trailing: true }
)

// Updated syncCart method
syncCart: (userId?: string) => {
  const { items } = get()

  if (userId) {
    // ✅ Debounced: Multiple rapid changes = single Supabase write
    debouncedSyncToSupabase(items, userId)
  } else {
    // ✅ Debounced: Reduces localStorage thrashing
    debouncedSyncToLocalStorage(items)
  }
}
```

**Why This Prevents Issues:**
- User clicks "Add to Cart" 3 times quickly → Only 1 Supabase save
- Reduces database load
- Prevents race conditions
- Last state always wins (no data loss)

---

### Step 4.2: Optimistic Updates with Rollback

**Advanced Pattern:**
```typescript
addItem: (product, variant, quantity, userId) => {
  const newItem = {
    id: generateId(),
    productId: product.id,
    // ... other fields ...
  }

  // ✅ Optimistic update: Show immediately
  set({ items: [...get().items, newItem] })

  // ✅ Sync to backend (debounced)
  get().syncCart(userId)

  // ✅ Optional: Verify sync succeeded
  get().verifySyncStatus(userId)
}

verifySyncStatus: async (userId?: string) => {
  if (!userId) return

  try {
    const serverCart = await loadCartFromSupabase(userId)
    const localCart = get().items

    // ✅ Check if server and local match
    if (JSON.stringify(serverCart) !== JSON.stringify(localCart)) {
      console.warn('[Cart] Sync mismatch detected, reloading from server')
      set({ items: serverCart })
    }
  } catch (error) {
    console.error('[Cart] Verification failed:', error)
  }
}
```

---

## PHASE 5: Realtime Subscription Conflict Resolution

### Step 5.1: Smart Merge on Realtime Updates

**File:** `components/cart/cart-provider.tsx`

**Updated Realtime Handler:**
```typescript
channel
  .on('postgres_changes', {
    event: '*',
    schema: 'public',
    table: 'carts',
    filter: `user_id=eq.${userId}`
  }, async (payload) => {
    console.log('[Cart] Realtime update received:', payload)

    const currentItems = useCartStore.getState().items
    const freshCart = await loadCartFromSupabase(userId)

    // ✅ Only update if server has newer data
    const currentTimestamp = useCartStore.getState().lastSyncedAt || 0
    const serverTimestamp = new Date(payload.new.updated_at).getTime()

    if (serverTimestamp > currentTimestamp) {
      // ✅ Merge instead of replace
      const mergedItems = mergeCartItems(freshCart, currentItems)

      useCartStore.setState({
        items: mergedItems,
        lastSyncedAt: serverTimestamp
      })

      console.log('[Cart] Synced from another tab')
    } else {
      console.log('[Cart] Ignoring stale update')
    }
  })
```

**Add Timestamp Tracking:**
```typescript
interface CartStore {
  items: CartItem[]
  lastSyncedAt: number  // ✅ NEW: Track last sync time
  // ... other fields ...
}

// Update on every successful sync
syncCart: async (userId?: string) => {
  const { items } = get()

  if (userId) {
    await saveCartToSupabase(items, userId)
    set({ lastSyncedAt: Date.now() })  // ✅ Update timestamp
  } else {
    saveGuestCartToLocalStorage(items)
  }
}
```

**Why This Prevents Conflicts:**
- Only newer server changes applied
- Local changes not overwritten by stale data
- Multi-tab sync without data loss

---

## PHASE 6: Loading States & UX Improvements

### Step 6.1: Comprehensive Loading States

**File:** `components/common/header.tsx`

**Better Loading Handling:**
```typescript
const { user, authState, isAuthenticated } = useAuth()

// ✅ Show skeleton only during INITIAL load
if (authState === AuthState.INITIALIZING) {
  return (
    <div className="flex items-center gap-2">
      <Skeleton className="h-8 w-8 rounded-full" />
      <Skeleton className="h-4 w-24" />
    </div>
  )
}

// ✅ No flicker on token refresh (authState stays AUTHENTICATED)
if (authState === AuthState.AUTHENTICATED && user) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger>
        <Avatar>
          <AvatarFallback>{user.full_name?.[0] || 'U'}</AvatarFallback>
        </Avatar>
      </DropdownMenuTrigger>
      {/* ... menu items ... */}
    </DropdownMenu>
  )
}

// ✅ Confirmed guest state
return <SignInButton />
```

**Why This Eliminates Flicker:**
- Skeleton only shown on FIRST load
- Token refresh doesn't change `authState` (stays AUTHENTICATED)
- No UI flash on tab switch

---

### Step 6.2: Cart Loading Indicator

**File:** `components/cart/cart-dropdown.tsx`

**Show Loading State:**
```typescript
const { items, isLoading, isInitialized } = useCartStore()
const { isHydrated } = useAuth()

// ✅ Wait for both auth and cart to initialize
if (!isHydrated || !isInitialized) {
  return (
    <div className="p-4 text-center">
      <Spinner />
      <p className="text-sm text-gray-500 mt-2">Loading cart...</p>
    </div>
  )
}

if (items.length === 0) {
  return <EmptyCartMessage />
}

return <CartItemsList items={items} />
```

**Why This Improves UX:**
- User knows cart is loading
- No "empty cart" flash before items appear
- Clear feedback during initialization

---

## PHASE 7: SSR/Hydration Fix

### Step 7.1: Use Supabase SSR Helpers

**File:** `components/auth/auth-provider.tsx`

**For Server Components:**
```typescript
import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'

export async function createServerSupabaseClient() {
  const cookieStore = cookies()

  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return cookieStore.get(name)?.value
        },
      },
    }
  )
}
```

**For Client Components (IMPROVED):**
```typescript
import { createBrowserClient } from '@supabase/ssr'

export function createBrowserSupabaseClient() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )
}
```

**Why This Matters:**
- Server and client use consistent cookie handling
- No hydration mismatches
- Session properly shared between RSC and client components

---

### Step 7.2: Middleware for Session Refresh

**File:** `middleware.ts`

**Add This:**
```typescript
import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

export async function middleware(request: NextRequest) {
  let response = NextResponse.next({
    request: {
      headers: request.headers,
    },
  })

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return request.cookies.get(name)?.value
        },
        set(name: string, value: string, options: CookieOptions) {
          response.cookies.set({
            name,
            value,
            ...options,
          })
        },
        remove(name: string, options: CookieOptions) {
          response.cookies.set({
            name,
            value: '',
            ...options,
          })
        },
      },
    }
  )

  // ✅ Refresh session on every request
  await supabase.auth.getSession()

  return response
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}
```

**Why This Fixes Tab Switch Issues:**
- Session automatically refreshed on navigation
- Cookies kept in sync
- No manual page reload needed

---

## PHASE 8: Error Boundaries & Fallbacks

### Step 8.1: Cart Error Boundary

**File:** `components/cart/cart-error-boundary.tsx`

**Create This:**
```typescript
'use client'

import { Component, ReactNode } from 'react'

interface Props {
  children: ReactNode
  fallback?: ReactNode
}

interface State {
  hasError: boolean
  error: Error | null
}

export class CartErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props)
    this.state = { hasError: false, error: null }
  }

  static getDerivedStateFromError(error: Error) {
    return { hasError: true, error }
  }

  componentDidCatch(error: Error, errorInfo: any) {
    console.error('[CartErrorBoundary]', error, errorInfo)
  }

  render() {
    if (this.state.hasError) {
      return this.props.fallback || (
        <div className="p-4 text-center">
          <p className="text-red-600">Cart failed to load</p>
          <button
            onClick={() => this.setState({ hasError: false })}
            className="mt-2 text-sm text-blue-600"
          >
            Retry
          </button>
        </div>
      )
    }

    return this.props.children
  }
}
```

**Usage:**
```typescript
<CartErrorBoundary>
  <CartProvider>
    {children}
  </CartProvider>
</CartErrorBoundary>
```

---

## SUMMARY: Implementation Order

### 🔴 **CRITICAL (Do First)**
1. ✅ Add `isHydrated` flag to AuthProvider (Phase 1.1)
2. ✅ Update CartProvider to wait for `isHydrated` (Phase 2.1)
3. ✅ Add re-initialization guard to cart store (Phase 2.2)
4. ✅ Implement cart merge logic (Phase 3.1)

### 🟡 **HIGH PRIORITY (Do Next)**
5. ✅ Add debounced cart sync (Phase 4.1)
6. ✅ Persist migration status (Phase 3.2)
7. ✅ Fix Realtime conflict resolution (Phase 5.1)
8. ✅ Improve loading states (Phase 6.1, 6.2)

### 🟢 **MEDIUM PRIORITY (Improvements)**
9. ✅ Add SSR middleware (Phase 7.2)
10. ✅ Add error boundaries (Phase 8.1)
11. ✅ Add AuthState enum (Phase 1.2 - optional but recommended)
12. ✅ Add optimistic updates with verification (Phase 4.2)

---

## Testing Checklist

After implementing fixes, test these scenarios:

### Auth Flow
- [ ] Fresh page load (guest)
- [ ] Sign in from guest
- [ ] Sign out
- [ ] Page refresh while logged in
- [ ] Tab switch while logged in
- [ ] Network offline → online

### Cart Flow
- [ ] Add item as guest
- [ ] Add item as logged-in user
- [ ] Guest cart migrates on login
- [ ] Existing user cart preserved on login
- [ ] Multi-tab cart sync
- [ ] Rapid "Add to Cart" clicks (no duplicates)
- [ ] Cart persists on page refresh
- [ ] Cart clears on sign out

### Edge Cases
- [ ] Login with items in both guest cart AND Supabase cart
- [ ] Supabase unavailable (cart falls back to localStorage)
- [ ] Network delay during cart save
- [ ] Concurrent cart operations from multiple tabs
- [ ] Sign out → sign in as different user

---

## Metrics to Track (Production)

```typescript
// Add to cart store
interface CartMetrics {
  initTime: number          // Time to initialize cart
  syncErrors: number        // Failed syncs
  mergeConflicts: number    // Times merge ran
  realtimeUpdates: number   // Realtime events received
}

// Log to analytics
analytics.track('cart_initialized', {
  userId: user?.id,
  itemCount: items.length,
  initTime: performance.now() - startTime,
  source: userId ? 'supabase' : 'localStorage'
})
```

---

**Expected Outcome:**
✅ Zero cart flickers
✅ Zero data loss on login/logout
✅ Consistent auth state across tabs
✅ Fast, reliable cart operations
✅ Production-ready stability

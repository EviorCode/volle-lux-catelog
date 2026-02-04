# 🚀 Quick Start: Auth + Cart Fixes

## 📋 TL;DR - Root Causes

1. **Cart initializes before auth hydrates** → Cart source chosen incorrectly
2. **No `isHydrated` flag** → Components can't distinguish "loading" vs "guest"
3. **Cart re-initializes on every auth change** → Existing items cleared
4. **Guest cart overwrites user cart on login** → Data loss
5. **No debouncing on cart sync** → Race conditions
6. **Realtime updates overwrite local changes** → Multi-tab conflicts

---

## 🔧 Minimal Fixes (Production-Ready)

### Fix #1: Add `isHydrated` to Auth (15 minutes)

**File:** `components/auth/auth-provider.tsx`

```typescript
interface AuthContextType {
  user: AuthUser | null
  loading: boolean
  isHydrated: boolean  // ⬅️ ADD THIS
  isAuthenticated: boolean
  signOut: () => Promise<void>
}

export function AuthProvider({ children }: AuthProviderProps) {
  const [user, setUser] = useState<AuthUser | null>(null)
  const [loading, setLoading] = useState(true)
  const [isHydrated, setIsHydrated] = useState(false)  // ⬅️ ADD THIS

  useEffect(() => {
    const initializeSession = async () => {
      setLoading(true)

      const { data: { session } } = await supabase.auth.getSession()

      if (session?.user) {
        await loadUserProfile(session.user.id)
      }

      setLoading(false)
      setIsHydrated(true)  // ⬅️ ADD THIS
    }

    initializeSession()
  }, [loadUserProfile, supabase])

  // In onAuthStateChange handler, also set isHydrated = true

  return (
    <AuthContext.Provider value={{
      user,
      loading,
      isHydrated,  // ⬅️ ADD THIS
      isAuthenticated: !!user,
      signOut,
    }}>
      {children}
    </AuthContext.Provider>
  )
}
```

---

### Fix #2: Wait for Hydration in CartProvider (5 minutes)

**File:** `components/cart/cart-provider.tsx`

```typescript
export function CartProvider({ children }: CartProviderProps) {
  const { user, isAuthenticated, loading, isHydrated } = useAuth()  // ⬅️ GET isHydrated

  // ❌ BEFORE:
  // useEffect(() => {
  //   if (!loading) {
  //     initializeCartWithAuth()
  //   }
  // }, [loading, initializeCartWithAuth])

  // ✅ AFTER:
  useEffect(() => {
    if (!loading && isHydrated) {  // ⬅️ ADD isHydrated CHECK
      initializeCartWithAuth()
    }
  }, [loading, isHydrated, initializeCartWithAuth])  // ⬅️ ADD isHydrated DEPENDENCY

  // ... rest of code ...
}
```

---

### Fix #3: Prevent Re-initialization (10 minutes)

**File:** `lib/stores/cart-store.ts`

```typescript
initializeCart: async (userId?: string) => {
  const { isInitialized, isLoading } = get()

  // ✅ ADD THESE GUARDS:
  if (isInitialized && !isLoading) {
    console.log('[Cart] Already initialized, skipping')
    return  // ⬅️ Don't reinitialize if already done
  }

  if (isLoading) {
    console.log('[Cart] Already loading, skipping')
    return  // ⬅️ Prevent concurrent initializations
  }

  set({ isLoading: true })

  try {
    const loadedItems = userId
      ? await loadCartFromSupabase(userId)
      : loadGuestCartFromLocalStorage()

    set({
      items: loadedItems,
      isInitialized: true,
      isLoading: false
    })
  } catch (error) {
    console.error('[Cart] Init failed:', error)
    set({ isLoading: false })  // ⬅️ Keep existing items on error
  }
}
```

---

### Fix #4: Merge Guest + User Cart (20 minutes)

**File:** `components/cart/cart-provider.tsx`

**Add helper function:**
```typescript
const mergeCartItems = (guestItems: CartItem[], userItems: CartItem[]): CartItem[] => {
  const merged = [...userItems]  // Start with user's existing cart

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

**Update migration logic:**
```typescript
const initializeCartWithAuth = useCallback(async () => {
  // Detect login
  const isNewLogin = userId && !prevUserIdRef.current
  const isLogout = !userId && prevUserIdRef.current

  if (isNewLogin && !hasMigratedRef.current) {
    const guestCartItems = loadGuestCartFromLocalStorage()

    if (guestCartItems.length > 0) {
      try {
        // ✅ LOAD USER CART FIRST
        const existingUserCart = await loadCartFromSupabase(userId)

        // ✅ MERGE INSTEAD OF REPLACE
        const mergedCart = mergeCartItems(guestCartItems, existingUserCart)

        // ✅ SAVE MERGED RESULT
        await saveCartToSupabase(mergedCart, userId, { maxRetries: 3 })

        // ✅ UPDATE STATE WITH MERGED CART
        setState({ items: mergedCart, isInitialized: true })

        // ✅ CLEAR GUEST CART
        clearGuestCartFromLocalStorage()

        console.log(`[Cart] Merged ${guestCartItems.length} guest items with ${existingUserCart.length} user items`)
      } catch (error) {
        console.error('[Cart] Migration failed:', error)
      }
    }

    hasMigratedRef.current = true
  }

  // ... rest of initialization ...
}, [userId, initializeCart])
```

---

### Fix #5: Debounce Cart Sync (15 minutes)

**Install:**
```bash
npm install lodash.debounce @types/lodash.debounce
```

**File:** `lib/stores/cart-store.ts`

```typescript
import debounce from 'lodash.debounce'

// ✅ CREATE DEBOUNCED FUNCTIONS (outside store)
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

// ✅ UPDATE SYNC METHOD
syncCart: (userId?: string) => {
  const { items } = get()

  if (userId) {
    debouncedSyncToSupabase(items, userId)  // ⬅️ DEBOUNCED
  } else {
    debouncedSyncToLocalStorage(items)  // ⬅️ DEBOUNCED
  }
}
```

---

### Fix #6: Smart Realtime Updates (15 minutes)

**File:** `components/cart/cart-provider.tsx`

```typescript
// ✅ ADD TIMESTAMP TRACKING
interface CartStore {
  items: CartItem[]
  lastSyncedAt: number  // ⬅️ ADD THIS
  // ... other fields ...
}

// ✅ UPDATE SYNC TO SET TIMESTAMP
syncCart: async (userId?: string) => {
  const { items } = get()

  if (userId) {
    await saveCartToSupabase(items, userId)
    set({ lastSyncedAt: Date.now() })  // ⬅️ ADD THIS
  } else {
    saveGuestCartToLocalStorage(items)
  }
}

// ✅ UPDATE REALTIME HANDLER
channel
  .on('postgres_changes', {
    event: '*',
    schema: 'public',
    table: 'carts',
    filter: `user_id=eq.${userId}`
  }, async (payload) => {
    const currentTimestamp = useCartStore.getState().lastSyncedAt || 0
    const serverTimestamp = new Date(payload.new.updated_at).getTime()

    // ✅ ONLY UPDATE IF SERVER IS NEWER
    if (serverTimestamp > currentTimestamp) {
      const freshCart = await loadCartFromSupabase(userId)

      useCartStore.setState({
        items: freshCart,
        lastSyncedAt: serverTimestamp
      })

      console.log('[Cart] Synced from another tab')
    } else {
      console.log('[Cart] Ignoring stale update')
    }
  })
```

---

### Fix #7: Better Loading States (10 minutes)

**File:** `components/common/header.tsx`

```typescript
const { user, loading, isHydrated } = useAuth()

// ✅ SHOW SKELETON ONLY ON INITIAL LOAD
if (!isHydrated) {
  return <Skeleton className="h-8 w-8 rounded-full" />
}

// ✅ NO FLICKER ON TOKEN REFRESH
if (user) {
  return <UserMenu user={user} />
}

return <SignInButton />
```

**File:** `components/cart/cart-dropdown.tsx`

```typescript
const { items, isInitialized } = useCartStore()
const { isHydrated } = useAuth()

// ✅ WAIT FOR BOTH AUTH AND CART
if (!isHydrated || !isInitialized) {
  return (
    <div className="p-4 text-center">
      <Spinner />
      <p>Loading cart...</p>
    </div>
  )
}

if (items.length === 0) {
  return <EmptyCartMessage />
}

return <CartItemsList items={items} />
```

---

## 📁 Recommended Folder Structure

```
lib/
├── supabase/
│   ├── client.ts                    # Browser client
│   ├── server.ts                    # Server client (NEW)
│   └── middleware.ts                # Session refresh (NEW)
├── stores/
│   └── cart-store.ts                # Zustand cart store (UPDATED)
└── utils/
    └── cart-helpers.ts              # mergeCartItems(), etc. (NEW)

components/
├── auth/
│   ├── auth-provider.tsx            # Auth context (UPDATED)
│   └── auth-error-boundary.tsx      # Error boundary (NEW)
├── cart/
│   ├── cart-provider.tsx            # Cart initialization (UPDATED)
│   ├── cart-error-boundary.tsx      # Error boundary (NEW)
│   └── cart-dropdown.tsx            # Cart UI (UPDATED)
└── common/
    └── header.tsx                   # User menu (UPDATED)

services/
├── auth/
│   ├── auth.service.ts              # Client auth methods
│   └── auth-server.service.ts       # Server auth methods
└── cart/
    └── cart.service.ts              # Supabase cart operations (UPDATED)

middleware.ts                         # Session refresh (NEW)
```

---

## 🧪 Testing Script

```typescript
// test/cart-auth-flow.test.ts

describe('Auth + Cart Flow', () => {
  it('initializes guest cart on fresh load', async () => {
    // 1. Clear all storage
    // 2. Load page
    // 3. Verify: isHydrated = true, user = null
    // 4. Add item to cart
    // 5. Verify: localStorage has item
  })

  it('migrates guest cart on login', async () => {
    // 1. Add items as guest
    // 2. Sign in
    // 3. Verify: items moved to Supabase
    // 4. Verify: localStorage cleared
  })

  it('merges guest + user cart on login', async () => {
    // 1. Sign in, add items to cart (User Cart)
    // 2. Sign out
    // 3. Add different items as guest (Guest Cart)
    // 4. Sign in again
    // 5. Verify: Both carts merged, no data loss
  })

  it('syncs cart across tabs', async () => {
    // 1. Open 2 tabs, sign in both
    // 2. Add item in Tab 1
    // 3. Verify: Tab 2 cart updates via Realtime
  })

  it('handles rapid add-to-cart clicks', async () => {
    // 1. Click "Add to Cart" 5 times quickly
    // 2. Verify: Only 1 Supabase save (debounced)
    // 3. Verify: Cart has correct quantity
  })

  it('preserves cart on page refresh', async () => {
    // 1. Sign in, add items
    // 2. Hard refresh page
    // 3. Verify: Cart items still present
    // 4. Verify: No flicker during load
  })

  it('clears cart on sign out', async () => {
    // 1. Sign in with items in cart
    // 2. Sign out
    // 3. Verify: Cart empty
    // 4. Verify: Supabase cart cleared
  })
})
```

---

## 📊 Before & After Comparison

### Before (Current Issues)

```
Page Load
  ↓
Auth: loading = true, user = null
Cart: Wait for auth...
  ↓
Auth: loading = false, user = null (guest detected)
Cart: initializeCart() → Load guest cart
  ↓
✅ User sees cart items
  ↓
[200ms later]
Auth: Session found! loading = true
  ↓
Cart: initializeCart() CALLED AGAIN
Cart: isInitialized = false (CLEARS ITEMS)
  ↓
❌ User sees empty cart (FLICKER)
  ↓
Cart: Load from Supabase
  ↓
✅ User sees cart items again (but annoyed by flicker)
```

### After (With Fixes)

```
Page Load
  ↓
Auth: loading = true, isHydrated = false, user = null
Cart: Wait for isHydrated...
  ↓
Auth: Check session... (takes 200ms)
  ↓
Auth: Session found! loading = false, isHydrated = true, user = {...}
  ↓
Cart: initializeCart(userId) → Load from Supabase
  ↓
✅ User sees cart items (NO FLICKER)
  ↓
Cart: isInitialized = true
  ↓
Any auth change (token refresh, etc.):
Cart: Check if (isInitialized) → SKIP re-init
  ↓
✅ Cart stable, no re-initialization (PERFECT)
```

---

## 🎯 Expected Results

After implementing these 7 fixes:

✅ **Zero cart flickers** - Items never disappear and reappear
✅ **Zero data loss** - Guest + user carts merge correctly
✅ **Consistent auth state** - Profile icon stable across tabs
✅ **Fast operations** - Debounced syncs, no race conditions
✅ **Multi-tab sync** - Changes in one tab appear in others
✅ **Reliable refreshes** - Page reload preserves state
✅ **Production-ready** - Handles slow networks, errors gracefully

---

## 🚀 Implementation Timeline

- **Day 1 (2 hours):** Fixes #1-#3 (Critical auth + cart guards)
- **Day 2 (2 hours):** Fixes #4-#5 (Cart merge + debouncing)
- **Day 3 (1 hour):** Fixes #6-#7 (Realtime + UX polish)
- **Day 4 (2 hours):** Testing + edge cases
- **Day 5 (1 hour):** Production deploy + monitoring

**Total:** ~8 hours of focused work

---

## 📞 Need Help?

If you run into issues:
1. Check browser console for `[Cart]` and `[Auth]` logs
2. Verify `isHydrated` flag in React DevTools
3. Check Supabase logs for session/cart errors
4. Test in incognito mode (fresh state)

**Common Gotchas:**
- Forgot to add `isHydrated` to dependencies
- Debounce not imported correctly
- Middleware not matching routes
- Supabase env vars missing on server

---

Good luck! 🎉

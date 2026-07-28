const STORAGE_KEY = 'sundry.cart';

// The cart is persisted as an array of product objects, each carrying
// its own `count`. Reading is defensive: a corrupted or hand-edited
// value should start the shopper with an empty cart, not crash the app.
export function loadCart() {
  try {
    const saved = sessionStorage.getItem(STORAGE_KEY);
    if (!saved) return [];
    const parsed = JSON.parse(saved);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

export function saveCart(items) {
  try {
    sessionStorage.setItem(STORAGE_KEY, JSON.stringify(items));
  } catch {
    // Storage can be unavailable in private-browsing modes. The cart
    // still works in memory for this session, so there's nothing to do.
  }
}

export function clearStoredCart() {
  try {
    sessionStorage.removeItem(STORAGE_KEY);
  } catch {
    // Same as above.
  }
}

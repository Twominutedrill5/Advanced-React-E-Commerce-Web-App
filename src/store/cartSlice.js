import { createSlice } from '@reduxjs/toolkit';
import { loadCart } from './cartStorage';

// The cart starts from whatever is already in sessionStorage, so a page
// refresh or a jump between routes keeps the shopper's items.
const initialState = {
  items: loadCart(),
  lastOrderTotal: null, // set on checkout so the Cart page can confirm the order
};

const cartSlice = createSlice({
  name: 'cart',
  initialState,
  reducers: {
    addToCart(state, action) {
      const product = action.payload;
      const existing = state.items.find((item) => item.id === product.id);
      if (existing) {
        existing.count += 1;
      } else {
        state.items.push({ ...product, count: 1 });
      }
      state.lastOrderTotal = null;
    },

    increaseCount(state, action) {
      const item = state.items.find((entry) => entry.id === action.payload);
      if (item) item.count += 1;
    },

    decreaseCount(state, action) {
      const item = state.items.find((entry) => entry.id === action.payload);
      if (!item) return;
      if (item.count > 1) {
        item.count -= 1;
      } else {
        // Dropping below one removes the line entirely.
        state.items = state.items.filter((entry) => entry.id !== action.payload);
      }
    },

    removeFromCart(state, action) {
      state.items = state.items.filter((entry) => entry.id !== action.payload);
    },

    // Checkout is simulated: FakeStoreAPI has no order endpoint, so the
    // "purchase" is the cart emptying. The total is kept for the receipt.
    checkout(state) {
      state.lastOrderTotal = state.items.reduce(
        (sum, item) => sum + item.price * item.count,
        0,
      );
      state.items = [];
    },

    dismissReceipt(state) {
      state.lastOrderTotal = null;
    },
  },
});

export const {
  addToCart,
  increaseCount,
  decreaseCount,
  removeFromCart,
  checkout,
  dismissReceipt,
} = cartSlice.actions;

// Selectors keep the totals in one place instead of recalculating in components.
export const selectCartItems = (state) => state.cart.items;

export const selectItemCount = (state) =>
  state.cart.items.reduce((total, item) => total + item.count, 0);

export const selectCartTotal = (state) =>
  state.cart.items.reduce((total, item) => total + item.price * item.count, 0);

export const selectLastOrderTotal = (state) => state.cart.lastOrderTotal;

export default cartSlice.reducer;

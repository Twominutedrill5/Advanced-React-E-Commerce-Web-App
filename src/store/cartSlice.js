import { createSlice } from '@reduxjs/toolkit';
import { loadCart } from './cartStorage';

// The cart starts from whatever is already in sessionStorage, so a page
// refresh or a jump between routes keeps the shopper's items.
const initialState = {
  items: loadCart(),
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

    // Called after the order has been written to Firestore, not before —
    // the Cart page owns that ordering so a failed write keeps the basket.
    clearCart(state) {
      state.items = [];
    },
  },
});

export const {
  addToCart,
  increaseCount,
  decreaseCount,
  removeFromCart,
  clearCart,
} = cartSlice.actions;

// Selectors keep the totals in one place instead of recalculating in components.
export const selectCartItems = (state) => state.cart.items;

export const selectItemCount = (state) =>
  state.cart.items.reduce((total, item) => total + item.count, 0);

export const selectCartTotal = (state) =>
  state.cart.items.reduce((total, item) => total + item.price * item.count, 0);

export default cartSlice.reducer;

import { configureStore } from '@reduxjs/toolkit';
import cartReducer from './cartSlice';
import { saveCart, clearStoredCart } from './cartStorage';

export const store = configureStore({
  reducer: {
    cart: cartReducer,
  },
});

// Every time the cart changes, mirror it into sessionStorage. Doing it here
// instead of inside the reducers keeps the reducers pure — Redux stays the
// single source of truth and storage is just a copy of it.
store.subscribe(() => {
  const { items } = store.getState().cart;
  if (items.length === 0) {
    clearStoredCart();
  } else {
    saveCart(items);
  }
});

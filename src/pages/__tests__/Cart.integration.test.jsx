import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { Provider } from "react-redux";
import { MemoryRouter } from "react-router-dom";
import { configureStore } from "@reduxjs/toolkit";
import cartReducer from "../../store/cartSlice";
import ProductCard from "../../components/ProductCard";
import Cart from "../Cart";

// Cart.jsx talks to Firestore (checkout) and reads the logged-in user. Those
// are external boundaries for this test — we only care that adding a product
// updates what the Cart page renders, so they're mocked out.
vi.mock("firebase/firestore", () => ({
  collection: vi.fn(),
  addDoc: vi.fn(),
}));
vi.mock("../../Library/Firebase/Firebase", () => ({ db: {} }));
vi.mock("../../context/useAuth", () => ({
  useAuth: () => ({ user: null }),
}));

const PRODUCT = {
  id: 7,
  title: "Integration Test Mug",
  category: "kitchen",
  description: "A mug used only in tests.",
  price: 12.0,
  image: "https://example.com/mug.png",
  rating: { rate: 5, count: 3 },
};

function renderApp() {
  const store = configureStore({
    reducer: { cart: cartReducer },
    preloadedState: { cart: { items: [], lastOrderTotal: null } },
  });

  render(
    <Provider store={store}>
      <MemoryRouter>
        <ProductCard product={PRODUCT} />
        <Cart />
      </MemoryRouter>
    </Provider>,
  );
}

describe("Cart integration", () => {
  it("shows the empty state before anything is added", () => {
    renderApp();

    expect(screen.getByText("Your cart is empty.")).toBeInTheDocument();
  });

  it("updates the Cart page when a product is added from the catalog", async () => {
    const user = userEvent.setup();
    renderApp();

    await user.click(screen.getByRole("button", { name: "Add to cart" }));

    expect(
      screen.getByText("Integration Test Mug", {
        selector: ".cart-line__title",
      }),
    ).toBeInTheDocument();
    expect(screen.getByText("Products in cart").nextSibling).toHaveTextContent(
      "1",
    );
    expect(
      screen.getByText("$12.00", { selector: ".summary__total dd" }),
    ).toBeInTheDocument();
  });

  it("increases the cart quantity and total when adding the same product twice", async () => {
    const user = userEvent.setup();
    renderApp();

    await user.click(screen.getByRole("button", { name: "Add to cart" }));
    await user.click(screen.getByRole("button", { name: "Add to cart" }));

    expect(screen.getByText("Products in cart").nextSibling).toHaveTextContent(
      "2",
    );
    expect(
      screen.getByText("$24.00", { selector: ".summary__total dd" }),
    ).toBeInTheDocument();
  });
});

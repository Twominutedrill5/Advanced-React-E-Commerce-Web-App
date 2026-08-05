import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { Provider } from "react-redux";
import { configureStore } from "@reduxjs/toolkit";
import cartReducer, { selectCartItems } from "../../store/cartSlice";
import ProductCard from "../ProductCard";

const PRODUCT = {
  id: 1,
  title: "Test Backpack",
  category: "men's clothing",
  description: "A sturdy backpack for testing.",
  price: 42.5,
  image: "https://example.com/backpack.png",
  rating: { rate: 4.2, count: 17 },
};

function renderWithStore(product = PRODUCT) {
  const store = configureStore({
    reducer: { cart: cartReducer },
    preloadedState: { cart: { items: [], lastOrderTotal: null } },
  });

  render(
    <Provider store={store}>
      <ProductCard product={product} />
    </Provider>,
  );

  return store;
}

describe("ProductCard", () => {
  it("renders the product's title, category, price, and rating", () => {
    renderWithStore();

    expect(
      screen.getByRole("heading", { name: "Test Backpack" }),
    ).toBeInTheDocument();
    expect(screen.getByText("men's clothing")).toBeInTheDocument();
    expect(screen.getByText("$42.50")).toBeInTheDocument();
    expect(screen.getByText("4.2")).toBeInTheDocument();
  });

  it("falls back to 'Not yet rated' when the product has no rating", () => {
    renderWithStore({ ...PRODUCT, rating: undefined });

    expect(screen.getByText("Not yet rated")).toBeInTheDocument();
  });

  it("dispatches addToCart and updates the store when 'Add to cart' is clicked", async () => {
    const user = userEvent.setup();
    const store = renderWithStore();

    expect(selectCartItems(store.getState())).toHaveLength(0);

    await user.click(screen.getByRole("button", { name: "Add to cart" }));

    const items = selectCartItems(store.getState());
    expect(items).toHaveLength(1);
    expect(items[0]).toMatchObject({ id: PRODUCT.id, count: 1 });
  });
});

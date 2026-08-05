import { useSelector, useDispatch } from "react-redux";
import { Link } from "react-router-dom";
import { useState } from "react";
import { collection, addDoc } from "firebase/firestore";
import ProductImage from "../components/ProductImage";
import { db } from "../Library/Firebase/Firebase";
import { useAuth } from "../context/AuthContext";
import {
  selectCartItems,
  selectItemCount,
  selectCartTotal,
  selectLastOrderTotal,
  increaseCount,
  decreaseCount,
  removeFromCart,
  checkout,
  dismissReceipt,
} from "../store/cartSlice";

export default function Cart() {
  const items = useSelector(selectCartItems);
  const itemCount = useSelector(selectItemCount);
  const total = useSelector(selectCartTotal);
  const lastOrderTotal = useSelector(selectLastOrderTotal);
  const dispatch = useDispatch();
  const { user } = useAuth();
  const [checkoutError, setCheckoutError] = useState("");
  const [isSubmittingOrder, setIsSubmittingOrder] = useState(false);

  const handleCheckout = async () => {
    if (!user) {
      setCheckoutError(
        "Please log in before checking out so we can store your order history.",
      );
      return;
    }

    if (items.length === 0 || isSubmittingOrder) {
      return;
    }

    setIsSubmittingOrder(true);
    setCheckoutError("");

    try {
      await addDoc(collection(db, "orders"), {
        userId: user.uid,
        userEmail: user.email || null,
        createdAtMs: Date.now(),
        total,
        items: items.map((item) => ({
          id: item.id,
          title: item.title,
          category: item.category,
          price: item.price,
          count: item.count,
          image: item.image || null,
        })),
      });
      dispatch(checkout());
    } catch (error) {
      setCheckoutError(error?.message || "Could not place order.");
    } finally {
      setIsSubmittingOrder(false);
    }
  };

  return (
    <>
      <section className="hero hero--compact">
        <p className="eyebrow">Your order</p>
        <h1>The cart.</h1>
      </section>

      {/* Confirmation after a simulated checkout. */}
      {lastOrderTotal !== null && (
        <div className="receipt" role="status">
          <p className="receipt__headline">Order placed.</p>
          <p>
            ${lastOrderTotal.toFixed(2)} order saved to Firebase. View it in
            your order history.
          </p>
          <div className="receipt__actions">
            <Link
              to="/"
              className="btn-ink"
              onClick={() => dispatch(dismissReceipt())}
            >
              Keep browsing
            </Link>
            <Link
              to="/orders"
              className="btn-ink"
              onClick={() => dispatch(dismissReceipt())}
              style={{ marginTop: "8px" }}
            >
              View orders
            </Link>
          </div>
        </div>
      )}

      {items.length === 0 && lastOrderTotal === null && (
        <div className="state-block">
          <p className="state-block__headline">Your cart is empty.</p>
          <p>
            <Link to="/" className="text-link">
              Head back to the catalog
            </Link>{" "}
            and add something.
          </p>
        </div>
      )}

      {items.length > 0 && (
        <div className="cart-layout">
          <ul className="cart-lines">
            {items.map((item) => (
              <li key={item.id} className="cart-line">
                <div className="cart-line__frame">
                  <ProductImage
                    src={item.image}
                    alt={item.title}
                    className="cart-line__image"
                  />
                </div>

                <div className="cart-line__body">
                  <p className="cart-line__category">{item.category}</p>
                  <h2 className="cart-line__title">{item.title}</h2>
                  <p className="cart-line__unit">
                    ${item.price.toFixed(2)} each
                  </p>

                  <div
                    className="counter"
                    role="group"
                    aria-label={`Quantity for ${item.title}`}
                  >
                    <button
                      type="button"
                      onClick={() => dispatch(decreaseCount(item.id))}
                      aria-label="Reduce quantity by one"
                    >
                      –
                    </button>
                    <span className="counter__value">{item.count}</span>
                    <button
                      type="button"
                      onClick={() => dispatch(increaseCount(item.id))}
                      aria-label="Add one more"
                    >
                      +
                    </button>
                  </div>
                </div>

                <div className="cart-line__right">
                  <p className="cart-line__total">
                    ${(item.price * item.count).toFixed(2)}
                  </p>
                  <button
                    type="button"
                    className="btn-remove"
                    onClick={() => dispatch(removeFromCart(item.id))}
                  >
                    Remove
                  </button>
                </div>
              </li>
            ))}
          </ul>

          <aside className="summary">
            <p className="eyebrow">Summary</p>
            <dl className="summary__rows">
              <div>
                <dt>Products in cart</dt>
                <dd>{itemCount}</dd>
              </div>
              <div>
                <dt>Distinct items</dt>
                <dd>{items.length}</dd>
              </div>
              <div className="summary__total">
                <dt>Total</dt>
                <dd>${total.toFixed(2)}</dd>
              </div>
            </dl>

            <button
              type="button"
              className="btn-ink btn-ink--block"
              onClick={handleCheckout}
              disabled={isSubmittingOrder}
            >
              {isSubmittingOrder
                ? "Placing order..."
                : "Place order in Firebase"}
            </button>
            {checkoutError && <p className="field-note">{checkoutError}</p>}
            <p className="field-note">
              Orders are stored with user, products, created date, and total
              price.
            </p>
          </aside>
        </div>
      )}
    </>
  );
}

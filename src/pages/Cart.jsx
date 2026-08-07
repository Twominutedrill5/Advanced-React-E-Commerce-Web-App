import { useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { Link, useNavigate } from 'react-router-dom';
import { useQueryClient } from '@tanstack/react-query';
import ProductImage from '../components/ProductImage';
import { useAuth } from '../context/AuthContext';
import { createOrder } from '../services/orders';
import {
  selectCartItems,
  selectItemCount,
  selectCartTotal,
  increaseCount,
  decreaseCount,
  removeFromCart,
  clearCart,
} from '../store/cartSlice';

export default function Cart() {
  const items = useSelector(selectCartItems);
  const itemCount = useSelector(selectItemCount);
  const total = useSelector(selectCartTotal);
  const dispatch = useDispatch();
  const { user } = useAuth();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const [placing, setPlacing] = useState(false);
  const [error, setError] = useState('');

  // Checkout is now a real write. The order goes to Firestore first — only if
  // that succeeds do we clear the cart, so a failed write never loses someone's
  // basket.
  async function handleCheckout() {
    setError('');
    setPlacing(true);
    try {
      const orderId = await createOrder({
        userId: user.uid,
        userEmail: user.email,
        items,
      });
      dispatch(clearCart());
      queryClient.invalidateQueries({ queryKey: ['orders', user.uid] });
      navigate(`/orders/${orderId}`, { state: { justPlaced: true } });
    } catch (err) {
      setError(err.message || 'The order could not be placed. Try again.');
    } finally {
      setPlacing(false);
    }
  }

  return (
    <>
      <section className="hero hero--compact">
        <p className="eyebrow">Your order</p>
        <h1>The cart.</h1>
      </section>

      {items.length === 0 && (
        <div className="state-block">
          <p className="state-block__headline">Your cart is empty.</p>
          <p>
            <Link to="/" className="text-link">
              Head back to the catalog
            </Link>{' '}
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
                  <ProductImage src={item.image} alt={item.title} className="cart-line__image" />
                </div>

                <div className="cart-line__body">
                  <p className="cart-line__category">{item.category}</p>
                  <h2 className="cart-line__title">{item.title}</h2>
                  <p className="cart-line__unit">${Number(item.price).toFixed(2)} each</p>

                  <div className="counter" role="group" aria-label={`Quantity for ${item.title}`}>
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
                    ${(Number(item.price) * item.count).toFixed(2)}
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

            {error && <p className="form-error">{error}</p>}

            {user ? (
              <button
                type="button"
                className="btn-ink btn-ink--block"
                onClick={handleCheckout}
                disabled={placing}
              >
                {placing ? 'Placing order…' : 'Place order'}
              </button>
            ) : (
              <>
                <Link to="/login" state={{ from: '/cart' }} className="btn-ink btn-ink--block">
                  Sign in to check out
                </Link>
                <p className="field-note">Orders are saved to your account, so you need one.</p>
              </>
            )}
          </aside>
        </div>
      )}
    </>
  );
}

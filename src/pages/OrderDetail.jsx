import { useParams, useLocation, Link } from 'react-router-dom';
import ProductImage from '../components/ProductImage';
import { useOrder } from '../hooks/useStore';
import { formatOrderDate } from '../utils/format';

export default function OrderDetail() {
  const { id } = useParams();
  const location = useLocation();
  const justPlaced = location.state?.justPlaced;
  const { data: order, isPending, isError, error } = useOrder(id);

  if (isPending) {
    return (
      <div className="state-block">
        <span className="spinner" aria-hidden="true" />
        <p>Loading the order…</p>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="state-block state-block--error">
        <p className="state-block__headline">That order didn&apos;t load.</p>
        <p>{error.message}</p>
      </div>
    );
  }

  return (
    <>
      {/* Shown once, right after checkout redirects here. */}
      {justPlaced && (
        <div className="receipt" role="status">
          <p className="receipt__headline">Order placed.</p>
          <p>Saved to your account. Everything below is what you bought.</p>
        </div>
      )}

      <section className="hero hero--compact">
        <p className="eyebrow">Order #{order.id.slice(0, 8).toUpperCase()}</p>
        <h1>{formatOrderDate(order.createdAt)}</h1>
      </section>

      <ul className="cart-lines">
        {order.items.map((line) => (
          <li key={line.productId} className="cart-line">
            <div className="cart-line__frame">
              <ProductImage src={line.image} alt={line.title} className="cart-line__image" />
            </div>
            <div className="cart-line__body">
              <p className="cart-line__category">{line.category}</p>
              <h2 className="cart-line__title">{line.title}</h2>
              <p className="cart-line__unit">
                ${Number(line.price).toFixed(2)} × {line.count}
              </p>
            </div>
            <div className="cart-line__right">
              <p className="cart-line__total">${(line.price * line.count).toFixed(2)}</p>
            </div>
          </li>
        ))}
      </ul>

      <div className="order-total">
        <span>Order total</span>
        <span className="order-total__value">${Number(order.total).toFixed(2)}</span>
      </div>

      <p className="field-note">
        <Link to="/orders" className="text-link">
          Back to order history
        </Link>
      </p>
    </>
  );
}

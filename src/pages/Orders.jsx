import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useOrders } from '../hooks/useStore';
import { formatOrderDate } from '../utils/format';

export default function Orders() {
  const { user } = useAuth();
  const { data: orders, isPending, isError, error } = useOrders(user?.uid);

  return (
    <>
      <section className="hero hero--compact">
        <p className="eyebrow">Account</p>
        <h1>Order history.</h1>
      </section>

      {isPending && (
        <div className="state-block">
          <span className="spinner" aria-hidden="true" />
          <p>Loading your orders…</p>
        </div>
      )}

      {isError && (
        <div className="state-block state-block--error">
          <p className="state-block__headline">Orders didn&apos;t load.</p>
          <p>{error.message}</p>
        </div>
      )}

      {!isPending && !isError && orders.length === 0 && (
        <div className="state-block">
          <p className="state-block__headline">No orders yet.</p>
          <p>
            <Link to="/" className="text-link">
              Browse the catalog
            </Link>{' '}
            to place your first one.
          </p>
        </div>
      )}

      {!isPending && !isError && orders.length > 0 && (
        <ul className="order-list">
          {orders.map((order) => (
            <li key={order.id}>
              <Link to={`/orders/${order.id}`} className="order-row">
                <div>
                  <p className="order-row__id">#{order.id.slice(0, 8).toUpperCase()}</p>
                  <p className="order-row__date">{formatOrderDate(order.createdAt)}</p>
                </div>
                <p className="order-row__count">
                  {order.itemCount} {order.itemCount === 1 ? 'product' : 'products'}
                </p>
                <p className="order-row__total">${Number(order.total).toFixed(2)}</p>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </>
  );
}

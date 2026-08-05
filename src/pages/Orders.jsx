import { useEffect, useMemo, useState } from "react";
import { collection, getDocs, query, where } from "firebase/firestore";
import { Link, useNavigate } from "react-router-dom";
import { db } from "../Library/Firebase/Firebase";
import { useAuth } from "../context/AuthContext";

function formatDate(timestampMs) {
  if (!timestampMs) {
    return "Unknown date";
  }
  return new Date(timestampMs).toLocaleString();
}

export default function Orders() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [orders, setOrders] = useState([]);
  const [selectedOrderId, setSelectedOrderId] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!user) {
      navigate("/login");
      return;
    }

    const fetchOrders = async () => {
      setIsLoading(true);
      setError("");

      try {
        const userOrdersQuery = query(
          collection(db, "orders"),
          where("userId", "==", user.uid),
        );
        const snapshot = await getDocs(userOrdersQuery);
        const orderList = snapshot.docs
          .map((entry) => ({
            id: entry.id,
            ...entry.data(),
          }))
          .sort((a, b) => (b.createdAtMs || 0) - (a.createdAtMs || 0));

        setOrders(orderList);
      } catch (fetchError) {
        setError(fetchError?.message || "Could not load orders.");
      } finally {
        setIsLoading(false);
      }
    };

    fetchOrders();
  }, [navigate, user]);

  const selectedOrder = useMemo(
    () => orders.find((order) => order.id === selectedOrderId) || null,
    [orders, selectedOrderId],
  );

  if (!user) {
    return null;
  }

  return (
    <>
      <section className="hero hero--compact">
        <p className="eyebrow">Orders</p>
        <h1>Your order history.</h1>
      </section>

      {isLoading && (
        <div className="state-block">
          <span className="spinner" aria-hidden="true" />
          <p>Loading your past orders...</p>
        </div>
      )}

      {error && (
        <div className="state-block state-block--error">
          <p className="state-block__headline">Orders could not load.</p>
          <p>{error}</p>
        </div>
      )}

      {!isLoading && !error && orders.length === 0 && (
        <div className="state-block">
          <p className="state-block__headline">No previous orders yet.</p>
          <p>
            <Link to="/cart" className="text-link">
              Go to cart
            </Link>{" "}
            and place your first order.
          </p>
        </div>
      )}

      {!isLoading && !error && orders.length > 0 && (
        <div className="cart-layout">
          <ul className="cart-lines">
            {orders.map((order) => (
              <li key={order.id} className="cart-line">
                <div className="cart-line__body">
                  <p className="cart-line__category">Order ID: {order.id}</p>
                  <h2 className="cart-line__title">
                    {formatDate(order.createdAtMs)}
                  </h2>
                  <p className="cart-line__unit">
                    {order.items?.length || 0} products
                  </p>
                </div>
                <div className="cart-line__right">
                  <p className="cart-line__total">
                    ${Number(order.total || 0).toFixed(2)}
                  </p>
                  <button
                    type="button"
                    className="btn-remove"
                    onClick={() => setSelectedOrderId(order.id)}
                  >
                    View details
                  </button>
                </div>
              </li>
            ))}
          </ul>

          <aside className="summary">
            <p className="eyebrow">Order details</p>
            {!selectedOrder && (
              <p className="field-note">Select an order to view products.</p>
            )}
            {selectedOrder && (
              <>
                <p className="field-note">Order: {selectedOrder.id}</p>
                <p className="field-note">
                  Date: {formatDate(selectedOrder.createdAtMs)}
                </p>
                <p className="field-note">
                  Total: ${Number(selectedOrder.total || 0).toFixed(2)}
                </p>
                <ul className="cart-lines" style={{ marginTop: "10px" }}>
                  {selectedOrder.items?.map((item, index) => (
                    <li
                      key={`${selectedOrder.id}-${item.id || index}`}
                      className="cart-line"
                    >
                      <div className="cart-line__body">
                        <h3 className="cart-line__title">{item.title}</h3>
                        <p className="cart-line__unit">Qty: {item.count}</p>
                      </div>
                      <div className="cart-line__right">
                        <p className="cart-line__total">
                          $
                          {(
                            Number(item.price || 0) * Number(item.count || 0)
                          ).toFixed(2)}
                        </p>
                      </div>
                    </li>
                  ))}
                </ul>
              </>
            )}
          </aside>
        </div>
      )}
    </>
  );
}

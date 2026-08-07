import { Routes, Route, NavLink, useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import Home from './pages/Home';
import Cart from './pages/Cart';
import Login from './pages/Login';
import Register from './pages/Register';
import Profile from './pages/Profile';
import Orders from './pages/Orders';
import OrderDetail from './pages/OrderDetail';
import ProductForm from './pages/ProductForm';
import ProtectedRoute from './components/ProtectedRoute';
import { useAuth } from './context/AuthContext';
import { selectItemCount } from './store/cartSlice';

function Masthead() {
  const itemCount = useSelector(selectItemCount);
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  async function handleLogout() {
    await logout();
    navigate('/');
  }

  return (
    <header className="masthead">
      <NavLink to="/" className="masthead__brand">
        Sundry
      </NavLink>

      <nav className="masthead__nav">
        <NavLink to="/" end>
          Catalog
        </NavLink>

        {user ? (
          <>
            <NavLink to="/orders">Orders</NavLink>
            <NavLink to="/profile">Profile</NavLink>
            <button type="button" className="nav-button" onClick={handleLogout}>
              Sign out
            </button>
          </>
        ) : (
          <>
            <NavLink to="/login">Sign in</NavLink>
            <NavLink to="/register">Register</NavLink>
          </>
        )}

        <NavLink to="/cart" className="masthead__cart">
          Cart
          {itemCount > 0 && <span className="masthead__count">{itemCount}</span>}
        </NavLink>
      </nav>
    </header>
  );
}

export default function App() {
  return (
    <div className="site">
      <div className="masthead-bar" />
      <Masthead />

      <main className="container-narrow">
        <Routes>
          {/* Public */}
          <Route path="/" element={<Home />} />
          <Route path="/cart" element={<Cart />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />

          {/* Signed-in only */}
          <Route
            path="/profile"
            element={
              <ProtectedRoute>
                <Profile />
              </ProtectedRoute>
            }
          />
          <Route
            path="/orders"
            element={
              <ProtectedRoute>
                <Orders />
              </ProtectedRoute>
            }
          />
          <Route
            path="/orders/:id"
            element={
              <ProtectedRoute>
                <OrderDetail />
              </ProtectedRoute>
            }
          />
          <Route
            path="/products/new"
            element={
              <ProtectedRoute>
                <ProductForm />
              </ProtectedRoute>
            }
          />
          <Route
            path="/products/:id/edit"
            element={
              <ProtectedRoute>
                <ProductForm />
              </ProtectedRoute>
            }
          />

          <Route
            path="*"
            element={
              <div className="state-block">
                <p className="state-block__headline">That page doesn&apos;t exist.</p>
                <p>Use the masthead above to get back to the catalog.</p>
              </div>
            }
          />
        </Routes>
      </main>

      <footer className="site-footer">
        Sundry — React, Firebase Auth, Firestore &amp; Redux Toolkit. Demo data only.
      </footer>
    </div>
  );
}

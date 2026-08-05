import { Route, Routes, NavLink } from "react-router-dom";
import { useSelector } from "react-redux";
import { AuthProvider, useAuth } from "./context/AuthContext";
import { ProductProvider } from "./context/ProductContext";
import Home from "./pages/Home";
import Register from "./pages/Register";
import Login from "./pages/Login";
import Logout from "./pages/Logout";
import Cart from "./pages/Cart";
import Profile from "./pages/Profile";
import Orders from "./pages/Orders";
import { selectItemCount } from "./store/cartSlice";

function Masthead() {
  const itemCount = useSelector(selectItemCount);
  const { user } = useAuth();

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
            <NavLink to="/cart" className="masthead__cart">
              Cart
              {itemCount > 0 && (
                <span className="masthead__count">{itemCount}</span>
              )}
            </NavLink>
            <NavLink to="/profile">Profile</NavLink>
            <NavLink to="/orders">Orders</NavLink>
            <NavLink to="/logout">Logout</NavLink>
          </>
        ) : (
          <>
            <NavLink to="/login">Login</NavLink>
            <NavLink to="/register">Register</NavLink>
          </>
        )}
      </nav>
    </header>
  );
}

function App() {
  return (
    <AuthProvider>
      <ProductProvider>
        <div className="site">
          <div className="masthead-bar" />

          <Masthead />

          <main className="container-narrow">
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/profile" element={<Profile />} />
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />
              <Route path="/cart" element={<Cart />} />
              <Route path="/orders" element={<Orders />} />
              <Route path="/logout" element={<Logout />} />
              <Route
                path="*"
                element={
                  <div className="state-block">
                    <p className="state-block__headline">
                      That page doesn't exist.
                    </p>
                    <p>Use the masthead above to get back to the catalog.</p>
                  </div>
                }
              />
            </Routes>
          </main>

          <footer className="site-footer">
            Sundry — React Query, Redux Toolkit &amp; Firebase Firestore.
          </footer>
        </div>
      </ProductProvider>
    </AuthProvider>
  );
}

export default App;

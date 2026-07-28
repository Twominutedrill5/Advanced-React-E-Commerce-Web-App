import { Routes, Route, NavLink } from 'react-router-dom';
import { useSelector } from 'react-redux';
import Home from './pages/Home';
import Cart from './pages/Cart';
import { selectItemCount } from './store/cartSlice';

export default function App() {
  const itemCount = useSelector(selectItemCount);

  return (
    <div className="site">
      <div className="masthead-bar" />

      <header className="masthead">
        <NavLink to="/" className="masthead__brand">
          Sundry
        </NavLink>

        <nav className="masthead__nav">
          <NavLink to="/" end>
            Catalog
          </NavLink>
          <NavLink to="/cart" className="masthead__cart">
            Cart
            {itemCount > 0 && <span className="masthead__count">{itemCount}</span>}
          </NavLink>
        </nav>
      </header>

      <main className="container-narrow">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/cart" element={<Cart />} />
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
        Sundry — React Query, Redux Toolkit &amp; FakeStoreAPI. Demo data only.
      </footer>
    </div>
  );
}

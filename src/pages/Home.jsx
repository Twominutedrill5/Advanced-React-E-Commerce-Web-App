import { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import CategorySelect, { ALL_CATEGORIES } from '../components/CategorySelect';
import ProductCard from '../components/ProductCard';
import ConfirmDialog from '../components/ConfirmDialog';
import { useProducts, useDeleteProduct } from '../hooks/useStore';
import { deriveCategories } from '../services/products';
import { useAuth } from '../context/AuthContext';

export default function Home() {
  const [category, setCategory] = useState(ALL_CATEGORIES);
  const [pendingDelete, setPendingDelete] = useState(null);
  const { user } = useAuth();
  const { data: products, isPending, isError, error } = useProducts();
  const removeProduct = useDeleteProduct();

  const categories = useMemo(() => deriveCategories(products || []), [products]);

  const visible = useMemo(() => {
    if (!products) return [];
    return category === ALL_CATEGORIES
      ? products
      : products.filter((product) => product.category === category);
  }, [products, category]);

  async function confirmDelete() {
    await removeProduct.mutateAsync(pendingDelete.id);
    setPendingDelete(null);
  }

  return (
    <>
      <section className="hero">
        <p className="eyebrow">The Sundry Catalog</p>
        <h1>Everything worth keeping, in one issue.</h1>
        <p className="lede">
          A live catalog backed by Firestore. Pick a section, add anything to your cart,
          and sign in to manage the listings yourself.
        </p>
      </section>

      <section className="controls">
        <CategorySelect
          categories={categories}
          value={category}
          onChange={setCategory}
          disabled={isPending || isError}
        />

        <div className="controls__right">
          {!isPending && !isError && (
            <p className="result-count">
              {visible.length} {visible.length === 1 ? 'item' : 'items'}
            </p>
          )}
          {user && (
            <Link to="/products/new" className="btn-ink btn-ink--inline">
              Add a product
            </Link>
          )}
        </div>
      </section>

      {isPending && (
        <div className="state-block">
          <span className="spinner" aria-hidden="true" />
          <p>Pulling the catalog…</p>
        </div>
      )}

      {isError && (
        <div className="state-block state-block--error">
          <p className="state-block__headline">The catalog didn&apos;t load.</p>
          <p>{error.message}</p>
        </div>
      )}

      {!isPending && !isError && visible.length === 0 && (
        <div className="state-block">
          <p className="state-block__headline">Nothing here yet.</p>
          <p>
            {products.length === 0
              ? 'Run the seed script, or sign in and add a product.'
              : 'Choose a different section to keep browsing.'}
          </p>
        </div>
      )}

      {visible.length > 0 && (
        <div className="product-grid">
          {visible.map((product) => (
            <ProductCard key={product.id} product={product} onDelete={setPendingDelete} />
          ))}
        </div>
      )}

      <ConfirmDialog
        open={Boolean(pendingDelete)}
        title="Delete this product?"
        body={
          pendingDelete
            ? `"${pendingDelete.title}" will be removed from Firestore. This can't be undone.`
            : ''
        }
        confirmLabel={removeProduct.isPending ? 'Deleting…' : 'Delete product'}
        onConfirm={confirmDelete}
        onCancel={() => setPendingDelete(null)}
      />
    </>
  );
}

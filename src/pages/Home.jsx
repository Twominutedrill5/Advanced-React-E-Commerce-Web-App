import { useState } from 'react';
import CategorySelect from '../components/CategorySelect';
import ProductCard from '../components/ProductCard';
import { useProducts, ALL_CATEGORIES } from '../hooks/useCatalog';

export default function Home() {
  const [category, setCategory] = useState(ALL_CATEGORIES);
  const { data: products, isPending, isError, error, isFetching } = useProducts(category);

  return (
    <>
      <section className="hero">
        <p className="eyebrow">The Sundry Catalog</p>
        <h1>Everything worth keeping, in one issue.</h1>
        <p className="lede">
          Clothing, jewelry, and electronics, pulled live from the supplier feed.
          Pick a section, then add anything you want to your cart.
        </p>
      </section>

      <section className="controls">
        <CategorySelect value={category} onChange={setCategory} />
        {!isPending && !isError && (
          <p className="result-count">
            {products.length} {products.length === 1 ? 'item' : 'items'}
            {isFetching && <span className="result-count__updating"> · updating</span>}
          </p>
        )}
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

      {!isPending && !isError && products.length === 0 && (
        <div className="state-block">
          <p className="state-block__headline">Nothing in this section yet.</p>
          <p>Choose a different section to keep browsing.</p>
        </div>
      )}

      {!isPending && !isError && products.length > 0 && (
        <div className="product-grid">
          {products.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      )}
    </>
  );
}

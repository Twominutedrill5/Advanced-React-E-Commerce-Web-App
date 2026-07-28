import { useDispatch } from 'react-redux';
import { addToCart } from '../store/cartSlice';
import ProductImage from './ProductImage';

export default function ProductCard({ product }) {
  const dispatch = useDispatch();

  // FakeStoreAPI nests the score: product.rating = { rate, count }
  const rate = product.rating?.rate;
  const reviewCount = product.rating?.count;

  return (
    <article className="product-card">
      <div className="product-card__frame">
        <ProductImage
          src={product.image}
          alt={product.title}
          className="product-card__image"
        />
      </div>

      <p className="product-card__category">{product.category}</p>
      <h2 className="product-card__title">{product.title}</h2>
      <p className="product-card__description">{product.description}</p>

      <div className="product-card__meta">
        <span className="product-card__price">${product.price.toFixed(2)}</span>
        <span className="product-card__rating">
          {rate != null ? (
            <>
              <span aria-hidden="true">★</span> {rate.toFixed(1)}
              <span className="product-card__reviews"> / {reviewCount} ratings</span>
            </>
          ) : (
            'Not yet rated'
          )}
        </span>
      </div>

      <button
        type="button"
        className="btn-ink"
        onClick={() => dispatch(addToCart(product))}
      >
        Add to cart
      </button>
    </article>
  );
}

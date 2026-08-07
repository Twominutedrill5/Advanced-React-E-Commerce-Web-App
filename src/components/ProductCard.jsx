import { Link } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { addToCart } from '../store/cartSlice';
import { useAuth } from '../context/AuthContext';
import ProductImage from './ProductImage';

export default function ProductCard({ product, onDelete }) {
  const dispatch = useDispatch();
  const { user } = useAuth();

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
        <span className="product-card__price">${Number(product.price).toFixed(2)}</span>
        <span className="product-card__rating">
          {rate != null ? (
            <>
              <span aria-hidden="true">★</span> {Number(rate).toFixed(1)}
              {reviewCount != null && (
                <span className="product-card__reviews"> / {reviewCount} ratings</span>
              )}
            </>
          ) : (
            'Not yet rated'
          )}
        </span>
      </div>

      <button type="button" className="btn-ink" onClick={() => dispatch(addToCart(product))}>
        Add to cart
      </button>

      {/* Product editing is only offered to signed-in users. */}
      {user && (
        <div className="card-admin">
          <Link to={`/products/${product.id}/edit`} className="btn-quiet">
            Edit
          </Link>
          <button type="button" className="btn-quiet btn-quiet--danger" onClick={() => onDelete(product)}>
            Delete
          </button>
        </div>
      )}
    </article>
  );
}

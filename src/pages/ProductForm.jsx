import { useState, useEffect } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import { useProduct, useCreateProduct, useUpdateProduct } from '../hooks/useStore';

const EMPTY = { title: '', price: '', category: '', description: '', image: '' };

// One form serves both create and edit — the presence of an :id in the URL is
// the only difference, so there's no second near-identical component to keep
// in sync.
export default function ProductForm() {
  const { id } = useParams();
  const isEdit = Boolean(id);
  const navigate = useNavigate();

  const [form, setForm] = useState(EMPTY);
  const [error, setError] = useState('');

  const { data: existing, isPending: loading } = useProduct(id);
  const create = useCreateProduct();
  const update = useUpdateProduct();

  // Populate the fields once the existing product arrives.
  useEffect(() => {
    if (existing) {
      setForm({
        title: existing.title ?? '',
        price: existing.price ?? '',
        category: existing.category ?? '',
        description: existing.description ?? '',
        image: existing.image ?? '',
      });
    }
  }, [existing]);

  const set = (field) => (event) => setForm({ ...form, [field]: event.target.value });

  async function handleSubmit(event) {
    event.preventDefault();
    setError('');
    try {
      if (isEdit) {
        await update.mutateAsync({ id, data: form });
      } else {
        await create.mutateAsync(form);
      }
      navigate('/');
    } catch (err) {
      setError(err.message || 'Saving failed. Try again.');
    }
  }

  if (isEdit && loading) {
    return (
      <div className="state-block">
        <span className="spinner" aria-hidden="true" />
        <p>Loading the product…</p>
      </div>
    );
  }

  const busy = create.isPending || update.isPending;

  return (
    <div className="form-page form-page--wide">
      <p className="eyebrow">{isEdit ? 'Edit listing' : 'New listing'}</p>
      <h1>{isEdit ? 'Update this product.' : 'Add a product.'}</h1>

      <form onSubmit={handleSubmit} className="stack-form">
        <label className="field">
          <span>Title</span>
          <input type="text" value={form.title} onChange={set('title')} required />
        </label>

        <div className="field-row">
          <label className="field">
            <span>Price</span>
            <input
              type="number"
              step="0.01"
              min="0"
              value={form.price}
              onChange={set('price')}
              required
            />
          </label>

          <label className="field">
            <span>Category</span>
            <input
              type="text"
              value={form.category}
              onChange={set('category')}
              required
              placeholder="electronics"
            />
          </label>
        </div>

        <label className="field">
          <span>Description</span>
          <textarea rows={4} value={form.description} onChange={set('description')} required />
        </label>

        <label className="field">
          <span>Image URL</span>
          <input
            type="url"
            value={form.image}
            onChange={set('image')}
            placeholder="https://…"
          />
          <small className="field-note">
            Leave blank and the card falls back to a placeholder.
          </small>
        </label>

        {error && <p className="form-error">{error}</p>}

        <div className="form-actions">
          <Link to="/" className="btn-quiet">
            Cancel
          </Link>
          <button type="submit" className="btn-ink" disabled={busy}>
            {busy ? 'Saving…' : isEdit ? 'Save changes' : 'Add product'}
          </button>
        </div>
      </form>
    </div>
  );
}

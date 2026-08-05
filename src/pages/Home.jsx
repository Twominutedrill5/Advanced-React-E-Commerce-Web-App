import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import CategorySelect from "../components/CategorySelect";
import ProductCard from "../components/ProductCard";
import { useAuth } from "../context/AuthContext";
import {
  useProducts,
  useCategories,
  ALL_CATEGORIES,
  createProduct,
  updateProduct,
  deleteProduct,
  seedProductsFromFakeStore,
} from "../hooks/useCatalog";

const EMPTY_PRODUCT_FORM = {
  title: "",
  price: "",
  category: "",
  image: "",
  description: "",
};

export default function Home() {
  const { user } = useAuth();
  const [category, setCategory] = useState(ALL_CATEGORIES);
  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState(EMPTY_PRODUCT_FORM);
  const [manageError, setManageError] = useState("");
  const [isManageOpen, setIsManageOpen] = useState(false);
  const queryClient = useQueryClient();

  const {
    data: products,
    isPending,
    isError,
    error,
    isFetching,
  } = useProducts(category);
  const { data: categories = [] } = useCategories();

  const createMutation = useMutation({
    mutationFn: createProduct,
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["products"] });
      await queryClient.invalidateQueries({ queryKey: ["categories"] });
      setForm(EMPTY_PRODUCT_FORM);
      setManageError("");
    },
    onError: (mutationError) => {
      setManageError(mutationError?.message || "Could not create product.");
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ productId, updates }) => updateProduct(productId, updates),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["products"] });
      await queryClient.invalidateQueries({ queryKey: ["categories"] });
      setEditingId(null);
      setForm(EMPTY_PRODUCT_FORM);
      setManageError("");
    },
    onError: (mutationError) => {
      setManageError(mutationError?.message || "Could not update product.");
    },
  });

  const deleteMutation = useMutation({
    mutationFn: deleteProduct,
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["products"] });
      await queryClient.invalidateQueries({ queryKey: ["categories"] });
    },
    onError: (mutationError) => {
      setManageError(mutationError?.message || "Could not delete product.");
    },
  });

  const seedMutation = useMutation({
    mutationFn: seedProductsFromFakeStore,
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["products"] });
      await queryClient.invalidateQueries({ queryKey: ["categories"] });
      setManageError("");
    },
    onError: (mutationError) => {
      setManageError(
        mutationError?.message || "Could not load starter catalog.",
      );
    },
  });

  const isMutating =
    createMutation.isPending ||
    updateMutation.isPending ||
    deleteMutation.isPending ||
    seedMutation.isPending;

  const handleFieldChange = (event) => {
    const { name, value } = event.target;
    setForm((current) => ({ ...current, [name]: value }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (!form.title || !form.price || !form.category || !form.description) {
      setManageError("Title, price, category, and description are required.");
      return;
    }

    const payload = {
      title: form.title.trim(),
      price: Number(form.price),
      category: form.category.trim(),
      image:
        form.image.trim() || "https://via.placeholder.com/320x320?text=Product",
      description: form.description.trim(),
      rating: {
        rate: 0,
        count: 0,
      },
    };

    if (editingId) {
      await updateMutation.mutateAsync({
        productId: editingId,
        updates: payload,
      });
      return;
    }

    await createMutation.mutateAsync(payload);
  };

  const beginEdit = (product) => {
    setEditingId(product.id);
    setForm({
      title: product.title || "",
      price: String(product.price ?? ""),
      category: product.category || "",
      image: product.image || "",
      description: product.description || "",
    });
    setManageError("");
    setIsManageOpen(true);
  };

  const cancelEdit = () => {
    setEditingId(null);
    setForm(EMPTY_PRODUCT_FORM);
    setManageError("");
  };

  const handleDelete = async (productId) => {
    await deleteMutation.mutateAsync(productId);
  };

  return (
    <>
      <section className="hero">
        <p className="eyebrow">The Sundry Catalog</p>
        <h1>Everything worth keeping, in one issue.</h1>
        <p className="lede">
          Clothing, jewelry, and electronics, now backed by Firestore. Pick a
          section, then add anything you want to your cart.
        </p>
      </section>

      <section className="controls">
        <CategorySelect value={category} onChange={setCategory} />
        {!isPending && !isError && (
          <p className="result-count">
            {products.length} {products.length === 1 ? "item" : "items"}
            {isFetching && (
              <span className="result-count__updating"> · updating</span>
            )}
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
          {category === ALL_CATEGORIES && user && (
            <>
              <p>
                The Firestore products collection is empty. Load the original
                starter catalog to get going, or add products above.
              </p>
              <button
                type="button"
                className="btn-ink"
                onClick={() => seedMutation.mutate()}
                disabled={isMutating}
              >
                {seedMutation.isPending
                  ? "Loading catalog..."
                  : "Load starter catalog"}
              </button>
            </>
          )}
        </div>
      )}

      {!isPending && !isError && products.length > 0 && (
        <div className="product-grid">
          {products.map((product) => (
            <div key={product.id} className="product-grid__cell">
              <ProductCard product={product} />
              {user && (
                <div className="product-grid__actions">
                  <button
                    type="button"
                    className="btn-remove"
                    onClick={() => beginEdit(product)}
                  >
                    Edit product
                  </button>
                  <button
                    type="button"
                    className="btn-remove"
                    onClick={() => handleDelete(product.id)}
                  >
                    Delete product
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {user && (
        <section className="summary" style={{ marginTop: "48px" }}>
          <button
            type="button"
            className="btn-ink"
            onClick={() => setIsManageOpen((open) => !open)}
          >
            {isManageOpen ? "Hide product management" : "Manage products"}
          </button>

          {isManageOpen && (
            <div style={{ marginTop: "20px" }}>
              <p className="eyebrow">Product management</p>
              <form onSubmit={handleSubmit}>
                <input
                  name="title"
                  value={form.title}
                  onChange={handleFieldChange}
                  placeholder="Title"
                  style={{ width: "100%", marginBottom: "8px" }}
                />
                <input
                  name="price"
                  type="number"
                  min="0"
                  step="0.01"
                  value={form.price}
                  onChange={handleFieldChange}
                  placeholder="Price"
                  style={{ width: "100%", marginBottom: "8px" }}
                />
                <input
                  name="category"
                  value={form.category}
                  onChange={handleFieldChange}
                  placeholder="Category"
                  style={{ width: "100%", marginBottom: "8px" }}
                  list="catalog-categories"
                />
                <datalist id="catalog-categories">
                  {categories.map((entry) => (
                    <option key={entry} value={entry} />
                  ))}
                </datalist>
                <input
                  name="image"
                  value={form.image}
                  onChange={handleFieldChange}
                  placeholder="Image URL (optional)"
                  style={{ width: "100%", marginBottom: "8px" }}
                />
                <textarea
                  name="description"
                  value={form.description}
                  onChange={handleFieldChange}
                  placeholder="Description"
                  rows={3}
                  style={{ width: "100%", marginBottom: "8px" }}
                />
                {manageError && <p className="field-note">{manageError}</p>}
                <button type="submit" className="btn-ink" disabled={isMutating}>
                  {editingId ? "Save product changes" : "Create product"}
                </button>
                {editingId && (
                  <button
                    type="button"
                    className="btn-remove"
                    style={{ marginTop: "8px" }}
                    onClick={cancelEdit}
                  >
                    Cancel editing
                  </button>
                )}
              </form>
            </div>
          )}
        </section>
      )}
    </>
  );
}

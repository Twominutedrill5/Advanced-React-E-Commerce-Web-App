import { useQuery } from "@tanstack/react-query";
import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  getDocs,
  query,
  updateDoc,
  where,
  writeBatch,
} from "firebase/firestore";
import { db } from "../Library/Firebase/Firebase";
import { fetchAllProducts as fetchFakeStoreProducts } from "../api/fakestore";

export const ALL_CATEGORIES = "all";

const PRODUCTS_COLLECTION = "products";

function mapSnapshot(snapshot) {
  return snapshot.docs.map((entry) => ({
    id: entry.id,
    ...entry.data(),
  }));
}

export async function fetchAllProducts() {
  const snapshot = await getDocs(collection(db, PRODUCTS_COLLECTION));
  return mapSnapshot(snapshot);
}

export async function fetchCategories() {
  const products = await fetchAllProducts();
  const categorySet = new Set(
    products.map((product) => product.category).filter(Boolean),
  );
  return Array.from(categorySet).sort((a, b) => a.localeCompare(b));
}

export async function fetchProductsByCategory(category) {
  const filteredQuery = query(
    collection(db, PRODUCTS_COLLECTION),
    where("category", "==", category),
  );
  const snapshot = await getDocs(filteredQuery);
  return mapSnapshot(snapshot);
}

export async function createProduct(productData) {
  await addDoc(collection(db, PRODUCTS_COLLECTION), {
    ...productData,
    price: Number(productData.price),
  });
}

export async function updateProduct(productId, updates) {
  await updateDoc(doc(db, PRODUCTS_COLLECTION, productId), {
    ...updates,
    ...(updates.price != null ? { price: Number(updates.price) } : {}),
  });
}

// One-time helper: the Firestore products collection starts empty after
// migrating off FakeStoreAPI. This copies the original catalog in so the
// store isn't blank on first run. Safe to call more than once — it skips
// the import if Firestore already has products.
export async function seedProductsFromFakeStore() {
  const existing = await fetchAllProducts();
  if (existing.length > 0) {
    return { seeded: false, count: existing.length };
  }

  const fakeStoreProducts = await fetchFakeStoreProducts();
  const batch = writeBatch(db);

  fakeStoreProducts.forEach((product) => {
    const productRef = doc(collection(db, PRODUCTS_COLLECTION));
    batch.set(productRef, {
      title: product.title,
      price: Number(product.price),
      category: product.category,
      image: product.image,
      description: product.description,
      rating: product.rating || { rate: 0, count: 0 },
    });
  });

  await batch.commit();
  return { seeded: true, count: fakeStoreProducts.length };
}

export async function deleteProduct(productId) {
  await deleteDoc(doc(db, PRODUCTS_COLLECTION, productId));
}

// One hook covers both listings. The category is part of the query key, so
// React Query caches each category separately and switching back to a
// category you've already viewed is instant.
export function useProducts(category) {
  return useQuery({
    queryKey: ["products", category],
    queryFn: () =>
      category === ALL_CATEGORIES
        ? fetchAllProducts()
        : fetchProductsByCategory(category),
  });
}

export function useCategories() {
  return useQuery({
    queryKey: ["categories"],
    queryFn: fetchCategories,
    // Categories rarely change, so this one can sit in cache much longer.
    staleTime: 1000 * 60 * 30,
  });
}

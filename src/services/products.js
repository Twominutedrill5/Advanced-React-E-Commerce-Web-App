import {
  collection,
  doc,
  getDocs,
  getDoc,
  addDoc,
  updateDoc,
  deleteDoc,
  query,
  orderBy,
  serverTimestamp,
} from 'firebase/firestore';
import { db } from '../firebase';

const productsRef = collection(db, 'products');

// Firestore returns the document ID separately from its fields, so every read
// goes through this to produce one flat object the components can use.
const shape = (snapshot) => ({ id: snapshot.id, ...snapshot.data() });

// READ ALL
export async function fetchProducts() {
  const snapshot = await getDocs(query(productsRef, orderBy('title')));
  return snapshot.docs.map(shape);
}

// READ ONE — used by the edit form.
export async function fetchProduct(id) {
  const snapshot = await getDoc(doc(db, 'products', id));
  if (!snapshot.exists()) throw new Error('That product no longer exists.');
  return shape(snapshot);
}

// Firestore has no DISTINCT, so categories are derived from the products we
// already hold. With a catalog this size that's cheaper than a second read;
// a real store would keep a separate categories collection.
export function deriveCategories(products) {
  return [...new Set(products.map((product) => product.category))].sort();
}

// CREATE
export async function createProduct(data) {
  const created = await addDoc(productsRef, {
    ...data,
    price: Number(data.price),
    createdAt: serverTimestamp(),
  });
  return created.id;
}

// UPDATE
export async function updateProduct(id, data) {
  await updateDoc(doc(db, 'products', id), {
    ...data,
    price: Number(data.price),
    updatedAt: serverTimestamp(),
  });
}

// DELETE
export async function deleteProduct(id) {
  await deleteDoc(doc(db, 'products', id));
}

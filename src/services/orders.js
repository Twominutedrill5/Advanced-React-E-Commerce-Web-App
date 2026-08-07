import {
  collection,
  doc,
  addDoc,
  getDoc,
  getDocs,
  query,
  where,
  orderBy,
  serverTimestamp,
} from 'firebase/firestore';
import { db } from '../firebase';

const ordersRef = collection(db, 'orders');

// An order is a snapshot, not a set of references. Prices and titles are copied
// in at checkout time so that editing or deleting a product later doesn't
// rewrite someone's order history.
export async function createOrder({ userId, userEmail, items }) {
  const lines = items.map((item) => ({
    productId: item.id,
    title: item.title,
    price: item.price,
    image: item.image || '',
    category: item.category || '',
    count: item.count,
  }));

  const total = lines.reduce((sum, line) => sum + line.price * line.count, 0);
  const itemCount = lines.reduce((sum, line) => sum + line.count, 0);

  const created = await addDoc(ordersRef, {
    userId,
    userEmail,
    items: lines,
    itemCount,
    total: Number(total.toFixed(2)),
    createdAt: serverTimestamp(),
  });

  return created.id;
}

// A user's own history, newest first.
export async function fetchUserOrders(userId) {
  const snapshot = await getDocs(
    query(ordersRef, where('userId', '==', userId), orderBy('createdAt', 'desc')),
  );
  return snapshot.docs.map((entry) => ({ id: entry.id, ...entry.data() }));
}

export async function fetchOrder(id) {
  const snapshot = await getDoc(doc(db, 'orders', id));
  if (!snapshot.exists()) throw new Error('That order could not be found.');
  return { id: snapshot.id, ...snapshot.data() };
}

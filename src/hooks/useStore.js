import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  fetchProducts,
  fetchProduct,
  createProduct,
  updateProduct,
  deleteProduct,
} from '../services/products';
import { fetchUserOrders, fetchOrder } from '../services/orders';
import { getUserDoc, updateUserDoc } from '../services/users';

/* ---------------- Products ---------------- */

// The whole catalog is fetched once and filtered in memory. Firestore charges
// per document read, so one read plus client-side filtering beats a fresh query
// every time the dropdown changes.
export function useProducts() {
  return useQuery({
    queryKey: ['products'],
    queryFn: fetchProducts,
  });
}

export function useProduct(id) {
  return useQuery({
    queryKey: ['products', id],
    queryFn: () => fetchProduct(id),
    enabled: Boolean(id),
  });
}

// After any write, invalidating 'products' makes React Query refetch the list,
// so the grid reflects the change without a manual reload.
export function useCreateProduct() {
  const client = useQueryClient();
  return useMutation({
    mutationFn: createProduct,
    onSuccess: () => client.invalidateQueries({ queryKey: ['products'] }),
  });
}

export function useUpdateProduct() {
  const client = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }) => updateProduct(id, data),
    onSuccess: () => client.invalidateQueries({ queryKey: ['products'] }),
  });
}

export function useDeleteProduct() {
  const client = useQueryClient();
  return useMutation({
    mutationFn: deleteProduct,
    onSuccess: () => client.invalidateQueries({ queryKey: ['products'] }),
  });
}

/* ---------------- Orders ---------------- */

export function useOrders(userId) {
  return useQuery({
    queryKey: ['orders', userId],
    queryFn: () => fetchUserOrders(userId),
    enabled: Boolean(userId),
  });
}

export function useOrder(id) {
  return useQuery({
    queryKey: ['order', id],
    queryFn: () => fetchOrder(id),
    enabled: Boolean(id),
  });
}

/* ---------------- Profile ---------------- */

export function useProfile(uid) {
  return useQuery({
    queryKey: ['profile', uid],
    queryFn: () => getUserDoc(uid),
    enabled: Boolean(uid),
  });
}

export function useUpdateProfile(uid) {
  const client = useQueryClient();
  return useMutation({
    mutationFn: (changes) => updateUserDoc(uid, changes),
    onSuccess: () => client.invalidateQueries({ queryKey: ['profile', uid] }),
  });
}

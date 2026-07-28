import { useQuery } from '@tanstack/react-query';
import {
  fetchAllProducts,
  fetchCategories,
  fetchProductsByCategory,
} from '../api/fakestore';

export const ALL_CATEGORIES = 'all';

// One hook covers both listings. The category is part of the query key, so
// React Query caches each category separately and switching back to a
// category you've already viewed is instant.
export function useProducts(category) {
  return useQuery({
    queryKey: ['products', category],
    queryFn: () =>
      category === ALL_CATEGORIES
        ? fetchAllProducts()
        : fetchProductsByCategory(category),
  });
}

export function useCategories() {
  return useQuery({
    queryKey: ['categories'],
    queryFn: fetchCategories,
    // Categories rarely change, so this one can sit in cache much longer.
    staleTime: 1000 * 60 * 30,
  });
}

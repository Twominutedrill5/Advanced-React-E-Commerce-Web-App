const BASE_URL = 'https://fakestoreapi.com';

async function request(path) {
  const response = await fetch(`${BASE_URL}${path}`);
  if (!response.ok) {
    throw new Error(`Request failed (${response.status}). Try reloading the page.`);
  }
  return response.json();
}

// GET https://fakestoreapi.com/products
export function fetchAllProducts() {
  return request('/products');
}

// GET https://fakestoreapi.com/products/categories
export function fetchCategories() {
  return request('/products/categories');
}

// GET https://fakestoreapi.com/products/category/{category}
// Categories like "men's clothing" contain spaces and an apostrophe,
// so the value has to be encoded before it goes into the URL.
export function fetchProductsByCategory(category) {
  return request(`/products/category/${encodeURIComponent(category)}`);
}

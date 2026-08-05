# Sundry — Catalog & Cart

An e-commerce front end built on the [FakeStoreAPI](https://fakestoreapi.com/) catalog,
with Firebase Authentication and Firestore for accounts, carts, and order history.
Browse a live product catalog, filter it by section, sign in, build a cart that
survives a page refresh, and check out to a real order record.

**Live demo:** [https://advanced-react-e-commerce-web-app-vert.vercel.app/](https://advanced-react-e-commerce-web-app-vert.vercel.app/)

**Stack:** React 19 · Vite · React Query (TanStack Query) · Redux Toolkit · React Router · Firebase (Auth + Firestore) · Jest + React Testing Library

---

## Run it

```bash
npm install
npm run dev
```

Then open the `http://localhost:5173/` address that Vite prints **in your browser**
(leave the terminal running — the dev server has to stay up).

To produce a production build:

```bash
npm run build
npm run preview
```

---

## How it's put together

The app splits state into two halves, and that split is the whole architecture:

| Concern              | Owned by          | Why                                                                                          |
| -------------------- | ----------------- | -------------------------------------------------------------------------------------------- |
| Products, categories | **React Query**   | Data that lives on a server. Fetching, caching, loading and error states are handled for us. |
| Shopping cart        | **Redux Toolkit** | Data that belongs to this user in this session. Nothing on the server knows about it.        |

### Data fetching — React Query

`src/hooks/useCatalog.js` wraps three endpoints:

- `GET /products` — the full catalog
- `GET /products/categories` — the list that fills the dropdown
- `GET /products/category/{category}` — a filtered listing

`useProducts(category)` uses the selected category as part of its **query key**, so
each section is cached separately. Switching back to a category you've already viewed
renders instantly from cache instead of hitting the network again.

The dropdown is not hard coded. Its options are rendered from the categories
response, so if FakeStoreAPI adds a section, it appears here with no code change.

### Cart state — Redux Toolkit

`src/store/cartSlice.js` holds the cart as an **array of product objects**, each with
a `count` added to it. Actions:

| Action                                    | Effect                                                         |
| ----------------------------------------- | -------------------------------------------------------------- |
| `addToCart(product)`                      | Adds the product, or bumps `count` if it's already in the cart |
| `increaseCount(id)` / `decreaseCount(id)` | Adjusts quantity; dropping below one removes the line          |
| `removeFromCart(id)`                      | Removes a line outright                                        |
| `checkout()`                              | Records the order total, then empties the cart                 |

Totals are derived with selectors (`selectItemCount`, `selectCartTotal`) rather than
stored, so they can never drift out of sync with the items.

### Persistence — sessionStorage

The cart is mirrored into `sessionStorage` by a subscriber in `src/store/store.js`.
Every time the store changes, the current items array is written out; when the cart
empties, the key is removed. On startup the slice reads that key back as its initial
state.

Keeping the write in a subscriber instead of inside the reducers means the reducers
stay pure — Redux remains the single source of truth, and storage is just a copy of it.

### Checkout

FakeStoreAPI has no order endpoint, so checkout is simulated: it clears Redux state
and sessionStorage, then shows a confirmation with the amount that would have been
charged.

### Broken product images

Several FakeStoreAPI image URLs now return 404 on the API's side. `ProductImage`
catches the image's `onError` and swaps in an inline SVG placeholder, so the grid
stays even instead of showing broken-image icons. The placeholder is drawn inline
rather than pulled from a placeholder service, so it can't fail to load either.

---

## Project structure

```
src/
├── api/fakestore.js        Fetch functions for the three endpoints
├── hooks/useCatalog.js     React Query hooks (useProducts, useCategories)
├── store/
│   ├── store.js            Store config + sessionStorage subscriber
│   ├── cartSlice.js        Cart reducers, actions, selectors
│   └── cartStorage.js      sessionStorage read/write helpers
├── components/
│   ├── ProductCard.jsx     One product + add-to-cart
│   ├── CategorySelect.jsx  Dynamic category dropdown
│   └── ProductImage.jsx    Image with placeholder fallback
├── pages/
│   ├── Home.jsx            Catalog listing + filter
│   └── Cart.jsx            Cart lines, totals, checkout
├── App.jsx                 Masthead, nav, routes
└── main.jsx                Redux + React Query + Router providers
```

## Features

- Full product listing with title, price, category, description, rating and image
- Category dropdown populated from the API
- Add to cart from the listing page
- Cart with per-line quantity controls and removal
- Live totals: number of products and order total
- Cart persists across refreshes via sessionStorage
- Simulated checkout with confirmation
- Loading, error and empty states on every view
- Responsive down to mobile, keyboard focus styles, reduced-motion support
- Firebase Authentication (login/register/logout), with nav and product management gated to signed-in users
- Orders written to Firestore on checkout and viewable on the Orders page

---

## Testing

Unit and integration tests are written with [Jest](https://jestjs.io/) and
[React Testing Library](https://testing-library.com/react):

```bash
npm test          # single run (used in CI)
npm run test:watch  # watch mode
```

- `src/components/__tests__/ProductCard.test.jsx` — unit tests for rendering and add-to-cart
- `src/components/__tests__/CategorySelect.test.jsx` — unit tests for loading/error states and selection
- `src/pages/__tests__/Cart.integration.test.jsx` — integration test verifying the Cart page updates when a product is added

## CI/CD

`.github/workflows/main.yml` defines a single pipeline:

1. **Build & Test** — installs dependencies, runs the test suite, and builds the app on every push/PR to `main`.
2. **Deploy** — if the build/test job succeeds and the push was to `main`, deploys the built app to Vercel.

The deploy job requires `VERCEL_TOKEN`, `VERCEL_ORG_ID`, and `VERCEL_PROJECT_ID` secrets configured in the GitHub repo settings.

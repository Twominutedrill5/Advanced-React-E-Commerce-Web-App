# Sundry — Firebase Edition

An e-commerce front end backed entirely by Firebase. Users register and sign in with
Firebase Authentication, the catalog lives in Firestore instead of a third-party API,
and every order is written to the database and readable later as order history.

**Stack:** React 19 · Vite · Firebase Auth · Cloud Firestore · React Query · Redux Toolkit · React Router

This is the third version of the Sundry storefront. The previous one read products from
FakeStoreAPI and simulated checkout by emptying the cart; here the products are ours and
checkout is a real write.

---

## Setup

### 1. Create the Firebase project

In the [Firebase console](https://console.firebase.google.com/):

1. **Add project** → name it → finish. (Analytics is optional; skip it.)
2. On the project overview, click the **web icon (`</>`)** to register a web app. Give it a
   nickname; you don't need Firebase Hosting.
3. Copy the `firebaseConfig` values it shows you — that's the next step.
4. **Build → Authentication → Get started → Email/Password → Enable → Save.**
5. **Build → Firestore Database → Create database.** Pick a region and start in
   **production mode**; step 3 below replaces the rules anyway.

### 2. Add your config

```bash
cp .env.example .env.local
```

Fill in the six `VITE_FIREBASE_*` values from step 1.3. `.env.local` is git-ignored, so your
keys never reach the repository — which is why nothing is hard coded in `src/firebase.js`.

> These keys are not secrets in the usual sense; Firebase web config is visible to anyone
> using the app. What actually protects your data is the security rules below.

### 3. Publish the security rules

Open `firestore.rules` in this repo, paste the contents into
**Firestore Database → Rules**, and click **Publish**. They enforce three things: a user can
only touch their own profile, products are public to read but signed-in to write, and an
order can only be read by the account that placed it.

### 4. Install and seed

```bash
npm install
npm run dev
```

Register an account in the app first (the seed script signs in as that account to satisfy
the rules), add its email and password to `.env.local` as `SEED_EMAIL` / `SEED_PASSWORD`,
then:

```bash
npm run seed
```

That pulls the FakeStoreAPI catalog once and batch-writes it into `products`. Re-running
is safe — it refuses to duplicate unless you pass `--replace`.

### 5. Create the orders index

The first time you open **Order history**, Firestore will reject the query and log an error
containing a long console URL. That's expected: filtering by `userId` while sorting by
`createdAt` needs a composite index, and Firestore won't guess one. Click the link in the
console, click **Create index**, wait about a minute, and reload. It's a one-time step.

---

## Data model

```
users/{uid}              ← document ID is the Firebase Auth UID
  email, name, address, createdAt, updatedAt

products/{autoId}
  title, price, category, description, image, rating{rate,count}, createdAt

orders/{autoId}
  userId, userEmail, itemCount, total, createdAt
  items[]  ← { productId, title, price, image, category, count }
```

Two decisions worth knowing about:

**User documents are keyed by Auth UID.** There's no lookup step anywhere in the app — if
you're signed in, you already know your document path.

**Orders store copies, not references.** Each line item carries the title and price as they
were at checkout. If a product's price changes next week, or the product is deleted
entirely, past orders still show what was actually bought. Storing product references would
quietly rewrite people's receipts.

---

## How it's put together

State is split three ways, and that split is the architecture:

| Concern | Owned by | Why |
| --- | --- | --- |
| Who's signed in | **AuthContext** | One `onAuthStateChanged` listener, one source of truth for the session |
| Server data (products, orders, profile) | **React Query** | Caching, loading and error states, refetch-after-write |
| The cart | **Redux Toolkit** | Local to this browser; nothing on the server knows it exists until checkout |

### Authentication

`src/context/AuthContext.jsx` wraps the Firebase auth listener. It exposes `user`, plus
`register`, `login`, and `logout`.

Registration does two things, because Auth and Firestore are separate systems: it creates
the Auth account, then writes the matching `users/{uid}` document. Creating the account
alone would leave a user who can log in but has no profile.

`checking` matters more than it looks. Firebase restores a session asynchronously, so on
first paint the app genuinely doesn't know whether anyone is signed in. `ProtectedRoute`
waits for that instead of redirecting on a guess — otherwise refreshing on `/orders` would
bounce a signed-in user to the login page every time.

### Product CRUD

`src/services/products.js` holds the Firestore calls; `src/hooks/useStore.js` wraps them in
React Query. Every mutation invalidates the `products` key on success, so the grid reflects
a create, edit, or delete without a manual refresh.

Create and edit share one component (`ProductForm`). The presence of an `:id` in the URL is
the only difference between them, so there's no second near-identical form to keep in sync.

The category dropdown is derived from the products already in memory rather than a second
query — Firestore has no `DISTINCT`, and it bills per document read. Add a product in a new
category and the option appears on its own.

### Orders

Checkout writes to Firestore **first**, and only clears the cart if that write succeeds. A
network failure mid-checkout leaves the basket intact instead of silently emptying it.

Order history lists each order's ID, date and total; clicking through shows the full line
items. Both reads are scoped by `userId`, and the security rules enforce that server-side —
so the scoping isn't just a UI convention.

### Account deletion

Deleting an account removes the Firestore document first, then the Auth record. If the
second step fails you're left with an orphaned login rather than orphaned personal data,
which is the better failure.

Firebase refuses to delete an account on a stale session, so the profile page catches
`auth/requires-recent-login` and tells the user to sign in again rather than showing a raw
SDK error.

---

## Project structure

```
scripts/seedProducts.mjs    One-off: FakeStoreAPI → Firestore
firestore.rules             Security rules to paste into the console
src/
├── firebase.js             SDK init from environment variables
├── context/AuthContext.jsx Session state and auth actions
├── services/               Firestore calls, one file per collection
│   ├── users.js
│   ├── products.js
│   └── orders.js
├── hooks/useStore.js       React Query wrappers around the services
├── store/                  Redux cart + sessionStorage mirror
├── components/
│   ├── ProductCard.jsx     Product + add-to-cart + admin controls
│   ├── CategorySelect.jsx  Dropdown built from loaded products
│   ├── ProductImage.jsx    Image with placeholder fallback
│   ├── ConfirmDialog.jsx   Confirmation before destructive writes
│   └── ProtectedRoute.jsx  Session-aware route guard
├── pages/
│   ├── Home.jsx            Catalog, filter, delete
│   ├── ProductForm.jsx     Create and edit
│   ├── Cart.jsx            Cart lines, totals, order placement
│   ├── Orders.jsx          Order history
│   ├── OrderDetail.jsx     One order in full
│   ├── Profile.jsx         Read, update, delete account
│   ├── Login.jsx
│   └── Register.jsx
├── utils/format.js         Firestore timestamp formatting
├── App.jsx                 Masthead and routes
└── main.jsx                Providers
```

## Routes

| Path | Access | What it does |
| --- | --- | --- |
| `/` | Public | Catalog with category filter |
| `/cart` | Public | Cart; checkout requires sign-in |
| `/login`, `/register` | Public | Firebase email/password auth |
| `/profile` | Signed in | View, edit, delete account |
| `/orders` | Signed in | Order history |
| `/orders/:id` | Signed in | Full order detail |
| `/products/new` | Signed in | Create a product |
| `/products/:id/edit` | Signed in | Edit a product |

## Troubleshooting

**"Firebase config is missing"** — `.env.local` doesn't exist or is empty. Vite only reads
env files at startup, so restart the dev server after creating it.

**"Missing or insufficient permissions"** — the rules in `firestore.rules` haven't been
published, or you're signed out. Check the Rules tab in the console.

**Order history throws an index error** — expected on first run. See setup step 5.

**`auth/operation-not-allowed` on register** — Email/Password isn't enabled under
Authentication → Sign-in method.

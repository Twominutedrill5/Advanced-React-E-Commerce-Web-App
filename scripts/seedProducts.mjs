/**
 * Seeds the Firestore `products` collection with the FakeStoreAPI catalog.
 *
 *   node scripts/seedProducts.mjs
 *
 * Reads config from .env.local. If SEED_EMAIL and SEED_PASSWORD are set there,
 * the script signs in first — needed once security rules require an authenticated
 * user for writes. Run it once; running it again adds duplicates unless you pass
 * --replace, which clears the collection first.
 */
import { readFileSync } from 'node:fs';
import { initializeApp } from 'firebase/app';
import { getAuth, signInWithEmailAndPassword } from 'firebase/auth';
import {
  getFirestore,
  collection,
  getDocs,
  writeBatch,
  doc,
} from 'firebase/firestore';

// Minimal .env parser so the script needs no extra dependency.
function loadEnv(path = '.env.local') {
  const env = {};
  let raw;
  try {
    raw = readFileSync(path, 'utf8');
  } catch {
    console.error(`Couldn't read ${path}. Copy .env.example to .env.local first.`);
    process.exit(1);
  }
  for (const line of raw.split('\n')) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('#')) continue;
    const index = trimmed.indexOf('=');
    if (index === -1) continue;
    env[trimmed.slice(0, index).trim()] = trimmed
      .slice(index + 1)
      .trim()
      .replace(/^["']|["']$/g, '');
  }
  return env;
}

const env = loadEnv();

const app = initializeApp({
  apiKey: env.VITE_FIREBASE_API_KEY,
  authDomain: env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: env.VITE_FIREBASE_APP_ID,
});

const db = getFirestore(app);
const productsRef = collection(db, 'products');

async function main() {
  if (env.SEED_EMAIL && env.SEED_PASSWORD) {
    await signInWithEmailAndPassword(getAuth(app), env.SEED_EMAIL, env.SEED_PASSWORD);
    console.log(`Signed in as ${env.SEED_EMAIL}`);
  }

  const existing = await getDocs(productsRef);

  if (existing.size > 0 && !process.argv.includes('--replace')) {
    console.log(
      `products already has ${existing.size} documents. ` +
        'Re-run with --replace to wipe and reseed.',
    );
    process.exit(0);
  }

  if (existing.size > 0) {
    const wipe = writeBatch(db);
    existing.docs.forEach((entry) => wipe.delete(entry.ref));
    await wipe.commit();
    console.log(`Cleared ${existing.size} existing products.`);
  }

  console.log('Fetching the FakeStoreAPI catalog…');
  const response = await fetch('https://fakestoreapi.com/products');
  if (!response.ok) throw new Error(`FakeStoreAPI returned ${response.status}`);
  const products = await response.json();

  // One batch write instead of 20 round trips.
  const batch = writeBatch(db);
  for (const product of products) {
    // Drop FakeStore's numeric id — Firestore generates its own document IDs,
    // and keeping both invites confusion about which one is authoritative.
    const { id, ...fields } = product;
    batch.set(doc(productsRef), {
      ...fields,
      price: Number(fields.price),
      createdAt: new Date(),
    });
  }
  await batch.commit();

  console.log(`Seeded ${products.length} products.`);
  process.exit(0);
}

main().catch((error) => {
  console.error('Seeding failed:', error.message);
  process.exit(1);
});

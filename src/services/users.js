import { doc, setDoc, getDoc, updateDoc, deleteDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '../firebase';

// Every user document is keyed by the Firebase Auth UID. That means there's no
// lookup step anywhere — if you're signed in, you already know your doc path.
const userRef = (uid) => doc(db, 'users', uid);

// CREATE — called once, right after registration succeeds.
export async function createUserDoc(uid, { email, name }) {
  await setDoc(userRef(uid), {
    email,
    name: name || '',
    address: '',
    createdAt: serverTimestamp(),
  });
}

// READ — powers the profile page.
export async function getUserDoc(uid) {
  const snapshot = await getDoc(userRef(uid));
  return snapshot.exists() ? { id: snapshot.id, ...snapshot.data() } : null;
}

// UPDATE — the profile form.
export async function updateUserDoc(uid, changes) {
  await updateDoc(userRef(uid), {
    ...changes,
    updatedAt: serverTimestamp(),
  });
}

// DELETE — removes the Firestore document. Deleting the Auth account itself is
// a separate step, handled in the profile page so the two can fail independently.
export async function deleteUserDoc(uid) {
  await deleteDoc(userRef(uid));
}

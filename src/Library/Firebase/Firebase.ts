// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyAuXN5tHZMOAnQgIijXgt2wnWvY9YlLc3g",
  authDomain: "ecommerce-c9762.firebaseapp.com",
  projectId: "ecommerce-c9762",
  storageBucket: "ecommerce-c9762.firebasestorage.app",
  messagingSenderId: "877801257152",
  appId: "1:877801257152:web:e5f5c8a78ff3c9bc869525",
  measurementId: "G-K9RW01P6M7",
};

// Initialize Firebase ***NEED THIS FOR IMPORTS
const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);

export default app;

import { initializeApp, getApps } from "firebase/app";
import {
  getFirestore,
  doc,
  getDoc,
  setDoc,
  collection,
  getDocs,
} from "firebase/firestore";

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
};

if (!getApps().length) {
  initializeApp(firebaseConfig);
}

export const db = getFirestore();

export async function loadModelDoc(id) {
  const d = doc(db, "models", id);
  const snap = await getDoc(d);
  return snap.exists() ? { id: snap.id, ...snap.data() } : null;
}

export async function saveModelDoc(id, data) {
  const d = doc(db, "models", id);
  await setDoc(d, data, { merge: true });
}

export async function loadAllModels() {
  const col = collection(db, "models");
  const snapshot = await getDocs(col);
  const arr = [];
  snapshot.forEach((s) => arr.push({ id: s.id, ...s.data() }));
  return arr;
}

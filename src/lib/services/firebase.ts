import { initializeApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider } from 'firebase/auth';
import { firebaseConfig } from './firebase_config';
import { getFirestore } from 'firebase/firestore';

const app = initializeApp(firebaseConfig);

export const auth = getAuth();
export const googleAuth = new GoogleAuthProvider();
export const db = getFirestore();

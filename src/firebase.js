import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

// Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyB8SGnR0q--3f2ZiWQCIaALalh12EOdhFI",
  authDomain: "calmpulse-ac926.firebaseapp.com",
  projectId: "calmpulse-ac926",
  storageBucket: "calmpulse-ac926.firebasestorage.app",
  messagingSenderId: "950504760903",
  appId: "1:950504760903:web:2802dc2277753c9b163362"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

export { auth, db };
export default app; 
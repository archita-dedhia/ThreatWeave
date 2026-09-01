import { initializeApp } from 'firebase/app';
import {
  getAuth,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  sendPasswordResetEmail,
  updateProfile,
} from 'firebase/auth';
import { getFirestore, doc, setDoc, getDoc } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || 'AIzaSyAZbm1Nau9R3Y4d5TUGsw5oVbHKHQdQMgs',
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || 'auth-01-12-2006.firebaseapp.com',
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || 'auth-01-12-2006',
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || 'auth-01-12-2006.firebasestorage.app',
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || '198855961806',
  appId: import.meta.env.VITE_FIREBASE_APP_ID || '1:198855961806:web:a98869ed379a8e3f59749f',
  measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID || 'G-H0H3P48BP6',
};

export const firebaseApp = initializeApp(firebaseConfig);
export const auth = getAuth(firebaseApp);
export const db = getFirestore(firebaseApp);

export const fbSignup = async (email, password, displayName) => {
  const userCred = await createUserWithEmailAndPassword(auth, email, password);
  if (displayName) {
    await updateProfile(userCred.user, { displayName });
  }
  try {
    await setDoc(doc(db, 'users', userCred.user.uid), {
      email,
      displayName: displayName || email.split('@')[0],
      createdAt: new Date().toISOString(),
      role: 'analyst',
      onboarded: false,
    }, { merge: true });
  } catch {
    // ignore — auth already succeeded
  }
  return userCred.user;
};

export const fbLogin = async (email, password) => {
  const userCred = await signInWithEmailAndPassword(auth, email, password);
  return userCred.user;
};

export const fbLogout = async () => signOut(auth);

export const fbSendPasswordReset = async (email) => sendPasswordResetEmail(auth, email);

export const fbGetUserProfile = async (uid) => {
  const snap = await getDoc(doc(db, 'users', uid));
  return snap.exists() ? snap.data() : null;
};

export const fbAuthStateListener = (cb) => onAuthStateChanged(auth, cb);

export const mapFirebaseError = (err) => {
  if (!err) return 'Authentication failed';
  switch (err.code) {
    case 'auth/invalid-email':
      return 'Invalid email format';
    case 'auth/user-disabled':
      return 'This account has been disabled';
    case 'auth/user-not-found':
      return 'No account found with that email';
    case 'auth/wrong-password':
      return 'Incorrect password';
    case 'auth/email-already-in-use':
      return 'An account with this email already exists';
    case 'auth/operation-not-allowed':
      return 'Sign-in method not enabled in Firebase Console';
    case 'auth/weak-password':
      return 'Password must be at least 6 characters';
    case 'auth/too-many-requests':
      return 'Too many attempts — please try again in a minute';
    case 'auth/network-request-failed':
      return 'Network error — check your connection';
    default:
      return err.message?.replace?.(/^Firebase:\s?/, '') || 'Authentication failed';
  }
};

export default firebaseApp;

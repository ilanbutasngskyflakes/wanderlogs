import Constants from "expo-constants";
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import {
    getFirestore,
    initializeFirestore,
    persistentLocalCache,
    persistentMultipleTabManager,
} from "firebase/firestore";
import { getStorage } from "firebase/storage";

// Firebase config from app.json extra or environment variables
const firebaseConfig = {
  apiKey:
    Constants.expoConfig?.extra?.firebaseApiKey ||
    process.env.FIREBASE_API_KEY ||
    "AIzaSyCs9ki6EiF1Pxtm4tbGe-mAfY9zlaIlDLI",
  authDomain:
    Constants.expoConfig?.extra?.firebaseAuthDomain ||
    process.env.FIREBASE_AUTH_DOMAIN ||
    "wonderlogs-3a7ba.firebaseapp.com",
  projectId:
    Constants.expoConfig?.extra?.firebaseProjectId ||
    process.env.FIREBASE_PROJECT_ID ||
    "wonderlogs-3a7ba",
  storageBucket:
    Constants.expoConfig?.extra?.firebaseStorageBucket ||
    process.env.FIREBASE_STORAGE_BUCKET ||
    "wonderlogs-3a7ba.firebasestorage.app",
  messagingSenderId:
    Constants.expoConfig?.extra?.firebaseMessagingSenderId ||
    process.env.FIREBASE_MESSAGING_SENDER_ID ||
    "515419366010",
  appId:
    Constants.expoConfig?.extra?.firebaseAppId ||
    process.env.FIREBASE_APP_ID ||
    "1:515419366010:android:cd94976b325adea83451c3",
};

if (!firebaseConfig.apiKey) {
  console.error("Firebase config: Missing API key! Config:", firebaseConfig);
}

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firebase services
export const auth = getAuth(app);

// Initialize Firestore with persistent cache (replaces deprecated enableIndexedDbPersistence)
let firestoreInstance: any;
try {
  firestoreInstance = initializeFirestore(app, {
    localCache: persistentLocalCache({
      tabManager: persistentMultipleTabManager(),
    }),
  });
} catch (error) {
  // Firestore already initialized or cache not supported
  firestoreInstance = getFirestore(app);
}

export const firestore = firestoreInstance;
export const storage = getStorage(app);

// Optional: Connect to Firebase emulators for local development
// Uncomment and configure if using Firebase Local Emulator Suite
/*
const FIRESTORE_EMULATOR_HOST = process.env.FIRESTORE_EMULATOR_HOST || 'localhost:8080';
const AUTH_EMULATOR_URL = process.env.AUTH_EMULATOR_URL || 'http://localhost:9099';
const STORAGE_EMULATOR_URL = process.env.STORAGE_EMULATOR_URL || 'http://localhost:9199';

if (__DEV__) {
  try {
    connectAuthEmulator(auth, AUTH_EMULATOR_URL, { disableWarnings: true });
    connectFirestoreEmulator(firestore, 'localhost', 8080);
    connectStorageEmulator(storage, 'localhost', 9199);
  } catch (error) {
    console.error('Emulator connection error:', error);
  }
}
*/

export default app;

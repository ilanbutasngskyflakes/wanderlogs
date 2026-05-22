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

// Firebase config from google-services.json (via Constants.expoConfig)
const firebaseConfig = {
  apiKey: Constants.expoConfig?.extra?.firebaseApiKey,
  authDomain: Constants.expoConfig?.extra?.firebaseAuthDomain,
  projectId: Constants.expoConfig?.extra?.firebaseProjectId,
  storageBucket: Constants.expoConfig?.extra?.firebaseStorageBucket,
  messagingSenderId: Constants.expoConfig?.extra?.firebaseMessagingSenderId,
  appId: Constants.expoConfig?.extra?.firebaseAppId,
};

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

import Constants from "expo-constants";
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";

const firebaseConfig = {
  apiKey: Constants.expoConfig?.extra?.firebaseApiKey || "AIzaSyCs9ki6EiF1Pxtm4tbGe-mAfY9zlaIlDLI",
  authDomain: Constants.expoConfig?.extra?.firebaseAuthDomain || "wonderlogs-3a7ba.firebaseapp.com",
  projectId: Constants.expoConfig?.extra?.firebaseProjectId || "wonderlogs-3a7ba",
  storageBucket: Constants.expoConfig?.extra?.firebaseStorageBucket || "wonderlogs-3a7ba.firebasestorage.app",
  messagingSenderId: Constants.expoConfig?.extra?.firebaseMessagingSenderId || "515419366010",
  appId: Constants.expoConfig?.extra?.firebaseAppId || "1:515419366010:android:cd94976b325adea83451c3",
};

let app: any;
let authInstance: any;
let firestoreInstance: any;
let storageInstance: any;

function getApp() {
  if (!app) {
    app = initializeApp(firebaseConfig);
  }
  return app;
}

export function getAuth_() {
  if (!authInstance) {
    authInstance = getAuth(getApp());
  }
  return authInstance;
}

export function getFirestore_() {
  if (!firestoreInstance) {
    firestoreInstance = getFirestore(getApp());
  }
  return firestoreInstance;
}

export function getStorage_() {
  if (!storageInstance) {
    storageInstance = getStorage(getApp());
  }
  return storageInstance;
}
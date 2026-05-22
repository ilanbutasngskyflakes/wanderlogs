import {
    createUserWithEmailAndPassword,
    User as FirebaseUser,
    GoogleAuthProvider,
    signInWithCredential,
    signInWithEmailAndPassword,
    signOut,
    updateProfile,
} from "firebase/auth";
import { doc, getDoc, serverTimestamp, setDoc } from "firebase/firestore";
import { AuthUser } from "../stores/authStore";
import { auth, firestore } from "./firebase";

export interface SignUpPayload {
  email: string;
  password: string;
  name: string;
}

export interface LoginPayload {
  email: string;
  password: string;
}

/**
 * Sign up with email and password
 * Creates user in Firebase Auth and Firestore
 */
export async function signUpWithEmail({
  email,
  password,
  name,
}: SignUpPayload): Promise<AuthUser> {
  try {
    // Create Firebase Auth user
    const { user: firebaseUser } = await createUserWithEmailAndPassword(
      auth,
      email,
      password,
    );

    // Update Firebase profile
    await updateProfile(firebaseUser, {
      displayName: name,
    });

    // Create Firestore user document
    const authUser: AuthUser = {
      id: firebaseUser.uid,
      email: firebaseUser.email,
      name: name || firebaseUser.displayName,
      avatarUrl: firebaseUser.photoURL,
      createdAt: new Date(),
    };

    await setDoc(doc(firestore, "users", firebaseUser.uid), {
      id: firebaseUser.uid,
      email: firebaseUser.email,
      name: name || firebaseUser.displayName,
      avatarUrl: firebaseUser.photoURL,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    });

    return authUser;
  } catch (error: any) {
    let message = "Sign up failed";
    if (error.code === "auth/email-already-in-use") {
      message = "Email already in use";
    } else if (error.code === "auth/weak-password") {
      message = "Password is too weak (min 6 characters)";
    } else if (error.code === "auth/invalid-email") {
      message = "Invalid email address";
    }
    throw new Error(message);
  }
}

/**
 * Login with email and password
 */
export async function loginWithEmail({
  email,
  password,
}: LoginPayload): Promise<AuthUser> {
  try {
    const { user: firebaseUser } = await signInWithEmailAndPassword(
      auth,
      email,
      password,
    );

    // Fetch Firestore user document
    const userDocRef = doc(firestore, "users", firebaseUser.uid);
    const userDocSnap = await getDoc(userDocRef);

    if (!userDocSnap.exists()) {
      throw new Error("User profile not found");
    }

    const userData = userDocSnap.data();
    const authUser: AuthUser = {
      id: firebaseUser.uid,
      email: firebaseUser.email,
      name: userData.name || firebaseUser.displayName,
      avatarUrl: userData.avatarUrl || firebaseUser.photoURL,
      createdAt: userData.createdAt?.toDate?.() || new Date(),
    };

    return authUser;
  } catch (error: any) {
    let message = "Login failed";
    if (error.code === "auth/user-not-found") {
      message = "User not found";
    } else if (error.code === "auth/wrong-password") {
      message = "Incorrect password";
    } else if (error.code === "auth/invalid-email") {
      message = "Invalid email address";
    }
    throw new Error(message);
  }
}

/**
 * Login with Google (requires Google Sign-In provider setup)
 */
export async function loginWithGoogle(idToken: string): Promise<AuthUser> {
  try {
    const credential = GoogleAuthProvider.credential(idToken);
    const { user: firebaseUser } = await signInWithCredential(auth, credential);

    // Create or get Firestore user document
    const userDocRef = doc(firestore, "users", firebaseUser.uid);
    const userDocSnap = await getDoc(userDocRef);

    if (!userDocSnap.exists()) {
      // First time login - create user document
      await setDoc(userDocRef, {
        id: firebaseUser.uid,
        email: firebaseUser.email,
        name: firebaseUser.displayName,
        avatarUrl: firebaseUser.photoURL,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      });
    }

    const userData = userDocSnap.data() || {};
    const authUser: AuthUser = {
      id: firebaseUser.uid,
      email: firebaseUser.email,
      name: userData.name || firebaseUser.displayName,
      avatarUrl: userData.avatarUrl || firebaseUser.photoURL,
      createdAt: userData.createdAt?.toDate?.() || new Date(),
    };

    return authUser;
  } catch (error: any) {
    throw new Error(`Google login failed: ${error.message}`);
  }
}

/**
 * Get current authenticated user
 */
export function getCurrentUser(): FirebaseUser | null {
  return auth.currentUser;
}

/**
 * Logout
 */
export async function logoutUser(): Promise<void> {
  try {
    await signOut(auth);
  } catch (error: any) {
    throw new Error(`Logout failed: ${error.message}`);
  }
}

/**
 * Subscribe to auth state changes
 */
export function onAuthStateChange(
  callback: (user: FirebaseUser | null) => void,
): () => void {
  return auth.onAuthStateChanged(callback);
}

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
import { getAuth_, getFirestore_ } from "./firebase";

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
      getAuth_(),
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

    await setDoc(doc(getFirestore_(), "users", firebaseUser.uid), {
      id: firebaseUser.uid,
      email: firebaseUser.email,
      name: name || firebaseUser.displayName,
      avatarUrl: firebaseUser.photoURL,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    });

    return authUser;
  } catch (error: any) {
    // Log full error for debugging (includes HTTP 400 details)
    // Keep user-facing message mapping below
    // eslint-disable-next-line no-console
    console.error("signUpWithEmail error:", error);

    let message = "Sign up failed";
    if (error.code === "auth/email-already-in-use") {
      message = "Email already in use";
    } else if (error.code === "auth/weak-password") {
      message = "Password is too weak (min 6 characters)";
    } else if (error.code === "auth/invalid-email") {
      message = "Invalid email address";
    }

    const err: any = new Error(message);
    // Preserve original Firebase error code for UI handling
    err.code = error.code;
    throw err;
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
      getAuth_(),
      email,
      password,
    );

    // Fetch Firestore user document
    const userDocRef = doc(getFirestore_(), "users", firebaseUser.uid);
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
    const { user: firebaseUser } = await signInWithCredential(getAuth_(), credential);

    // Create or get Firestore user document
    const userDocRef = doc(getFirestore_(), "users", firebaseUser.uid);
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
  try {
    return getAuth_().currentUser;
  } catch (error) {
    console.warn("Could not get current user:", error);
    return null;
  }
}

/**
 * Logout
 */
export async function logoutUser(): Promise<void> {
  try {
    await signOut(getAuth_());
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
  try {
    const auth = getAuth_();
    if (!auth) {
      console.warn("Auth not initialized yet");
      return () => {};
    }
    return auth.onAuthStateChanged(callback);
  } catch (error) {
    console.warn("Auth initialization error (will retry):", error);
    // Return empty unsubscribe - auth will work after initialization
    return () => {};
  }
}

/**
 * Get current user
 */
export function getCurrentAuthUser(): FirebaseUser | null {
  try {
    return getAuth_().currentUser;
  } catch (error) {
    console.warn("Could not get current auth user:", error);
    return null;
  }
};

import { User as FirebaseUser } from "firebase/auth";
import { create } from "zustand";

export interface AuthUser {
  id: string;
  email: string | null;
  name: string | null;
  avatarUrl: string | null;
  createdAt: Date | null;
}

interface AuthState {
  user: AuthUser | null;
  firebaseUser: FirebaseUser | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  error: string | null;
  setUser: (user: AuthUser | null) => void;
  setFirebaseUser: (user: FirebaseUser | null) => void;
  setIsLoading: (isLoading: boolean) => void;
  setError: (error: string | null) => void;
  logout: () => void;
  clearError: () => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  firebaseUser: null,
  isLoading: true,
  isAuthenticated: false,
  error: null,

  setUser: (user) =>
    set({
      user,
      isAuthenticated: !!user,
    }),

  setFirebaseUser: (firebaseUser) =>
    set({
      firebaseUser,
    }),

  setIsLoading: (isLoading) =>
    set({
      isLoading,
    }),

  setError: (error) =>
    set({
      error,
    }),

  logout: () =>
    set({
      user: null,
      firebaseUser: null,
      isAuthenticated: false,
      error: null,
    }),

  clearError: () =>
    set({
      error: null,
    }),
}));

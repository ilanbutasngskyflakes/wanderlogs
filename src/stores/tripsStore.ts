import { DocumentSnapshot } from "firebase/firestore";
import { create } from "zustand";
import {
    createTrip as createTripService,
    deleteTrip as deleteTripService,
    fetchTripsForUser,
    listenToTrips,
    Trip,
    updateTrip as updateTripService,
} from "../lib/firestoreService";

interface TripsState {
  trips: Trip[];
  currentTrip: Trip | null;
  isLoading: boolean;
  error: string | null;
  lastDocSnapshot?: DocumentSnapshot;
  hasMoreTrips: boolean;
  unsubscribeTrips?: () => void;

  // Actions
  fetchTrips: (userId: string, pageSize?: number) => Promise<void>;
  fetchMoreTrips: (userId: string, pageSize?: number) => Promise<void>;
  subscribeToTrips: (userId: string) => void;
  unsubscribeFromTrips: () => void;
  createTrip: (
    userId: string,
    tripData: Omit<
      Trip,
      "id" | "userId" | "createdAt" | "updatedAt" | "entryCount"
    >,
  ) => Promise<Trip>;
  updateTrip: (
    userId: string,
    tripId: string,
    updates: Partial<Trip>,
  ) => Promise<void>;
  deleteTrip: (userId: string, tripId: string) => Promise<void>;
  setCurrentTrip: (trip: Trip | null) => void;
  setTrips: (trips: Trip[]) => void;
  addTrip: (trip: Trip) => void;
  removeTrip: (tripId: string) => void;
  clearError: () => void;
}

export const useTripsStore = create<TripsState>((set, get) => ({
  trips: [],
  currentTrip: null,
  isLoading: false,
  error: null,
  hasMoreTrips: true,

  fetchTrips: async (userId: string, pageSize = 20) => {
    set({ isLoading: true, error: null });
    try {
      const { trips, lastDoc } = await fetchTripsForUser(userId, pageSize);
      set({
        trips,
        lastDocSnapshot: lastDoc,
        hasMoreTrips: trips.length === pageSize,
        isLoading: false,
      });
    } catch (error: any) {
      set({
        error: error.message || "Failed to fetch trips",
        isLoading: false,
      });
    }
  },

  fetchMoreTrips: async (userId: string, pageSize = 20) => {
    const { lastDocSnapshot } = get();
    if (!lastDocSnapshot) return;

    set({ isLoading: true, error: null });
    try {
      const { trips, lastDoc } = await fetchTripsForUser(
        userId,
        pageSize,
        lastDocSnapshot,
      );
      set((state) => ({
        trips: [...state.trips, ...trips],
        lastDocSnapshot: lastDoc,
        hasMoreTrips: trips.length === pageSize,
        isLoading: false,
      }));
    } catch (error: any) {
      set({
        error: error.message || "Failed to fetch more trips",
        isLoading: false,
      });
    }
  },

  subscribeToTrips: (userId: string) => {
    const { unsubscribeTrips } = get();
    if (unsubscribeTrips) unsubscribeTrips();

    set({ isLoading: true, error: null });
    const unsubscribe = listenToTrips(
      userId,
      (trips) => {
        set({
          trips,
          isLoading: false,
        });
      },
      (error) => {
        set({
          error: error.message,
          isLoading: false,
        });
      },
    );

    set({ unsubscribeTrips: unsubscribe });
  },

  unsubscribeFromTrips: () => {
    const { unsubscribeTrips } = get();
    if (unsubscribeTrips) {
      unsubscribeTrips();
      set({ unsubscribeTrips: undefined });
    }
  },

  createTrip: async (userId: string, tripData) => {
    set({ isLoading: true, error: null });
    try {
      const newTrip = await createTripService(userId, tripData);
      set((state) => ({
        trips: [newTrip, ...state.trips],
        isLoading: false,
      }));
      return newTrip;
    } catch (error: any) {
      set({
        error: error.message || "Failed to create trip",
        isLoading: false,
      });
      throw error;
    }
  },

  updateTrip: async (userId: string, tripId: string, updates) => {
    set({ isLoading: true, error: null });
    try {
      await updateTripService(userId, tripId, updates);
      set((state) => ({
        trips: state.trips.map((trip) =>
          trip.id === tripId ? { ...trip, ...updates } : trip,
        ),
        currentTrip:
          state.currentTrip?.id === tripId
            ? { ...state.currentTrip, ...updates }
            : state.currentTrip,
        isLoading: false,
      }));
    } catch (error: any) {
      set({
        error: error.message || "Failed to update trip",
        isLoading: false,
      });
      throw error;
    }
  },

  deleteTrip: async (userId: string, tripId: string) => {
    set({ isLoading: true, error: null });
    try {
      await deleteTripService(userId, tripId);
      set((state) => ({
        trips: state.trips.filter((trip) => trip.id !== tripId),
        currentTrip:
          state.currentTrip?.id === tripId ? null : state.currentTrip,
        isLoading: false,
      }));
    } catch (error: any) {
      set({
        error: error.message || "Failed to delete trip",
        isLoading: false,
      });
      throw error;
    }
  },

  setCurrentTrip: (trip) => set({ currentTrip: trip }),

  setTrips: (trips) => set({ trips }),

  addTrip: (trip) =>
    set((state) => ({
      trips: [trip, ...state.trips],
    })),

  removeTrip: (tripId) =>
    set((state) => ({
      trips: state.trips.filter((trip) => trip.id !== tripId),
    })),

  clearError: () => set({ error: null }),
}));

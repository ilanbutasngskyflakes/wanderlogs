import { DocumentSnapshot } from "firebase/firestore";
import { create } from "zustand";
import {
    createEntry as createEntryService,
    deleteEntry as deleteEntryService,
    Entry,
    fetchAllEntriesForUser,
    fetchEntriesByTag,
    fetchEntriesForTrip,
    listenToAllEntries,
    listenToEntriesForTrip,
    updateEntry as updateEntryService,
} from "../lib/firestoreService";

interface EntriesState {
  entries: Entry[];
  allEntries: Entry[]; // For map and highlights screens
  currentEntry: Entry | null;
  isLoading: boolean;
  error: string | null;
  lastDocSnapshot?: DocumentSnapshot;
  hasMoreEntries: boolean;
  unsubscribeEntries?: () => void;
  unsubscribeAllEntries?: () => void;

  // Actions
  fetchEntries: (
    userId: string,
    tripId: string,
    pageSize?: number,
  ) => Promise<void>;
  fetchMoreEntries: (
    userId: string,
    tripId: string,
    pageSize?: number,
  ) => Promise<void>;
  fetchAllEntries: (userId: string) => Promise<void>;
  fetchEntriesByTag: (userId: string, tag: string) => Promise<void>;
  subscribeToEntriesForTrip: (userId: string, tripId: string) => void;
  unsubscribeFromEntriesForTrip: () => void;
  subscribeToAllEntries: (userId: string) => void;
  unsubscribeFromAllEntries: () => void;
  createEntry: (
    userId: string,
    tripId: string,
    entryData: Omit<
      Entry,
      "id" | "tripId" | "userId" | "createdAt" | "updatedAt"
    >,
  ) => Promise<Entry>;
  updateEntry: (
    userId: string,
    tripId: string,
    entryId: string,
    updates: Partial<Entry>,
  ) => Promise<void>;
  deleteEntry: (
    userId: string,
    tripId: string,
    entryId: string,
  ) => Promise<void>;
  setCurrentEntry: (entry: Entry | null) => void;
  setEntries: (entries: Entry[]) => void;
  addEntry: (entry: Entry) => void;
  removeEntry: (entryId: string) => void;
  clearError: () => void;
}

export const useEntriesStore = create<EntriesState>((set, get) => ({
  entries: [],
  allEntries: [],
  currentEntry: null,
  isLoading: false,
  error: null,
  hasMoreEntries: true,

  fetchEntries: async (userId: string, tripId: string, pageSize = 20) => {
    set({ isLoading: true, error: null });
    try {
      const { entries, lastDoc } = await fetchEntriesForTrip(
        userId,
        tripId,
        pageSize,
      );
      set({
        entries,
        lastDocSnapshot: lastDoc,
        hasMoreEntries: entries.length === pageSize,
        isLoading: false,
      });
    } catch (error: any) {
      set({
        error: error.message || "Failed to fetch entries",
        isLoading: false,
      });
    }
  },

  fetchMoreEntries: async (userId: string, tripId: string, pageSize = 20) => {
    const { lastDocSnapshot } = get();
    if (!lastDocSnapshot) return;

    set({ isLoading: true, error: null });
    try {
      const { entries, lastDoc } = await fetchEntriesForTrip(
        userId,
        tripId,
        pageSize,
        lastDocSnapshot,
      );
      set((state) => ({
        entries: [...state.entries, ...entries],
        lastDocSnapshot: lastDoc,
        hasMoreEntries: entries.length === pageSize,
        isLoading: false,
      }));
    } catch (error: any) {
      set({
        error: error.message || "Failed to fetch more entries",
        isLoading: false,
      });
    }
  },

  fetchAllEntries: async (userId: string) => {
    set({ isLoading: true, error: null });
    try {
      const allEntries = await fetchAllEntriesForUser(userId);
      set({
        allEntries,
        isLoading: false,
      });
    } catch (error: any) {
      set({
        error: error.message || "Failed to fetch all entries",
        isLoading: false,
      });
    }
  },

  fetchEntriesByTag: async (userId: string, tag: string) => {
    set({ isLoading: true, error: null });
    try {
      const entries = await fetchEntriesByTag(userId, tag);
      set({
        entries,
        isLoading: false,
      });
    } catch (error: any) {
      set({
        error: error.message || "Failed to fetch entries by tag",
        isLoading: false,
      });
    }
  },

  subscribeToEntriesForTrip: (userId: string, tripId: string) => {
    const { unsubscribeEntries } = get();
    if (unsubscribeEntries) unsubscribeEntries();

    set({ isLoading: true, error: null });
    const unsubscribe = listenToEntriesForTrip(
      userId,
      tripId,
      (entries) => {
        set({
          entries,
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

    set({ unsubscribeEntries: unsubscribe });
  },

  unsubscribeFromEntriesForTrip: () => {
    const { unsubscribeEntries } = get();
    if (unsubscribeEntries) {
      unsubscribeEntries();
      set({ unsubscribeEntries: undefined });
    }
  },

  subscribeToAllEntries: (userId: string) => {
    const { unsubscribeAllEntries } = get();
    if (unsubscribeAllEntries) unsubscribeAllEntries();

    set({ isLoading: true, error: null });
    const unsubscribe = listenToAllEntries(
      userId,
      (allEntries) => {
        set({
          allEntries,
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

    set({ unsubscribeAllEntries: unsubscribe });
  },

  unsubscribeFromAllEntries: () => {
    const { unsubscribeAllEntries } = get();
    if (unsubscribeAllEntries) {
      unsubscribeAllEntries();
      set({ unsubscribeAllEntries: undefined });
    }
  },

  createEntry: async (userId: string, tripId: string, entryData) => {
    set({ isLoading: true, error: null });
    try {
      const newEntry = await createEntryService(userId, tripId, entryData);
      // Don't manually add to entries - let the listener handle it
      set({
        isLoading: false,
      });
      return newEntry;
    } catch (error: any) {
      set({
        error: error.message || "Failed to create entry",
        isLoading: false,
      });
      throw error;
    }
  },

  updateEntry: async (
    userId: string,
    tripId: string,
    entryId: string,
    updates,
  ) => {
    set({ isLoading: true, error: null });
    try {
      await updateEntryService(userId, tripId, entryId, updates);
      set((state) => ({
        entries: state.entries.map((entry) =>
          entry.id === entryId ? { ...entry, ...updates } : entry,
        ),
        allEntries: state.allEntries.map((entry) =>
          entry.id === entryId ? { ...entry, ...updates } : entry,
        ),
        currentEntry:
          state.currentEntry?.id === entryId
            ? { ...state.currentEntry, ...updates }
            : state.currentEntry,
        isLoading: false,
      }));
    } catch (error: any) {
      set({
        error: error.message || "Failed to update entry",
        isLoading: false,
      });
      throw error;
    }
  },

  deleteEntry: async (userId: string, tripId: string, entryId: string) => {
    set({ isLoading: true, error: null });
    try {
      await deleteEntryService(userId, tripId, entryId);
      set((state) => ({
        entries: state.entries.filter((entry) => entry.id !== entryId),
        allEntries: state.allEntries.filter((entry) => entry.id !== entryId),
        currentEntry:
          state.currentEntry?.id === entryId ? null : state.currentEntry,
        isLoading: false,
      }));
    } catch (error: any) {
      set({
        error: error.message || "Failed to delete entry",
        isLoading: false,
      });
      throw error;
    }
  },

  setCurrentEntry: (entry) => set({ currentEntry: entry }),

  setEntries: (entries) => set({ entries }),

  addEntry: (entry) =>
    set((state) => ({
      entries: [entry, ...state.entries],
      allEntries: [entry, ...state.allEntries],
    })),

  removeEntry: (entryId) =>
    set((state) => ({
      entries: state.entries.filter((entry) => entry.id !== entryId),
      allEntries: state.allEntries.filter((entry) => entry.id !== entryId),
    })),

  clearError: () => set({ error: null }),
}));

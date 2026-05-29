import {
    collection,
    doc,
    DocumentSnapshot,
    getDoc,
    getDocs,
    limit,
    onSnapshot,
    orderBy,
    query,
    serverTimestamp,
    setDoc,
    startAfter,
    Timestamp,
    updateDoc,
    writeBatch,
} from "firebase/firestore";
import { deleteObject, ref } from "firebase/storage";
import { getFirestore_, getStorage_ } from "./firebase";

export interface Trip {
  id: string;
  userId: string;
  name: string;
  destination: string;
  startDate: Date | Timestamp;
  endDate: Date | Timestamp;
  coverPhotoUrl?: string;
  createdAt: Date | Timestamp;
  updatedAt: Date | Timestamp;
  entryCount: number;
  lastEntryAt?: Date | Timestamp;
}

export interface Entry {
  id: string;
  tripId: string;
  userId: string;
  placeName: string;
  description?: string;
  latitude: number;
  longitude: number;
  locationName?: string;
  date: Date | Timestamp;
  createdAt: Date | Timestamp;
  updatedAt: Date | Timestamp;
  highlightTags: string[];
  isFavorite: boolean;
  photos: Photo[];
}

export interface Photo {
  id: string;
  url: string;
  storagePath: string;
  width?: number;
  height?: number;
  order: number;
}

// ============ TRIP OPERATIONS ============

/**
 * Create a new trip
 */
export async function createTrip(
  userId: string,
  tripData: Omit<
    Trip,
    "id" | "userId" | "createdAt" | "updatedAt" | "entryCount"
  >,
): Promise<Trip> {
  try {
    const tripRef = doc(collection(getFirestore_(), `users/${userId}/trips`));
    const newTrip: any = {
      ...tripData,
      id: tripRef.id,
      userId,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
      entryCount: 0,
    };

    console.log("firestoreService.createTrip: saving", { userId, tripId: tripRef.id, tripData });
    // Remove undefined fields (Firestore rejects undefined values)
    const sanitized: any = Object.fromEntries(
      Object.entries(newTrip).filter(([, v]) => v !== undefined),
    );
    console.log("firestoreService.createTrip: sanitized", sanitized);
    await setDoc(tripRef, sanitized);
    console.log("firestoreService.createTrip: saved", { tripId: tripRef.id });
    return sanitized as Trip;
  } catch (error: any) {
    console.error("firestoreService.createTrip error:", error);
    throw new Error(`Failed to create trip: ${error.message}`);
  }
}

/**
 * Fetch trips for a user (paginated)
 */
export async function fetchTripsForUser(
  userId: string,
  pageSize: number = 20,
  lastDocSnapshot?: DocumentSnapshot,
): Promise<{ trips: Trip[]; lastDoc?: DocumentSnapshot }> {
  try {
    const tripsRef = collection(getFirestore_(), `users/${userId}/trips`);
    let q = query(tripsRef, orderBy("createdAt", "desc"), limit(pageSize));

    if (lastDocSnapshot) {
      q = query(
        tripsRef,
        orderBy("createdAt", "desc"),
        startAfter(lastDocSnapshot),
        limit(pageSize),
      );
    }

    const querySnapshot = await getDocs(q);
    const trips = querySnapshot.docs.map((doc) => ({
      ...doc.data(),
      id: doc.id,
    })) as Trip[];

    return {
      trips,
      lastDoc: querySnapshot.docs[querySnapshot.docs.length - 1],
    };
  } catch (error: any) {
    throw new Error(`Failed to fetch trips: ${error.message}`);
  }
}

/**
 * Get a single trip
 */
export async function getTrip(
  userId: string,
  tripId: string,
): Promise<Trip | null> {
  try {
    const tripRef = doc(getFirestore_(), `users/${userId}/trips/${tripId}`);
    const tripSnap = await getDoc(tripRef);

    if (!tripSnap.exists()) {
      return null;
    }

    return tripSnap.data() as Trip;
  } catch (error: any) {
    throw new Error(`Failed to get trip: ${error.message}`);
  }
}

/**
 * Update a trip
 */
export async function updateTrip(
  userId: string,
  tripId: string,
  updates: Partial<Trip>,
): Promise<void> {
  try {
    const tripRef = doc(getFirestore_(), `users/${userId}/trips/${tripId}`);
    await updateDoc(tripRef, {
      ...updates,
      updatedAt: serverTimestamp(),
    });
  } catch (error: any) {
    throw new Error(`Failed to update trip: ${error.message}`);
  }
}

/**
 * Delete a trip and cascade delete all entries and photos
 */
export async function deleteTrip(
  userId: string,
  tripId: string,
): Promise<void> {
  try {
    const batch = writeBatch(getFirestore_());

    // Get all entries for this trip
    const entriesRef = collection(
      getFirestore_(),
      `users/${userId}/trips/${tripId}/entries`,
    );
    const entriesSnap = await getDocs(entriesRef);

    // Delete all photos in storage for each entry
    for (const entryDoc of entriesSnap.docs) {
      const entry = entryDoc.data() as Entry;

      // Delete photos from storage
      if (entry.photos && entry.photos.length > 0) {
        for (const photo of entry.photos) {
          try {
            const photoRef = ref(getStorage_(), photo.storagePath);
            await deleteObject(photoRef);
          } catch (error) {
            console.warn(`Failed to delete photo: ${photo.storagePath}`, error);
          }
        }
      }

      // Delete entry document
      batch.delete(entryDoc.ref);
    }

    // Delete trip document
    const tripRef = doc(getFirestore_(), `users/${userId}/trips/${tripId}`);
    batch.delete(tripRef);

    await batch.commit();
  } catch (error: any) {
    throw new Error(`Failed to delete trip: ${error.message}`);
  }
}

// ============ ENTRY OPERATIONS ============

/**
 * Create a new entry
 */
export async function createEntry(
  userId: string,
  tripId: string,
  entryData: Omit<
    Entry,
    "id" | "tripId" | "userId" | "createdAt" | "updatedAt"
  >,
): Promise<Entry> {
  try {
    const entryRef = doc(
      collection(getFirestore_(), `users/${userId}/trips/${tripId}/entries`),
    );
    const newEntry: any = {
      ...entryData,
      id: entryRef.id,
      tripId,
      userId,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    };

    // Remove undefined fields before saving
    const sanitizedEntry: any = Object.fromEntries(
      Object.entries(newEntry).filter(([, v]) => v !== undefined),
    );
    await setDoc(entryRef, sanitizedEntry);

    // Update trip's entryCount and lastEntryAt
    const tripRef = doc(getFirestore_(), `users/${userId}/trips/${tripId}`);
    const tripSnap = await getDoc(tripRef);
    if (tripSnap.exists()) {
      const trip = tripSnap.data() as Trip;
      await updateDoc(tripRef, {
        entryCount: (trip.entryCount || 0) + 1,
        lastEntryAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      });
    }

    return sanitizedEntry as Entry;
  } catch (error: any) {
    throw new Error(`Failed to create entry: ${error.message}`);
  }
}

/**
 * Fetch entries for a trip (paginated)
 */
export async function fetchEntriesForTrip(
  userId: string,
  tripId: string,
  pageSize: number = 20,
  lastDocSnapshot?: DocumentSnapshot,
): Promise<{ entries: Entry[]; lastDoc?: DocumentSnapshot }> {
  try {
    const entriesRef = collection(
      getFirestore_(),
      `users/${userId}/trips/${tripId}/entries`,
    );
    let q = query(entriesRef, orderBy("date", "desc"), limit(pageSize));

    if (lastDocSnapshot) {
      q = query(
        entriesRef,
        orderBy("date", "desc"),
        startAfter(lastDocSnapshot),
        limit(pageSize),
      );
    }

    const querySnapshot = await getDocs(q);
    const entries = querySnapshot.docs.map((doc) => ({
      ...doc.data(),
      id: doc.id,
    })) as Entry[];

    return {
      entries,
      lastDoc: querySnapshot.docs[querySnapshot.docs.length - 1],
    };
  } catch (error: any) {
    throw new Error(`Failed to fetch entries: ${error.message}`);
  }
}

/**
 * Get a single entry
 */
export async function getEntry(
  userId: string,
  tripId: string,
  entryId: string,
): Promise<Entry | null> {
  try {
    const entryRef = doc(
      getFirestore_(),
      `users/${userId}/trips/${tripId}/entries/${entryId}`,
    );
    const entrySnap = await getDoc(entryRef);

    if (!entrySnap.exists()) {
      return null;
    }

    return entrySnap.data() as Entry;
  } catch (error: any) {
    throw new Error(`Failed to get entry: ${error.message}`);
  }
}

/**
 * Update an entry
 */
export async function updateEntry(
  userId: string,
  tripId: string,
  entryId: string,
  updates: Partial<Entry>,
): Promise<void> {
  try {
    const entryRef = doc(
      getFirestore_(),
      `users/${userId}/trips/${tripId}/entries/${entryId}`,
    );
    await updateDoc(entryRef, {
      ...updates,
      updatedAt: serverTimestamp(),
    });
  } catch (error: any) {
    throw new Error(`Failed to update entry: ${error.message}`);
  }
}

/**
 * Delete an entry and its photos
 */
export async function deleteEntry(
  userId: string,
  tripId: string,
  entryId: string,
): Promise<void> {
  try {
    const batch = writeBatch(getFirestore_());

    // Get entry to find photos
    const entryRef = doc(
      getFirestore_(),
      `users/${userId}/trips/${tripId}/entries/${entryId}`,
    );
    const entrySnap = await getDoc(entryRef);

    if (entrySnap.exists()) {
      const entry = entrySnap.data() as Entry;

      // Delete photos from storage
      if (entry.photos && entry.photos.length > 0) {
        for (const photo of entry.photos) {
          try {
            const photoRef = ref(getStorage_(), photo.storagePath);
            await deleteObject(photoRef);
          } catch (error) {
            console.warn(`Failed to delete photo: ${photo.storagePath}`, error);
          }
        }
      }
    }

    // Delete entry document
    batch.delete(entryRef);

    // Decrement trip's entryCount
    const tripRef = doc(getFirestore_(), `users/${userId}/trips/${tripId}`);
    batch.update(tripRef, {
      entryCount: (entrySnap.data()?.entryCount || 1) - 1,
      updatedAt: serverTimestamp(),
    });

    await batch.commit();
  } catch (error: any) {
    throw new Error(`Failed to delete entry: ${error.message}`);
  }
}

// ============ QUERY HELPERS ============

/**
 * Fetch all entries across all trips for a user (for map/highlights)
 */
export async function fetchAllEntriesForUser(userId: string): Promise<Entry[]> {
  try {
    const tripsSnap = await getDocs(
      collection(getFirestore_(), `users/${userId}/trips`),
    );
    const allEntries: Entry[] = [];

    for (const tripDoc of tripsSnap.docs) {
      const entriesSnap = await getDocs(
        collection(getFirestore_(), `users/${userId}/trips/${tripDoc.id}/entries`),
      );
      allEntries.push(
        ...(entriesSnap.docs.map((doc) => ({
          ...doc.data(),
          id: doc.id,
        })) as Entry[]),
      );
    }

    return allEntries;
  } catch (error: any) {
    throw new Error(`Failed to fetch all entries: ${error.message}`);
  }
}

/**
 * Fetch entries filtered by highlight tag
 */
export async function fetchEntriesByTag(
  userId: string,
  tag: string,
): Promise<Entry[]> {
  try {
    const entries = await fetchAllEntriesForUser(userId);
    return entries.filter((entry) => entry.highlightTags.includes(tag));
  } catch (error: any) {
    throw new Error(`Failed to fetch entries by tag: ${error.message}`);
  }
}

// ============ REAL-TIME LISTENERS ============

/**
 * Listen to trips in real-time (ordered by createdAt desc)
 */
export function listenToTrips(
  userId: string,
  onUpdate: (trips: Trip[]) => void,
  onError?: (error: Error) => void,
): () => void {
  try {
    const tripsRef = collection(getFirestore_(), `users/${userId}/trips`);
    const q = query(tripsRef, orderBy("createdAt", "desc"));

    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        const trips = snapshot.docs.map((doc) => ({
          ...doc.data(),
          id: doc.id,
        })) as Trip[];
        onUpdate(trips);
      },
      (error) => {
        console.error("Error listening to trips:", error);
        if (onError)
          onError(new Error(`Failed to listen to trips: ${error.message}`));
      },
    );

    return unsubscribe;
  } catch (error: any) {
    const err = new Error(`Failed to setup trip listener: ${error.message}`);
    if (onError) onError(err);
    return () => {};
  }
}

/**
 * Listen to entries for a specific trip in real-time
 */
export function listenToEntriesForTrip(
  userId: string,
  tripId: string,
  onUpdate: (entries: Entry[]) => void,
  onError?: (error: Error) => void,
): () => void {
  try {
    const entriesRef = collection(
      getFirestore_(),
      `users/${userId}/trips/${tripId}/entries`,
    );
    const q = query(entriesRef, orderBy("date", "desc"));

    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        const entries = snapshot.docs.map((doc) => ({
          ...doc.data(),
          id: doc.id,
        })) as Entry[];
        onUpdate(entries);
      },
      (error) => {
        console.error("Error listening to entries:", error);
        if (onError)
          onError(new Error(`Failed to listen to entries: ${error.message}`));
      },
    );

    return unsubscribe;
  } catch (error: any) {
    const err = new Error(`Failed to setup entry listener: ${error.message}`);
    if (onError) onError(err);
    return () => {};
  }
}

/**
 * Listen to all entries across all trips in real-time (for map/highlights)
 */
export function listenToAllEntries(
  userId: string,
  onUpdate: (entries: Entry[]) => void,
  onError?: (error: Error) => void,
): () => void {
  try {
    const tripsRef = collection(getFirestore_(), `users/${userId}/trips`);
    const allEntries: Entry[] = [];
    let unsubscribeTrips: (() => void) | null = null;
    const tripUnsubscribers: (() => void)[] = [];

    const tripsUnsubscribe = onSnapshot(
      tripsRef,
      (tripsSnapshot) => {
        // Cleanup old listeners for deleted trips
        tripUnsubscribers.forEach((unsub) => unsub());
        tripUnsubscribers.length = 0;
        allEntries.length = 0;

        // Setup listeners for all trips
        tripsSnapshot.docs.forEach((tripDoc) => {
          const entriesRef = collection(
            getFirestore_(),
            `users/${userId}/trips/${tripDoc.id}/entries`,
          );
          const entriesUnsubscribe = onSnapshot(
            entriesRef,
            (entriesSnapshot) => {
              const tripEntries = entriesSnapshot.docs.map((doc) => ({
                ...doc.data(),
                id: doc.id,
              })) as Entry[];
              allEntries.push(
                ...tripEntries.filter(
                  (e) =>
                    !allEntries.find(
                      (existing) =>
                        existing.id === e.id && existing.tripId === e.tripId,
                    ),
                ),
              );
              onUpdate([...allEntries]);
            },
            (error) => {
              console.error("Error listening to entries in trip:", error);
              if (onError)
                onError(
                  new Error(`Failed to listen to entries: ${error.message}`),
                );
            },
          );
          tripUnsubscribers.push(entriesUnsubscribe);
        });
      },
      (error) => {
        console.error("Error listening to trips:", error);
        if (onError)
          onError(
            new Error(`Failed to listen to all entries: ${error.message}`),
          );
      },
    );

    return () => {
      tripsUnsubscribe();
      tripUnsubscribers.forEach((unsub) => unsub());
    };
  } catch (error: any) {
    const err = new Error(
      `Failed to setup all entries listener: ${error.message}`,
    );
    if (onError) onError(err);
    return () => {};
  }
}

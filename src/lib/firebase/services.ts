
'use server';

import { db } from '@/lib/firebase/config';
import {
  collection,
  getDocs,
  doc,
  getDoc,
  addDoc,
  updateDoc,
  deleteDoc,
  query,
  where,
  Timestamp,
  DocumentData,
} from 'firebase/firestore';
import type { User, Club, Event, Registration } from '@/lib/types';
import { revalidatePath } from 'next/cache';

// Generic function to convert Firestore doc to a specific type
function docToType<T>(doc: DocumentData): T {
    const data = doc.data();
    const result: { [key: string]: any } = { id: doc.id };

    for (const key in data) {
        if (data[key] instanceof Timestamp) {
            result[key] = data[key].toDate();
        } else {
            result[key] = data[key];
        }
    }
    return result as T;
}


// User services
export async function getUsers(): Promise<User[]> {
  const usersCol = collection(db, 'users');
  const userSnapshot = await getDocs(usersCol);
  return userSnapshot.docs.map(d => docToType<User>(d));
}

export async function getUser(id: string): Promise<User | null> {
    const userDoc = await getDoc(doc(db, 'users', id));
    return userDoc.exists() ? docToType<User>(userDoc) : null;
}

export async function getUserByEmail(email: string): Promise<User | null> {
    const q = query(collection(db, "users"), where("email", "==", email));
    const snapshot = await getDocs(q);
    if (snapshot.empty) {
        return null;
    }
    return docToType<User>(snapshot.docs[0]);
}

export async function createUser(userData: Omit<User, 'id'>): Promise<User> {
    const docRef = await addDoc(collection(db, 'users'), { ...userData, clubId: null });
    return { id: docRef.id, ...userData, clubId: null };
}


export async function updateUser(userId: string, data: Partial<User>) {
    const userRef = doc(db, 'users', userId);
    await updateDoc(userRef, data);
    revalidatePath('/dashboard');
}

// Club services
export async function getClubs(): Promise<Club[]> {
  const clubsCol = collection(db, 'clubs');
  const clubSnapshot = await getDocs(clubsCol);
  return clubSnapshot.docs.map(d => docToType<Club>(d));
}

export async function getClub(id: string): Promise<Club | null> {
    const clubDoc = await getDoc(doc(db, 'clubs', id));
    return clubDoc.exists() ? docToType<Club>(clubDoc) : null;
}

export async function createClub(clubData: Omit<Club, 'id'>) {
    const clubsCol = collection(db, 'clubs');
    await addDoc(clubsCol, clubData);
    revalidatePath('/dashboard');
}

export async function updateClub(id: string, clubData: Partial<Club>) {
    const clubRef = doc(db, 'clubs', id);
    await updateDoc(clubRef, clubData);
    revalidatePath('/dashboard');
    revalidatePath(`/clubs/${id}`);
}

export async function deleteClub(id: string) {
    await deleteDoc(doc(db, 'clubs', id));
    revalidatePath('/dashboard');
}


// Event services
export async function getEvents(): Promise<Event[]> {
  const eventsCol = collection(db, 'events');
  const eventSnapshot = await getDocs(eventsCol);
  return eventSnapshot.docs.map(d => docToType<Event>(d));
}

export async function getEvent(id: string): Promise<Event | null> {
    const eventDoc = await getDoc(doc(db, 'events', id));
    return eventDoc.exists() ? docToType<Event>(eventDoc) : null;
}

export async function getEventsByClub(clubId: string): Promise<Event[]> {
    const q = query(collection(db, "events"), where("clubId", "==", clubId));
    const snapshot = await getDocs(q);
    return snapshot.docs.map(d => docToType<Event>(d));
}

export async function createEvent(eventData: Omit<Event, 'id'>) {
    const eventsCol = collection(db, 'events');
    await addDoc(eventsCol, eventData);
    revalidatePath('/dashboard');
}

export async function updateEvent(id: string, eventData: Partial<Event>) {
    const eventRef = doc(db, 'events', id);
    await updateDoc(eventRef, eventData);
    revalidatePath('/dashboard');
    revalidatePath(`/events/${id}`);
}

export async function deleteEvent(id: string) {
    await deleteDoc(doc(db, 'events', id));
    revalidatePath('/dashboard');
}


// Registration services
export async function getRegistrationsForUser(userId: string): Promise<Registration[]> {
    const q = query(collection(db, "registrations"), where("userId", "==", userId));
    const snapshot = await getDocs(q);
    return snapshot.docs.map(d => docToType<Registration>(d));
}

export async function registerForEvent(userId: string, eventId: string) {
    await addDoc(collection(db, 'registrations'), { userId, eventId });
    revalidatePath('/dashboard');
}

export async function unregisterFromEvent(userId: string, eventId: string) {
    const q = query(collection(db, "registrations"), where("userId", "==", userId), where("eventId", "==", eventId));
    const snapshot = await getDocs(q);
    if (!snapshot.empty) {
        const docId = snapshot.docs[0].id;
        await deleteDoc(doc(db, 'registrations', docId));
    }
    revalidatePath('/dashboard');
}

export async function getRegistrationsForEvent(eventId: string): Promise<Registration[]> {
    const q = query(collection(db, "registrations"), where("eventId", "==", eventId));
    const snapshot = await getDocs(q);
    return snapshot.docs.map(d => docToType<Registration>(d));
}

export async function getRegisteredUsersForEvent(eventId: string): Promise<User[]> {
    const registrations = await getRegistrationsForEvent(eventId);
    if (registrations.length === 0) return [];
    
    const userIds = registrations.map(r => r.userId);
    // Firestore 'in' queries are limited to 30 items. For a real app with many users,
    // you might need to batch these queries.
    if (userIds.length === 0) return [];

    const q = query(collection(db, "users"), where("__name__", "in", userIds));
    const userSnapshot = await getDocs(q);
    return userSnapshot.docs.map(d => docToType<User>(d));
}

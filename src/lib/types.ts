export type UserRole = "student" | "club_staff" | "admin";

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  clubId?: string | null; // for club_staff, can be null
}

export interface Club {
  id: string;
  name:string;
  description: string;
  imageUrl?: string | null;
}

export interface Event {
  id: string;
  name: string;
  description: string;
  date: string; // Storing as ISO string
  location: string;
  clubId: string;
  organizer: string; // Club name
  imageUrl?: string | null;
}

export interface Registration {
  id: string;
  eventId: string;
  userId: string;
}

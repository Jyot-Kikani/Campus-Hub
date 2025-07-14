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
}

export interface Event {
  id: string;
  name: string;
  description: string;
  date: Date;
  location: string;
  clubId: string;
  organizer: string; // Club name
}

export interface Registration {
  id: string;
  eventId: string;
  userId: string;
}

import type { User, Club, Event, Registration } from "@/lib/types";

export const mockUsers: User[] = [
  { id: "1", name: "Alice Student", email: "alice@university.edu", role: "student" },
  { id: "2", name: "Bob Staff", email: "bob@university.edu", role: "club_staff", clubId: "c1" },
  { id: "3", name: "Charlie Admin", email: "charlie@university.edu", role: "admin" },
  { id: "4", name: "Diana Student", email: "diana@university.edu", role: "student" },
];

export const mockClubs: Club[] = [
  { id: "c1", name: "Tech Innovators Club", description: "Exploring the future of technology." },
  { id: "c2", name: "Art & Design Society", description: "A place for creative minds." },
  { id: "c3", name: "Debate Club", description: "Engage in intellectual discourse." },
];

export const mockEvents: Event[] = [
  { id: "e1", name: "AI Hackathon", description: "Build an AI project in 24 hours. Prizes for the best innovations!", date: new Date(new Date().setDate(new Date().getDate() + 7)), location: "Engineering Building, Room 101", clubId: "c1", organizer: "Tech Innovators Club" },
  { id: "e2", name: "Guest Lecture: The Art of Storytelling", description: "Learn from a renowned visual artist about narrative in art.", date: new Date(new Date().setDate(new Date().getDate() + 10)), location: "Fine Arts Hall", clubId: "c2", organizer: "Art & Design Society" },
  { id: "e3", name: "Annual Debate Championship", description: "Witness the sharpest minds battle it out on pressing global issues.", date: new Date(new Date().setDate(new Date().getDate() + 14)), location: "Grand Auditorium", clubId: "c3", organizer: "Debate Club"},
  { id: "e4", name: "Introduction to Web3", description: "A workshop covering the basics of blockchain and decentralized applications.", date: new Date(new Date().setDate(new Date().getDate() + 20)), location: "CS Department, Lab 3", clubId: "c1", organizer: "Tech Innovators Club" },
];

export const mockRegistrations: Registration[] = [
  { id: "r1", eventId: "e2", userId: "1" },
  { id: "r2", eventId: "e3", userId: "1" },
  { id: "r3", eventId: "e1", userId: "4" },
];


"use client";

import { useAuth } from "@/components/auth-provider";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import type { User, UserRole } from "@/lib/types";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";

const roleColors: Record<UserRole, "default" | "secondary" | "destructive"> = {
  admin: "destructive",
  club_staff: "secondary",
  student: "default",
};

export function UserManagement() {
  const { users, updateUser, user: currentUser, clubs } = useAuth();
  
  const handleRoleChange = (userId: string, newRole: UserRole) => {
    const userData: Partial<User> = { role: newRole };
    if (newRole !== 'club_staff') {
      // Using null is better than an empty string for "no value" in Firestore
      userData.clubId = null; 
    }
    updateUser(userId, userData);
  };

  const handleClubChange = (userId: string, newClubId: string) => {
    // newClubId will be the club's ID, or an empty string if cleared.
    // We store null in the database for "no club".
    updateUser(userId, { clubId: newClubId || null });
  };
  
  return (
    <Card className="mt-6">
      <CardHeader>
        <CardTitle className="font-headline">All Users</CardTitle>
        <CardDescription>View and manage roles for all users in the system.</CardDescription>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Email</TableHead>
              <TableHead>Role</TableHead>
              <TableHead>Assigned Club</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {users.map((user) => (
              <TableRow key={user.id}>
                <TableCell className="font-medium">{user.name}</TableCell>
                <TableCell>{user.email}</TableCell>
                <TableCell>
                  <Select 
                    defaultValue={user.role} 
                    onValueChange={(newRole: UserRole) => handleRoleChange(user.id, newRole)}
                    disabled={user.id === currentUser?.id}
                  >
                    <SelectTrigger className="w-[130px]">
                      <SelectValue placeholder="Select a role" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="student">Student</SelectItem>
                      <SelectItem value="club_staff">Club Staff</SelectItem>
                      <SelectItem value="admin">Admin</SelectItem>
                    </SelectContent>
                  </Select>
                </TableCell>
                <TableCell>
                  <Select
                    value={user.clubId || ""} // The Select value can be an empty string to show the placeholder
                    onValueChange={(newClubId) => handleClubChange(user.id, newClubId)}
                    disabled={user.role !== 'club_staff' || user.id === currentUser?.id}
                  >
                     <SelectTrigger className="w-[180px]">
                        <SelectValue placeholder="No club assigned" />
                     </SelectTrigger>
                     <SelectContent>
                        {/* A SelectItem's value cannot be an empty string. The placeholder handles this state. */}
                        {clubs.map(club => (
                           <SelectItem key={club.id} value={club.id}>{club.name}</SelectItem>
                        ))}
                     </SelectContent>
                  </Select>
                </TableCell>
                <TableCell className="text-right">
                   <Badge variant={roleColors[user.role]} className="capitalize">
                    {user.role.replace('_', ' ')}
                  </Badge>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}

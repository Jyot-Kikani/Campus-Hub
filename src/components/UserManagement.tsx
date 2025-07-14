
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
      userData.clubId = ''; // Clear clubId if role is not club_staff
    }
    updateUser(userId, userData);
  };

  const handleClubChange = (userId: string, newClubId: string) => {
    updateUser(userId, { clubId: newClubId });
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
                    value={user.clubId || ""}
                    onValueChange={(newClubId) => handleClubChange(user.id, newClubId)}
                    disabled={user.role !== 'club_staff' || user.id === currentUser?.id}
                  >
                     <SelectTrigger className="w-[180px]">
                        <SelectValue placeholder="Select a club" />
                     </SelectTrigger>
                     <SelectContent>
                        <SelectItem value="" disabled>No club assigned</SelectItem>
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

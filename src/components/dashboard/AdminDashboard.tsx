"use client";

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { UserManagement } from "@/components/UserManagement";
import { ClubManagement } from "@/components/ClubManagement";

export default function AdminDashboard() {
  return (
    <div className="space-y-8">
       <div>
          <h1 className="text-4xl font-headline text-primary">Admin Control Panel</h1>
          <p className="text-lg font-body text-muted-foreground mt-2">Oversee university clubs and manage user roles across the platform.</p>
        </div>
      <Tabs defaultValue="users" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="users">User Management</TabsTrigger>
          <TabsTrigger value="clubs">Club Management</TabsTrigger>
        </TabsList>
        <TabsContent value="users">
            <UserManagement />
        </TabsContent>
        <TabsContent value="clubs">
           <ClubManagement />
        </TabsContent>
      </Tabs>
    </div>
  );
}

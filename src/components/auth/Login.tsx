"use client";

import { useAuth } from "@/components/auth-provider";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { useState } from "react";
import type { UserRole } from "@/lib/types";

export function Login() {
  const { login } = useAuth();
  const [role, setRole] = useState<UserRole>("student");

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    // Dummy email, as we're just selecting a role
    login(`user@${role}.com`, role);
  };

  return (
    <div className="flex items-center justify-center py-12 px-4">
      <Card className="w-full max-w-md shadow-2xl animate-fade-in-up">
        <CardHeader className="text-center">
          <CardTitle className="text-3xl font-headline">Select a Role to Sign In</CardTitle>
          <CardDescription className="font-body">
            Choose a user role to experience the portal.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleLogin} className="space-y-6">
            <RadioGroup
              defaultValue="student"
              onValueChange={(value: UserRole) => setRole(value)}
              className="space-y-2"
            >
              <Label className="text-lg font-headline">I am a...</Label>
              <div className="flex items-center space-x-2 p-3 rounded-md border has-[:checked]:bg-primary/10 has-[:checked]:border-primary transition-all">
                <RadioGroupItem value="student" id="student" />
                <Label htmlFor="student" className="font-body text-base cursor-pointer flex-1">Student</Label>
              </div>
              <div className="flex items-center space-x-2 p-3 rounded-md border has-[:checked]:bg-primary/10 has-[:checked]:border-primary transition-all">
                <RadioGroupItem value="club_staff" id="club_staff" />
                <Label htmlFor="club_staff" className="font-body text-base cursor-pointer flex-1">Club Staff</Label>
              </div>
              <div className="flex items-center space-x-2 p-3 rounded-md border has-[:checked]:bg-primary/10 has-[:checked]:border-primary transition-all">
                <RadioGroupItem value="admin" id="admin" />
                <Label htmlFor="admin" className="font-body text-base cursor-pointer flex-1">Admin</Label>
              </div>
            </RadioGroup>
            <Button type="submit" className="w-full font-headline text-lg">
              Sign In
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}

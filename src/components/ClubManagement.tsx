"use client";

import { useState, useEffect } from "react";
import { getClubs, createClub, updateClub, deleteClub } from "@/lib/firebase/services";
import type { Club } from "@/lib/types";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { PlusCircle, Edit, Trash2 } from "lucide-react";
import { ClubForm } from "@/components/ClubForm";
import { toast } from "@/hooks/use-toast";
import { Skeleton } from "@/components/ui/skeleton";

export function ClubManagement() {
    const [clubs, setClubs] = useState<Club[]>([]);
    const [editingClub, setEditingClub] = useState<Club | null>(null);
    const [isFormOpen, setIsFormOpen] = useState(false);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const fetchClubs = async () => {
            setIsLoading(true);
            const clubsData = await getClubs();
            setClubs(clubsData);
            setIsLoading(false);
        };
        fetchClubs();
    }, []);

    const handleEdit = (club: Club) => {
        setEditingClub(club);
        setIsFormOpen(true);
    };

    const handleCreateNew = () => {
        setEditingClub(null);
        setIsFormOpen(true);
    };

    const handleDelete = async (clubId: string) => {
        try {
            await deleteClub(clubId);
            setClubs(prev => prev.filter(c => c.id !== clubId));
            toast({ title: "Success", description: "Club deleted." });
        } catch (error) {
            toast({ title: "Error", description: "Failed to delete club.", variant: "destructive" });
        }
    };

    const handleFormSubmit = async (clubData: Omit<Club, 'id'>) => {
        try {
            if (editingClub) {
                await updateClub(editingClub.id, clubData);
            } else {
                await createClub(clubData);
            }
            const updatedClubs = await getClubs();
            setClubs(updatedClubs);
            setIsFormOpen(false);
            setEditingClub(null);
            toast({ title: "Success", description: `Club ${editingClub ? 'updated' : 'created'}.`});
        } catch (error) {
            toast({ title: "Error", description: `Failed to ${editingClub ? 'update' : 'create'} club.`, variant: "destructive" });
        }
    };

    return (
        <div className="mt-6">
            <div className="flex justify-between items-center mb-6">
                <div>
                  <h2 className="text-2xl font-headline">Manage Clubs</h2>
                  <p className="text-muted-foreground">Add, edit, or remove university clubs.</p>
                </div>
                <Dialog open={isFormOpen} onOpenChange={setIsFormOpen}>
                    <DialogTrigger asChild>
                        <Button onClick={handleCreateNew}>
                            <PlusCircle className="mr-2 h-4 w-4" />
                            Create Club
                        </Button>
                    </DialogTrigger>
                    <DialogContent className="sm:max-w-[500px]">
                        <DialogHeader>
                            <DialogTitle className="font-headline text-2xl">{editingClub ? "Edit Club" : "Create New Club"}</DialogTitle>
                        </DialogHeader>
                        <ClubForm onSubmit={handleFormSubmit} club={editingClub ?? undefined} />
                    </DialogContent>
                </Dialog>
            </div>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                {isLoading ? (
                    Array.from({length: 3}).map((_, i) => <Skeleton key={i} className="h-48 w-full"/>)
                ) : (
                    clubs.map(club => (
                        <Card key={club.id} className="flex flex-col">
                            <CardHeader>
                                <CardTitle className="font-headline text-xl text-primary">{club.name}</CardTitle>
                            </CardHeader>
                            <CardContent className="flex-grow">
                                <CardDescription className="font-body">{club.description}</CardDescription>
                            </CardContent>
                            <CardFooter className="pt-4">
                                <Button variant="ghost" size="icon" onClick={() => handleEdit(club)}><Edit className="h-4 w-4" /></Button>
                                <Button variant="ghost" size="icon" className="text-destructive hover:text-destructive" onClick={() => handleDelete(club.id)}><Trash2 className="h-4 w-4" /></Button>
                            </CardFooter>
                        </Card>
                    ))
                )}
            </div>
        </div>
    );
}

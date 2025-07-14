"use client";

import type { Club } from "@/lib/types";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { ArrowRight } from "lucide-react";
import Link from "next/link";
import Image from "next/image";

interface ClubListProps {
  clubs: Club[];
  isLoading: boolean;
}

export function ClubList({ clubs, isLoading }: ClubListProps) {
  return (
    <div>
      <h2 className="text-2xl font-bold tracking-tight font-headline mb-4">Discover Clubs</h2>
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        {isLoading ? (
            Array.from({ length: 3 }).map((_, i) => (
                <Card key={i} className="flex flex-col">
                     <CardHeader>
                        <Skeleton className="h-40 w-full mb-4" />
                        <Skeleton className="h-8 w-3/4" />
                     </CardHeader>
                     <CardContent>
                        <Skeleton className="h-4 w-full mb-2" />
                        <Skeleton className="h-4 w-full mb-2" />
                        <Skeleton className="h-4 w-2/3" />
                     </CardContent>
                     <CardFooter>
                         <Skeleton className="h-10 w-full" />
                     </CardFooter>
                </Card>
            ))
        ) : clubs.map(club => (
          <Card key={club.id} className="flex flex-col group">
            <CardHeader>
              <div className="relative h-40 w-full mb-4 rounded-md overflow-hidden">
                <Image src={`https://placehold.co/600x400.png`} alt={club.name} layout="fill" objectFit="cover" className="transition-transform duration-300 group-hover:scale-105" data-ai-hint="students collaboration" />
              </div>
              <CardTitle className="font-headline text-xl text-primary">{club.name}</CardTitle>
            </CardHeader>
            <CardContent className="flex-grow">
              <CardDescription className="font-body line-clamp-3">{club.description}</CardDescription>
            </CardContent>
            <CardFooter className="pt-4">
              <Link href={`/clubs/${club.id}`} passHref>
                <Button variant="outline" className="w-full">
                  Learn More <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </Link>
            </CardFooter>
          </Card>
        ))}
      </div>
    </div>
  );
}

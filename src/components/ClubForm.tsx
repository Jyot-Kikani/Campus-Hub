"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import type { Club } from "@/lib/types";
import { uploadImage } from "@/lib/firebase/services";
import { useState } from "react";
import Image from "next/image";
import { toast } from "@/hooks/use-toast";
import { Upload } from "lucide-react";

const formSchema = z.object({
  name: z.string().min(3, "Club name must be at least 3 characters."),
  description: z.string().min(10, "Description must be at least 10 characters."),
  imageUrl: z.string().url().optional().nullable(),
});

type ClubFormProps = {
  onSubmit: (data: z.infer<typeof formSchema>) => void;
  club?: Club;
};

export function ClubForm({ onSubmit, club }: ClubFormProps) {
  const [isUploading, setIsUploading] = useState(false);
  const [imagePreview, setImagePreview] = useState<string | null>(club?.imageUrl || null);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: club?.name || "",
      description: club?.description || "",
      imageUrl: club?.imageUrl || null,
    },
  });

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setIsUploading(true);
      try {
        const reader = new FileReader();
        reader.onloadend = () => {
          setImagePreview(reader.result as string);
        };
        reader.readAsDataURL(file);

        const imageUrl = await uploadImage(file);
        form.setValue("imageUrl", imageUrl);
        toast({ title: "Success", description: "Image uploaded successfully." });
      } catch (error) {
        toast({ title: "Error", description: "Failed to upload image.", variant: "destructive" });
        setImagePreview(club?.imageUrl || null); // Revert on failure
      } finally {
        setIsUploading(false);
      }
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6 py-4">
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Club Name</FormLabel>
              <FormControl>
                <Input placeholder="e.g., Creative Writing Guild" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="description"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Description</FormLabel>
              <FormControl>
                <Textarea
                  placeholder="What is this club about?"
                  className="resize-y"
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormItem>
          <FormLabel>Club Banner Image</FormLabel>
          <FormControl>
            <div className="flex items-center gap-4">
              <div className="w-24 h-24 relative rounded-md border bg-muted overflow-hidden">
                {imagePreview ? (
                  <Image src={imagePreview} alt="Club image preview" layout="fill" objectFit="cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-muted-foreground text-xs text-center">No Image</div>
                )}
              </div>
              <Button asChild variant="outline">
                <label htmlFor="image-upload" className="cursor-pointer">
                   <Upload className="mr-2 h-4 w-4" />
                   {isUploading ? "Uploading..." : "Upload"}
                  <input id="image-upload" type="file" className="sr-only" onChange={handleImageUpload} accept="image/*" disabled={isUploading}/>
                </label>
              </Button>
            </div>
          </FormControl>
          <FormMessage />
        </FormItem>
        <Button type="submit" className="w-full" disabled={isUploading}>{club ? "Save Changes" : "Create Club"}</Button>
      </form>
    </Form>
  );
}

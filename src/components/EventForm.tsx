"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { CalendarIcon, Upload, Wand2 } from "lucide-react";
import { Calendar } from "@/components/ui/calendar";
import { cn } from "@/lib/utils";
import { format } from "date-fns";
import type { Event } from "@/lib/types";
import { useState } from "react";
import { uploadImage } from "@/lib/firebase/services";
import Image from "next/image";
import { toast } from "@/hooks/use-toast";
// In a real application, you would import and use your Genkit flow like this:
// import { generateDescription } from "@/ai/flows"; 

const formSchema = z.object({
  name: z.string().min(3, "Event name must be at least 3 characters."),
  description: z.string().min(10, "Description must be at least 10 characters."),
  date: z.date({ required_error: "A date is required." }),
  location: z.string().min(3, "Location is required."),
  imageUrl: z.string().url().optional().nullable(),
});

type EventFormProps = {
  onSubmit: (data: z.infer<typeof formSchema>) => void;
  event?: Event;
};

export function EventForm({ onSubmit, event }: EventFormProps) {
  const [isGenerating, setIsGenerating] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [imagePreview, setImagePreview] = useState<string | null>(event?.imageUrl || null);


  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: event?.name || "",
      description: event?.description || "",
      date: event ? new Date(event.date) : undefined,
      location: event?.location || "",
      imageUrl: event?.imageUrl || null,
    },
  });
  
  const handleGenerateDescription = async () => {
    const eventName = form.getValues("name");
    if (!eventName) {
      form.setError("name", { type: "manual", message: "Please enter an event name first to generate a description."});
      return;
    }
    setIsGenerating(true);
    // This is a mock AI call. In a real app, you would call your Genkit flow.
    // e.g., const { description } = await generateDescription(eventName);
    await new Promise(res => setTimeout(res, 1500));
    const generatedDesc = `Join us for an exciting session on "${eventName}"! This event is a fantastic opportunity to learn, network with peers, and dive deep into fascinating topics. We'll have expert speakers, interactive workshops, and plenty of fun. Don't miss out on this unique campus experience!`;
    form.setValue("description", generatedDesc);
    form.clearErrors("description");
    setIsGenerating(false);
  };

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
        setImagePreview(event?.imageUrl || null); // Revert on failure
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
              <FormLabel>Event Name</FormLabel>
              <FormControl>
                <Input placeholder="e.g., Annual Tech Summit" {...field} />
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
              <FormLabel className="flex justify-between items-center">
                <span>Description</span>
                <Button type="button" variant="ghost" size="sm" onClick={handleGenerateDescription} disabled={isGenerating}>
                  <Wand2 className={cn("mr-2 h-4 w-4", isGenerating && "animate-spin")} />
                  {isGenerating ? "Generating..." : "Generate with AI"}
                </Button>
              </FormLabel>
              <FormControl>
                <Textarea
                  placeholder="Tell us more about the event..."
                  className="resize-y min-h-[100px]"
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
         <FormItem>
          <FormLabel>Event Banner Image</FormLabel>
          <FormControl>
            <div className="flex items-center gap-4">
              <div className="w-24 h-24 relative rounded-md border bg-muted overflow-hidden">
                {imagePreview ? (
                  <Image src={imagePreview} alt="Event image preview" layout="fill" objectFit="cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-muted-foreground text-xs text-center">No Image</div>
                )}
              </div>
              <Button asChild variant="outline">
                <label htmlFor="event-image-upload" className="cursor-pointer">
                   <Upload className="mr-2 h-4 w-4" />
                   {isUploading ? "Uploading..." : "Upload"}
                  <input id="event-image-upload" type="file" className="sr-only" onChange={handleImageUpload} accept="image/*" disabled={isUploading}/>
                </label>
              </Button>
            </div>
          </FormControl>
          <FormMessage />
        </FormItem>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <FormField
            control={form.control}
            name="date"
            render={({ field }) => (
              <FormItem className="flex flex-col">
                <FormLabel>Date</FormLabel>
                <Popover>
                  <PopoverTrigger asChild>
                    <FormControl>
                      <Button
                        variant={"outline"}
                        className={cn(
                          "w-full justify-start text-left font-normal",
                          !field.value && "text-muted-foreground"
                        )}
                      >
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {field.value ? (
                          format(field.value, "PPP")
                        ) : (
                          <span>Pick a date</span>
                        )}
                      </Button>
                    </FormControl>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      mode="single"
                      selected={field.value}
                      onSelect={field.onChange}
                      disabled={(date) => date < new Date(new Date().setDate(new Date().getDate() - 1))}
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="location"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Location</FormLabel>
                <FormControl>
                  <Input placeholder="e.g., Main Auditorium" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
        <Button type="submit" className="w-full" disabled={isUploading}>{event ? "Save Changes" : "Create Event"}</Button>
      </form>
    </Form>
  );
}

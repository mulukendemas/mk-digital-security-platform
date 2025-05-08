import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  FormDescription,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { ContactDescription } from "@/lib/types";
import { ImageUpload } from "@/components/ui/image-upload";

interface ContactDescriptionFormProps {
  initialData?: ContactDescription | null;
  onSubmit: (data: Omit<ContactDescription, "id">) => void;
  onCancel: () => void;
}

const ContactDescriptionForm = ({
  initialData,
  onSubmit,
  onCancel,
}: ContactDescriptionFormProps) => {
  const [imageFile, setImageFile] = useState<File | null>(null);

  const form = useForm({
    defaultValues: {
      title: initialData?.title || "",
      description: initialData?.description || "",
      background_image: initialData?.background_image || "",
    },
  });

  const handleSubmit = (data: any) => {
    // Create a FormData object to handle file uploads
    const formData = new FormData();

    // Add the text fields
    formData.append('title', data.title);
    formData.append('description', data.description);

    // Add the image file if it exists
    if (imageFile) {
      formData.append('background_image_file', imageFile);
    }

    // Submit the FormData
    onSubmit(formData);
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
        <FormField
          control={form.control}
          name="title"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Title</FormLabel>
              <FormControl>
                <Input {...field} />
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
                <Textarea {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="background_image"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Background Image</FormLabel>
              <FormControl>
                <ImageUpload
                  value={field.value}
                  onChange={(url) => field.onChange(url)}
                  onUpload={(file) => setImageFile(file)}
                />
              </FormControl>
              <FormDescription>
                Recommended size: 1920x600 pixels. This image will appear at the top of the Contact page.
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="flex justify-end gap-2">
          <Button type="button" variant="outline" onClick={onCancel}>
            Cancel
          </Button>
          <Button type="submit">
            {initialData ? "Update" : "Create"}
          </Button>
        </div>
      </form>
    </Form>
  );
};

export default ContactDescriptionForm;
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
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
import { Button } from "@/components/ui/button";
import { useState } from "react";
import { AboutHero } from "@/lib/types";
import { Image as ImageIcon } from "lucide-react";

// Schema with optional title and description
const heroFormSchema = z.object({
  title: z.string().optional().default(""),
  description: z.string().optional().default(""),
  background_image: z.instanceof(File).optional(),
});

type FormValues = z.infer<typeof heroFormSchema>;

interface AboutHeroFormProps {
  data?: AboutHero | null;
  onSubmit: (data: FormData) => void;
}

export function AboutHeroForm({ data, onSubmit }: AboutHeroFormProps) {
  const [imagePreview, setImagePreview] = useState<string | null>(
    data?.background_image || null
  );

  const form = useForm<FormValues>({
    resolver: zodResolver(heroFormSchema),
    defaultValues: {
      title: data?.title || "",
      description: data?.description || "",
      background_image: undefined,
    },
  });

  const handleSubmit = (values: FormValues) => {
    console.log('AboutHeroForm - Form values:', values);

    const formData = new FormData();

    // Always include title and description, even if empty
    // This ensures empty strings are sent to the backend to clear the fields
    formData.append('title', values.title || '');
    formData.append('description', values.description || '');

    // Add background image if it exists
    if (values.background_image instanceof File) {
      // Try both field names to ensure compatibility with backend
      formData.append('background_image', values.background_image);
      formData.append('background_image_file', values.background_image);

      console.log('AboutHeroForm - Image file being uploaded:', {
        name: values.background_image.name,
        type: values.background_image.type,
        size: values.background_image.size,
      });

      // Double-check that the image was appended correctly
      const imageCheck = formData.get('background_image');
      console.log('AboutHeroForm - Image check after append:', {
        hasImage: !!imageCheck,
        isFile: imageCheck instanceof File,
        fileName: imageCheck instanceof File ? imageCheck.name : 'N/A',
        fileSize: imageCheck instanceof File ? imageCheck.size : 'N/A'
      });
    }

    // Log all form data entries
    console.log('AboutHeroForm - FormData entries:');
    for (const pair of formData.entries()) {
      if (pair[1] instanceof File) {
        console.log(`${pair[0]}: File(${(pair[1] as File).name}, ${(pair[1] as File).type}, ${(pair[1] as File).size} bytes)`);
      } else {
        console.log(`${pair[0]}: ${pair[1]}`);
      }
    }

    onSubmit(formData);
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
        {/* Background Image Upload */}
        <div className="mb-6">
          <FormLabel>Background Image</FormLabel>
          <div className="flex gap-4 mt-2">
            <div className="w-32 h-32 border rounded-lg overflow-hidden flex items-center justify-center bg-gray-50">
              {imagePreview ? (
                <img
                  src={imagePreview}
                  alt="Background preview"
                  className="max-w-full max-h-full object-contain"
                  onError={() => setImagePreview(null)}
                />
              ) : (
                <ImageIcon className="h-10 w-10 text-gray-400" />
              )}
            </div>
            <div className="flex-1">
              <FormField
                control={form.control}
                name="background_image"
                render={({ field: { value, onChange, ...fieldProps } }) => (
                  <FormItem>
                    <FormControl>
                      <Input
                        type="file"
                        accept="image/*"
                        {...fieldProps}
                        onChange={(e) => {
                          const file = e.target.files?.[0];
                          if (file) {
                            onChange(file);
                            setImagePreview(URL.createObjectURL(file));
                          }
                        }}
                      />
                    </FormControl>
                    <FormDescription>
                      Upload a background image for the hero section
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
          </div>
        </div>

        <FormField
          control={form.control}
          name="title"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Title (Optional)</FormLabel>
              <FormControl>
                <Input placeholder="Enter hero title" {...field} />
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
              <FormLabel>Description (Optional)</FormLabel>
              <FormControl>
                <Textarea
                  placeholder="Enter hero description"
                  className="min-h-[100px]"
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <Button type="submit" className="w-full">
          {data ? 'Update Hero Section' : 'Create Hero Section'}
        </Button>
      </form>
    </Form>
  );
}

import { FC, useState, useEffect } from "react";
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
import { NewsDescription } from "@/lib/types";
import { ImageUpload } from "@/components/admin/ImageUpload";

const formSchema = z.object({
  title: z.string().optional(),
  description: z.string().optional(),
});

type FormValues = z.infer<typeof formSchema>;

interface NewsDescriptionFormProps {
  initialData?: NewsDescription | null;
  onSubmit: (data: FormData) => void;
  onCancel: () => void;
}

const NewsDescriptionForm: FC<NewsDescriptionFormProps> = ({
  initialData,
  onSubmit,
  onCancel,
}) => {
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(initialData?.hero_image || null);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: initialData?.title || "",
      description: initialData?.description || "",
    },
  });

  // Update preview URL when initialData changes
  useEffect(() => {
    if (initialData?.hero_image) {
      // Check if it's a blob URL (temporary URL created by the browser)
      if (typeof initialData.hero_image === 'string' && initialData.hero_image.startsWith('blob:')) {
        console.log("Preview URL is a blob URL, not using it:", initialData.hero_image);
        setPreviewUrl(null);
      } else {
        console.log("Setting preview URL from initialData:", initialData.hero_image);
        setPreviewUrl(initialData.hero_image);
      }
    }
  }, [initialData?.hero_image]);

  const handleImageChange = (file: File | null) => {
    setImageFile(file);

    // Create a preview URL for the selected file
    if (file) {
      const url = URL.createObjectURL(file);
      setPreviewUrl(url);
    } else {
      setPreviewUrl(initialData?.hero_image || null);
    }
  };

  const handleSubmit = (data: FormValues) => {
    // Create a FormData object to handle file uploads
    const formData = new FormData();

    // Always include title and description in the FormData, even if they're empty
    // This ensures that empty fields are properly set to null in the backend
    formData.append('title', data.title || '');
    formData.append('description', data.description || '');

    // Add the image file if it exists
    if (imageFile) {
      console.log('NewsDescriptionForm: Adding image file to FormData:', {
        name: imageFile.name,
        type: imageFile.type,
        size: imageFile.size,
        lastModified: new Date(imageFile.lastModified).toISOString()
      });
      formData.append('hero_image_file', imageFile);
    } else {
      console.log('NewsDescriptionForm: No image file to add to FormData');
    }

    // Log all FormData entries for debugging
    console.log('NewsDescriptionForm: FormData entries:');
    for (const pair of formData.entries()) {
      if (pair[1] instanceof File) {
        console.log(`${pair[0]}: File(${(pair[1] as File).name}, ${(pair[1] as File).type}, ${(pair[1] as File).size} bytes)`);
      } else {
        console.log(`${pair[0]}: ${pair[1]}`);
      }
    }

    // Submit the FormData
    onSubmit(formData);
  };

  return (
    <div className="bg-white p-6 rounded-md shadow">
      <Form {...form}>
        <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
          <FormField
            control={form.control}
            name="title"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Title (Optional)</FormLabel>
                <FormControl>
                  <Input placeholder="Enter title" {...field} />
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
                    placeholder="Enter description"
                    rows={5}
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <div className="space-y-2">
            <FormLabel>Hero Background Image</FormLabel>
            <ImageUpload
              onChange={handleImageChange}
              previewUrl={previewUrl}
              className="w-full"
            />
            <p className="text-sm text-gray-500 mt-1">
              Recommended size: 1920x600 pixels
            </p>
          </div>

          <div className="flex justify-end gap-2">
            <Button type="button" variant="outline" onClick={onCancel}>
              Cancel
            </Button>
            <Button type="submit">
              {initialData ? "Update" : "Create"} Description
            </Button>
          </div>
        </form>
      </Form>
    </div>
  );
};

export default NewsDescriptionForm;

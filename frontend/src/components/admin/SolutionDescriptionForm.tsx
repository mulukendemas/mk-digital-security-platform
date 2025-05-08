import { FC, useState } from "react";
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
  FormDescription,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { SolutionDescription } from "@/lib/types";
import { Image as ImageIcon } from "lucide-react";

const formSchema = z.object({
  title: z.string().optional().default(""),
  description: z.string().optional().default(""),
  hero_image: z.instanceof(File).optional(),
});

type FormValues = z.infer<typeof formSchema>;

interface SolutionDescriptionFormProps {
  initialData?: SolutionDescription | null;
  onSubmit: (data: FormData) => void;
  onCancel: () => void;
}

const SolutionDescriptionForm: FC<SolutionDescriptionFormProps> = ({
  initialData,
  onSubmit,
  onCancel,
}) => {
  // Process the hero_image URL if it's a relative path
  let heroImageUrl = initialData?.hero_image || null;
  if (heroImageUrl && heroImageUrl.startsWith('/') && !heroImageUrl.startsWith('//')) {
    const apiUrl = import.meta.env.VITE_API_URL || '';
    heroImageUrl = `${apiUrl}${heroImageUrl}`;
  }

  const [previewImage, setPreviewImage] = useState<string | null>(heroImageUrl);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: initialData?.title || "",
      description: initialData?.description || "",
      hero_image: undefined,
    },
  });

  const handleSubmit = (data: FormValues) => {
    console.log("Form submitted with values:", data);

    // Create FormData for file upload
    const formData = new FormData();

    // Always include title and description
    formData.append("title", data.title);
    formData.append("description", data.description);

    // Add hero image if present
    if (data.hero_image instanceof File) {
      // Use the correct field name that matches the serializer
      formData.append("hero_image_file", data.hero_image);
      console.log(`Adding hero_image_file: ${data.hero_image.name} (${data.hero_image.size} bytes)`);

      // Check if the file is valid
      if (data.hero_image.size === 0) {
        console.error("Error: File size is 0 bytes");
        alert("The selected image file appears to be empty. Please select a valid image.");
        return;
      }

      // Check if the file is an image
      if (!data.hero_image.type.startsWith('image/')) {
        console.error("Error: File is not an image");
        alert("The selected file is not an image. Please select a valid image file.");
        return;
      }
    }

    // If we're updating and there's an existing ID, include it
    if (initialData?.id) {
      console.log(`Including ID: ${initialData.id}`);
      formData.append("id", initialData.id.toString());
    }

    // Log the FormData contents for debugging
    console.log('FormData entries:');
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
    <div className="bg-white p-6 rounded-md shadow">
      <Form {...form}>
        <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
          <FormField
            control={form.control}
            name="title"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Title (optional)</FormLabel>
                <FormControl>
                  <Input placeholder="Enter title (optional)" {...field} />
                </FormControl>
                <FormDescription>
                  You can leave this field empty if you don't want to display a title
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="description"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Description (optional)</FormLabel>
                <FormControl>
                  <Textarea
                    placeholder="Enter description (optional)"
                    rows={5}
                    {...field}
                  />
                </FormControl>
                <FormDescription>
                  You can leave this field empty if you don't want to display a description
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="hero_image"
            render={({ field: { value, onChange, ...field } }) => (
              <FormItem>
                <FormLabel>Hero Background Image</FormLabel>
                <FormControl>
                  <Input
                    type="file"
                    accept="image/*"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) {
                        onChange(file);
                        // Create a preview URL
                        const url = URL.createObjectURL(file);
                        setPreviewImage(url);
                      }
                    }}
                    {...field}
                  />
                </FormControl>
                <FormDescription>
                  Upload an image for the solutions hero background
                </FormDescription>
                <FormMessage />
                {previewImage && (
                  <div className="mt-2">
                    <p className="text-sm text-gray-500 mb-2">Image preview:</p>
                    <div className="relative w-full h-32 bg-gray-100 rounded-md overflow-hidden">
                      <img
                        src={previewImage}
                        alt="Hero preview"
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          // If image fails to load, use default image
                          (e.target as HTMLImageElement).src = "/images/default-market.jpg";
                        }}
                      />
                    </div>
                  </div>
                )}
              </FormItem>
            )}
          />

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

export default SolutionDescriptionForm;

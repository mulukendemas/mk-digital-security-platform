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
import { ProductDescription } from "@/lib/types";
import { Image as ImageIcon } from "lucide-react";

const formSchema = z.object({
  title: z.string().optional().default(""),
  description: z.string().optional().default(""),
  hero_image: z.instanceof(File).optional(),
});

type FormValues = z.infer<typeof formSchema>;

interface ProductDescriptionFormProps {
  initialData?: ProductDescription | null;
  onSubmit: (data: FormData) => void;
  onCancel: () => void;
}

const ProductDescriptionForm: FC<ProductDescriptionFormProps> = ({
  initialData,
  onSubmit,
  onCancel,
}) => {
  const [imagePreview, setImagePreview] = useState<string | null>(() => {
    if (initialData?.hero_image) {
      console.log("Initial hero image:", initialData.hero_image);
      return initialData.hero_image;
    }
    return null;
  });

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: initialData?.title || "",
      description: initialData?.description || "",
      hero_image: undefined,
    },
  });

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      form.setValue("hero_image", file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = (data: FormValues) => {
    // Create FormData for file upload
    const formData = new FormData();

    // Always include title and description, even if they're empty
    // This ensures that empty strings are sent to the backend
    formData.append("title", data.title || "");
    formData.append("description", data.description || "");

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
          {/* Hero Image Upload */}
          <div className="mb-6">
            <FormLabel>Hero Background Image</FormLabel>
            <div className="flex gap-4 mt-2">
              <div className="w-32 h-32 border rounded-lg overflow-hidden flex items-center justify-center bg-gray-50">
                {imagePreview ? (
                  <>
                    <img
                      src={imagePreview}
                      alt="Hero preview"
                      className="max-w-full max-h-full object-contain"
                      onError={(e) => {
                        console.error("Error loading image preview:", e);
                        setImagePreview(null);
                      }}
                    />
                    <div className="absolute bottom-0 left-0 right-0 bg-black/50 text-white text-xs p-1 truncate">
                      {typeof imagePreview === 'string' && imagePreview.split('/').pop()}
                    </div>
                  </>
                ) : (
                  <div className="text-gray-400 flex flex-col items-center justify-center">
                    <ImageIcon className="w-10 h-10 mb-2" />
                    <span className="text-xs">No image</span>
                  </div>
                )}
              </div>
              <div className="flex-1">
                <Input
                  type="file"
                  accept="image/*"
                  onChange={handleImageChange}
                  className="mb-2"
                />
                <FormDescription>
                  Upload a hero background image. Recommended size: 1920x500px.
                </FormDescription>
              </div>
            </div>
          </div>

          <FormField
            control={form.control}
            name="title"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Title</FormLabel>
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
                <FormLabel>Description</FormLabel>
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

export default ProductDescriptionForm;

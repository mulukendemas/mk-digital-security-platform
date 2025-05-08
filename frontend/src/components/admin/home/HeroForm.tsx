import { useForm } from "react-hook-form";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Form, FormField, FormItem, FormLabel, FormControl, FormMessage } from "@/components/ui/form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";

interface HeroFormProps {
  data?: {
    id?: number;
    title: string;
    description: string;
    button_text: string;
    button_link: string;
    background_image?: string;
  } | null;
  onSubmit: (data: FormData) => void;
}

const heroFormSchema = z.object({
  title: z.string().min(1, "Title is required"),
  description: z.string().min(1, "Description is required"),
  button_text: z.string().min(1, "Button text is required"),
  button_link: z.string()
    .min(1, "Button link is required")
    .regex(/^(\/|https?:\/\/)/, "Must start with '/' or 'http://' or 'https://'"),
  background_image: z.any().optional(),
});

type FormValues = z.infer<typeof heroFormSchema>;

export function HeroForm({ data, onSubmit }: HeroFormProps) {
  const form = useForm<FormValues>({
    resolver: zodResolver(heroFormSchema),
    defaultValues: {
      title: data?.title || "",
      description: data?.description || "",
      button_text: data?.button_text || "",
      button_link: data?.button_link || "",
      background_image: null,
    },
  });

  const handleSubmit = (values: FormValues) => {
    const formData = new FormData();
    formData.append('title', values.title);
    formData.append('description', values.description);
    formData.append('button_text', values.button_text);
    formData.append('button_link', values.button_link);

    console.log('HeroForm - Form values:', values);

    if (values.background_image?.[0]) {
      const imageFile = values.background_image[0];

      // Generate a unique filename with timestamp to prevent caching issues
      const timestamp = new Date().getTime();
      const fileExtension = imageFile.name.split('.').pop();
      const newFileName = `hero_image_${timestamp}.${fileExtension}`;

      // Create a new File object with the modified name
      const renamedFile = new File([imageFile], newFileName, {
        type: imageFile.type,
        lastModified: imageFile.lastModified
      });

      console.log('HeroForm - Image file being uploaded:', {
        originalName: imageFile.name,
        newName: renamedFile.name,
        type: renamedFile.type,
        size: renamedFile.size,
        lastModified: new Date(renamedFile.lastModified).toISOString()
      });

      // Append the renamed file to the form data with the correct field name
      formData.append('background_image_file', renamedFile);
    } else {
      console.log('HeroForm - No new image file selected');
      // The image will be handled in HomeAdmin.tsx
    }

    // Log all form data entries
    console.log('HeroForm - FormData entries:');
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
        <FormField
          control={form.control}
          name="title"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Title</FormLabel>
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
              <FormLabel>Description</FormLabel>
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

        <FormField
          control={form.control}
          name="button_text"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Button Text</FormLabel>
              <FormControl>
                <Input placeholder="Enter button text" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="button_link"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Button Link</FormLabel>
              <FormControl>
                <Input placeholder="https://example.com" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="background_image"
          render={({ field: { value, onChange, ...field } }) => (
            <FormItem>
              <FormLabel>Background Image</FormLabel>
              <FormControl>
                <Input
                  type="file"
                  accept="image/*"
                  onChange={(e) => onChange(e.target.files)}
                  {...field}
                />
              </FormControl>
              <FormMessage />
              {data?.background_image && (
                <div className="mt-2">
                  <p className="text-sm text-gray-500">Current image:</p>
                  <img
                    src={`http://localhost:8000${data.background_image}`}
                    alt="Current background"
                    className="mt-2 w-full h-32 object-cover rounded-lg"
                  />
                </div>
              )}
            </FormItem>
          )}
        />

        <Button
          type="submit"
          className="w-full"
          disabled={form.formState.isSubmitting}
        >
          {form.formState.isSubmitting ? (
            "Saving..."
          ) : (
            data ? 'Update Hero Section' : 'Create Hero Section'
          )}
        </Button>
      </form>
    </Form>
  );
}

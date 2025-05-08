import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Solution } from "@/lib/types";
import { X, Upload } from "lucide-react";
import { useState } from "react";

// Schema for solution form validation
const solutionSchema = z.object({
  title: z.string().min(5, "Title must be at least 5 characters"),
  slug: z.string().min(3, "Slug is required"),
  description: z.string().min(20, "Description must be at least 20 characters"),
  image: z.any().optional(), // Changed to accept File object
  icon: z.string().optional(),
  features: z.array(z.string()),
});

type SolutionFormValues = z.infer<typeof solutionSchema>;

interface SolutionFormProps {
  solution: Solution | null;
  onSubmit: (data: Omit<Solution, "id" | "createdAt" | "updatedAt">) => void;
  onCancel: () => void;
}

const SolutionForm = ({ solution, onSubmit, onCancel }: SolutionFormProps) => {
  const [imagePreview, setImagePreview] = useState<string>(
    solution?.image || "/placeholder.svg"
  );

  // Initialize form with solution data if editing
  const defaultValues: Partial<SolutionFormValues> = {
    title: solution?.title || "",
    slug: solution?.slug || "",
    description: solution?.description || "",
    image: undefined, // File input starts empty
    icon: solution?.icon || "",
    features: solution?.features || [""]
  };

  const form = useForm<SolutionFormValues>({
    resolver: zodResolver(solutionSchema),
    defaultValues,
  });

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      form.setValue("image", file);
      // Create a preview URL
      const previewUrl = URL.createObjectURL(file);
      setImagePreview(previewUrl);
    }
  };

  const handleSubmit = (data: SolutionFormValues) => {
    // Filter out empty strings from arrays
    const filteredFeatures = data.features.filter(item => item.trim() !== "");
   
    // Ensure all required properties are present
    const solutionData: Omit<Solution, "id" | "createdAt" | "updatedAt"> = {
      title: data.title,
      slug: data.slug,
      description: data.description,
      features: filteredFeatures.length ? filteredFeatures : ["No features specified"],
      // Only include image if it's a new File
      ...(data.image instanceof File && { image: data.image }),
      // Only include icon if it exists and is different from the current one
      ...(data.icon && (!solution || data.icon !== solution.icon) && { icon: data.icon })
    };
    
    onSubmit(solutionData);
  };

  // Handle dynamic arrays (features)
  const addFeature = () => {
    const current = form.getValues("features");
    form.setValue("features", [...current, ""]);
  };

  const removeFeature = (index: number) => {
    const current = form.getValues("features");
    if (current.length > 1) {
      form.setValue(
        "features",
        current.filter((_, i) => i !== index)
      );
    }
  };

  return (
    <div className="bg-white rounded-md shadow p-6">
      <h3 className="text-lg font-medium mb-4">
        {solution ? "Edit Solution" : "Add New Solution"}
      </h3>
      
      <Form {...form}>
        <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6" encType="multipart/form-data">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <FormField
              control={form.control}
              name="title"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Title</FormLabel>
                  <FormControl>
                    <Input placeholder="Enter solution title" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="slug"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Slug</FormLabel>
                  <FormControl>
                    <Input placeholder="solution-slug" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          <FormField
            control={form.control}
            name="description"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Description</FormLabel>
                <FormControl>
                  <Textarea
                    placeholder="Enter solution description"
                    className="min-h-[100px]"
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <FormField
              control={form.control}
              name="image"
              render={({ field: { value, onChange, ...fieldProps } }) => (
                <FormItem>
                  <FormLabel>Solution Image</FormLabel>
                  <div className="flex flex-col space-y-2">
                    {imagePreview && (
                      <div className="relative w-full h-40 bg-gray-100 rounded-md overflow-hidden">
                        <img 
                          src={imagePreview} 
                          alt="Solution preview" 
                          className="w-full h-full object-cover"
                        />
                      </div>
                    )}
                    <FormControl>
                      <div className="flex items-center">
                        <label 
                          htmlFor="image-upload" 
                          className="cursor-pointer flex items-center gap-2 px-4 py-2 border rounded-md bg-gray-50 hover:bg-gray-100"
                        >
                          <Upload className="h-4 w-4" />
                          <span>Upload Image</span>
                        </label>
                        <Input 
                          id="image-upload"
                          type="file" 
                          accept="image/*"
                          className="hidden"
                          onChange={handleImageChange}
                          {...fieldProps}
                        />
                      </div>
                    </FormControl>
                  </div>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="icon"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Icon Name</FormLabel>
                  <FormControl>
                    <Input placeholder="e.g., Shield, Fingerprint, IdCard" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          <div>
            <div className="flex justify-between items-center mb-2">
              <FormLabel>Features</FormLabel>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={addFeature}
              >
                Add Feature
              </Button>
            </div>
            {form.watch("features").map((_, index) => (
              <div key={index} className="flex gap-2 mb-2">
                <FormField
                  control={form.control}
                  name={`features.${index}`}
                  render={({ field }) => (
                    <FormItem className="flex-1">
                      <FormControl>
                        <Input placeholder="Enter solution feature" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => removeFeature(index)}
                  disabled={form.watch("features").length <= 1}
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            ))}
          </div>

          <div className="flex justify-end gap-2 pt-4">
            <Button type="button" variant="outline" onClick={onCancel}>
              Cancel
            </Button>
            <Button type="submit">
              {solution ? "Update Solution" : "Create Solution"}
            </Button>
          </div>
        </form>
      </Form>
    </div>
  );
};

export default SolutionForm;


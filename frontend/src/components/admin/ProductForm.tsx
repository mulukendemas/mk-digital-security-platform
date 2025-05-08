import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useState } from "react";
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
  FormDescription,
} from "@/components/ui/form";
import { Product } from "@/lib/types";
import { X, Upload, Image as ImageIcon } from "lucide-react";

// Updated schema for product form validation to match new model
const productSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  description: z.string().optional(),
  items: z.array(z.string().min(1, "Item cannot be empty")),
  image: z.instanceof(File).optional(),
});

type ProductFormValues = z.infer<typeof productSchema>;

interface ProductFormProps {
  product: Product | null;
  onSubmit: (data: Omit<Product, "id" | "createdAt" | "updatedAt">) => void;
  onCancel: () => void;
}

const ProductForm = ({ product, onSubmit, onCancel }: ProductFormProps) => {
  // All product images are null, so always set imagePreview to null
  const [imagePreview, setImagePreview] = useState<string | null>(null);

  // Initialize form with product data if editing
  const defaultValues: Partial<ProductFormValues> = {
    name: product?.name || "",
    description: product?.description || "",
    items: product?.items || [""],
    image: undefined,
  };

  const form = useForm<ProductFormValues>({
    resolver: zodResolver(productSchema),
    defaultValues,
  });

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      console.log("Image selected:", {
        name: file.name,
        type: file.type,
        size: file.size
      });

      form.setValue("image", file);

      const reader = new FileReader();
      reader.onloadend = () => {
        console.log("Image preview generated");
        setImagePreview(reader.result as string);
      };
      reader.onerror = (error) => {
        console.error("Error reading file:", error);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = (data: ProductFormValues) => {
    console.log("Form submitted with data:", data);

    // Filter out empty strings from arrays
    const filteredItems = data.items.filter(item => item.trim() !== "");
    console.log("Filtered items:", filteredItems);

    // Create FormData for file upload
    const formData = new FormData();
    formData.append("name", data.name);

    if (data.description) {
      formData.append("description", data.description);
    }

    // Add items as JSON string
    formData.append("items", JSON.stringify(
      filteredItems.length ? filteredItems : ["No items specified"]
    ));

    // Add image if present
    if (data.image instanceof File) {
      console.log("Adding image to FormData:", {
        name: data.image.name,
        type: data.image.type,
        size: data.image.size
      });
      // Use image_file instead of image to match the backend serializer
      formData.append("image_file", data.image);
      console.log("Image added to FormData with field name 'image_file'");
    } else {
      console.log("No image file to upload");
    }

    // Log the final FormData contents
    console.log("Final FormData contents:");
    for (const pair of formData.entries()) {
      if (pair[1] instanceof File) {
        console.log(`${pair[0]}: File(${(pair[1] as File).name}, ${(pair[1] as File).type}, ${(pair[1] as File).size} bytes)`);
      } else {
        console.log(`${pair[0]}: ${pair[1]}`);
      }
    }

    onSubmit(formData as any);
  };

  // Handle dynamic items array
  const addItem = () => {
    const currentItems = form.getValues("items");
    form.setValue("items", [...currentItems, ""]);
  };

  const removeItem = (index: number) => {
    const currentItems = form.getValues("items");
    if (currentItems.length > 1) {
      form.setValue(
        "items",
        currentItems.filter((_, i) => i !== index)
      );
    }
  };

  return (
    <div className="bg-white rounded-md shadow p-6">
      <h3 className="text-lg font-medium mb-4">
        {product ? "Edit Product" : "Add New Product"}
      </h3>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
          {/* Image Upload */}
          <div className="mb-6">
            <FormLabel className="block mb-2">Product Image</FormLabel>
            <div className="flex items-start gap-4">
              <div className="w-40 h-40 border rounded-md flex items-center justify-center overflow-hidden bg-gray-50">
                {imagePreview ? (
                  <img
                    src={imagePreview}
                    alt="Product preview"
                    className="max-w-full max-h-full object-contain"
                  />
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
                  Upload a product image. Recommended size: 800x600px.
                </FormDescription>
              </div>
            </div>
          </div>

          <FormField
            control={form.control}
            name="name"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Product Name</FormLabel>
                <FormControl>
                  <Input placeholder="Enter product name" {...field} />
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
                <FormLabel>Product Description</FormLabel>
                <FormControl>
                  <Textarea
                    placeholder="Enter product description"
                    className="min-h-[100px]"
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <div>
            <div className="flex justify-between items-center mb-2">
              <FormLabel>Items</FormLabel>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={addItem}
              >
                Add Item
              </Button>
            </div>
            {form.watch("items").map((_, index) => (
              <div key={index} className="flex gap-2 mb-2">
                <FormField
                  control={form.control}
                  name={`items.${index}`}
                  render={({ field }) => (
                    <FormItem className="flex-1">
                      <FormControl>
                        <Input placeholder="Enter product item" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => removeItem(index)}
                  disabled={form.watch("items").length <= 1}
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
              {product ? "Update Product" : "Create Product"}
            </Button>
          </div>
        </form>
      </Form>
    </div>
  );
};

export default ProductForm;

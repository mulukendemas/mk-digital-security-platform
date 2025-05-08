
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
import { NewsArticle, User } from "@/lib/types";
import { useState, useEffect } from "react";
import { Upload } from "lucide-react";
import { toast } from "sonner";

// Schema for news article form validation
const newsSchema = z.object({
  title: z.string().min(5, "Title must be at least 5 characters"),
  slug: z.string().min(3, "Slug is required"),
  excerpt: z.string().min(10, "Excerpt must be at least 10 characters"),
  content: z.string().min(50, "Content must be at least 50 characters"),
  image: z.any().optional(),
  author: z.string().min(1, "Author is required"),
  publishedAt: z.string().min(1, "Published date is required"),
});

type NewsFormValues = z.infer<typeof newsSchema>;

interface NewsFormProps {
  article?: NewsArticle | null;
  authors: User[];
  onSubmit: (formData: FormData) => void;
  onCancel: () => void;
}

const NewsForm = ({ article, authors, onSubmit, onCancel }: NewsFormProps) => {
  const [imagePreview, setImagePreview] = useState<string | null>(
    article?.image || null
  );

  // Format date for input
  const formatDateForInput = (date: string | Date | undefined) => {
    if (!date) return new Date().toISOString().split('T')[0];
    const formattedDate = new Date(date).toISOString().split('T')[0];
    console.log('Formatted date:', formattedDate); // Debug log
    return formattedDate;
  };

  // Initialize form with article data if editing
  const defaultValues: NewsFormValues = {
    title: article?.title || "",
    slug: article?.slug || "",
    excerpt: article?.excerpt || "",
    content: article?.content || "",
    image: undefined,
    author: article?.author?.toString() || "",
    publishedAt: formatDateForInput(article?.publishedAt),
  };

  const form = useForm<NewsFormValues>({
    resolver: zodResolver(newsSchema),
    defaultValues,
    mode: "onChange",
  });

  // Reset form when article changes
  useEffect(() => {
    if (article) {
      console.log("Original article data:", article);

      // Generate slug if empty
      const slug = article.slug || article.title.toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/(^-|-$)/g, '');

      // Generate excerpt if empty (use first 150 characters of content)
      const excerpt = article.excerpt || article.content?.substring(0, 150) || "";

      // Ensure all fields are properly set with fallbacks
      const formData = {
        title: article.title || "",
        slug: slug,
        excerpt: excerpt,
        content: article.content || "",
        author: article.author?.toString() || "",
        publishedAt: formatDateForInput(article.publishedAt),
        image: undefined
      };

      console.log("Setting form values:", formData);

      // First, reset the form to clear any previous values
      form.reset(formData);

      // Then, explicitly set each field to ensure they're properly registered
      Object.entries(formData).forEach(([key, value]) => {
        // Ensure the value is not undefined before setting
        if (value !== undefined) {
          form.setValue(key as keyof NewsFormValues, value, {
            shouldValidate: true,
            shouldDirty: true,
            shouldTouch: true
          });
        }
      });

      // Set image preview if exists
      if (article.image) {
        setImagePreview(article.image);
      }

      // Force a revalidation of all fields
      form.trigger();

      // Debug: Log the form state
      console.log("Form State after reset:", {
        values: form.getValues(),
        errors: form.formState.errors,
        isDirty: form.formState.isDirty,
        dirtyFields: form.formState.dirtyFields
      });
    }
  }, [article, form]);

  // Add form state logging with more detail
  useEffect(() => {
    const subscription = form.watch((value, { name, type }) => {
      console.log('Form field updated:', {
        field: name,
        type,
        value,
        formValues: form.getValues(),
        fieldError: form.getFieldState(name as keyof NewsFormValues).error
      });
    });
    return () => subscription.unsubscribe();
  }, [form]);

  const handleSubmit = async (data: NewsFormValues) => {
    try {
      console.log('Submitting form with data:', data);

      // Validate required fields before submission
      const requiredFields = ['title', 'slug', 'excerpt', 'content', 'author', 'publishedAt'];
      const missingFields = requiredFields.filter(field => !data[field as keyof NewsFormValues]);

      if (missingFields.length > 0) {
        throw new Error(`Required fields missing: ${missingFields.join(', ')}`);
      }

      const formData = new FormData();

      // Generate slug if empty
      const slug = data.slug || data.title.toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/(^-|-$)/g, '');

      // Add all fields to FormData with trimming
      formData.append('title', data.title.trim());
      formData.append('slug', slug.trim());
      formData.append('excerpt', data.excerpt.trim());
      formData.append('content', data.content.trim());
      formData.append('author', data.author);
      formData.append('published_at', new Date(data.publishedAt).toISOString());

      // Handle image if present
      if (data.image instanceof File) {
        formData.append('image', data.image);
        console.log('Adding image file to FormData:', data.image.name, data.image.type, data.image.size);
      } else if (data.image instanceof FileList && data.image.length > 0) {
        // For backward compatibility
        formData.append('image', data.image[0]);
        console.log('Adding image from FileList to FormData');
      } else if (data.image) {
        console.log('Image data is present but not a File or FileList:', typeof data.image);
      }

      // Debug log the FormData contents
      console.log('FormData contents:');
      for (const [key, value] of formData.entries()) {
        console.log(`${key}: ${value}`);
      }

      await onSubmit(formData);
    } catch (error) {
      console.error('Form submission error:', error);
      toast.error(error instanceof Error ? error.message : "Failed to submit form");
    }
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Store the actual File object instead of FileList
      form.setValue("image", file);
      setImagePreview(URL.createObjectURL(file));
      console.log('Image file selected:', file.name, file.type, file.size);

      // Validate file type
      const validImageTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
      if (!validImageTypes.includes(file.type)) {
        toast.warning(`File type ${file.type} may not be supported. Please use JPEG, PNG, GIF, or WebP.`);
      }

      // Validate file size (max 5MB)
      const maxSize = 5 * 1024 * 1024; // 5MB
      if (file.size > maxSize) {
        toast.warning(`File size (${(file.size / 1024 / 1024).toFixed(2)}MB) exceeds the recommended maximum of 5MB.`);
      }
    }
  };

  return (
    <div className="bg-white rounded-md shadow p-6">
      <h3 className="text-lg font-medium mb-4">
        {article ? "Edit News Article" : "Add News Article"}
      </h3>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
          <FormField
            control={form.control}
            name="title"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Title</FormLabel>
                <FormControl>
                  <Input
                    placeholder="Article title"
                    {...field}
                    value={field.value || ''}
                  />
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
                  <Input placeholder="article-slug" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="excerpt"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Excerpt</FormLabel>
                <FormControl>
                  <Textarea
                    {...field}
                    placeholder="Brief summary of the article"
                    rows={3}
                    onChange={(e) => {
                      field.onChange(e);
                      console.log('Excerpt changed:', e.target.value); // Debug log
                    }}
                    value={field.value || ''} // Ensure value is never undefined
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="content"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Content</FormLabel>
                <FormControl>
                  <Textarea
                    placeholder="Article content"
                    {...field}
                    rows={10}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="image"
            render={({ field: { value, onChange, ...field } }) => (
              <FormItem>
                <FormLabel>Image</FormLabel>
                <FormControl>
                  <div className="space-y-4">
                    <Input
                      type="file"
                      accept="image/*"
                      onChange={handleImageChange}
                      {...field}
                    />
                    {imagePreview && (
                      <div className="mt-2">
                        <img
                          src={imagePreview}
                          alt="Preview"
                          className="max-w-[200px] h-auto"
                        />
                      </div>
                    )}
                  </div>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="author"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Author</FormLabel>
                <FormControl>
                  <select
                    {...field}
                    className="w-full p-2 border rounded-md"
                  >
                    <option value="">Select an author</option>
                    {authors.map((author) => {
                      console.log('Rendering author option:', author); // Debug log
                      return (
                        <option
                          key={author.id}
                          value={author.id.toString()}
                        >
                          {author.name || author.username}
                        </option>
                      );
                    })}
                  </select>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="publishedAt"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Publish Date</FormLabel>
                <FormControl>
                  <Input
                    type="date"
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <div className="flex justify-end gap-4">
            <Button type="button" variant="outline" onClick={onCancel}>
              Cancel
            </Button>
            <Button type="submit">
              {article ? "Update Article" : "Create Article"}
            </Button>
          </div>
        </form>
      </Form>
    </div>
  );
};

export default NewsForm;













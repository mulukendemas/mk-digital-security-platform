import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Form, FormField, FormItem, FormLabel, FormControl, FormMessage } from "@/components/ui/form";
import { CompanyOverview } from "@/lib/types";

interface CompanyOverviewFormProps {
  data?: CompanyOverview;
  onSubmit: (data: Omit<CompanyOverview, 'id'>) => void;
}

const formSchema = z.object({
  title: z.string().min(1, "Title is required"),
  description: z.string().min(1, "Description is required"),
  quote: z.string().min(1, "Quote is required"),
  quote_author: z.string().min(1, "Quote author is required"),
  quote_position: z.string().min(1, "Quote position is required"),
});

export function CompanyOverviewForm({ data, onSubmit }: CompanyOverviewFormProps) {
  const form = useForm<CompanyOverview>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: data?.title || "",
      description: data?.description || "",
      quote: data?.quote || "",
      quote_author: data?.quote_author || "",
      quote_position: data?.quote_position || ""
    }
  });

  const handleSubmit = (values: CompanyOverview) => {
    // Remove any empty strings or undefined values
    const cleanValues = Object.fromEntries(
      Object.entries(values).filter(([_, v]) => v !== "" && v != null)
    );
    
    console.log('Form values being submitted:', cleanValues); // Debug log
    onSubmit(cleanValues);
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
          name="quote"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Quote</FormLabel>
              <FormControl>
                <Textarea {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="quote_author"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Quote Author</FormLabel>
              <FormControl>
                <Input {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="quote_position"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Quote Position</FormLabel>
              <FormControl>
                <Input {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <Button type="submit">Submit</Button>
      </form>
    </Form>
  );
}

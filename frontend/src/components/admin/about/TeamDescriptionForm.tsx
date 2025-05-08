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

const formSchema = z.object({
  title: z.string().min(1, "Title is required"),
  description: z.string().min(1, "Description is required"),
});

type TeamDescription = z.infer<typeof formSchema>;

interface TeamDescriptionFormProps {
  data?: TeamDescription;
  onSubmit: (data: TeamDescription) => void;
}

export function TeamDescriptionForm({ data, onSubmit }: TeamDescriptionFormProps) {
  const form = useForm<TeamDescription>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: data?.title || "",
      description: data?.description || "",
    },
  });

  const handleSubmit = (formData: TeamDescription) => {
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
                  {...field} 
                  rows={4}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <Button type="submit" className="w-full">
          {data ? 'Update' : 'Add'} Team Description
        </Button>
      </form>
    </Form>
  );
}


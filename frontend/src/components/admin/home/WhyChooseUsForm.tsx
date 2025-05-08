import { useForm } from "react-hook-form";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Form, FormField, FormItem, FormLabel, FormControl } from "@/components/ui/form";
import { WhyChooseUs } from "@/lib/types";

interface WhyChooseUsFormProps {
  data?: WhyChooseUs | null;
  onSubmit: (data: Partial<WhyChooseUs>) => void;
}

export function WhyChooseUsForm({ data, onSubmit }: WhyChooseUsFormProps) {
  const form = useForm({
    defaultValues: {
      title: data?.title || "",
      description: data?.description || "",
      icon: data?.icon || "CheckCircle",
    },
  });

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <FormField
          control={form.control}
          name="title"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Title</FormLabel>
              <FormControl>
                <Input {...field} />
              </FormControl>
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
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="icon"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Icon</FormLabel>
              <FormControl>
                <Input {...field} placeholder="CheckCircle, Award, etc." />
              </FormControl>
            </FormItem>
          )}
        />
        <Button type="submit">
          {data ? "Update Item" : "Add Item"}
        </Button>
      </form>
    </Form>
  );
}
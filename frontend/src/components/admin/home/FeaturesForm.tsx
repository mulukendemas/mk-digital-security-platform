import { useForm } from "react-hook-form";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Form, FormField, FormItem, FormLabel, FormControl } from "@/components/ui/form";
import { Feature } from "@/lib/types";

interface FeaturesFormProps {
  data?: Feature | null;
  onSubmit: (data: Partial<Feature>) => void;
}

export function FeaturesForm({ data, onSubmit }: FeaturesFormProps) {
  const form = useForm({
    defaultValues: {
      title: data?.title || "",
      description: data?.description || "",
      icon: data?.icon || "Shield",
    },
  });

  return (
    <div className="space-y-6">
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
                  <Input {...field} placeholder="Shield, Lock, etc." />
                </FormControl>
              </FormItem>
            )}
          />
          <Button type="submit">
            {data ? "Update Feature" : "Add Feature"}
          </Button>
        </form>
      </Form>
    </div>
  );
}
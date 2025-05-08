import { useForm } from "react-hook-form";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Form, FormField, FormItem, FormLabel, FormControl } from "@/components/ui/form";
import { TargetMarket } from "@/lib/types";

interface TargetMarketsFormProps {
  data?: TargetMarket | null;
  onSubmit: (data: FormData) => void;
}

export function TargetMarketsForm({ data, onSubmit }: TargetMarketsFormProps) {
  const form = useForm({
    defaultValues: {
      title: data?.title || "",
      description: data?.description || "",
      image: undefined,
    },
  });

  const handleSubmit = async (formData: any) => {
    const submitData = new FormData();
    submitData.append('title', formData.title);
    submitData.append('description', formData.description);
    
    if (formData.image) {
      submitData.append('image', formData.image);
    }

    onSubmit(submitData);
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
          name="image"
          render={({ field: { onChange, value, ...field } }) => (
            <FormItem>
              <FormLabel>Image (Optional)</FormLabel>
              {data?.image && (
                <div className="mb-2">
                  <img src={data.image} alt="Current" className="w-20 h-20 object-cover rounded" />
                </div>
              )}
              <FormControl>
                <Input 
                  type="file" 
                  accept="image/*"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) {
                      onChange(file);
                    }
                  }}
                  {...field}
                />
              </FormControl>
            </FormItem>
          )}
        />
        <Button type="submit">
          {data ? "Update Market" : "Add Market"}
        </Button>
      </form>
    </Form>
  );
}